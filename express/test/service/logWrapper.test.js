import { Log } from "../../src/service/logWrapper";

describe('Log', () => {
  let log;
  let logger;

  beforeEach(() => {
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };
    console.log = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.debug = jest.fn();
  });

  test('info should log the message when logging is enabled', () => {
    log = new Log(true, logger);
    log.info('Hello', 'world');

    expect(console.log).not.toHaveBeenCalled(); // Ensure console.log is not called
    expect(logger.info).toHaveBeenCalledWith(
      'Helloworld',
      expect.objectContaining({ caller: expect.any(String) })
    );
  });

  test('info should log the message to console when logging is disabled', () => {
    log = new Log(false, logger);

    log.info('Hello', 'world');

    expect(console.log).toHaveBeenCalledWith('Helloworld'); // Ensure console.log is called
    expect(logger.info).not.toHaveBeenCalled(); // Ensure logger.info is not called
  });

  test('error should log the message when logging is enabled', () => {
    log = new Log(true, logger);
    log.error('Hello', 'world');

    expect(console.error).not.toHaveBeenCalled(); // Ensure console.log is not called
    expect(logger.error).toHaveBeenCalledWith(
      'Helloworld',
      expect.objectContaining({ caller: expect.any(String) })
    );
  });

  test('error should log the message to console when logging is disabled', () => {
    log = new Log(false, logger);

    log.error('Hello', 'world');

    expect(console.error).toHaveBeenCalledWith('Helloworld'); // Ensure console.log is called
    expect(logger.error).not.toHaveBeenCalled(); // Ensure logger.info is not called
  });

  test('warn should log the message when logging is enabled', () => {
    log = new Log(true, logger);
    log.warn('Hello', 'world');

    expect(console.warn).not.toHaveBeenCalled(); // Ensure console.log is not called
    expect(logger.warn).toHaveBeenCalledWith(
      'Helloworld',
      expect.objectContaining({ caller: expect.any(String) })
    );
  });

  test('warn should log the message to console when logging is disabled', () => {
    log = new Log(false, logger);

    log.warn('Hello', 'world');

    expect(console.warn).toHaveBeenCalledWith('Helloworld'); // Ensure console.log is called
    expect(logger.warn).not.toHaveBeenCalled(); // Ensure logger.info is not called
  });

  test('debug should log the message when logging is enabled', () => {
    log = new Log(true, logger);
    log.debug('Hello', 'world');

    expect(console.debug).not.toHaveBeenCalled(); // Ensure console.log is not called
    expect(logger.debug).toHaveBeenCalledWith(
      'Helloworld',
      expect.objectContaining({ caller: expect.any(String) })
    );
  });

  test('debug should log the message to console when logging is disabled', () => {
    log = new Log(false, logger);

    log.debug('Hello', 'world');

    expect(console.debug).toHaveBeenCalledWith('Helloworld'); // Ensure console.log is called
    expect(logger.debug).not.toHaveBeenCalled(); // Ensure logger.info is not called
  });

});
