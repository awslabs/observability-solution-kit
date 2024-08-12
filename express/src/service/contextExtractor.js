import jwt from 'jsonwebtoken';
import _ from 'lodash';

/**
 * Extracts information from a JWT (JSON Web Token).
 *
 * @param {string} jwtFromRequest The JWT token to extract information from.
 * @returns {object} An object containing the decoded information from the JWT.
 *
 * @description
 * This function extracts information from the given JWT token and returns it as an object.
 * If no JWT token is provided, an empty object is returned.
 *
 * @example
 * const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
 * const extractedInfo = extract(jwtToken);
 * console.log(extractedInfo);
 *
 * // Output:
 * // {
 * //   "userId": 123,
 * //   "username": "john_doe",
 * //   "exp": 1674889721
 * // }
 */
const extract = (jwtFromRequest) => {
    if(!jwtFromRequest) {
        return {};
    }
    const decodedToken = jwt.decode(jwtFromRequest);

    return decodedToken;
}

export default {
    extract,
}