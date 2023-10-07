import winston, { format } from 'winston';
import util from 'util';
import { logContextStore } from './logContextStore.js';
import { consts } from '../const/consts.js';

/**
 * winstonLogger is a logger instance created using the Winston library.
 *
 * @type {winston.Logger}
 * @description
 * This logger instance is initialized with various log formatting options and a Console transport.
 * The logger utilizes the Winston library for efficient logging and supports JSON formatting of logs.
 */
const winstonLogger = winston.createLogger({
  format: format.combine(
    format.metadata(),
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ level, message, metadata, timestamp, stack }) => {
      const transformedMessage = typeof message !== 'string' ? util.inspect(message, { depth: null }) : message;
      return stack
        ? JSON.stringify({
            timestamp,
            level: level.toUpperCase(),
            message,
            stack,
            ...metadata,
          })
        : JSON.stringify({
            timestamp,
            level: level.toUpperCase(),
            message: transformedMessage,
            ...metadata,
          });
    })
  ),
  transports: [new winston.transports.Console()],
});

/**
 * proxyLogger is a Proxy object for the winstonLogger.
 *
 * @type {Proxy}
 * @description
 * This Proxy object intercepts the access to the winstonLogger and checks for a child logger instance
 * stored in the logContextStore. If a child logger is found in the store, it uses the child logger;
 * otherwise, it falls back to the original winstonLogger.
 */
const proxyLogger = new Proxy(winstonLogger, {
  get(target, property, receiver) {
    target = logContextStore.getValueFromStore(consts.CHILD_LOGGER_KEY) || target;
    return Reflect.get(target, property, receiver);
  },
});

export { winstonLogger, proxyLogger };