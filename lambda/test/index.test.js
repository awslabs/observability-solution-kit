import { middlewares, interceptor } from '../src/service/middlewares.js';

test('Middlewares has to return the valid middleware', () => {
  const result = middlewares();

  expect(result).toBeDefined();
  expect(result).toBeInstanceOf(Function);
});

test('Interceptor has to return the valid interceptor', () => {
  const result = interceptor();

  expect(result).toBeDefined();
  expect(result).toBeInstanceOf(Object);
});
