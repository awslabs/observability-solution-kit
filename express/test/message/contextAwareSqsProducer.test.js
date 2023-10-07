import { ContextAwareSqsProducer } from '../../src/message/contextAwareSqsProducer.js';
import { isNotLoggingEnabled } from '../../src/configuration/director.js';
import { winstonLogger } from '../../src/service/loggerCreator.js';

jest.mock('aws-sdk', () => {
  const SQSMock = {
    sendMessage: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  const AWSMock = {
    SQS: jest.fn(() => SQSMock),
    config: {
      update: jest.fn(),
    },
  };
  return AWSMock;
});

jest.mock('aws-xray-sdk', () => {
  return {
    captureAWSClient: jest.fn((client) => client),
  };
});
jest.mock('../../src/configuration/director', () => {
  return {
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

jest.mock('properties-reader', () => {
  return jest.fn().mockImplementation(() => {
    return {
      get: jest.fn().mockImplementation((key) => {
        switch (key) {
          case 'saas.observability.logging.enable':
            return true;
          case 'saas.observability.name':
            return 'MyService';
          default:
            return undefined;
        }
      }),
    };
  });
});

describe('ContextAwareSqsProducer', () => {
  test('should send a message without log context when logging is disabled', async () => {
    isNotLoggingEnabled.mockReturnValue(true);

    const producer = new ContextAwareSqsProducer();
    const sendMessageParams = {
      MessageBody: 'Test message',
    };

    await producer.tenantAwareSendMessage(sendMessageParams);

    expect(producer.producer.sendMessage).toHaveBeenCalledWith(sendMessageParams);
    expect(producer.producer.promise).toHaveBeenCalled();
  });

  test('should send a message with log context when logging is enabled', async () => {
    isNotLoggingEnabled.mockReturnValue(false);

    const producer = new ContextAwareSqsProducer();
    const sendMessageParams = {
      MessageBody: 'Test message',
      MessageAttributes: {},
    };

    const logContext = {};

    const response = { MessageId: '12345' };
    producer.producer.promise.mockResolvedValue(response);

    const expectedParams = {
      ...sendMessageParams,
      MessageAttributes: {
        logAttributes: {
          DataType: 'String',
          StringValue: JSON.stringify(logContext),
        },
        ...sendMessageParams.MessageAttributes,
      },
    };

    const result = await producer.tenantAwareSendMessage(sendMessageParams);

    expect(producer.producer.sendMessage).toHaveBeenCalledWith(expectedParams);
    expect(producer.producer.promise).toHaveBeenCalled();

    expect(result).toEqual(response);
  });

  test('should handle an error when sending a message with log context', async () => {
    isNotLoggingEnabled.mockReturnValue(false);

    const producer = new ContextAwareSqsProducer();
    const sendMessageParams = {
      MessageBody: 'Test message',
    };

    const errorMessage = 'Some error message';

    producer.producer.promise.mockRejectedValue(new Error(errorMessage));

    await producer.tenantAwareSendMessage(sendMessageParams);

    expect(winstonLogger.warn).toHaveBeenCalledTimes(1);
  });
});
