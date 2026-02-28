/**
 * Price History Integration Module
 * Connects price history engine with content scripts and UI
 */

class PriceHistoryIntegration {
  constructor() {
    this.engine = new PriceHistoryEngine();
    this.visualizer = new PriceHistoryVisualizer();
    this.initialized = false;
  }

  /**
   * Initialize price history tracking on product page
   */
  async initialize(url, currentPrice, productData = {}) {
    if (this.initialized) return;

    try {
      // Extract product ID
      const productId = this.engine.extractProductId(url, productData);
      
      // Save price snapshot (will skip if already recorded in session)
      await this.engine.savePriceSnapshot(
        productId,
        currentPrice,
        new URL(url).hostname,
        productData
      );

      this.initialized = true;
      console.log('Price history tracking initialized for:', productId);
    } catch (error) {
      console.error('Failed to initialize price history:', error);
    }
  }

  /**
   * Show price history overlay
   */
  async showPriceHistory(url, currentPrice, productData = {}) {
    try {
      const intelligence = await this.engine.getPriceIntelligence(
        url,
        currentPrice,
        productData
      );

      await this.visualizer.show(intelligence);
    } catch (error) {
      console.error('Failed to show price history:', error);
    }
  }

  /**
   * Add price history button to page
   */
  addPriceHistoryButton(targetElement, url, currentPrice, productData = {}) {
    // Remove existing button if present
    const existingBtn = document.getElementById('priceHistoryBtn');
    if (existingBtn) existingBtn.remove();

    const button = document.createElement('button');
    button.id = 'priceHistoryBtn';
    button.className = 'price-history-trigger-btn';
    button.innerHTML = '📊 Price History';
    
    button.addEventListener('click', () => {
      this.showPriceHistory(url, currentPrice, productData);
    });

    // Inject button styles
    this.injectButtonStyles();

    // Insert button near target element
    if (targetElement && targetElement.parentNode) {
      targetElement.parentNode.insertBefore(button, targetElement.nextSibling);
    } else {
      document.body.appendChild(button);
    }
  }

  /**
   * Inject button styles
   */
  injectButtonStyles() {
    if (document.getElementById('priceHistoryBtnStyles')) return;

    const style = document.createElement('style');
    style.id = 'priceHistoryBtnStyles';
    style.textContent = `
      .price-history-trigger-btn {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin: 10px 0;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      }

      .price-history-trigger-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      .price-history-trigger-btn:active {
        transform: translateY(0);
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Get price history summary (for quick display)
   */
  async getPriceSummary(url, currentPrice, productData = {}) {
    try {
      const intelligence = await this.engine.getPriceIntelligence(
        url,
        currentPrice,
        productData
      );

      if (!intelligence.analytics) return null;

      return {
        lowest: intelligence.analytics.lowest,
        average: intelligence.analytics.average,
        highest: intelligence.analytics.highest,
        buyTiming: intelligence.analytics.buyTiming,
        savings: currentPrice - intelligence.analytics.lowest
      };
    } catch (error) {
      console.error('Failed to get price summary:', error);
      return null;
    }
  }

  /**
   * Create inline price badge (compact display)
   */
  async createPriceBadge(url, currentPrice, productData = {}) {
    const summary = await this.getPriceSummary(url, currentPrice, productData);
    if (!summary) return null;

    const badge = document.createElement('div');
    badge.className = 'price-history-badge';
    
    let badgeClass = 'neutral';
    let badgeText = 'Fair Price';
    
    if (summary.buyTiming === 'EXCELLENT') {
      badgeClass = 'excellent';
      badgeText = `🎯 Lowest Price!`;
    } else if (summary.buyTiming === 'GOOD') {
      badgeClass = 'good';
      badgeText = `👍 Good Deal`;
    } else if (summary.buyTiming === 'WAIT') {
      badgeClass = 'wait';
      badgeText = `⏳ Wait for Drop`;
    }

    badge.innerHTML = `
      <div class="badge-content ${badgeClass}">
        <span class="badge-text">${badgeText}</span>
        <span class="badge-detail">Low: $${summary.lowest} | Avg: $${summary.average}</span>
      </div>
    `;

    this.injectBadgeStyles();
    return badge;
  }

  /**
   * Inject badge styles
   */
  injectBadgeStyles() {
    if (document.getElementById('priceHistoryBadgeStyles')) return;

    const style = document.createElement('style');
    style.id = 'priceHistoryBadgeStyles';
    style.textContent = `
      .price-history-badge {
        margin: 8px 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .badge-content {
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        display: inline-block;
      }

      .badge-content.excellent {
        background: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #4caf50;
      }

      .badge-content.good {
        background: #e3f2fd;
        color: #1565c0;
        border: 1px solid #2196f3;
      }

      .badge-content.neutral {
        background: #fff3e0;
        color: #e65100;
        border: 1px solid #ff9800;
      }

      .badge-content.wait {
        background: #ffebee;
        color: #c62828;
        border: 1px solid #f44336;
      }

      .badge-text {
        font-weight: 600;
        display: block;
        margin-bottom: 2px;
      }

      .badge-detail {
        font-size: 11px;
        opacity: 0.8;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Perform maintenance (clear old data)
   */
  async performMaintenance() {
    await this.engine.clearOldData(90);
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PriceHistoryIntegration;
}
