import AWS from 'aws-sdk';
import { isNotLoggingEnabled } from '../configuration/director.js';
import { logContextStore } from '../service/logContextStore.js';
import { consts } from '../const/consts.js';
import { winstonLogger } from '../service/loggerCreator.js';
import AWSXRay from 'aws-xray-sdk';
AWS.config.update({ region: process.env.AWS_REGION ?? 'us-east-1' });

/**
 * ContextAwareSqsProducer class for sending SQS (Simple Queue Service) messages with tenant-aware attributes.
 *
 * @description
 * This class provides methods for sending SQS messages with tenant-aware attributes.
 * It utilizes the AWS SDK for interacting with the SQS service.
 * The class constructor sets up an SQS client, and the 'tenantAwareSendMessage' method sends messages to the SQS queue.
 */
class ContextAwareSqsProducer {
  constructor() {
    this.producer = AWSXRay.captureAWSClient(new AWS.SQS({}));
  }

  /**
   * Sends a tenant-aware SQS message with additional context attributes.
   *
   * @async
   * @param {object} params The parameters for the SQS message, including 'QueueUrl', 'MessageBody', and 'MessageAttributes'.
   * @returns {Promise<object>} A promise that resolves to the response from SQS when the message is sent successfully.
   *
   * @description
   * This method sends an SQS message to the specified queue with tenant-aware attributes.
   * If logging is disabled (checked via isNotLoggingEnabled()), the message is sent as-is without tenant-aware attributes.
   * When logging is enabled, the method extracts the log context from logContextStore,
   * and it includes the log context as an additional attribute in the SQS message using the 'MessageAttributes' property.
   * The additional attribute is named using consts.ATTRIBUTES_KEY.
   * The 'params' object may already contain some 'MessageAttributes', which will be preserved in the message,
   * and the tenant-aware attribute is added alongside them.
   */
  async tenantAwareSendMessage(params) {
    if (isNotLoggingEnabled()) {
      return await this.producer.sendMessage(params).promise();
    }

    try {
      const logContext = logContextStore.getValueFromStore(consts.LOG_STORAGE_KEY) || {};
      const tenantAwareParams = {
        ...params,
        MessageAttributes: {
          [consts.ATTRIBUTES_KEY]: {
            DataType: 'String',
            StringValue: JSON.stringify(logContext),
          },
          ...params.MessageAttributes,
        },
      };
      const response = await this.producer.sendMessage(tenantAwareParams).promise();

      return response;
    } catch (e) {
      winstonLogger.warn(e);
    }
  }
}

export { ContextAwareSqsProducer };