/**
 * Price History Visualizer
 * Renders interactive price history charts and overlays
 */

class PriceHistoryVisualizer {
  constructor() {
    this.chartId = 'priceHistoryChart';
    this.overlayId = 'priceHistoryOverlay';
  }

  /**
   * Create and inject overlay into page
   */
  createOverlay(intelligence) {
    // Remove existing overlay if present
    this.removeOverlay();

    const overlay = document.createElement('div');
    overlay.id = this.overlayId;
    overlay.className = 'price-history-overlay';
    overlay.innerHTML = this.generateOverlayHTML(intelligence);

    document.body.appendChild(overlay);
    this.attachEventListeners(overlay);
    
    // Render chart after DOM insertion
    setTimeout(() => this.renderChart(intelligence.chartData, intelligence.analytics), 100);
  }

  /**
   * Generate overlay HTML structure
   */
  generateOverlayHTML(intelligence) {
    const { analytics } = intelligence;
    
    if (!analytics) {
      return '<div class="price-history-error">Unable to load price history</div>';
    }

    const buyTimingClass = analytics.buyTiming.toLowerCase();
    const buyTimingText = this.getBuyTimingText(analytics.buyTiming);
    const dataSourceNote = analytics.hasSimulatedData 
      ? '<span class="simulated-note">📊 Includes simulated data for visualization</span>'
      : '<span class="real-note">✓ Based on tracked price history</span>';

    return `
      <div class="price-history-container">
        <div class="price-history-header">
          <h3>💰 Price History Intelligence</h3>
          <button class="close-btn" id="closePriceHistory">✕</button>
        </div>

        <div class="price-stats">
          <div class="stat-item">
            <span class="stat-label">Lowest</span>
            <span class="stat-value lowest">$${analytics.lowest}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Average</span>
            <span class="stat-value">$${analytics.average}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Highest</span>
            <span class="stat-value highest">$${analytics.highest}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Current</span>
            <span class="stat-value current">$${analytics.current}</span>
          </div>
        </div>

        <div class="buy-timing ${buyTimingClass}">
          <span class="timing-icon">${this.getTimingIcon(analytics.buyTiming)}</span>
          <span class="timing-text">${buyTimingText}</span>
        </div>

        <div class="chart-container">
          <canvas id="${this.chartId}"></canvas>
        </div>

        <div class="price-insights">
          <div class="insight-item">
            <span class="insight-label">Price Ranking:</span>
            <span class="insight-value">${analytics.ranking}th percentile</span>
          </div>
          <div class="insight-item">
            <span class="insight-label">Volatility:</span>
            <span class="insight-value">±$${analytics.volatility}</span>
          </div>
          <div class="insight-item">
            <span class="insight-label">Data Points:</span>
            <span class="insight-value">${analytics.dataPoints} snapshots</span>
          </div>
        </div>

        <div class="data-source">
          ${dataSourceNote}
        </div>
      </div>
    `;
  }

  /**
   * Get buy timing recommendation text
   */
  getBuyTimingText(timing) {
    const messages = {
      'EXCELLENT': '🎯 Excellent time to buy! Price at historic low',
      'GOOD': '👍 Good deal - Below average price',
      'NEUTRAL': '⚖️ Fair price - Consider waiting',
      'WAIT': '⏳ Price is high - Wait for a better deal'
    };
    return messages[timing] || messages['NEUTRAL'];
  }

  /**
   * Get timing icon
   */
  getTimingIcon(timing) {
    const icons = {
      'EXCELLENT': '🎯',
      'GOOD': '👍',
      'NEUTRAL': '⚖️',
      'WAIT': '⏳'
    };
    return icons[timing] || '⚖️';
  }

  /**
   * Render price history chart using Canvas
   */
  renderChart(chartData, analytics) {
    const canvas = document.getElementById(this.chartId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth * 2; // Retina display
    const height = canvas.height = canvas.offsetHeight * 2;
    
    ctx.scale(2, 2);

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width / 2 - padding.left - padding.right;
    const chartHeight = height / 2 - padding.top - padding.bottom;

    // Calculate scales
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.95;
    const maxPrice = Math.max(...prices) * 1.05;
    const priceRange = maxPrice - minPrice;

    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`$${price.toFixed(0)}`, padding.left - 5, y + 3);
    }

    // Draw price line
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2;
    ctx.beginPath();

    chartData.forEach((point, index) => {
      const x = padding.left + (chartWidth / (chartData.length - 1)) * index;
      const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      // Draw simulated data differently
      if (point.simulated) {
        ctx.setLineDash([5, 5]);
      } else {
        ctx.setLineDash([]);
      }
    });

    ctx.stroke();
    ctx.setLineDash([]);

    // Highlight lowest price point
    const lowestIndex = prices.indexOf(Math.min(...prices));
    const lowestX = padding.left + (chartWidth / (chartData.length - 1)) * lowestIndex;
    const lowestY = padding.top + chartHeight - ((chartData[lowestIndex].price - minPrice) / priceRange) * chartHeight;

    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(lowestX, lowestY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Highlight current price point
    const currentIndex = chartData.length - 1;
    const currentX = padding.left + (chartWidth / (chartData.length - 1)) * currentIndex;
    const currentY = padding.top + chartHeight - ((analytics.current - minPrice) / priceRange) * chartHeight;

    ctx.fillStyle = '#FF9800';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw date labels (show every nth label to avoid crowding)
    const labelInterval = Math.ceil(chartData.length / 6);
    ctx.fillStyle = '#666';
    ctx.font = '9px Arial';
    ctx.textAlign = 'center';

    chartData.forEach((point, index) => {
      if (index % labelInterval === 0 || index === chartData.length - 1) {
        const x = padding.left + (chartWidth / (chartData.length - 1)) * index;
        const y = padding.top + chartHeight + 15;
        const date = new Date(point.timestamp);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        ctx.fillText(label, x, y);
      }
    });
  }

  /**
   * Attach event listeners to overlay
   */
  attachEventListeners(overlay) {
    const closeBtn = overlay.querySelector('#closePriceHistory');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.removeOverlay());
    }

    // Close on outside click
    overlay.addEventListener('click', (e) => {
      if (e.target.id === this.overlayId) {
        this.removeOverlay();
      }
    });
  }

  /**
   * Remove overlay from page
   */
  removeOverlay() {
    const existing = document.getElementById(this.overlayId);
    if (existing) {
      existing.remove();
    }
  }

  /**
   * Inject required CSS styles
   */
  injectStyles() {
    if (document.getElementById('priceHistoryStyles')) return;

    const style = document.createElement('style');
    style.id = 'priceHistoryStyles';
    style.textContent = `
      .price-history-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .price-history-container {
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      }

      .price-history-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .price-history-header h3 {
        margin: 0;
        font-size: 20px;
        color: #333;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn:hover {
        color: #333;
      }

      .price-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 16px;
      }

      .stat-item {
        text-align: center;
        padding: 12px;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .stat-label {
        display: block;
        font-size: 11px;
        color: #666;
        margin-bottom: 4px;
        text-transform: uppercase;
      }

      .stat-value {
        display: block;
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }

      .stat-value.lowest {
        color: #4CAF50;
      }

      .stat-value.highest {
        color: #f44336;
      }

      .stat-value.current {
        color: #FF9800;
      }

      .buy-timing {
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
        font-weight: 500;
      }

      .buy-timing.excellent {
        background: #e8f5e9;
        color: #2e7d32;
      }

      .buy-timing.good {
        background: #e3f2fd;
        color: #1565c0;
      }

      .buy-timing.neutral {
        background: #fff3e0;
        color: #e65100;
      }

      .buy-timing.wait {
        background: #ffebee;
        color: #c62828;
      }

      .timing-icon {
        font-size: 20px;
        margin-right: 8px;
      }

      .chart-container {
        margin-bottom: 20px;
        background: #fafafa;
        border-radius: 8px;
        padding: 16px;
      }

      #priceHistoryChart {
        width: 100%;
        height: 200px;
        display: block;
      }

      .price-insights {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 16px;
      }

      .insight-item {
        text-align: center;
        padding: 8px;
      }

      .insight-label {
        display: block;
        font-size: 11px;
        color: #666;
        margin-bottom: 4px;
      }

      .insight-value {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      .data-source {
        text-align: center;
        font-size: 12px;
        color: #999;
        padding-top: 12px;
        border-top: 1px solid #eee;
      }

      .simulated-note {
        color: #FF9800;
      }

      .real-note {
        color: #4CAF50;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Show price history for a product
   */
  async show(intelligence) {
    this.injectStyles();
    this.createOverlay(intelligence);
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PriceHistoryVisualizer;
}
