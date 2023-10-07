import { consts } from '../const/consts.js';
import config from './index.js'

/**
 * Checks whether logging is enabled in the application's configuration.
 *
 * @function isLoggingEnabled
 * @returns {boolean} True if logging is enabled, otherwise false.
 */
const isLoggingEnabled = () => {
    return config.get('saas.observability.logging.enable') === true
}

/**
 * Checks whether logging is not enabled in the application's configuration.
 *
 * @function isNotLoggingEnabled
 * @returns {boolean} True if logging is not enabled, otherwise false.
 */
const isNotLoggingEnabled = () => {
    return !isLoggingEnabled();
}

/**
 * Retrieves the service name from the application's configuration.
 *
 * @function getServiceName
 * @returns {string} The service name, or consts.UNKNOWN if not specified in the configuration.
 *
 */
const getServiceName = () => {
    return config.get('saas.observability.name') || consts.UNKNOWN;
}

export {
    isLoggingEnabled,
    isNotLoggingEnabled,
    getServiceName,
}