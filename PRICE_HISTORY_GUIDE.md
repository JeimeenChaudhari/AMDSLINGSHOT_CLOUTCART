# 💰 Price History Intelligence Guide

## Overview

The Price History Engine tracks product prices over time, provides analytics, and displays interactive visualizations to help users make informed purchasing decisions.

## Architecture

### Core Modules

1. **PriceHistoryEngine** (`utils/price-history-engine.js`)
   - Product identification (ASIN, item IDs, URL-based)
   - Price snapshot storage and retrieval
   - Historical data generation (simulated when needed)
   - Analytics calculation (lowest, highest, average, volatility)
   - Buy timing recommendations

2. **PriceHistoryVisualizer** (`utils/price-history-visualizer.js`)
   - Interactive canvas-based chart rendering
   - Overlay UI with statistics
   - Buy timing indicators
   - Responsive design

3. **PriceHistoryIntegration** (`utils/price-history-integration.js`)
   - Content script integration
   - Button injection
   - Badge creation
   - Maintenance utilities

## Features

### Product Identification

Automatically extracts unique identifiers:
- **Amazon**: ASIN from URL (`/dp/B09XS7JWHH`)
- **eBay**: Item ID (`/itm/123456789`)
- **Walmart**: Product ID (`/ip/product-name/12345678`)
- **Flipkart**: Product ID from URL parameters
- **Fallback**: Hash of website + product title

### Price Snapshot System

Each product page visit:
1. Extracts current price
2. Creates snapshot with timestamp
3. Stores in Chrome local storage
4. Prevents duplicates within same session
5. Maintains 90-day rolling history

### Analytics Engine

Calculates:
- **Lowest Price**: Historical minimum
- **Highest Price**: Historical maximum
- **Average Price**: Mean of all snapshots
- **Volatility**: Standard deviation (price fluctuation)
- **Current Ranking**: Percentile position (0-100%)
- **Buy Timing**: EXCELLENT | GOOD | NEUTRAL | WAIT

### Buy Timing Logic

```javascript
if (currentPrice <= lowest * 1.05) → EXCELLENT
else if (currentPrice <= average * 0.95) → GOOD
else if (currentPrice >= highest * 0.95) → WAIT
else → NEUTRAL
```

### Visualization

Interactive chart displays:
- Timeline from first snapshot to present
- Price fluctuation line graph
- Lowest price point highlighted (green)
- Current price point highlighted (orange)
- Simulated data shown with dashed lines
- Grid lines and axis labels

## Integration

### Basic Usage

```javascript
// Initialize integration
const integration = new PriceHistoryIntegration();

// Track price on page load
await integration.initialize(
  window.location.href,
  currentPrice,
  { title: productTitle, url: window.location.href }
);

// Show price history overlay
await integration.showPriceHistory(
  window.location.href,
  currentPrice,
  { title: productTitle }
);

// Add price history button
integration.addPriceHistoryButton(
  targetElement,
  window.location.href,
  currentPrice,
  { title: productTitle }
);
```

### Content Script Integration

```javascript
// In content.js
const priceHistory = new PriceHistoryIntegration();

// Detect product page
if (isProductPage()) {
  const price = extractPrice();
  const title = extractTitle();
  
  // Track price
  await priceHistory.initialize(
    window.location.href,
    price,
    { title }
  );
  
  // Add button near price element
  const priceElement = document.querySelector('.price');
  priceHistory.addPriceHistoryButton(
    priceElement,
    window.location.href,
    price,
    { title }
  );
}
```

### Background Script Integration

```javascript
// Periodic maintenance (run daily)
chrome.alarms.create('priceHistoryMaintenance', {
  periodInMinutes: 1440 // 24 hours
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'priceHistoryMaintenance') {
    const engine = new PriceHistoryEngine();
    engine.clearOldData(90); // Keep 90 days
  }
});
```

## Data Storage

### Storage Structure

```javascript
{
  "priceHistory": {
    "amazon_B09XS7JWHH": {
      "productId": "amazon_B09XS7JWHH",
      "title": "Sony WH-1000XM5",
      "snapshots": [
        {
          "timestamp": 1709164800000,
          "price": 399.99,
          "website": "amazon.com",
          "title": "Sony WH-1000XM5",
          "url": "https://www.amazon.com/dp/B09XS7JWHH"
        }
      ]
    }
  }
}
```

### Session Storage

Prevents duplicate snapshots within same session:

```javascript
{
  "priceHistorySession": {
    "amazon_B09XS7JWHH": "2/28/2026"
  }
}
```

## Performance Optimizations

1. **Session Deduplication**: Only one snapshot per product per day
2. **Rolling Window**: Automatic cleanup of data older than 90 days
3. **Cached Results**: Analytics calculated once per view
4. **Lazy Loading**: Chart rendered after DOM insertion
5. **Simulated Data**: Generated only when insufficient history exists

## Simulated Data

When fewer than 5 real snapshots exist:
- Generates 30 days of simulated history
- Uses ±15% variance from current price
- Marked with `simulated: true` flag
- Displayed with dashed lines in chart
- User notified via badge

## UI Components

### Overlay

Full-screen modal with:
- Price statistics grid
- Buy timing recommendation
- Interactive chart
- Price insights
- Data source indicator

### Button

Gradient button with:
- Chart icon
- "Price History" label
- Hover animations
- Click handler

### Badge

Compact inline display:
- Buy timing indicator
- Lowest/average prices
- Color-coded by timing

## Testing

Open `test-price-history.html` in browser:

1. **Track Prices**: Save snapshots for sample products
2. **Show History**: Display overlay with analytics
3. **Add Buttons**: Inject interactive buttons
4. **Generate Data**: Create simulated datasets
5. **Test Analytics**: Calculate statistics
6. **View Storage**: Inspect stored data
7. **Clear Data**: Reset all history
8. **Maintenance**: Run cleanup routine

## API Reference

### PriceHistoryEngine

```javascript
// Extract product ID
extractProductId(url, productData)

// Save price snapshot
savePriceSnapshot(productId, price, website, productData)

// Get product history
getProductHistory(productId)

// Generate simulated data
generateSimulatedHistory(currentPrice, daysBack)

// Calculate analytics
calculateAnalytics(snapshots, currentPrice)

// Get complete intelligence
getPriceIntelligence(url, currentPrice, productData)

// Clear old data
clearOldData(daysToKeep)
```

### PriceHistoryVisualizer

```javascript
// Show overlay
show(intelligence)

// Create overlay
createOverlay(intelligence)

// Render chart
renderChart(chartData, analytics)

// Remove overlay
removeOverlay()

// Inject styles
injectStyles()
```

### PriceHistoryIntegration

```javascript
// Initialize tracking
initialize(url, currentPrice, productData)

// Show price history
showPriceHistory(url, currentPrice, productData)

// Add button
addPriceHistoryButton(targetElement, url, currentPrice, productData)

// Get summary
getPriceSummary(url, currentPrice, productData)

// Create badge
createPriceBadge(url, currentPrice, productData)

// Perform maintenance
performMaintenance()
```

## Browser Compatibility

- Chrome 88+
- Edge 88+
- Opera 74+
- Brave (Chromium-based)

Requires:
- Chrome Storage API
- Canvas API
- ES6+ JavaScript

## Future Enhancements

- [ ] Price drop alerts
- [ ] Multi-site price comparison in history
- [ ] Export history to CSV
- [ ] Price prediction using ML
- [ ] Wishlist integration
- [ ] Email notifications
- [ ] Historical price API integration
- [ ] Advanced filtering options

## Troubleshooting

**Issue**: No history displayed
- **Solution**: Visit product page multiple times or wait for simulated data

**Issue**: Duplicate snapshots
- **Solution**: Session storage prevents this automatically

**Issue**: Chart not rendering
- **Solution**: Check canvas support and console for errors

**Issue**: Storage quota exceeded
- **Solution**: Run maintenance to clear old data

## License

Part of Emotion-Adaptive Shopping Assistant Chrome Extension
