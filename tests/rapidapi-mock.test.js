/**
 * RapidAPI Mock Test
 * Verifies that RapidAPI calls are properly mocked during tests
 */

describe('RapidAPI Mocking', () => {
  
  test('should mock chrome.runtime.sendMessage for pricesApiSearch', (done) => {
    const message = {
      action: 'pricesApiSearch',
      productName: 'Test Product',
      country: 'in',
      limit: 10,
      apiKey: 'test-key',
      apiHost: 'test-host'
    };
    
    chrome.runtime.sendMessage(message, (response) => {
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0]).toHaveProperty('product_id');
      expect(response.data[0]).toHaveProperty('product_title');
      done();
    });
  });
  
  test('should mock chrome.runtime.sendMessage for pricesApiOffers', (done) => {
    const message = {
      action: 'pricesApiOffers',
      productId: 'test-product-id',
      country: 'in',
      apiKey: 'test-key',
      apiHost: 'test-host'
    };
    
    chrome.runtime.sendMessage(message, (response) => {
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data).toHaveProperty('offers');
      expect(Array.isArray(response.data.offers)).toBe(true);
      expect(response.data.offers.length).toBeGreaterThan(0);
      expect(response.data.offers[0]).toHaveProperty('store_name');
      expect(response.data.offers[0]).toHaveProperty('price');
      done();
    });
  });
  
  test('should mock fetch for RapidAPI search endpoint', async () => {
    const url = 'https://real-time-product-search.p.rapidapi.com/search?q=test&country=in&limit=10';
    
    const response = await fetch(url);
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('product_id');
  });
  
  test('should mock fetch for RapidAPI product endpoint', async () => {
    const url = 'https://real-time-product-search.p.rapidapi.com/product/test-id?country=in';
    
    const response = await fetch(url);
    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data).toHaveProperty('offers');
    expect(Array.isArray(data.offers)).toBe(true);
  });
  
});
