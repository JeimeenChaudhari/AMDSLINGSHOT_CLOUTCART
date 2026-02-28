/**
 * Jest Test Setup
 * Configures global test environment
 */

// Mock browser APIs
global.chrome = {
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        callback({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
      }),
      remove: jest.fn((keys, callback) => {
        if (callback) callback();
      }),
      clear: jest.fn((callback) => {
        if (callback) callback();
      })
    },
    sync: {
      get: jest.fn((keys, callback) => {
        callback({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
      })
    }
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    },
    getURL: jest.fn((path) => `chrome-extension://test/${path}`)
  },
  tabs: {
    query: jest.fn((query, callback) => {
      callback([{ id: 1, url: 'https://example.com' }]);
    }),
    sendMessage: jest.fn()
  }
};

// Mock IndexedDB
global.indexedDB = {
  open: jest.fn(() => ({
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: jest.fn(),
      transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
          add: jest.fn(),
          get: jest.fn(),
          getAll: jest.fn(),
          delete: jest.fn(),
          clear: jest.fn()
        }))
      }))
    }
  }))
};

// Mock performance API
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
    memory: {
      usedJSHeapSize: 10000000,
      totalJSHeapSize: 50000000,
      jsHeapSizeLimit: 2000000000
    }
  };
}

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  sequential: jest.fn(() => ({
    add: jest.fn(),
    compile: jest.fn(),
    fit: jest.fn(() => Promise.resolve({ history: {} })),
    predict: jest.fn(() => ({
      data: () => Promise.resolve(new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]))
    })),
    save: jest.fn(() => Promise.resolve()),
    load: jest.fn(() => Promise.resolve())
  })),
  layers: {
    embedding: jest.fn(),
    lstm: jest.fn(),
    attention: jest.fn(),
    dropout: jest.fn(),
    dense: jest.fn()
  },
  train: {
    adam: jest.fn()
  },
  callbacks: {
    earlyStopping: jest.fn(),
    reduceLROnPlateau: jest.fn()
  },
  tensor: jest.fn(),
  tensor2d: jest.fn()
}));

// Increase test timeout for ML operations
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
