/**
© 2023 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.
This AWS Content is provided subject to the terms of the AWS Customer Agreement available at  http://aws.amazon.com/agreement or other written agreement between Customer and either
Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both.
*/

import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import _ from 'lodash';

/**
 * Extracts a JWT (JSON Web Token) from the cookies(cookieList).
 *
 * @class TokenDirector
 * @description
 * TokenDirector is reponsible for extracting a JWT(JSON Web Token) from the cookies(cookieList).
 *
 * It first checks if the "cookies" is in the event payload and tries to find a token part in it using the "token=" pattern.
 *
 * If a token is found in the cookie list, it is returned as the JWT token.
 * If neither the cookie nor the authorization header contains a JWT token, an it return 'undefined'.
 *
 * This class consists of static methods.
 */
export default class TokenDirector {
  /**
   * Return cookie string from request.
   * @static
   * @param {Object} request - The request object of the Lambda event.
   * @param {string} tokenKey - The key to look for the JWT token in the cookies.
   * @returns {string|undefined} The JWT token string found in the request cookies, or undefined if not found.
   */
  static getJwtFromRequest(request, key) {
    try {
      let jwt = undefined;
      // Parse the barear token, if jwt in the authorization header
      if (key === 'headers.authorization' || key === 'headers.Authorization') {
        const tokenValue = _.get(request, key, undefined);
        jwt = this.getJwtFromAuthrizationHeader(tokenValue);
      } else if (key.startsWith('headers.cookie.') || key.startsWith('headers.Cookie.')) {
        const regex = /(.+)\.(.+)/;
        const [__, tokenValueKey, tokenKey] = key.match(regex);
        const tokenValue = _.get(request, tokenValueKey, undefined);
        jwt = this.getJwtFromCookie(tokenValue, tokenKey);
      }
      // console.log(`[TokenDirector] getJwtFromRequest() result: ${jwt}`);
      return jwt;
    } catch (e) {
      console.warn(e);
    }
  }

  static sign(data, key, options) {
    return jwt.sign(data, key, options);
  }

  static verify(key, token, options) {
    return new Promise((resolve) => {
      jwt.verify(token, key, options, (err, decoded) => {
        if (err) {
          console.warn(`[TokenDirector] Failed jwt verification`, err, token);
          // throw new Error('Unauthorized');
        }
        resolve(decoded);
      });
    });
  }

  /**
   * Decode JWT token.
   * @static
   * @param {String} token - JWT token to decode.
   * @returns {Object|undefined} Decoded JWT object, or undefined if decoding fails.
   */
  static decode(token) {
    if (!token) {
      return {};
    }
    const decodedToken = jwt.decode(token);
    // console.log('[TokenDirector] decode jwt: ', decodedToken);

    return decodedToken;
  }

  static getJwtFromAuthrizationHeader(authHeader) {
    try {
      if (!authHeader) {
        console.log('[TokenDirector] getJwtFromAuthrizationHeader(): Authorization header missing');
        return undefined;
      }

      const token = authHeader.split(' ')[1]; // extract from "Bearer <token>" format
      if (!token) {
        console.log('[TokenDirector] getJwtFromAuthrizationHeader(): Token not found in Authorization header');
        return undefined;
      }

      return token;
    } catch (e) {
      console.warn('[TokenDirector] getJwtFromAuthrizationHeader(): Internal server error', e);
      return undefined;
    }
  }

  /**
   * Extract log context from cookie string.
   * @param {String} cookies - this field should be cookie string
   * @param {String} key = the key value of the token in cookie
   * @returns {Object} Object of base64 decoded jwt
   */
  static getJwtFromCookie = (cookies, key) => {
    try {
      if (cookies) {
        const jsonCookies = cookie.parse(cookies);
        if (jsonCookies) {
          const token = jsonCookies[key] ?? undefined;
          // console.log('[tokenDirector] getJwtFromCookie(): getJwtFromCookie: ', token);
          return token;
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return undefined;
  };

  static getJwtFromCookieList(cookieList, key) {
    try {
      if (cookieList === undefined || cookieList.length == 0) {
        return undefined;
      }
      key = key.split('=')[0];
      for (let cookieElement of cookieList) {
        const cookie = cookieElement.trim().split('=');
        const cookieKey = cookie[0];
        const cookieValue = cookie[1];
        if (cookieKey === key) {
          return cookieValue;
        }
      }
    } catch (e) {
      console.warn(`[TokenDirector] extractCookieValue(): Failed to extract cookie value...`, e);
    }
    return undefined;
  }
}
