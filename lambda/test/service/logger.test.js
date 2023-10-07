import TenantLogger from '../../src/service/logger.js';

const mockConfig = {
  enableLogging: true,
  logLevel: 'info',
  logOptions: {
    ENABLE_CALLER: true,
    CALLER_PREFIX: 'PREFIX_',
    ENABLE_XRAY_TRACE_ID: true,
  },
  logConst: {
    UNKNOWN: 'UNKNOWN',
    LOG_CONTEXT_FROM_SQS_KEY: 'messageAttributes.logContext.stringValue',
  },
  headerLogFormat: 'format_here',
};

const mockSQSMessage = {
  messageAttributes: {
    logContext: {
      stringValue: '{"key": "value"}',
    },
  },
};

describe('TenantLogger', () => {
  let initLoggerSpy;
  beforeEach(() => {
    initLoggerSpy = jest.spyOn(TenantLogger.prototype, 'initLogger');
  });

  test('create Logger with options', () => {
    const mockOptions = { serviceName: 'service-name', logLevel: 'INFO' };
    const logger = new TenantLogger(mockConfig, mockOptions);
    logger._logger = {
      appendKeys: jest.fn(),
    };
    expect(logger._isEnabled).toEqual(mockConfig.enableLogging);
    expect(logger._serviceName).toEqual('service-name');
    expect(logger._logLevel).toEqual('INFO');
    expect(logger.options).toEqual(mockOptions);
    expect(logger.initLogger).toHaveBeenCalled();
  });

  test('initLogger', () => {
    const logger = new TenantLogger(mockConfig);
    logger._logger = {
      appendKeys: jest.fn(),
    };

    logger.initLogger();

    expect(logger._logger.appendKeys).toHaveBeenCalled();
  });

  test('appendContextFromSQSMessage', () => {
    const logger = new TenantLogger();
    logger._isEnabled = true;
    logger._logger = {
      appendKeys: jest.fn(),
    };

    logger.appendContextFromSQSMessage(mockSQSMessage);

    expect(logger._logger.appendKeys).toHaveBeenCalled();
  });

  test('log methods', () => {
    const logger = new TenantLogger();
    logger._isEnabled = true;
    logger._logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    logger.info('Info message');
    logger.warn('Warn message');
    logger.error('Error message');
    logger.debug('Debug message');

    expect(logger._logger.info).toHaveBeenCalledWith('Info message');
    expect(logger._logger.warn).toHaveBeenCalledWith('Warn message');
    expect(logger._logger.error).toHaveBeenCalledWith('Error message');
    expect(logger._logger.debug).toHaveBeenCalledWith('Debug message');
  });

  test('setLogLevel', () => {
    const logger = new TenantLogger();
    logger._logger = {
      setLogLevel: jest.fn(),
    };

    logger.setLogLevel('warn');

    expect(logger._logger.setLogLevel).toHaveBeenCalledWith('warn');
  });

  test('getLogContext', () => {
    const logger = new TenantLogger();
    logger._isEnabled = true;
    logger._logger = {
      getPersistentLogAttributes: jest.fn(() => ({ logContext: { key: 'value' } })),
    };

    const logContext = logger.getLogContext();

    expect(logContext).toEqual({ logContext: { logContext: { key: 'value' } } });
  });
});
