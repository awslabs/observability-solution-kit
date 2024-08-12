import contextExtractor from "../../src/service/contextExtractor";

describe('contextExtractor', () => {
  test('extract should return an empty object if jwtFromRequest is falsy', () => {
    const jwtFromRequest = null;
    const result = contextExtractor.extract(jwtFromRequest);

    expect(result).toEqual({});
  });

  test('extract should decode the JWT token and return the decoded token', () => {
    const jwtFromRequest = 'eyJhbGciOiJIUzI1NiJ9.eyJhY2NvdW50Ijp7ImVtYWlsIjoiYWFhQGNjYy5jb20iLCJ1c2VyTmFtZSI6IkZJUlNUTkFNRSBMQVNUTkFNRSIsInVzZXJJZCI6IlVTRVJJRCJ9LCJ1c2VySW5mbyI6eyJmaXJzdE5hbWUiOiJGSVJTVE5BTUUiLCJsYXN0TmFtZSI6IkxBU1ROQU1FIn0sIm9yZ2FuaXphdGlvbnMiOlt7Im9yZ2FuaXphdGlvbklkIjoiQUJDIiwib3JnYW5pemF0aW9uTmFtZSI6Ikphc3N5In1dLCJ0b2tlblR5cGUiOiJ1c2VyIiwiaWF0IjoxNjg4MDQyOTA3LCJleHAiOjE2ODgxMjkzMDcsImlzcyI6IlRlc3QifQ.zOEUjH6Q3PtYI16WgpF7xM1jlHDM8gbD9mRNgYxOKgI';
    const decodedToken = {
        "account": {
          "email": "aaa@ccc.com",
          "userName": "FIRSTNAME LASTNAME",
          "userId": "USERID"
        },
        "userInfo": {
          "firstName": "FIRSTNAME",
          "lastName": "LASTNAME"
        },
        "organizations": [
          {
            "organizationId": "ABC",
            "organizationName": "Jassy"
          }
        ],
      "tokenType": "user",
      "iat": 1688042907,
      "exp": 1688129307,
      "iss": "Test"
      };

    const result = contextExtractor.extract(jwtFromRequest);
    expect(result).toEqual(decodedToken);
  });
});
