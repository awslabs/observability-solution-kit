import config from '../../src/configuration/index.js';

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
    expect(config.get('saas.observability.logging.enable')).toBe(true);
  });

  it('should return service name from config', () => {
    expect(config.get('saas.observability.name')).toBe('MyService');
  });
});
