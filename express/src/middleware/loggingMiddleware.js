import tokenDirector from '../service/tokenDirector.js';
import contextExtractor from '../service/contextExtractor.js';
import logFormatter from '../service/logFormatter.js';
import { logFormattingMap } from '../layout/logLayout.js';
import headerDirector from '../service/headerDirector.js';

/**
 * Extracts and formats log context from the incoming request for logging purposes.
 *
 * @function before
 * @param {object} request The request object.
 * @returns {object} The formatted log context extracted from the request.
 *
 * @description
 * This function is used to extract log context from the incoming request for logging purposes.
 * It starts by retrieving the JWT (JSON Web Token) from the request using tokenDirector.getJwtFromRequest().
 * The JWT is then decoded, and the context information is extracted using contextExtractor.extract().
 * Next, the extracted context information is formatted according to the logFormattingMap using logFormatter.apply().
 * Additionally, it includes the Trace ID from the request headers by calling headerDirector.getTraceIdFromRequest().
 * The formatted log context, including the extracted and formatted context information along with the Trace ID,
 * is returned to be used for logging during the request processing.
 *
 * @example
 * const requestObj = {
 *   headers: {
 *     authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "x-amzn-trace-id": "1234567890abcdef"
 *   }
 * };
 * const logContext = before(requestObj);
 * console.log(logContext);
 * // Output:
 * // {
 * //   userId: "user123",
 * //   clientId: "client789",
 * //   traceId: "1234567890abcdef"
 * // }
 */
const before = (request) => {
    const jwtFromRequest = tokenDirector.getJwtFromRequest(request);
    const decodedToken = contextExtractor.extract(jwtFromRequest);
    let formattedContext = logFormatter.apply(logFormattingMap, decodedToken);

    formattedContext.traceId = headerDirector.getTraceIdFromRequest(request);
    
    return formattedContext;
}

export default {
    before,
}