import { AsyncLocalStorage } from "async_hooks";
import { logContextStore } from "../../src/service/logContextStore";

describe('LogContextStore', () => {

    beforeEach(() => {
        // Mock AsyncLocalStorage
        jest.spyOn(AsyncLocalStorage.prototype, 'getStore').mockReturnValue({
          get: jest.fn(),
        });

      });
    
      afterEach(() => {
        // Restore AsyncLocalStorage
        jest.restoreAllMocks();
      });
    

    test('should create defaultStorage and attributeStorage instances', () => {
        expect(logContextStore.defaultStorage).toBeInstanceOf(AsyncLocalStorage);
        expect(logContextStore.attributeStorage).toBeInstanceOf(AsyncLocalStorage);
    });

    test('getValueFromStore should return the value from defaultStorage if it exists', () => {
        const key = 'key';
        const value = 'value';

        logContextStore.defaultStorage.getStore = jest.fn().mockReturnValue({
            get: jest.fn().mockReturnValue(value),
        });
        logContextStore.attributeStorage.getStore = jest.fn().mockReturnValue(null);

        const result = logContextStore.getValueFromStore(key);

        expect(result).toBe(value);
        expect(logContextStore.defaultStorage.getStore).toHaveBeenCalled();
        expect(logContextStore.attributeStorage.getStore).not.toHaveBeenCalled();
        expect(logContextStore.defaultStorage.getStore().get).toHaveBeenCalledWith(key);
    });

    test('getValueFromStore should return the value from attributeStorage if it exists and defaultStorage does not have a value', () => {
        const key = 'key';
        const value = 'value';
      
        logContextStore.defaultStorage.getStore = jest.fn().mockReturnValue(null);
        logContextStore.attributeStorage.getStore = jest.fn().mockReturnValue({
          get: jest.fn().mockReturnValue(value),
        });
      
        const result = logContextStore.getValueFromStore(key);
      
        expect(result).toBe(value);
        expect(logContextStore.defaultStorage.getStore).toHaveBeenCalled();
        expect(logContextStore.attributeStorage.getStore).toHaveBeenCalled();
        expect(logContextStore.attributeStorage.getStore().get).toHaveBeenCalledWith(key);
      });

    test('getValueFromStore should return undefined if neither defaultStorage nor attributeStorage has a value', () => {
        const key = 'key';

        logContextStore.defaultStorage.getStore = jest.fn().mockReturnValue(null);
        logContextStore.attributeStorage.getStore = jest.fn().mockReturnValue(null);

        const result = logContextStore.getValueFromStore(key);

        expect(result).toBe(undefined);
        expect(logContextStore.defaultStorage.getStore).toHaveBeenCalled();
        expect(logContextStore.attributeStorage.getStore).toHaveBeenCalled();
    });
});
