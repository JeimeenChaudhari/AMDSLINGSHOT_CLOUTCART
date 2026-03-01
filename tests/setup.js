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
    sendMessage: jest.fn((message, callback) => {
      // Mock RapidAPI search responses
      if (message.action === 'pricesApiSearch') {
        const mockResponse = {
          success: true,
          data: [
            {
              product_id: 'mock-product-1',
              product_title: 'Mock Product 1',
              product_description: 'Test product',
              product_photos: ['https://example.com/photo.jpg'],
              product_rating: 4.5,
              product_page_url: 'https://example.com/product1',
              typical_price_range: ['₹50,000', '₹60,000']
            }
          ]
        };
        if (callback) callback(mockResponse);
        return Promise.resolve(mockResponse);
      }
      
      // Mock RapidAPI offers responses
      if (message.action === 'pricesApiOffers') {
        const mockResponse = {
          success: true,
          data: {
            product_id: message.productId,
            offers: [
              {
                store_name: 'Amazon',
                store_rating: 4.5,
                offer_page_url: 'https://amazon.in/product',
                store_review_count: 1000,
                store_reviews_page_url: 'https://amazon.in/reviews',
                price: '₹55,000',
                shipping: 'Free',
                tax: 'Included',
                on_sale: false,
                original_price: null,
                product_condition: 'New'
              },
              {
                store_name: 'Flipkart',
                store_rating: 4.3,
                offer_page_url: 'https://flipkart.com/product',
                store_review_count: 800,
                price: '₹54,500',
                shipping: 'Free',
                tax: 'Included',
                on_sale: true,
                original_price: '₹60,000',
                product_condition: 'New'
              }
            ]
          }
        };
        if (callback) callback(mockResponse);
        return Promise.resolve(mockResponse);
      }
      
      // Default mock response for other actions
      if (callback) callback({ success: true });
      return Promise.resolve({ success: true });
    }),
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

// Mock fetch API to prevent real network calls during tests
global.fetch = jest.fn((url) => {
  // Mock RapidAPI responses
  if (url.includes('real-time-product-search.p.rapidapi.com')) {
    if (url.includes('/search')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([
          {
            product_id: 'mock-product-1',
            product_title: 'Mock Product 1',
            product_description: 'Test product',
            product_photos: ['https://example.com/photo.jpg'],
            product_rating: 4.5,
            product_page_url: 'https://example.com/product1',
            typical_price_range: ['₹50,000', '₹60,000']
          }
        ])
      });
    }
    
    if (url.includes('/product/')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          product_id: 'mock-product-1',
          offers: [
            {
              store_name: 'Amazon',
              store_rating: 4.5,
              offer_page_url: 'https://amazon.in/product',
              store_review_count: 1000,
              price: '₹55,000',
              shipping: 'Free',
              tax: 'Included',
              product_condition: 'New'
            }
          ]
        })
      });
    }
  }
  
  // Default mock response for other URLs
  return Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve('<html><body>Mock HTML</body></html>'),
    json: () => Promise.resolve({ success: true })
  });
});

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
