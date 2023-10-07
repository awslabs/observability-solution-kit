/**
 * Extracts a JWT (JSON Web Token) from the request's headers or cookies.
 *
 * @param {object} request The request object containing headers and cookies.
 * @returns {string} The extracted JWT token, or an empty string if not found.
 *
 * @description
 * This function attempts to extract a JWT token from the provided request object's headers or cookies.
 * It first checks if the "cookie" header is available and tries to find a token part in it using the "token=" pattern.
 * If a token is found in the cookie, it is returned as the JWT token.
 * If not found in the cookie, the function checks the "authorization" header for a JWT token.
 * If found, it returns the JWT token from the "authorization" header.
 * If neither the cookie nor the authorization header contains a JWT token, an empty string is returned.
 *
 * @example
 * // Example 1: JWT token is present in the "cookie" header.
 * const requestObj = {
 *   headers: {
 *     cookie: "some_cookie_name=abc; token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9; other_cookie_name=xyz;"
 *   }
 * };
 * const jwtToken = getJwtFromRequest(requestObj);
 * console.log(jwtToken); // Output: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
 *
 * @example
 * // Example 2: JWT token is present in the "authorization" header.
 * const requestObj = {
 *   headers: {
 *     authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
 *   }
 * };
 * const jwtToken = getJwtFromRequest(requestObj);
 * console.log(jwtToken); // Output: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
 *
 * @example
 * // Example 3: JWT token is not found in headers or cookies.
 * const requestObj = {
 *   headers: {}
 * };
 * const jwtToken = getJwtFromRequest(requestObj);
 * console.log(jwtToken); // Output: ""
 */
const getJwtFromRequest = (request) => {
    const header = request.headers || "";
    if(header && header.cookie) {
        const cookieString = header.cookie;
        const cookieParts = cookieString.split(";");
        const tokenPart = cookieParts.find((part) => part.includes("token="));
        const token = tokenPart?.split("=")?.length > 1 ? tokenPart.split("=")[1] : "";
        return token;
    } else if(header && header.authorization) {
        return header.authorization;
    } 
    return "";
}

export default {
    getJwtFromRequest,
}