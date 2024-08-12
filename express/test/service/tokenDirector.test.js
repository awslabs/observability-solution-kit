import tokenDirector from "../../src/service/tokenDirector";

describe('tokenDirector', () => {
  describe('getJwtFromRequest', () => {
    test('should return the JWT token from the request headers', () => {
      const request = {
        headers: {
          cookie: 'token=abc123; otherCookie=def456',
        },
      };

      const jwtToken = tokenDirector.getJwtFromRequest(request);

      expect(jwtToken).toBe('abc123');
    });

    test('should return an empty string if the token is not found in the request headers', () => {
      const request = {
        headers: {
          cookie: 'otherCookie=def456',
        },
      };

      const jwtToken = tokenDirector.getJwtFromRequest(request);

      expect(jwtToken).toBe('');
    });

    test('should return an empty string if the request headers are empty', () => {
      const request = {
        headers: {},
      };

      const jwtToken = tokenDirector.getJwtFromRequest(request);

      expect(jwtToken).toBe('');
    });
  });
});
