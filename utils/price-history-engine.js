/**
 * Price History Intelligence Engine
 * Tracks product prices over time and provides analytics
 */

class PriceHistoryEngine {
  constructor() {
    this.storageKey = 'priceHistory';
    this.sessionKey = 'priceHistorySession';
  }

  /**
   * Extract unique product identifier
   */
  extractProductId(url, productData) {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Amazon ASIN
    if (hostname.includes('amazon')) {
      const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i) || 
                        url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
      if (asinMatch) return `amazon_${asinMatch[1]}`;
    }

    // eBay item ID
    if (hostname.includes('ebay')) {
      const itemMatch = url.match(/\/itm\/(\d+)/);
      if (itemMatch) return `ebay_${itemMatch[1]}`;
    }

    // Walmart product ID
    if (hostname.includes('walmart')) {
      const walmartMatch = url.match(/\/ip\/[^\/]+\/(\d+)/);
      if (walmartMatch) return `walmart_${walmartMatch[1]}`;
    }

    // Flipkart product ID
    if (hostname.includes('flipkart')) {
      const flipkartMatch = url.match(/\/p\/itm[a-z0-9]+\?pid=([A-Z0-9]+)/i);
      if (flipkartMatch) return `flipkart_${flipkartMatch[1]}`;
    }

    // Fallback: hash of website + product title
    const website = hostname.replace('www.', '');
    const title = productData?.title || 'unknown';
    return `${website}_${this.hashString(title)}`;
  }

  /**
   * Simple hash function for product titles
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if price snapshot already exists in current session
   */
  async isSnapshotInSession(productId) {
    const sessionData = sessionStorage.getItem(this.sessionKey);
    if (!sessionData) return false;

    const sessions = JSON.parse(sessionData);
    return sessions[productId] === new Date().toDateString();
  }

  /**
   * Mark snapshot as recorded in current session
   */
  markSessionSnapshot(productId) {
    const sessionData = sessionStorage.getItem(this.sessionKey) || '{}';
    const sessions = JSON.parse(sessionData);
    sessions[productId] = new Date().toDateString();
    sessionStorage.setItem(this.sessionKey, JSON.stringify(sessions));
  }

  /**
   * Save price snapshot
   */
  async savePriceSnapshot(productId, price, website, productData = {}) {
    // Prevent duplicate storage within same session
    if (await this.isSnapshotInSession(productId)) {
      console.log('Price snapshot already recorded in this session');
      return false;
    }

    const snapshot = {
      timestamp: Date.now(),
      price: parseFloat(price),
      website,
      title: productData.title || '',
      url: productData.url || ''
    };

    // Load existing history
    const history = await this.loadHistory();
    
    if (!history[productId]) {
      history[productId] = {
        productId,
        title: productData.title || '',
        snapshots: []
      };
    }

    history[productId].snapshots.push(snapshot);

    // Keep only last 90 days of data
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    history[productId].snapshots = history[productId].snapshots.filter(
      s => s.timestamp > ninetyDaysAgo
    );

    // Save to storage
    await this.saveHistory(history);
    this.markSessionSnapshot(productId);

    return true;
  }

  /**
   * Load all price history from storage
   */
  async loadHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.storageKey], (result) => {
        resolve(result[this.storageKey] || {});
      });
    });
  }

  /**
   * Save price history to storage
   */
  async saveHistory(history) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.storageKey]: history }, resolve);
    });
  }

  /**
   * Get price history for specific product
   */
  async getProductHistory(productId) {
    const history = await this.loadHistory();
    return history[productId] || null;
  }

  /**
   * Generate simulated historical data for visualization
   */
  generateSimulatedHistory(currentPrice, daysBack = 30) {
    const snapshots = [];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = daysBack; i >= 0; i--) {
      const timestamp = now - (i * dayMs);
      
      // Simulate price fluctuation (±15% from current price)
      const variance = 0.15;
      const randomFactor = 1 + (Math.random() * variance * 2 - variance);
      const price = currentPrice * randomFactor;

      snapshots.push({
        timestamp,
        price: parseFloat(price.toFixed(2)),
        simulated: true
      });
    }

    return snapshots;
  }

  /**
   * Get dataset for visualization (real + simulated if needed)
   */
  async getVisualizationDataset(productId, currentPrice) {
    const productHistory = await this.getProductHistory(productId);
    
    if (!productHistory || productHistory.snapshots.length < 5) {
      // Insufficient data - use simulated dataset
      return this.generateSimulatedHistory(currentPrice, 30);
    }

    return productHistory.snapshots;
  }

  /**
   * Calculate analytics from price history
   */
  calculateAnalytics(snapshots, currentPrice) {
    if (!snapshots || snapshots.length === 0) {
      return null;
    }

    const prices = snapshots.map(s => s.price);
    const lowest = Math.min(...prices);
    const highest = Math.max(...prices);
    const average = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Calculate volatility (standard deviation)
    const variance = prices.reduce((sum, price) => {
      return sum + Math.pow(price - average, 2);
    }, 0) / prices.length;
    const volatility = Math.sqrt(variance);

    // Current price ranking (percentile)
    const lowerPrices = prices.filter(p => p < currentPrice).length;
    const ranking = (lowerPrices / prices.length) * 100;

    // Buy timing suggestion
    let buyTiming = 'NEUTRAL';
    if (currentPrice <= lowest * 1.05) {
      buyTiming = 'EXCELLENT';
    } else if (currentPrice <= average * 0.95) {
      buyTiming = 'GOOD';
    } else if (currentPrice >= highest * 0.95) {
      buyTiming = 'WAIT';
    }

    return {
      lowest: parseFloat(lowest.toFixed(2)),
      highest: parseFloat(highest.toFixed(2)),
      average: parseFloat(average.toFixed(2)),
      current: parseFloat(currentPrice.toFixed(2)),
      volatility: parseFloat(volatility.toFixed(2)),
      ranking: parseFloat(ranking.toFixed(1)),
      buyTiming,
      dataPoints: snapshots.length,
      hasSimulatedData: snapshots.some(s => s.simulated)
    };
  }

  /**
   * Get complete price intelligence for a product
   */
  async getPriceIntelligence(url, currentPrice, productData = {}) {
    const productId = this.extractProductId(url, productData);
    const snapshots = await this.getVisualizationDataset(productId, currentPrice);
    const analytics = this.calculateAnalytics(snapshots, currentPrice);

    return {
      productId,
      snapshots,
      analytics,
      chartData: this.prepareChartData(snapshots)
    };
  }

  /**
   * Prepare data for chart visualization
   */
  prepareChartData(snapshots) {
    return snapshots.map(snapshot => ({
      date: new Date(snapshot.timestamp).toLocaleDateString(),
      timestamp: snapshot.timestamp,
      price: snapshot.price,
      simulated: snapshot.simulated || false
    }));
  }

  /**
   * Clear old history data (maintenance)
   */
  async clearOldData(daysToKeep = 90) {
    const history = await this.loadHistory();
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    Object.keys(history).forEach(productId => {
      history[productId].snapshots = history[productId].snapshots.filter(
        s => s.timestamp > cutoffTime
      );

      // Remove products with no snapshots
      if (history[productId].snapshots.length === 0) {
        delete history[productId];
      }
    });

    await this.saveHistory(history);
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PriceHistoryEngine;
}
