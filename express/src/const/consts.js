/**
 * Constants object containing various constant properties.
 *
 * @const {object} consts
 * @property {string} UNKNOWN - Represents an unknown value or default when a specific value is not available.
 * @property {number} EXTRACT_INDEX - The index used for extracting elements from an array or other data structures.
 * @property {string} ATTRIBUTES_KEY - The key used for tenant-aware attributes in an SQS message.
 * @property {string} LOG_STORAGE_KEY - The key used to store log context in an AsyncLocalStorage store.
 * @property {string} CHILD_LOGGER_KEY - The key used to store a child logger in an AsyncLocalStorage store.
 * @property {string} CALLER_PREFIX - Prefix used to identify the caller in logs, specifically for ECS services.
 * @property {string} TRACE_KEY_IN_SQS_HEADER - The key for the AWS X-Ray trace header in SQS message attributes.
 * @property {string} ECS_FARGATE_ORIGIN - The origin identifier for AWS Fargate services in ECS (Elastic Container Service).
 * @property {string} DEFAULT_CONSUMER_NAME - The default name for the SQS consumer.
 *
 * @description
 * This object exports various constant properties used throughout the SDK.
 * Each property represents a specific constant value used in different parts of the SDK.
 * The comments describe the purpose of each constant property.
 */
export const consts = {
    UNKNOWN: 'unknown',
    EXTRACT_INDEX: 0,
    ATTRIBUTES_KEY: 'logAttributes',
    LOG_STORAGE_KEY: 'logContext',
    CHILD_LOGGER_KEY: 'childLogger',
    CALLER_PREFIX: 'ecs:',
    TRACE_KEY_IN_SQS_HEADER: 'AWSTraceHeader',
    ECS_FARGATE_ORIGIN: 'AWS::ECS::Fargate',
    DEFAULT_CONSUMER_NAME: 'SqsConsumer'
};