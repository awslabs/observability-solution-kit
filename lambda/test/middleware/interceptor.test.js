import interceptor from '../../src/middleware/interceptor.js';
import ContextExtractor from '../../src/service/contextExtractor.js';
import LogFormatter from '../../src/service/logFormatter.js';
import CONTEXT_TYPE from '../../src/const/contextTypeConst.js';

jest.mock('../../src/service/contextExtractor', () => ({
  extract: jest.fn(),
  extractRootfromTraceId: jest.fn(),
}));

jest.mock('../../src/service/logFormatter', () => ({
  initFormat: jest.fn(),
  apply: jest.fn(),
}));

const loggerMock = {
  isEnabled: true,
  config: null,
  initLogger: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  appendKeys: jest.fn(),
  getPersistentLogAttributes: jest.fn(),
};

const dummyParams = {
  isEnabled: true,
  logOptions: {
    ENABLE_XRAY_TRACE_ID: true,
    ENABLE_CALLER: true,
    CALLER_PREFIX: 'lambda:',
  },
  logConst: {
    UNKNOWN: 'unknown',
    SET_CONTEXT_INTO_LAMBDA_PAYLOAD_KEY: '_logContext',
    LOG_CONTEXT_FROM_TOKEN_KEY: 'token=',
    LOG_CONTEXT_FROM_LAMBDA_KEY: '_logContext',
    LOG_CONTEXT_FROM_SQS_KEY: 'messageAttributes.logAttributes.stringValue',
    LOG_CONTEXT_FROM_ECS_KEY: '_logContext',
  },
  headerLogFormat: {
    'organizations[0].organizationId': 'tenantContext.organizationId',
    'organizations[0].businessType': 'tenantContext.businessType',
    'organizations[0].organizationName': 'tenantContext.organizationName',
    'organizations[0].industry': 'tenantContext.industry',
    'organizations[0].country': 'tenantContext.country',
    'account.userId': 'userContext.userId',
  },
};

describe('interceptor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should skip interceptor if logger is disabled', async () => {
    const logger = { 
      ...loggerMock, 
      isEnabled: false, 
      logConst: {},
      logOptions: {},
      headerLogFormat: {}
    };
    const request = {};

    await interceptor(logger).before(request);

    expect(logger.initLogger).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith('[5k-saas][interceptor] Logger is disabled. skip interceptor...');
  });

  it('should handle errors when loading log configuration', async () => {
    const logger = { ...loggerMock };
    const request = {};

    await interceptor(logger).before(request);

    expect(logger.initLogger).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      '[5k-saas][interceptor] Cannot read config. please check if config is valid. skip interceptor...'
    );
  });

  it('should handle context extraction based on CONTEXT_TYPE_HEADER', async () => {
    const request = {
      event: {
        headers: { 'x-amzn-trace-id': 'some-trace-id' },
      },
    };
    const expectedValue = {
      'account.userId': 'userContext.userId',
      'organizations[0].businessType': 'tenantContext.businessType',
      'organizations[0].country': 'tenantContext.country',
      'organizations[0].industry': 'tenantContext.industry',
      'organizations[0].organizationId': 'tenantContext.organizationId',
      'organizations[0].organizationName': 'tenantContext.organizationName',
    };
    const logger = { ...loggerMock, config: { ...dummyParams } };

    ContextExtractor.extract.mockReturnValue({ contextType: CONTEXT_TYPE.CONTEXT_TYPE_HEADER, tenantContext: {} });
    ContextExtractor.extractRootfromTraceId.mockReturnValue('my-trace-id');
    LogFormatter.apply.mockReturnValue({ key: 'value' });
    LogFormatter.initFormat.mockReturnValue({ key2: 'value2' });
    const expectedLogContext = {
      key: 'value',
      requestId: 'my-trace-id',
      traceId: 'my-trace-id',
    };

    await interceptor(logger).before(request);

    expect(LogFormatter.apply).toHaveBeenCalledWith(expectedValue, {}, 'unknown');
    expect(logger.appendKeys).toHaveBeenCalledTimes(1);
    expect(logger.appendKeys).toHaveBeenCalledWith(expectedLogContext);
    expect(request.event['someLogContextKey']).toBeUndefined();
  });
});
