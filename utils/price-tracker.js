// Price tracking utilities
class PriceTracker {
  constructor() {
    this.storageKey = 'priceHistory';
  }

  async trackPrice(productId, price, productName) {
    const history = await this.getHistory();
    
    if (!history[productId]) {
      history[productId] = {
        name: productName,
        prices: []
      };
    }

    history[productId].prices.push({
      price: parseFloat(price),
      date: new Date().toISOString(),
      url: window.location.href
    });

    // Keep only last 90 days
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
    history[productId].prices = history[productId].prices.filter(entry => {
      return new Date(entry.date).getTime() > ninetyDaysAgo;
    });

    await this.saveHistory(history);
    return history[productId];
  }

  async getHistory() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.storageKey], (data) => {
        resolve(data[this.storageKey] || {});
      });
    });
  }

  async saveHistory(history) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.storageKey]: history }, resolve);
    });
  }

  async getProductHistory(productId) {
    const history = await this.getHistory();
    return history[productId] || null;
  }

  calculateStats(prices) {
    if (!prices || prices.length === 0) return null;

    const priceValues = prices.map(p => p.price);
    const min = Math.min(...priceValues);
    const max = Math.max(...priceValues);
    const avg = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
    const current = priceValues[priceValues.length - 1];

    return {
      min,
      max,
      avg: parseFloat(avg.toFixed(2)),
      current,
      isLowest: current === min,
      isHighest: current === max,
      savingsFromMax: parseFloat((max - current).toFixed(2)),
      percentChange: parseFloat((((current - avg) / avg) * 100).toFixed(2))
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PriceTracker;
}
