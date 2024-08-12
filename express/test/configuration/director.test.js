import * as director from '../../src/configuration/director.js';

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

describe('director', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if logging is enabled', () => {
    expect(director.isLoggingEnabled()).toBe(true);
  });

  it('should return false if logging is not enabled', () => {
    expect(director.isNotLoggingEnabled()).toBe(false);
  });

  it('should return default service name from config', () => {
    expect(director.getServiceName()).toBe('MyService');
  });
});
