// Background Price Fetcher
// Handles fetching HTML from ecommerce sites without opening visible tabs

class PriceFetcher {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.requestQueue = new Map();
    this.maxRetries = 2;
  }

  // Main fetch method
  async fetchProductPage(url, options = {}) {
    const cacheKey = this.getCacheKey(url);

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log(`[PriceFetcher] Cache hit for: ${url}`);
        return cached.data;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    // Check if request is already in progress
    if (this.requestQueue.has(cacheKey)) {
      console.log(`[PriceFetcher] Request already in progress: ${url}`);
      return this.requestQueue.get(cacheKey);
    }

    // Create new fetch promise
    const fetchPromise = this.performFetch(url, options);
    this.requestQueue.set(cacheKey, fetchPromise);

    try {
      const result = await fetchPromise;
      
      // Cache successful result
      if (result && result.html) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      return result;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  // Perform actual fetch with retry logic
  async performFetch(url, options = {}) {
    const { retries = this.maxRetries, timeout = 10000 } = options;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`[PriceFetcher] Fetching (attempt ${attempt + 1}): ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          signal: controller.signal,
          credentials: 'omit'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        return {
          success: true,
          html: html,
          url: url,
          status: response.status
        };

      } catch (error) {
        console.warn(`[PriceFetcher] Attempt ${attempt + 1} failed:`, error.message);

        if (attempt === retries) {
          return {
            success: false,
            error: error.message,
            url: url
          };
        }

        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }
  }

  // Fetch multiple URLs in parallel
  async fetchMultiple(urls, options = {}) {
    const { maxConcurrent = 3 } = options;
    const results = new Map();

    // Process in batches to avoid overwhelming the browser
    for (let i = 0; i < urls.length; i += maxConcurrent) {
      const batch = urls.slice(i, i + maxConcurrent);
      const promises = batch.map(async (url) => {
        const result = await this.fetchProductPage(url, options);
        return { url, result };
      });

      const batchResults = await Promise.all(promises);
      
      for (const { url, result } of batchResults) {
        results.set(url, result);
      }
    }

    return results;
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    console.log('[PriceFetcher] Cache cleared');
  }

  // Clear expired cache entries
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheExpiry) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache key
  getCacheKey(url) {
    return url.split('?')[0]; // Ignore query params for caching
  }

  // Delay helper
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const priceFetcher = new PriceFetcher();

// Message listener for content script requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchProductPage') {
    priceFetcher.fetchProductPage(request.url, request.options)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'fetchMultiplePages') {
    priceFetcher.fetchMultiple(request.urls, request.options)
      .then(results => sendResponse({ success: true, results: Object.fromEntries(results) }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'clearPriceCache') {
    priceFetcher.clearCache();
    sendResponse({ success: true });
    return true;
  }
});

// Periodic cache cleanup
setInterval(() => {
  priceFetcher.clearExpiredCache();
}, 60000); // Every minute

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PriceFetcher;
}
