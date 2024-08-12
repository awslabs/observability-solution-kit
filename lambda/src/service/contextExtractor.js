/**
© 2023 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
This AWS Content is provided subject to the terms of the AWS Customer Agreement available at  http://aws.amazon.com/agreement or other written agreement between Customer and either
Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both.
*/

import _ from 'lodash';
import TokenDirector from './tokenDirector.js';
import CONTEXT_TYPE from '../const/contextTypeConst.js';

/**
 *
 * @class ContextExtractor
 * @description
 * ContextExtractor class is responsible for extracting tenant context from various case of invocation type as follows.
 *  Extract tenant context by context type
 *   1) Invocation from API Gateway - Extract from decoded JWT payload
 *   2) Invocation from another lambda - Extract from event payload
 *   3) Invocation from event source of SQS - Extract from message attributes
 *   4) Invocation from ECS Service - Extract from event payload
 *
 * This class consists of static methods.
 */
export default class ContextExtractor {
  /**
   * Extracts context information from the event and returns it.
   * @static
   * @param {Object} event - The AWS Lambda event object.
   * @param {Object} config - Configuration object containing log constants.
   * @returns {Object} An object with contextType and tenantContext properties.
   *
   */
  static extract(event, config) {
    const logConst = config?.logConst;
    let contextType;
    let tenantContext;
    try {
      const jwtFromRequest = TokenDirector.getJwtFromRequest(event, logConst?.LOG_CONTEXT_FROM_TOKEN_KEY);

      if (jwtFromRequest) {
        contextType = CONTEXT_TYPE.CONTEXT_TYPE_HEADER ?? undefined;
        // Case1) Invocation from API Gateway
        // console.log('[contextExtractor] Case1) Invocation from API Gateway');
        tenantContext = TokenDirector.decode(jwtFromRequest);
      } else {
        contextType = CONTEXT_TYPE.CONTEXT_TYPE_PAYLOAD ?? undefined;
        if (_.has(event, logConst?.LOG_CONTEXT_FROM_LAMBDA_KEY)) {
          // Case2) Invocation from another lambda function
          // console.log('[contextExtractor] Case2) Invocation from another lambda function');
          tenantContext = this.extractFromEventByKey({
            event: event,
            key: logConst?.LOG_CONTEXT_FROM_LAMBDA_KEY,
          });
        } else if (_.has(event, 'Records')) {
          // Case3) Invocation(trigger) from event source of SQS
          // console.log('[contextExtractor] Case3) Invocation(trigger) from event source of SQS');
          tenantContext = this.extractFromSQSMessages({
            message: event,
            key: logConst?.LOG_CONTEXT_FROM_SQS_KEY,
          });
          if (!tenantContext) {
            contextType = CONTEXT_TYPE.CONTEXT_TYPE_BATCH ?? undefined;
          }
        } else if (_.has(event, logConst?.LOG_CONTEXT_FROM_ECS_KEY)) {
          // Case4) Invocation from ECS
          // console.log('[contextExtractor] Case4) Invocation from ECS');
          tenantContext = this.extractFromEventByKey({
            event: event,
            key: logConst?.LOG_CONTEXT_FROM_ECS_KEY,
          });
        } else {
          console.warn('[O11yv][contextExtractor] Cannot understand context');
          contextType = undefined;
          tenantContext = undefined;
        }
      }
    } catch (e) {
      console.warn(e);
    } finally {
      contextType = contextType ?? undefined;
      tenantContext = tenantContext ?? undefined;
    }
    return { contextType: contextType, tenantContext: tenantContext };
  };

  /**
   * Extract log context from lambda event.
   * @static
   * @param {Object} options - {event: Object, key: String}
   * @returns {Object} Object of log context
   */
  static extractFromEventByKey(options) {
    const { event, key } = options;
    return _.get(event, key, undefined);
  }

  /**
   * Extract log context from message attributes of SQS message.
   * @static
   * @param {Object} options - Options object { message: Object, key: String }.
   * @returns {Object|undefined} Object of log context, or undefined if extraction fails.
   */
  static extractFromSQSMessages(options) {
    const { message, key } = options;
    try {
      const messageRecords = _.get(message, 'Records', []);
      // SQS batch messages, Skip extractFromSQSMessage()...
      if (messageRecords.length === 1) {
        const SQS_MESSAGE_KEY = `Records[0].${key}`;
        const strContext = _.get(message, SQS_MESSAGE_KEY, undefined);
        const context = strContext ? JSON.parse(strContext) : {};
        return context;
      }
    } catch (e) {
      console.warn(e);
    }
    return undefined;
  };

  /**
   * Extract log context from message attributes of SQS message.
   * @static
   * @param {Object} options - Options object { message: Object, key: String }.
   * @returns {Object|undefined} Object of log context, or undefined if extraction fails.
   */
  static extractFromSQSMessageAttributes(options) {
    const { message, key } = options;
    try {
      const strContext = _.get(message, key, undefined);
      return strContext ? JSON.parse(strContext) : {};
    } catch (e) {
      console.warn(e);
    }
    return undefined;
  };

  /**
   * Extracts the root value from the given Trace ID.
   * @static
   * @param {String} traceId - Trace ID to extract the root value from.
   * @returns {String|undefined} Root value extracted from the Trace ID, or undefined if extraction fails.
   */
  static extractRootfromTraceId(traceId) {
    try {
      if (traceId) {
        const rootMatch = traceId.match(/Root=([^;]+)/);
        if (rootMatch && rootMatch[1]) {
          const rootValue = rootMatch[1];
          return rootValue;
        } else {
          // console.warn('There is no Root in trace id.');
        }
      }
      return undefined;
    } catch (e) {
      // console.warn('Failed to extract Root value from Trace ID.');
      return undefined;
    }
  };
}
