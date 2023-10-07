import { consts } from "../../src/const/consts";
import headerDirector from "../../src/service/headerDirector";

describe('headerDirector', () => {
  describe('getTraceIdFromRequest', () => {
    test('should return the trace ID from headers', () => {
      const request = {
        headers: {
          'x-amzn-trace-id': '1234567890',
        },
      };

      const traceId = headerDirector.getTraceIdFromRequest(request);

      expect(traceId).toBe('1234567890');
    });

    test('should return consts.UNKNOWN if trace ID is not found', () => {
      const request = {
        headers: {},
      };

      const traceId = headerDirector.getTraceIdFromRequest(request);

      expect(traceId).toBe(consts.UNKNOWN);
    });
  });
});
