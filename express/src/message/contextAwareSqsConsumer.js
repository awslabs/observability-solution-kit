import { getServiceName, isNotLoggingEnabled } from '../configuration/director.js';
import { consts } from '../const/consts.js';
import { Consumer } from 'sqs-consumer';
import { logContextStore } from '../service/logContextStore.js';
import { winstonLogger } from '../service/loggerCreator.js';
import AWSXRay from 'aws-xray-sdk';
AWSXRay.setContextMissingStrategy('IGNORE_ERROR');

/**
 * ContextAwareSqsConsumer class for consuming SQS (Simple Queue Service) messages with tenant-aware attributes.
 *
 * @description
 * This class provides methods for consuming SQS messages with tenant-aware attributes.
 * It utilizes the AWS SDK and 'sqs-consumer' library for receiving messages from the SQS queue.
 * The class constructor sets up a consumer with custom message handling, including tenant-aware context.
 */
class ContextAwareSqsConsumer {

  /**
   * Constructs a new ContextAwareSqsConsumer instance.
   * @param {object} options The options for configuring the SQS consumer, including 'queueUrl' and 'handleMessage'.
   */
  constructor(options) {
    this.originalHandleMessage = options.handleMessage;
    this.consumer = Consumer.create({
      ...options,
      attributeNames: [consts.TRACE_KEY_IN_SQS_HEADER],
      handleMessage: this.tenantAwareHandleMessage,
    });
  }

  /**
   * Creates a new instance of ContextAwareSqsConsumer.
   * @static
   * @param {object} options The options for configuring the SQS consumer, including 'queueUrl' and 'handleMessage'.
   * @returns {ContextAwareSqsConsumer} The new instance of ContextAwareSqsConsumer.
   */
  static create(options) {
    return new ContextAwareSqsConsumer(options);
  }

  /**
   * Extracts the tenant attributes from the SQS message for logging.
   *
   * @function getTenantAttributes
   * @param {object} message The SQS message containing attributes.
   * @returns {object} The extracted tenant context as an object.
   *
   * @description
   * This function extracts tenant context attributes from the SQS message for logging purposes.
   * It looks for the 'MessageAttributes' property in the message, specifically the attribute with key consts.ATTRIBUTES_KEY.
   * If the attribute exists and contains a valid JSON string, it is parsed to obtain the tenant context.
   * If the attribute is not properly formatted or missing, an empty object is returned for the tenant context.
   */
  getTenantAttributes(message) {
    const messageAttributes = message?.MessageAttributes;
    const logAttributes = messageAttributes?.[consts.ATTRIBUTES_KEY];
    let logContext = {};
    if (logAttributes && logAttributes.StringValue) {
      try {
        logContext = JSON.parse(logAttributes.StringValue);
      } catch (e) {
        winstonLogger.warn(`logAttributes are not properly formatted: ${JSON.stringify(logAttributes.StringValue)} `);
        logContext = {};
      }
    }
    return logContext;
  }

  /**
   * Sets the AWS X-Ray segment with the trace header from the SQS message.
   *
   * @function setSegmentWithTraceHeader
   * @param {object} message The SQS message containing the trace header attribute.
   * @returns {void}
   *
   * @description
   * This function sets up the AWS X-Ray segment based on the trace header attribute present in the SQS message.
   * If the trace header exists, it is processed to obtain the trace data, and an X-Ray segment is created with that information.
   * The segment name is set to the service name obtained from getServiceName().
   * If the sampling decision indicates that the segment should not be traced, the 'notTraced' property is set accordingly.
   * The created segment is set as the current segment using AWSXRay.setSegment().
   */
  setSegmentWithTraceHeader = (message) => {
    const traceHeader = message?.Attributes?.[consts.TRACE_KEY_IN_SQS_HEADER];
    if (traceHeader) {
      const traceData = AWSXRay.utils.processTraceData(traceHeader);
      this.segment = new AWSXRay.Segment(`${getServiceName()}`, traceData.root, traceData.parent);
      this.segment.notTraced = '1' !== traceData?.sampled;
      AWSXRay.setSegment(this.segment);
    }
  };

  /**
   * Handles the SQS message with tenant-aware context for logging.
   *
   * @async
   * @function tenantAwareHandleMessage
   * @param {object} message The SQS message to be handled.
   * @returns {Promise<void>}
   *
   * @description
   * This function handles the incoming SQS message with tenant-aware context for logging purposes.
   * It sets up the AWS X-Ray segment based on the trace header from the SQS message.
   * If logging is disabled (checked via isNotLoggingEnabled()), the original handleMessage function is called directly with the message.
   * When logging is enabled, the function extracts the tenant context attributes from the message using getTenantAttributes().
   * It then creates a child logger with the extracted log context using winstonLogger.child().
   * Both the child logger and the log context are stored in an AsyncLocalStorage store logContextStore.
   * The store is then used to execute the original handleMessage function with log context available in the logContextStore.
   * The segment is closed at the end of message handling using this.segment.close().
   */
  tenantAwareHandleMessage = async (message) => {
    try {
      this.setSegmentWithTraceHeader(message);

      if (isNotLoggingEnabled()) {
        return this.originalHandleMessage(message);
      }

      const logContext = this.getTenantAttributes(message);
      const childLogger = winstonLogger.child({ ...logContext });
      const store = new Map();
      store.set(consts.CHILD_LOGGER_KEY, childLogger);
      store.set(consts.LOG_STORAGE_KEY, logContext);

      logContextStore.attributeStorage.run(store, this.originalHandleMessage, message);
    } catch (e) {
      winstonLogger.warn(e.stack);
    } finally {
      if (this.segment) this.segment.close();
    }
  };
  /**
   * Starts the SQS consumer to listen for messages from the SQS queue.
   *
   * @function start
   * @returns {void}
   */
  start() {
    AWSXRay.getNamespace().run((ns) => this.consumer.start());
  }

  /**
   * Adds a listener for the specified event to the SQS consumer.
   *
   * @function on
   * @param {string} eventName The name of the event to listen for.
   * @param {function} listener The event listener function.
   * @returns {void}
   */
  on(eventName, listener) {
    this.consumer.on(eventName, listener);
  }
}

export { ContextAwareSqsConsumer };