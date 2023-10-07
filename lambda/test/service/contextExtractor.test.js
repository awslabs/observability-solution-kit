import ContextExtractor from '../../src/service/contextExtractor.js';

const mockEvent = {
  headers: {
    Accept: '*/*',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  },
  body: '{"key": "value"}',
  Records: [
    {
      messageAttributes: {
        logContext: {
          stringValue: '{"key": "value"}',
        },
      },
    },
  ],
};

const mockDecodedJwt = {
  sub: '1234567890',
  name: 'John Doe',
  iat: 1516239022,
};

const mockContextString = '{"key": "value"}';
const mockDecodedString = { iat: 1516239022, name: 'John Doe', sub: '1234567890' };

describe('ContextExtractor', () => {
  test('extract - extractFromSQSMessageAttributes()', () => {
    const mockConfig = {
      logConst: {
        LOG_CONTEXT_FROM_SQS_KEY: 'messageAttributes.logContext.stringValue',
      },
    };
    const mockRecord = mockEvent.Records[0];
    const mockExtractedContext = {
      key: 'value',
    };

    const result = ContextExtractor.extractFromSQSMessageAttributes({
      message: mockRecord,
      key: mockConfig.logConst.LOG_CONTEXT_FROM_SQS_KEY,
    });
    expect(result).toBeDefined();
    expect(result).toEqual(mockExtractedContext);
  });

  test('extract - API Gateway', () => {
    const mockConfig = {
      logConst: {
        LOG_CONTEXT_FROM_TOKEN_KEY: 'headers.Authorization',
        LOG_CONTEXT_FROM_LAMBDA_KEY: 'body',
      },
      headerLogFormat: {
        name: 'my.name',
      },
    };

    const result = ContextExtractor.extract(mockEvent, mockConfig);

    expect(result).toBeDefined();
    expect(result.contextType).toBe('header');
    expect(result.tenantContext).toEqual(mockDecodedString);

    delete mockEvent.headers.Authorization;
  });

  test('extract - Invocation from another lambda function', () => {
    const mockConfig = {
      logConst: {
        LOG_CONTEXT_FROM_TOKEN_KEY: 'headers.Authorization',
        LOG_CONTEXT_FROM_LAMBDA_KEY: 'body',
      },
    };
    delete mockEvent.cookies;

    const result = ContextExtractor.extract(mockEvent, mockConfig);

    expect(result).toBeDefined();
    expect(result.contextType).toBe('payload');
    expect(result.tenantContext).toEqual(mockContextString);
  });

  test('extract - Invocation(trigger) from event source of SQS', () => {
    const mockConfig = {
      logConst: {
        LOG_CONTEXT_FROM_TOKEN_KEY: 'headers.Authorization',
        LOG_CONTEXT_FROM_LAMBDA_KEY: 'body',
        LOG_CONTEXT_FROM_SQS_KEY: 'messageAttributes.logContext.stringValue',
      },
    };
    delete mockEvent.cookies;

    const result = ContextExtractor.extract(mockEvent, mockConfig);

    expect(result).toBeDefined();
    expect(result.contextType).toBe('payload');
    expect(result.tenantContext).toEqual(mockContextString);
  });

  test('extract - Invocation from ECS', () => {
    const mockConfig = {
      logConst: {
        LOG_CONTEXT_FROM_TOKEN_KEY: 'headers.Authorization',
        LOG_CONTEXT_FROM_LAMBDA_KEY: 'body_lambda',
        LOG_CONTEXT_FROM_ECS_KEY: 'body',
      },
    };
    delete mockEvent.cookies;
    delete mockEvent.Records;

    const result = ContextExtractor.extract(mockEvent, mockConfig);

    expect(result).toBeDefined();
    expect(result.contextType).toBe('payload');
    expect(result.tenantContext).toEqual(mockContextString);
  });

  test('extract - Cannot understand context', () => {
    const mockConfig = {
      logConst: {
        LOG_CONTEXT_FROM_TOKEN_KEY: 'token=',
        LOG_CONTEXT_FROM_LAMBDA_KEY: 'body',
      },
    };
    delete mockEvent.cookies;
    delete mockEvent.body;

    const result = ContextExtractor.extract(mockEvent, mockConfig);
  });

  test('extract - extractRootfromTraceId()', () => {
    const mockTraceId = 'Root=trace-id-root;Parent=trace-id-parent;Sampled=0;';
    const expectedValue = 'trace-id-root';

    const result = ContextExtractor.extractRootfromTraceId(mockTraceId);
    expect(result).toBeDefined();
    expect(result).toEqual(expectedValue);
  });
});
