import { logContextStore } from "../../src/service/logContextStore";
import { proxyLogger, winstonLogger } from "../../src/service/loggerCreator";

describe('Logger Creator', () => {
  beforeEach(() => {
    const key = 'key';
    const value = 'value';
    logContextStore.getValueFromStore = jest.fn().mockReturnValue({ [key]: value});
  });

  test('should create a winston logger', () => {
    expect(winstonLogger).toBeDefined();
  });

  test('should create a proxy logger', () => {
    expect(proxyLogger).toBeDefined();
  });

  test('should create a proxy logger if there is no log context in store', () => {
    logContextStore.getValueFromStore = jest.fn().mockReturnValue(undefined);
    expect(proxyLogger).toBeDefined();
  });

  // test('Log format should include level, message, and timestamp', () => {
  //   const expectedFormat = {
  //     level: expect.any(String),
  //     message: expect.any(String),
  //     timestamp: expect.any(String),
  //   };

  //   // 로깅 메시지를 생성합니다.
  //   const logger = winstonLogger.info('Test log message');

  //   // 생성된 로그의 포맷을 확인합니다.
  //   const logFormat = winstonLogger.transports[0];


  //   // 생성된 로그의 포맷과 예상되는 포맷을 비교합니다.
  //   expect(logFormat).toMatchObject(expectedFormat);
  // });

});
