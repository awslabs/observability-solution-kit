import _ from 'lodash';
import { consts } from '../const/consts.js';
/**
 * logFormatter class provides utility functions for formatting log data.
 *
 * @description
 * This class includes static methods for initializing and applying log data formatting.
 * It uses the lodash library for convenience.
 */
class logFormatter {

  /**
   * Initializes the log data format based on the provided format object.
   *
   * @static
   * @param {object} format The format object defining how to structure the log data.
   * @returns {object} The initialized log data format.
   */
  static init = (format) => {
    const initFormat = this.apply(format, {});
    return initFormat;
  };
  
  /**
   * Applies the log data format to the provided context object.
   *
   * @static
   * @param {object} format The format object defining how to structure the log data.
   * @param {object} context The context object containing data to be formatted.
   * @returns {object} The formatted log data based on the provided format and context.
   *
   * @description
   * This method takes a format object and a context object. It applies the format to the context data,
   * retrieving the values from the context based on the format keys and organizing them into a new object.
   * If the value for a specific key is not found in the context, the constant consts.UNKNOWN is used as the default value.
   */
  static apply = (format, context) => {
    var obj = {};
    for (const key in format) {
      const fromContext = _.get(context, key, consts.UNKNOWN);
      _.set(obj, format[key], fromContext);
    }
    return obj;
  };
}

export default logFormatter;