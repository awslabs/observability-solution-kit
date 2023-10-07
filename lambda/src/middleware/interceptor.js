/**
© 2023 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
This AWS Content is provided subject to the terms of the AWS Customer Agreement available at  http://aws.amazon.com/agreement or other written agreement between Customer and either
Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both.
*/
import ContextExtractor from '../service/contextExtractor.js';
import LogFormatter from '../service/logFormatter.js';
import CONTEXT_TYPE from '../const/contextTypeConst.js';
/**
 * It is used as before middleware to construct structured logs by intercepting Lambda request, extracts context from various sources in an appropriate way.
 *
 * * 1) (If logger is enabled) Extract log context (JWT of equest header, SQS message, Lambda event payload from lambda functions and ECS).
 * * 2) (If logger is enabled) Append additional context with logger options.
 * * 3) (If logger is enabled) Append tenant context into logger.
 * * 4) (If logger is enabled) Append tenant context into lambda event.
 *
 * @param {Logger} logger - (required) Logger from @5k-saas/sdk-lambda-logging
 * @returns {Object} Object containing a 'before' function to be used as a before middleware.
 */
function interceptor(logger) {
  // Before Middleware
  const customMiddlewareBefore = async (request) => {
    try {
      if (!(logger?.config?.logConst || logger?.logOptions || logger?.headerLogFormat)) {
        logger.info('[5k-saas][interceptor] Cannot read config. please check if config is valid. skip interceptor...');
        return;
      }
      if (!logger?.isEnabled) {
        logger.info('[5k-saas][interceptor] Logger is disabled. skip interceptor...');
        return;
      }
    } catch (e) {
      logger.warn('[5k-saas][interceptor] Error occurred. Skip interceptor... error: ', e);
      return;
    }

    try {
      const { event, context } = request;
      const configData = logger?.config ?? undefined;
      const { logOptions, logConst, headerLogFormat } = configData;
      const { ENABLE_XRAY_TRACE_ID } = logOptions;
      let logContext = {};
      // #1) Extract log context
      const { contextType, tenantContext } = ContextExtractor.extract(event, configData);
      switch (contextType) {
        case CONTEXT_TYPE.CONTEXT_TYPE_HEADER:
          logContext = LogFormatter.apply(headerLogFormat, tenantContext, logConst?.UNKNOWN ?? 'unknown');
          break;
        case CONTEXT_TYPE.CONTEXT_TYPE_PAYLOAD:
          logContext = tenantContext;
          break;
        case CONTEXT_TYPE.CONTEXT_TYPE_BATCH:
          break;
        default:
          logContext = undefined;
          break;
      }

      if (!logContext) {
        // If logContext is 'undefined', the context velues will be filled with 'unknown'.
        logContext = LogFormatter.initFormat(headerLogFormat, logConst?.UNKNOWN);
      } else if (contextType === CONTEXT_TYPE.CONTEXT_TYPE_BATCH) {
        // If lambda event came from SQS batch messages, skip append log context and log options.
        // Becuase, log context cannot be determined as specific value.
        logContext = LogFormatter.initFormat(headerLogFormat, `${logConst?.UNKNOWN}_batch` ?? 'unknown_batch');
        logContext = {
          ...logContext,
          requestId: logConst?.UNKNOWN ?? 'unknown',
          traceId: ENABLE_XRAY_TRACE_ID ? logConst?.UNKNOWN : undefined,
        };
        logger.appendKeys(logContext);
        return;
      } else {
        // #2) Append additional context with logger options
        logContext = {
          ...logContext,
          requestId:
            ContextExtractor.extractRootfromTraceId(event?.headers?.['x-amzn-trace-id']) ??
            logContext.requestId ??
            logConst?.UNKNOWN ??
            'unknown',
          traceId: ENABLE_XRAY_TRACE_ID
            ? ContextExtractor.extractRootfromTraceId(process.env._X_AMZN_TRACE_ID) ?? logConst.UNKNOWN
            : undefined,
        };
      }

      // #3) Append tenant context into logger
      logger.appendKeys(logContext);

      // #4) Append tenant context into lambda event
      request.event[logConst.SET_CONTEXT_INTO_LAMBDA_PAYLOAD_KEY] = logger.getPersistentLogAttributes();
    } catch (e) {
      logger.warn(e);
    }
  };

  return {
    before: customMiddlewareBefore,
  };
}

export default interceptor;
