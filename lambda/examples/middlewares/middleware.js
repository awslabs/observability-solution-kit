export default function () {
  console.log('middleware');

  const options = { ...defaults, ...opts };

  const customMiddlewareBefore = async (request) => {
    const { event, context } = request;
    console.log('middleware - customMiddlewareBefore');
    // ...
  };

  const customMiddlewareAfter = async (request) => {
    const { response } = request;
    // ...
    request.response = response;
    console.log('middleware - customMiddlewareAfter');
  };

  const customMiddlewareOnError = async (request) => {
    console.log('middleware - customMiddlewareOnError');
    if (request.response === undefined) return;
    return customMiddlewareAfter(request);
  };

  return {
    before: customMiddlewareBefore,
    after: customMiddlewareAfter,
    onError: customMiddlewareOnError,
  };
}
