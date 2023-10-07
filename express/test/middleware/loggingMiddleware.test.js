import beforeMiddleware from '../../src/middleware/loggingMiddleware.js'; // Update the path to match the actual location of the 'before' module
import tokenDirector from '../../src/service/tokenDirector.js';
import contextExtractor from '../../src/service/contextExtractor.js';
import logFormatter from '../../src/service/logFormatter.js';
import headerDirector from '../../src/service/headerDirector.js';
import { logFormattingMap } from '../../src/layout/logLayout.js';

jest.mock('../../src/service/tokenDirector.js');
jest.mock('../../src/service/contextExtractor.js');
jest.mock('../../src/service/logFormatter.js');
jest.mock('../../src/service/headerDirector.js');

describe('before middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should construct formatted context correctly', () => {
    const request = {};
    const jwtFromRequest = 'mockedJwt';
    const decodedToken = { id: 123, username: 'user123' };
    const formattedContext = { id: 123, username: 'user123', traceId: 'mockedTraceId' };

    tokenDirector.getJwtFromRequest.mockReturnValue(jwtFromRequest);
    contextExtractor.extract.mockReturnValue(decodedToken);
    logFormatter.apply.mockReturnValue(formattedContext);
    headerDirector.getTraceIdFromRequest.mockReturnValue('mockedTraceId');

    const result = beforeMiddleware.before(request);

    expect(tokenDirector.getJwtFromRequest).toHaveBeenCalledWith(request);
    expect(contextExtractor.extract).toHaveBeenCalledWith(jwtFromRequest);
    expect(logFormatter.apply).toHaveBeenCalledWith(logFormattingMap, decodedToken);
    expect(headerDirector.getTraceIdFromRequest).toHaveBeenCalledWith(request);
    expect(result).toEqual(formattedContext);
  });
});
