import _ from 'lodash';
import { consts } from '../../src/const/consts';
import logFormatter from '../../src/service/logFormatter';

describe('logFormatter', () => {
  describe('init', () => {
    test('should initialize with the provided format and an empty context', () => {
      const format = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      };
      const expectedResult = {
        value1: consts.UNKNOWN,
        value2: consts.UNKNOWN,
        value3: consts.UNKNOWN,
      };

      const result = logFormatter.init(format);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('apply', () => {
    test('should apply the format to the provided context', () => {
      const format = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      };
      const context = {
        key1: 'context1',
        key2: 'context2',
      };
      const expectedResult = {
        value1: 'context1',
        value2: 'context2',
        value3: consts.UNKNOWN,
      };

      const result = logFormatter.apply(format, context);

      expect(result).toEqual(expectedResult);
    });

    test('should set UNKNOWN if the key is not present in the context', () => {
      const format = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      };
      const context = {
        key2: 'context2',
      };
      const expectedResult = {
        value1: consts.UNKNOWN,
        value2: 'context2',
        value3: consts.UNKNOWN,
      };

      const result = logFormatter.apply(format, context);

      expect(result).toEqual(expectedResult);
    });

    test('should apply the format to the provided context with complex format', () => {
      const format = {
        'organizations[0].organizationId': 'tenantContext.organizationId',
        'organizations[0].businessType': 'tenantContext.businessType',
        'organizations[0].organizationName': 'tenantContext.organizationName',
        'organizations[0].industry': 'tenantContext.industry',
        'organizations[0].country': 'tenantContext.country',
        'account.userId': 'userContext.userId',
      };
      const context = {
        organizations: [
          {
            organizationId: 'ABC',
            businessType: 'Type1',
            organizationName: 'Company1',
            industry: 'Industry1',
            country: 'Country1',
          },
        ],
        account: {
          userId: 'USERID',
        },
      };
      const expectedResult = {
        tenantContext: {
          organizationId: 'ABC',
          businessType: 'Type1',
          organizationName: 'Company1',
          industry: 'Industry1',
          country: 'Country1',
        },
        userContext: {
          userId: 'USERID',
        },
      };

      const result = logFormatter.apply(format, context);

      expect(result).toEqual(expectedResult);
    });

    test('should set UNKNOWN if the key is not present in the context with complex format', () => {
      const format = {
        'organizations[0].organizationId': 'tenantContext.organizationId',
        'organizations[0].businessType': 'tenantContext.businessType',
        'organizations[0].organizationName': 'tenantContext.organizationName',
        'organizations[0].industry': 'tenantContext.industry',
        'organizations[0].country': 'tenantContext.country',
        'account.userId': 'userContext.userId',
      };
      const context = {
        organizations: [],
        account: {},
      };
      const expectedResult = {
        tenantContext: {
          organizationId: consts.UNKNOWN,
          businessType: consts.UNKNOWN,
          organizationName: consts.UNKNOWN,
          industry: consts.UNKNOWN,
          country: consts.UNKNOWN,
        },
        userContext: {
          userId: consts.UNKNOWN,
        },
      };

      const result = logFormatter.apply(format, context);

      expect(result).toEqual(expectedResult);
    });
  });
});
