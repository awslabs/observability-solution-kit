import LogFormatter from '../../src/service/logFormatter.js';

describe('LogFormatter', () => {
  test('initFormat', () => {
    const format = {
      key1: 'field1',
      key2: 'field2',
      key3: 'field3',
    };
    const value = 'default';

    const formattedObj = LogFormatter.initFormat(format, value);

    expect(formattedObj).toEqual({
      field1: 'default',
      field2: 'default',
      field3: 'default',
    });
  });

  test('apply', () => {
    const format = {
      key1: 'field1',
      key2: 'field2.field22',
      key3: 'field3.field33.field333',
    };
    const context = {
      key1: 'value1',
      key2: 'value2',
    };
    const defaultValue = 'default';

    const formattedObj = LogFormatter.apply(format, context, defaultValue);

    expect(formattedObj).toEqual({
      field1: 'value1',
      field2: {
        field22: 'value2',
      },
      field3: {
        field33: {
          field333: 'default',
        },
      },
    });
  });

  test('apply - missing keys in context', () => {
    const format = {
      key1: 'field1',
      key2: 'field2',
      key3: 'field3',
    };
    const context = {
      key1: 'value1',
    };
    const defaultValue = 'default';

    const formattedObj = LogFormatter.apply(format, context, defaultValue);

    expect(formattedObj).toEqual({
      field1: 'value1',
      field2: 'default',
      field3: 'default',
    });
  });

  test('apply - empty format and context', () => {
    const format = {};
    const context = {};
    const defaultValue = 'default';

    const formattedObj = LogFormatter.apply(format, context, defaultValue);

    expect(formattedObj).toEqual({});
  });
});
