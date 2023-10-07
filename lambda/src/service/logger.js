/**
© 2023 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
This AWS Content is provided subject to the terms of the AWS Customer Agreement available at  http://aws.amazon.com/agreement or other written agreement between Customer and either
Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both.
*/
import { Logger } from '@aws-lambda-powertools/logger';
import callee from 'callee';
import ContextExtractor from './contextExtractor.js';
import LogFormatter from './logFormatter.js';

export default class TenantLogger {
  /**
   * Log class provides logging capabilities with various log levels.
   *
   * @class TenantLogger
   * @param {String} [config] Configuration profile for the logger
   * @param {Object} [options] Options object for the logger
   * @description
   * This class provides logging functionalities with different log levels (info, warn, error, debug).
   * It takes two parameters during construction:
   * 1. 'config' refers to a config object which is defined 
   * 2. 'options' indicates the option to be set additionally when creating the logger. For example, serviceName, logLovel.
   *    <e.g.> { serviceName: "service-name", logLevel: "INFO" }
   *
   * If logging is disabled, messages are displayed on the console using the appropriate log level methods.
   * If logging is enabled, messages are logged using the specified logger instance and include caller information.
   */
  constructor(config = undefined, options = undefined) {
    this._isEnabled = false;
    this._logger = undefined;
    this.config = config;
    this.options = options;
    if (this._isEnabled) {
      this._logger = new Logger(this.options);
      this.initLogger();
    } else {
      console.log('[ollyv][Logger] Logger is disabled...');
    }
  }

  /**
   * Initialize the logger with the provided configuration.
   * @param {}
   * @returns {}
   *
   */
  initLogger() {
    try {
      const { enableLogging, logOptions, logConst, headerLogFormat } = this.config;
      if (enableLogging) {
        let initContext = LogFormatter.initFormat(headerLogFormat, logConst?.UNKNOWN ?? 'unknown') ?? {};
        initContext = {
          ...initContext,
          requestId: logConst?.UNKNOWN ?? 'unknown',
          traceId: logOptions?.ENABLE_XRAY_TRACE_ID ? logConst?.UNKNOWN : undefined,
        };
        this.appendKeys(initContext);
      }
    } catch (e) {
      this.warn('[ollyv][Logger] initLogger() failed... ', e);
    }
  }

  /**
   * Append tenant context into logger when it is contained in the messageAttributes of SQS message.
   * @param {Object} message - SQS message
   * @returns {}
   *
   */
  appendContextFromSQSMessage(message) {
    try {
      if (this._isEnabled) {
        const { logOptions, logConst } = this.config;
        const attrKey = logConst?.LOG_CONTEXT_FROM_SQS_KEY;
        let logContext = ContextExtractor.extractFromSQSMessageAttributes({ message: message, key: attrKey });
        logContext = {
          ...logContext,
          traceId: logOptions?.ENABLE_XRAY_TRACE_ID
            ? ContextExtractor.extractRootfromTraceId(process.env._X_AMZN_TRACE_ID) ?? logConst.UNKNOWN
            : undefined,
        };
        this._logger.appendKeys(logContext);
      }
    } catch (e) {
      this.warn('[ollyv][Logger] appendContextFromSQSMessage failed. ', e);
    }
  }

  /**
   * Append some context to the logger.
   * @param {Object} logContext - Object of context wanted to set to the logger
   * @returns {}
   *
   */
  appendKeys(logContext) {
    if (this._logger) {
      this._logger.appendKeys(logContext);
    }
  }

  /**
   * Get log context from the logger.
   * @returns {Object|undefined}
   */
  getLogContext() {
    if (this._isEnabled) {
      return { logContext: this._logger.getPersistentLogAttributes() };
    }
    return undefined;
  }

  getPersistentLogAttributes() {
    if (this._logger) {
      return this._logger.getPersistentLogAttributes() ?? undefined;
    }
    return undefined;
  }

  /**
   * Set log level of the logger.
   * @param {String} logLevel - Log level - INFO, WARN, ERROR, DEBUG
   * @returns {}
   */
  setLogLevel(logLevel) {
    this._logLevel = logLevel;
    if (this._logger) {
      this._logger.setLogLevel(logLevel);
    }
  }

  info = (...message) => {
    if (this._isEnabled) {
      const caller = callee().getFileName() + ':' + callee().getLineNumber() + ':' + callee().getColumnNumber();
      if (this._logOptions?.ENABLE_CALLER) {
        this._logger.info(this.concatMessage(message), { caller: this?._logOptions?.CALLER_PREFIX + caller });
      } else {
        this._logger.info(this.concatMessage(message));
      }
    } else {
      console.log(this.concatMessage(message));
    }
  };

  warn = (...message) => {
    if (this._isEnabled) {
      const caller = callee().getFileName() + ':' + callee().getLineNumber() + ':' + callee().getColumnNumber();
      if (this?._logOptions?.ENABLE_CALLER) {
        this._logger.warn(this.concatMessage(message), { caller: this?._logOptions?.CALLER_PREFIX + caller });
      } else {
        this._logger.warn(this.concatMessage(message));
      }
    } else {
      console.warn(this.concatMessage(message));
    }
  };

  error = (...message) => {
    if (this._isEnabled) {
      const caller = callee().getFileName() + ':' + callee().getLineNumber() + ':' + callee().getColumnNumber();
      if (this?._logOptions?.ENABLE_CALLER) {
        this._logger.error(this.concatMessage(message), { caller: this?._logOptions?.CALLER_PREFIX + caller });
      } else {
        this._logger.error(this.concatMessage(message));
      }
    } else {
      console.error(this.concatMessage(message));
    }
  };

  debug = (...message) => {
    if (this._isEnabled) {
      const caller = callee().getFileName() + ':' + callee().getLineNumber() + ':' + callee().getColumnNumber();
      if (this._logOptions?.ENABLE_CALLER) {
        this._logger.debug(this.concatMessage(message), { caller: this?._logOptions?.CALLER_PREFIX + caller });
      } else {
        this._logger.debug(this.concatMessage(message));
      }
    } else {
      console.debug(this.concatMessage(message));
    }
  };

  get isEnabled() {
    return this._isEnabled;
  }

  set isEnabled(isEnabled) {
    this._isEnabled = isEnabled;
  }

  get config() {
    return {
      enableLogging: this._isEnabled ?? false,
      logLevel: this._logLevel ?? undefined,
      logOptions: this._logOptions ?? undefined,
      logConst: this._logConst ?? undefined,
      headerLogFormat: this._headerLogFormat ?? undefined,
    };
  }

  set config(configData) {
    this._isEnabled = configData?.enableLogging ?? false;
    this._logConst = configData?.logConst ?? undefined;
    this._logOptions = configData?.logOptions ?? undefined;
    this._headerLogFormat = configData?.headerLogFormat ?? undefined;
    this.logLevel = configData?.logLevel ?? undefined;
  }

  get options() {
    return { serviceName: this?._serviceName, logLevel: this?._logLevel };
  }

  set options(options) {
    this._serviceName = options?.serviceName ?? process.env.AWS_LAMBDA_FUNCTION_NAME ?? undefined;
    this._logLevel = options?.logLevel ?? undefined;
  }

  /**
   * Concatenate and format the log message.
   * @private
   * @param {...*} message - Log message parts to be concatenated.
   * @returns {string} Concatenated log message.
   */
  concatMessage(...message) {
    try {
      const concatedMessage = message
        .flat()
        .map((item) => {
          return typeof item == 'object' ? JSON.stringify(item) : item;
        })
        .join('');
      return concatedMessage;
    } catch (e) {
      return message.flat().join('');
    }
  }
}
