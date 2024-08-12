import loggingContextMiddleware from './middleware/loggingMiddleware.js';
import { consts } from './const/consts.js';
import { getServiceName, isLoggingEnabled, isNotLoggingEnabled } from './configuration/director.js';
import { logContextStore } from './service/logContextStore.js';
import { ContextAwareSqsProducer } from './message/contextAwareSqsProducer.js';
import { ContextAwareSqsConsumer } from './message/contextAwareSqsConsumer.js';
import { proxyLogger, winstonLogger } from './service/loggerCreator.js';
import { Log } from './service/logWrapper.js';
import AWSXRay from 'aws-xray-sdk';

/**
 * Middleware to extract logContext for each incoming request and store a child logger in context.
 *
 * @function contextMiddleware
 * @param {object} request The request object.
 * @param {object} response The response object.
 * @param {function} next The next middleware function in the chain.
 * @returns {void}
 * 
 * @description
 * This middleware function extracts the logContext for each incoming request using the loggingContextMiddleware.
 * It creates a child logger from the winstonLogger instance and stores both the child logger and the logContext
 * in an AsyncLocalStorage store, accessible through logContextStore, to enable logging with the tenantContext.
 * If logging is disabled (checked via isNotLoggingEnabled()), the middleware skips the logging setup and proceeds to the next middleware in the chain.
 */
const contextMiddleware = (request, response, next) => {
  if (isNotLoggingEnabled()) {
    return next();
  }

  try {
    const logContext = loggingContextMiddleware.before(request);
    const childLogger = winstonLogger.child({ ...logContext });
    const store = new Map(); // TODO : block memory leak
    store.set(consts.CHILD_LOGGER_KEY, childLogger);
    store.set(consts.LOG_STORAGE_KEY, logContext);
    return logContextStore.defaultStorage.run(store, next);
  } catch (e) {
    winstonLogger.warn(e);
  } 
};

/**
 * Logger instance for application logging.
 *
 * @constant logger
 * @type {Log}
 * @description
 * This constant creates a Log instance for application logging.
 * The 'isLoggingEnabled()' function determines whether logging is enabled or not.
 * If logging is enabled, it uses the proxyLogger, which checks for a child logger in the logContextStore.
 * Otherwise, it falls back to console logging.
 */
const logger = new Log(isLoggingEnabled(), proxyLogger);

/**
 * Open an AWS X-Ray segment for tracing.
 *
 * @function openSegment
 * @returns {object} The AWS X-Ray segment.
 * @description
 * This function opens an AWS X-Ray segment for tracing the current operation.
 * The segment name is obtained from the 'getServiceName()' function.
 */
const openSegment = () => {
  return AWSXRay.express.openSegment(getServiceName());
}

/**
 * Close the current AWS X-Ray segment.
 *
 * @function closeSegment
 * @returns {void}
 * @description
 * This function closes the current AWS X-Ray segment, finishing the tracing for the current operation.
 */
const closeSegment = () => {
  return AWSXRay.express.closeSegment();
}

export {
  logger, // for logging
  contextMiddleware, // for Webapp
  ContextAwareSqsConsumer, // for SQS consumer
  ContextAwareSqsProducer, // for SQS producer
  logContextStore, // for Lambda invoke
  AWSXRay as tracer,
  openSegment,
  closeSegment
};