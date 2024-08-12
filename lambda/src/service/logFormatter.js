/**
© 2023 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
This AWS Content is provided subject to the terms of the AWS Customer Agreement available at  http://aws.amazon.com/agreement or other written agreement between Customer and either
Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both.
*/

import _ from 'lodash';

/**
 *
 * @class LogFormatter
 * @description
 * LogFormatter class is responsible for formatting log by the format defined in log configuration.
 *
 * This class consists of static methods.
 */
export default class LogFormatter {
  /**
   * @static
   * @param {Object} format - Objects consisting of sources and wanted structure formats for structured log
   * @param {String} value - default value
   * @returns {Object} - The initialized object with the format and value
   */
  static initFormat(format, value) {
    var obj = {};
    try {
      for (const key in format) {
        _.set(obj, format[key], value);
      }
    } catch (e) {
      console.warn(`[O11yv][LogFormatter] initFormat() failed: ${e}`);
    }
    return obj;
  }

  /**
   * Convert the source data to the format wanted to change for structured log.
   * @static
   * @param {Object} format - Objects consisting of sources and wanted structure formats for structured log
   * @param {Object} context - Input data source
   * @returns {Object} Structured log context
   */
  static apply(format, context, defaultValue) {
    var obj = {};
    try {
      for (const key in format) {
        const fromContext = _.get(context, key, defaultValue);
        _.set(obj, format[key], fromContext);
      }
    } catch (e) {
      console.warn(`[O11yv][logFormatter] apply() failed: ${e}`);
    }
    return obj;
  }
}
