import TokenDirector from '../../src/service/tokenDirector.js';

const mockJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('TokenDirector', () => {
  test('getJwtFromAuthrizationHeader - get jwt from authorization header', () => {
    const invalidToken = 'invalid';
    const mockJwtHeader = 'Bearer ' + mockJwt;
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    expect(TokenDirector.getJwtFromAuthrizationHeader(mockJwtHeader)).toBe(token);
    expect(TokenDirector.getJwtFromAuthrizationHeader(undefined)).toBeUndefined();
    expect(TokenDirector.getJwtFromAuthrizationHeader(invalidToken)).toBeUndefined();
  });

  test('getJwtFromCookie() - get jwt from cookie string', () => {
    const cookies = "jwt_token=token_value; other_cookie=other_value";

    expect(TokenDirector.getJwtFromCookie(cookies, 'jwt_token')).toBe('token_value');
    expect(TokenDirector.getJwtFromCookie(cookies, 'other_cookie')).toBe('other_value');
    expect(TokenDirector.getJwtFromCookie(cookies, 'key4')).toBeUndefined();
  });

  test('getJwtFromCookieList() - get jwt from cookie lsit', () => {
    const cookieList = ['key1=value1', 'key2=value2', 'key3=value3'];

    expect(TokenDirector.getJwtFromCookieList(cookieList, 'key1')).toBe('value1');
    expect(TokenDirector.getJwtFromCookieList(cookieList, 'key2')).toBe('value2');
    expect(TokenDirector.getJwtFromCookieList(cookieList, 'key3')).toBe('value3');
    expect(TokenDirector.getJwtFromCookieList(cookieList, 'key4')).toBeUndefined();
  });

  test('decode() - decode jwt payload', () => {
    const token_value = {
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022
    }

    expect(TokenDirector.decode(mockJwt)).toStrictEqual(token_value);
  });

  test('getJwtFromRequest - valid auth header', () => {
    const request = {
      // cookies: ['jwt_token=token_value', 'other_cookie=other_value'],
      headers: {
        Authorization: 'Bearer token_value'
      }
    };
    const tokenKey = 'headers.Authorization';

    const jwt = TokenDirector.getJwtFromRequest(request, tokenKey);

    expect(jwt).toBe('token_value');
  });

  test('getJwtFromRequest - invalid auth header', () => {
    const request = {
      // cookies: ['other_cookie=other_value'],
      headers: {
        Other: 'other_value'
      }
    };
    const tokenKey = 'headers.Authorization';

    const jwt = TokenDirector.getJwtFromRequest(request, tokenKey);

    expect(jwt).toBeUndefined();
  });

  test('getJwtFromRequest - no auth header', () => {
    const request = {
      nonheader: 'value'
    };
    const tokenKey = 'headers.authorization';

    const jwt = TokenDirector.getJwtFromRequest(request, tokenKey);

    expect(jwt).toBeUndefined();
  });

  test('getJwtFromRequest - valid cookie string', () => {
    const request = {
      headers: {
        Cookie: 'jwt_token=token_value; other_cookie=other_value;',
      }
    };
    const tokenKey = 'headers.Cookie.jwt_token';

    const jwt = TokenDirector.getJwtFromRequest(request, tokenKey);

    expect(jwt).toBe('token_value');
  });

  test('getJwtFromRequest - invalid cookie string', () => {
    const request = {
      headers: {
        Cookie: 'one_cookcie=some_value; other_cookie=other_value;',
      }
    };
    const tokenKey = 'headers.Cookie.jwt_token';

    const jwt = TokenDirector.getJwtFromRequest(request, tokenKey);

    expect(jwt).toBeUndefined();
  });

  test('getJwtFromRequest - no cookie header', () => {
    const request = {
      nonheader: 'value'
    };
    const tokenKey = 'headers.cookie';

    const jwt = TokenDirector.getJwtFromRequest(request, tokenKey);

    expect(jwt).toBeUndefined();
  });
});
