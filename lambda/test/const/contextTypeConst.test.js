import CONTEXT_TYPE from '../../src/const/contextTypeConst';

describe('CONTEXT_TYPE', () => {
  test('CONTEXT_TYPE_HEADER should have the value "header"', () => {
    expect(CONTEXT_TYPE.CONTEXT_TYPE_HEADER).toBe('header');
  });

  test('CONTEXT_TYPE_PAYLOAD should have the value "payload"', () => {
    expect(CONTEXT_TYPE.CONTEXT_TYPE_PAYLOAD).toBe('payload');
  });

  test('CONTEXT_TYPE_BATCH should have the value "batch"', () => {
    expect(CONTEXT_TYPE.CONTEXT_TYPE_BATCH).toBe('batch');
  });
});
