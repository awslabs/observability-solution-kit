/**
 * Mapping of log message properties to tenant and user context.
 *
 * @const {object} logFormattingMap
 *
 * @description
 * This object exports a mapping of log message properties to tenant and user context.
 * Each property key represents a specific property path in the log message, and its value represents the corresponding context key.
 * When applied to a log message, these property keys will be replaced by the corresponding context values, if available.
 * For example, 'tenant.organizationId' in the log message will be replaced by the actual tenant organization ID from the context.
 * This mapping helps to enrich log messages with tenant and user context information for better log analysis and monitoring.
 */
const logFormattingMap = {
  'tenant.tenantId'   : 'tenantContext.tenantId',
  'tenant.tenantName' : 'tenantContext.tenantName',
  'tenant.plan'       : 'tenantContext.plan',
  'account.userId'    : 'userContext.userId',
  'account.gender'    : 'userContext.gender',
  'account.role'      : 'userContext.role',
};

export { logFormattingMap };