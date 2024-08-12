import PropertiesReader from 'properties-reader'

/**
 * Configuration reader for loading properties from a properties file.
 *
 * @description
 * This module exports a default instance of the `PropertiesReader` class, which is used to read configuration properties from a properties file.
 * The properties file name is determined based on the current environment (NODE_ENV) and an optional SDK prefix (SDK_PREFIX).
 * The default file name format is `${SDK_PREFIX}${NODE_ENV}.properties`.
 * If NODE_ENV is not set, the default environment is assumed to be "local".
 * If SDK_PREFIX is not set, it defaults to an empty string.
 *
 * The `PropertiesReader` class allows for easy parsing and retrieval of properties from the properties file,
 * making it convenient for handling application configuration in a key-value format.
 *
 * @example
 * // Usage in other modules:
 * import config from './path/to/config.js';
 *
 * // Accessing configuration properties
 * const value = config.get('property.key');
 */
let config;
let configFilePrefix="local";
if(process.env.NODE_ENV)
{
  configFilePrefix=process.env.NODE_ENV.trim();
}
const sdkPrefix = process.env.SDK_PREFIX ?? "";

config = new PropertiesReader( sdkPrefix + configFilePrefix+'.properties');

export default config;