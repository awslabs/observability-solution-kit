import { AsyncLocalStorage } from 'async_hooks';
import { consts } from '../const/consts.js';
/**
 * LogContextStore class manages the storage of log context values using AsyncLocalStorage.
 *
 * @description
 * This class provides a way to store log context values using two instances of AsyncLocalStorage:
 * - `defaultStorage`: The default storage for http request.
 * - `attributeStorage`: An instance of AsyncLocalStorage for attribute-specific storage, used in AWS SQS message processing.
 * It also exposes methods to retrieve values from the storage.
 */
class LogContextStore {

    constructor() {
      this.defaultStorage = new AsyncLocalStorage();
      this.attributeStorage = new AsyncLocalStorage(); 
    }

    /**
     * Get the value associated with a given key from the storage.
     *
     * @param {string} key The key to retrieve the value from the storage.
     * @returns {*} The value associated with the provided key or undefined if not found.
     */
    getValueFromStore(key) {
      const value = 
        this.defaultStorage.getStore()?.get(key) ||
        this.attributeStorage.getStore()?.get(key) ||
        undefined;
      return value;
    }
    
    /**
     * Get the log context from the storage using the predefined constant key.
     *
     * @returns {*} The log context value retrieved from the storage.
     */
    getContext() {
      return this.getValueFromStore(consts.LOG_STORAGE_KEY);
    }
    
}

const logContextStore = new LogContextStore();

export {
  logContextStore,
}