import { consts } from "../const/consts.js";

/**
 * Gets the Trace ID from the request's headers.
 *
 * @param {object} request The request object containing headers.
 * @returns {string} The Trace ID extracted from the request headers, or a default value if not found.
 *
 * @description
 * This function retrieves the Trace ID from the headers of the given request object.
 * If the "x-amzn-trace-id" header exists in the request, it will be returned as the Trace ID.
 * If the header is not found or empty, a default value (consts.UNKNOWN) will be returned.
 *
 * @param {object} request The request object containing headers.
 *
 * @example
 * const requestObj = {
 *   headers: {
 *     "x-amzn-trace-id": "1234567890abcdef"
 *   }
 * };
 *
 * const traceId = getTraceIdFromRequest(requestObj);
 * console.log(traceId); // Output: "1234567890abcdef"
 *
 * @example
 * const requestObj = {
 *   headers: {}
 * };
 *
 * const traceId = getTraceIdFromRequest(requestObj);
 * console.log(traceId); // Output: "unknown" (default value from consts)
 */
const getTraceIdFromRequest = (request) => {
    const header = request.headers || "";
    const traceId = header["x-amzn-trace-id"] || "";
    return traceId ? traceId : consts.UNKNOWN;
}

export default {
    getTraceIdFromRequest,
}