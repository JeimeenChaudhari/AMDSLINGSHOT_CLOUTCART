/**
 * AI-Powered Price History Agent
 * Fetches real price history data using Apify API
 */

class PriceHistoryAgent {
  constructor() {
    // API key should be stored securely - this is a placeholder
    // In production, use chrome.storage or environment variables
    this.apifyApiKey = 'YOUR_APIFY_API_KEY'; // Replace with your key
    
    this.currency = {
      'amazon.in': { symbol: '₹', code: 'INR', locale: 'en-IN' },
      'amazon.com': { symbol: '$', code: 'USD', locale: 'en-US' },
      'flipkart.com': { symbol: '₹', code: 'INR', locale: 'en-IN' },
      'walmart.com': { symbol: '$', code: 'USD', locale: 'en-US' }
    };
  }

  /**
   * Get currency info based on domain
   */
  getCurrencyInfo(hostname) {
    for (const [domain, info] of Object.entries(this.currency)) {
      if (hostname.includes(domain)) {
        return info;
      }
    }
    return { symbol: '$', code: 'USD', locale: 'en-US' }; // Default
  }

  /**
   * Extract ASIN/Product ID from URL
   */
  extractProductId(url) {
    // Amazon ASIN
    let match = url.match(/\/dp\/([A-Z0-9]{10})/);
    if (match) return { id: match[1], type: 'amazon' };
    
    // Flipkart
    match = url.match(/\/p\/itm([a-zA-Z0-9]+)/);
    if (match) return { id: match[1], type: 'flipkart' };
    
    // Generic
    match = url.match(/\/product\/([^\/\?]+)/);
    if (match) return { id: match[1], type: 'generic' };
    
    return null;
  }

  /**
   * Fetch price history from Apify API via background script
   */
  async fetchFromApify(asin, url, currentPrice) {
    try {
      console.log('[PriceHistory] Requesting Apify data via background script for ASIN:', asin);
      
      // Extract domain from URL
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      // Send message to background script to fetch from Apify
      return new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: 'fetchApifyPrice',
          asin: asin,
          domain: domain,
          currentPrice: currentPrice
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('[PriceHistory] Background script error:', chrome.runtime.lastError);
            resolve(null);
            return;
          }
          
          if (response && response.success) {
            console.log('[PriceHistory] Received Apify data:', response.data);
            if (response.metadata) {
              console.log('[PriceHistory] Product metadata:', response.metadata);
            }
            resolve(response.data);
          } else {
            console.log('[PriceHistory] Apify fetch failed:', response?.error);
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('[PriceHistory] Apify fetch error:', error);
      return null;
    }
  }

  /**
   * Scrape price history from page (fallback)
   */
  async scrapeFromPage(url, currentPrice) {
    try {
      // Get stored history
      const stored = await this.getStoredHistory(url);
      
      // Add current price
      const today = new Date().toISOString().split('T')[0];
      if (!stored.some(entry => entry.date.startsWith(today))) {
        stored.push({
          price: currentPrice,
          date: new Date().toISOString(),
          source: 'scraped'
        });
      }

      // Keep last 90 days
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
      return stored.filter(entry => new Date(entry.date).getTime() > ninetyDaysAgo);
    } catch (error) {
      console.error('[PriceHistory] Scrape error:', error);
      return [];
    }
  }

  /**
   * Get stored price history
   */
  async getStoredHistory(url) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['priceHistoryData'], (data) => {
        const history = data.priceHistoryData || {};
        const urlHash = btoa(url).substring(0, 32);
        resolve(history[urlHash] || []);
      });
    });
  }

  /**
   * Store price history
   */
  async storeHistory(url, historyData) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['priceHistoryData'], (data) => {
        const history = data.priceHistoryData || {};
        const urlHash = btoa(url).substring(0, 32);
        history[urlHash] = historyData;
        chrome.storage.local.set({ priceHistoryData: history }, resolve);
      });
    });
  }

  /**
   * Analyze price history and generate insights
   */
  analyzePriceHistory(history, currentPrice, currencyInfo) {
    if (!history || history.length === 0) {
      return {
        hasData: false,
        message: 'No price history available yet. We\'ll start tracking from your first visit.'
      };
    }

    const prices = history.map(h => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Calculate price trend
    const recentPrices = prices.slice(-7); // Last 7 entries
    const trend = recentPrices.length > 1 && recentPrices[recentPrices.length - 1] > recentPrices[0] ? 'increasing' : 'decreasing';

    // Calculate savings
    const savingsFromMax = maxPrice - currentPrice;
    const savingsPercent = ((savingsFromMax / maxPrice) * 100).toFixed(1);

    // Determine if it's a good time to buy
    const isGoodDeal = currentPrice <= avgPrice * 0.9; // 10% below average
    const isBestPrice = currentPrice === minPrice;

    return {
      hasData: true,
      prices: {
        current: currentPrice,
        lowest: minPrice,
        highest: maxPrice,
        average: avgPrice
      },
      trend,
      savings: {
        amount: savingsFromMax,
        percent: savingsPercent
      },
      recommendation: isBestPrice ? 'best' : isGoodDeal ? 'good' : 'wait',
      dataPoints: history.length,
      dateRange: {
        from: history[0].date,
        to: history[history.length - 1].date
      },
      currencyInfo
    };
  }

  /**
   * Main method to get price history
   */
  async getPriceHistory(url, currentPrice) {
    const hostname = new URL(url).hostname;
    const currencyInfo = this.getCurrencyInfo(hostname);
    const productId = this.extractProductId(url);

    console.log('[PriceHistoryAgent] Fetching price history for:', productId, 'Current price:', currentPrice);

    let history = [];

    // Always use local scraping first (immediate data)
    history = await this.scrapeFromPage(url, currentPrice);
    
    console.log('[PriceHistory] Local history:', history.length, 'entries');

    // Try Apify for Amazon products (async, don't block)
    if (productId && productId.type === 'amazon') {
      // Fetch from Apify in background (don't wait)
      this.fetchFromApify(productId.id, url, currentPrice).then(apifyData => {
        if (apifyData && apifyData.length > 0) {
          console.log('[PriceHistory] Apify data received, updating history');
          // Merge and store
          const combined = [...history, ...apifyData];
          
          // Remove duplicates by date
          const uniqueHistory = [];
          const seenDates = new Set();
          
          combined.forEach(entry => {
            const dateKey = entry.date.split('T')[0];
            if (!seenDates.has(dateKey)) {
              seenDates.add(dateKey);
              uniqueHistory.push(entry);
            }
          });
          
          // Sort by date
          uniqueHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
          
          this.storeHistory(url, uniqueHistory);
        }
      }).catch(err => {
        console.log('[PriceHistory] Apify background fetch error:', err);
      });
    }

    // Remove duplicates by date
    const uniqueHistory = [];
    const seenDates = new Set();
    
    history.forEach(entry => {
      const dateKey = entry.date.split('T')[0];
      if (!seenDates.has(dateKey)) {
        seenDates.add(dateKey);
        uniqueHistory.push(entry);
      }
    });

    // Sort by date
    uniqueHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Store the history
    if (uniqueHistory && uniqueHistory.length > 0) {
      await this.storeHistory(url, uniqueHistory);
    }

    // Analyze and return insights
    return this.analyzePriceHistory(uniqueHistory, currentPrice, currencyInfo);
  }

  /**
   * Format price with currency
   */
  formatPrice(price, currencyInfo) {
    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.PriceHistoryAgent = PriceHistoryAgent;
}
