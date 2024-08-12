import callee from 'callee';
import { consts } from '../const/consts.js';

/**
 * Log class provides logging capabilities with various log levels.
 *
 * @param {boolean} isLoggingEnabled Indicates whether logging is enabled or not.
 * @param {winston.Logger} logger The logger instance to be used for logging.
 * @description
 * This class provides logging functionalities with different log levels (info, warn, error, debug).
 * It takes two parameters during construction: 'isLoggingEnabled' indicates whether logging is enabled,
 * and 'logger' is the logger instance that will be used for logging (e.g., winstonLogger).
 * If logging is disabled, messages are displayed on the console using the appropriate log level methods.
 * If logging is enabled, messages are logged using the specified logger instance and include caller information.
 */
class Log {
    constructor(isLoggingEnabled, logger) {
      this.isLoggingEnabled = isLoggingEnabled;
      this.logger = logger;
    }
  
    /**
     * Log an info-level message.
     *
     * @param {...*} message The message(s) to be logged.
     */
    info(...message) {
      if (this.isLoggingEnabled) {
        const caller = callee().getFileName() + ':' + callee().getLineNumber() + ':' + callee().getColumnNumber();
        this.logger.info(this.concatMessage(message), { caller: consts.CALLER_PREFIX + caller });
      } else {
        console.log(this.concatMessage(message));
      }
    }
  
    /**
     * Log a warning-level message.
     *
     * @param {...*} message The message(s) to be logged.
     */
    warn(...message) {
      if (this.isLoggingEnabled) {
        const caller = callee().getFileName() + ':' + callee().getLineNumber() + ':' + callee().getColumnNumber();
        this.logger.warn(this.concatMessage(message), { caller: consts.CALLER_PREFIX + caller });
      } else {
        console.warn(this.concatMessage(message));
      }
    }
  
    /**
     * Log an error-level message.
     *
     * @param {...*} message The message(s) to be logged.
     */
    error(...message) {
      if (this.isLoggingEnabled) {
        const caller = callee().getFileName() + ':' + callee().getLineNumber() + ':' + callee().getColumnNumber();
        this.logger.error(this.concatMessage(message), { caller: consts.CALLER_PREFIX + caller });
      } else {
        console.error(this.concatMessage(message));
      }
    }
  
    /**
     * Log a debug-level message.
     *
     * @param {...*} message The message(s) to be logged.
     */
    debug(...message) {
      if (this.isLoggingEnabled) {
        const caller = callee().getFileName() + ':' + callee().getLineNumber() + ':' + callee().getColumnNumber();
        this.logger.debug(this.concatMessage(message), { caller: consts.CALLER_PREFIX + caller });
      } else {
        console.debug(this.concatMessage(message));
      }
    }

    /**
     * Concatenate the messages into a single string.
     *
     * @private
     * @param {...*} message The message(s) to be concatenated.
     * @returns {string} The concatenated message.
     *
     * @description
     * This method concatenates the provided messages into a single string.
     * If the messages contain objects, they are converted to JSON strings before concatenation.
     * If an error occurs during the concatenation process, the messages are simply joined without any additional formatting.
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

  export {
    Log
  }