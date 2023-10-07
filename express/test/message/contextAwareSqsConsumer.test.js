import { ContextAwareSqsConsumer } from '../../src/message/contextAwareSqsConsumer.js';
import { isNotLoggingEnabled } from '../../src/configuration/director.js';
import { winstonLogger } from '../../src/service/loggerCreator.js';
import AWSXRay from 'aws-xray-sdk';

jest.mock('../../src/configuration/director', () => {
  return {
    getServiceName: jest.fn().mockReturnValue('MyService'),
    isNotLoggingEnabled: jest.fn().mockReturnValue(false),
  };
});

jest.mock('../../src/service/loggerCreator', () => {
  return {
    winstonLogger: {
      warn: jest.fn(),
      child: jest.fn().mockReturnValue({ info: jest.fn() }),
    },
  };
});

jest.mock('aws-xray-sdk', () => {
  const closeFn = jest.fn();
  const setSegmentFn = jest.fn();
  return {
    setContextMissingStrategy: jest.fn(),
    utils: {
      processTraceData: jest.fn().mockReturnValue({
        root: '12345',
        parent: '67890',
        sampled: '1',
      }),
    },
    Segment: jest.fn().mockImplementation(() => ({
      close: closeFn,
    })),
    setSegment: setSegmentFn,
    getNamespace: jest.fn().mockReturnValue({
      run: jest.fn(),
    }),
  };
});

jest.spyOn(ContextAwareSqsConsumer.prototype, 'getTenantAttributes').mockReturnValue({});

describe('ContextAwareSqsConsumer', () => {
  let options;

  beforeEach(() => {
    options = {
      handleMessage: jest.fn(),
      queueUrl: 'https://dummy.sqs.url',
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new ContextAwareSqsConsumer', () => {
    const consumer = ContextAwareSqsConsumer.create(options);
    expect(consumer).toBeDefined();
  });

  it('should set segment with trace header', () => {
    const consumer = new ContextAwareSqsConsumer(options);
    const message = {
      Attributes: { AWSTraceHeader: 'Root=12345;Parent=67890;Sampled=1' },
    };
    consumer.setSegmentWithTraceHeader(message);
    expect(AWSXRay.utils.processTraceData).toHaveBeenCalledWith('Root=12345;Parent=67890;Sampled=1');
    expect(AWSXRay.Segment).toHaveBeenCalledWith('MyService', '12345', '67890');
    expect(AWSXRay.setSegment).toHaveBeenCalledWith(expect.any(Object));
  });

  it('should call originalHandleMessage when logging is not enabled', () => {
    const consumer = new ContextAwareSqsConsumer(options);
    isNotLoggingEnabled.mockReturnValueOnce(true);
    consumer.tenantAwareHandleMessage({});
    expect(isNotLoggingEnabled).toHaveBeenCalled();
    expect(consumer.originalHandleMessage).toHaveBeenCalled();
    consumer.tenantAwareHandleMessage({});
    expect(isNotLoggingEnabled).toHaveBeenCalled();
    expect(consumer.originalHandleMessage).toHaveBeenCalled();
  });

  it('should handle message when logging is enabled', async () => {
    const consumer = new ContextAwareSqsConsumer(options);
    const message = {
      MessageAttributes: {
        ['logAttributes']: {
          StringValue: JSON.stringify({ key: 'value' }),
        },
      },
    };
    await consumer.tenantAwareHandleMessage(message);
    expect(isNotLoggingEnabled).toHaveBeenCalled();
    expect(consumer.getTenantAttributes).toHaveBeenCalledWith(message);
    expect(winstonLogger.child).toHaveBeenCalled();
  });

  it('should handle message when logging is enabled but log attributes are not properly formatted', async () => {
    const consumer = new ContextAwareSqsConsumer(options);
    const message = {
      MessageAttributes: {
        ['logAttributes']: {
          StringValue: 'invalid_json',
        },
      },
    };
    await consumer.tenantAwareHandleMessage(message);
    expect(isNotLoggingEnabled).toHaveBeenCalled();
    expect(consumer.getTenantAttributes).toHaveBeenCalledWith(message);
  });
});
