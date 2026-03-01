// Background service worker
console.log('Emotion-Adaptive Shopping Assistant background service worker starting...');

// ============================================================================
// TRAINING SCHEDULER
// ============================================================================

// Schedule periodic training checks
chrome.alarms.create('emotionModelTraining', { 
  periodInMinutes: 10 // Check every 10 minutes
});

async function checkAndScheduleTraining() {
  try {
    // Get training stats
    const result = await chrome.storage.local.get(['trainingStats', 'lastTrainingCheck']);
    
    const now = Date.now();
    const lastCheck = result.lastTrainingCheck || 0;
    
    // Don't check too frequently
    if (now - lastCheck < 5 * 60 * 1000) { // 5 minutes
      return;
    }
    
    await chrome.storage.local.set({ lastTrainingCheck: now });
    
    // Check if we have enough new samples
    const stats = result.trainingStats;
    
    if (stats && stats.totalSamples > 0) {
      console.log('[TrainingScheduler] Training data available:', stats.totalSamples, 'samples');
      
      // Notify active tabs to retrain if needed
      const tabs = await chrome.tabs.query({ active: true });
      
      for (const tab of tabs) {
        if (tab.url && isShoppingSite(tab.url)) {
          try {
            await chrome.tabs.sendMessage(tab.id, { 
              action: 'scheduleTraining',
              stats: stats
            });
          } catch (error) {
            // Tab might not have content script loaded
            console.log('[TrainingScheduler] Could not notify tab:', tab.id);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('[TrainingScheduler] Error checking training:', error);
  }
}

function isShoppingSite(url) {
  const shoppingSites = [
    'amazon.com', 'amazon.in', 'flipkart.com', 'ebay.com', 'walmart.com',
    'target.com', 'meesho.com', 'snapdeal.com', 'myntra.com', 'ajio.com',
    'tatacliq.com', 'nykaa.com', 'croma.com', 'reliancedigital.in'
  ];
  
  return shoppingSites.some(site => url.includes(site));
}

// ============================================================================
// PRICE FETCHER
// ============================================================================

class PriceFetcher {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.requestQueue = new Map();
    this.maxRetries = 2;
  }

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

  // Fetch multiple URLs in parallel with limited concurrency
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

  getCacheKey(url) {
    return url.split('?')[0]; // Ignore query params for caching
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearCache() {
    this.cache.clear();
    console.log('[PriceFetcher] Cache cleared');
  }

  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheExpiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
const priceFetcher = new PriceFetcher();

// Periodic cache cleanup
setInterval(() => {
  priceFetcher.clearExpiredCache();
}, 60000); // Every minute

// ============================================================================
// EXTENSION INITIALIZATION
// ============================================================================

chrome.runtime.onInstalled.addListener(() => {
  console.log('Emotion-Adaptive Shopping Assistant installed');
  
  // Set default settings
  chrome.storage.sync.set({
    emotionEnabled: false,
    keyboardMode: false,
    focusMode: true,
    priceHistory: true,
    comparison: true,
    recommendation: true,
    reviewChecker: true,
    moneySaved: 0,
    productsAnalyzed: 0
  });
  
  // Initialize training scheduler
  checkAndScheduleTraining();
});

// Check training when browser starts
chrome.runtime.onStartup.addListener(() => {
  console.log('[TrainingScheduler] Browser started, checking training');
  checkAndScheduleTraining();
});

// Listen for tab updates to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const shoppingSites = [
      'amazon.com',
      'amazon.in',
      'flipkart.com',
      'ebay.com',
      'walmart.com',
      'target.com'
    ];
    
    const isShoppingSite = shoppingSites.some(site => tab.url.includes(site));
    
    if (isShoppingSite) {
      // Check if extension context is still valid before sending message
      try {
        chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' }).catch((err) => {
          // Silently ignore - content script not ready or extension reloaded
          if (err.message && !err.message.includes('Extension context invalidated')) {
            console.log('Message send failed:', err.message);
          }
        });
      } catch (err) {
        // Extension context invalidated - ignore silently
      }
    }
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateStats') {
    chrome.storage.sync.get(['moneySaved', 'productsAnalyzed'], (data) => {
      chrome.storage.sync.set({
        moneySaved: (data.moneySaved || 0) + (message.moneySaved || 0),
        productsAnalyzed: (data.productsAnalyzed || 0) + 1
      });
    });
  }
  
  if (message.action === 'getPriceComparison') {
    // In production, call real price comparison API
    // For now, return mock data
    sendResponse({
      success: true,
      comparisons: [
        { site: 'Amazon', price: message.currentPrice, current: true },
        { site: 'Walmart', price: message.currentPrice * 0.95 },
        { site: 'eBay', price: message.currentPrice * 1.05 },
        { site: 'Target', price: message.currentPrice * 0.92 }
      ]
    });
  }
  
  // Handle RapidAPI requests to avoid CORS issues
  if (message.action === 'pricesApiSearch') {
    const { productName, country, limit, apiKey, apiHost } = message;
    const searchLimit = limit || 10;
    const searchUrl = `https://real-time-product-search.p.rapidapi.com/search?q=${encodeURIComponent(productName)}&country=${country || 'in'}&limit=${searchLimit}`;
    
    fetch(searchUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost || 'real-time-product-search.p.rapidapi.com',
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(JSON.stringify(err));
        }).catch(() => {
          throw new Error(`HTTP ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => {
      sendResponse({ success: true, data: data });
    })
    .catch(error => {
      console.error('RapidAPI search error:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Keep channel open for async response
  }
  
  if (message.action === 'pricesApiOffers') {
    const { productId, country, apiKey, apiHost } = message;
    const offersUrl = `https://real-time-product-search.p.rapidapi.com/product/${productId}?country=${country || 'in'}`;
    
    fetch(offersUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost || 'real-time-product-search.p.rapidapi.com',
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(JSON.stringify(err));
        }).catch(() => {
          throw new Error(`HTTP ${response.status}`);
        });
      }
      return response.json();
    })
    .then(data => {
      sendResponse({ success: true, data: data });
    })
    .catch(error => {
      console.error('RapidAPI offers error:', error);
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // Keep channel open for async response
  }
  
  // Price fetcher handlers
  if (message.action === 'fetchProductPage') {
    priceFetcher.fetchProductPage(message.url, message.options)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (message.action === 'fetchMultiplePages') {
    priceFetcher.fetchMultiple(message.urls, message.options)
      .then(results => sendResponse({ success: true, results: Object.fromEntries(results) }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.action === 'clearPriceCache') {
    priceFetcher.clearCache();
    sendResponse({ success: true });
    return true;
  }
  
  return true;
});

// Periodic cleanup of old price history
chrome.alarms.create('cleanupPriceHistory', { periodInMinutes: 1440 }); // Daily

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupPriceHistory') {
    chrome.storage.local.get(['priceHistory'], (data) => {
      const history = data.priceHistory || {};
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      Object.keys(history).forEach(productId => {
        history[productId] = history[productId].filter(entry => {
          return new Date(entry.date).getTime() > thirtyDaysAgo;
        });
        
        if (history[productId].length === 0) {
          delete history[productId];
        }
      });
      
      chrome.storage.local.set({ priceHistory: history });
    });
  }
  
  if (alarm.name === 'emotionModelTraining') {
    checkAndScheduleTraining();
  }
});
