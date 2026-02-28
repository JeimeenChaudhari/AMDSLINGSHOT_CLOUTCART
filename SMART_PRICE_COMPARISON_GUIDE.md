# Smart Price Comparison Engine - Implementation Guide

## Overview
Browser-based intelligent price comparison system that works WITHOUT external APIs. The extension automatically compares prices across multiple ecommerce sites when viewing Amazon products.

## Architecture

### Core Components

1. **Product Detector** (`utils/product-detector.js`)
   - Detects when user is on a product page
   - Extracts product title, price, and identifiers
   - Supports Amazon, Flipkart, eBay

2. **Product Normalizer** (`utils/product-normalizer.js`)
   - Cleans product titles for better search
   - Removes brackets, storage sizes, marketing phrases
   - Generates optimized search queries

3. **Search URL Generator** (`utils/search-url-generator.js`)
   - Creates search URLs for each ecommerce site
   - Supports Flipkart, eBay, Walmart, Target, Meesho, Snapdeal

4. **Site Scrapers** (`utils/site-scrapers/`)
   - `base-scraper.js` - Common scraping functionality
   - `flipkart-scraper.js` - Flipkart-specific extraction
   - `ebay-scraper.js` - eBay-specific extraction
   - `walmart-scraper.js` - Walmart-specific extraction
   - `scraper-factory.js` - Creates appropriate scraper instances

5. **Price Comparison Engine** (`utils/price-comparison-engine.js`)
   - Main orchestrator
   - Coordinates detection, fetching, parsing, comparison
   - Caches results for 10 minutes

6. **Background Price Fetcher** (`background/price-fetcher.js`)
   - Fetches HTML from ecommerce sites
   - Runs in background service worker
   - Implements retry logic and caching
   - No visible browser tabs

7. **Smart Comparison Integration** (`utils/comparison-smart.js`)
   - Integrates new engine with existing UI
   - Formats results for overlay display

## Workflow

### Step 1: Product Detection
```javascript
const detector = new ProductDetector();
const product = detector.detectProductPage();
// Returns: { site, title, price, asin, url, image }
```

### Step 2: Title Normalization
```javascript
const normalizer = new ProductNormalizer();
const searchQuery = normalizer.normalize(product.title);
// "Apple iPhone 15 Pro Max (256GB) - Blue" 
// → "apple iphone pro max blue"
```

### Step 3: Generate Search URLs
```javascript
const urlGen = new SearchURLGenerator();
const urls = urlGen.generateAllURLs(searchQuery);
// {
//   flipkart: "https://www.flipkart.com/search?q=...",
//   ebay: "https://www.ebay.com/sch/i.html?_nkw=...",
//   ...
// }
```

### Step 4: Background Fetch
```javascript
// Content script sends message to background
chrome.runtime.sendMessage({
  action: 'fetchMultiplePages',
  urls: Object.values(urls),
  options: { maxConcurrent: 2, timeout: 8000 }
}, (response) => {
  // response.results contains HTML for each URL
});
```

### Step 5: Parse HTML
```javascript
const factory = new ScraperFactory();
const scraper = factory.getScraper('flipkart');
const result = await scraper.scrape(html);
// Returns: { site, title, price, link, available }
```

### Step 6: Compare Prices
```javascript
const engine = new PriceComparisonEngine();
const comparison = await engine.compareCurrentProduct();
// Returns: {
//   success: true,
//   currentPrice: 999,
//   bestPrice: 899,
//   savings: 100,
//   savingsPercent: "10.0",
//   prices: { amazon: {...}, flipkart: {...}, ebay: {...} }
// }
```

## Usage

### In Content Script
```javascript
// Initialize
const smartComparison = new SmartPriceComparison();

// Compare prices
const result = await smartComparison.comparePrice(
  productName,
  currentPrice,
  currentSite
);

// Display results
if (result.availableProducts.length > 0) {
  displayPriceComparison(result);
}
```

### Adding New Site Scrapers

1. Create new scraper class extending `BaseScraper`:
```javascript
class NewSiteScraper extends BaseScraper {
  constructor() {
    super('newsite');
    this.priceSelectors = ['.price', '.cost'];
    this.titleSelectors = ['.product-name', 'h1'];
  }

  async scrape(html) {
    const doc = this.parseHTML(html);
    // Extract product info
    return { site, title, price, link, available };
  }
}
```

2. Register in `scraper-factory.js`:
```javascript
if (typeof NewSiteScraper !== 'undefined') {
  this.register('newsite', NewSiteScraper);
}
```

3. Add URL config in `search-url-generator.js`:
```javascript
newsite: {
  baseUrl: 'https://www.newsite.com/search',
  queryParam: 'q',
  additionalParams: {}
}
```

## Performance Features

- **Caching**: Results cached for 10 minutes
- **Concurrent Fetching**: Max 2-3 sites fetched simultaneously
- **Timeout Protection**: 8-10 second timeout per fetch
- **Retry Logic**: Up to 2 retries with exponential backoff
- **Cache Cleanup**: Expired entries removed every minute

## Error Handling

- Graceful degradation if site blocks request
- Fallback to empty results if all fetches fail
- Console logging for debugging
- No user-facing errors for failed comparisons

## Manifest Requirements

```json
{
  "permissions": ["storage", "tabs"],
  "host_permissions": ["https://*/*", "http://*/*"],
  "background": {
    "service_worker": "background/background.js",
    "type": "module"
  },
  "content_scripts": [{
    "js": [
      "utils/product-normalizer.js",
      "utils/product-detector.js",
      "utils/search-url-generator.js",
      "utils/site-scrapers/base-scraper.js",
      "utils/site-scrapers/flipkart-scraper.js",
      "utils/site-scrapers/ebay-scraper.js",
      "utils/site-scrapers/walmart-scraper.js",
      "utils/site-scrapers/scraper-factory.js",
      "utils/price-comparison-engine.js",
      "utils/comparison-smart.js",
      "content/content.js"
    ]
  }]
}
```

## Testing

### Test Product Detection
```javascript
const detector = new ProductDetector();
console.log(detector.detectProductPage());
```

### Test Normalization
```javascript
const normalizer = new ProductNormalizer();
console.log(normalizer.normalize("Apple iPhone 15 Pro (256GB) - Blue"));
```

### Test Full Comparison
```javascript
const engine = new PriceComparisonEngine();
const result = await engine.compareCurrentProduct();
console.log(result);
```

## Limitations

- Requires valid HTML structure from target sites
- Site layout changes may break scrapers
- Some sites may block automated requests
- CORS restrictions handled by background fetch
- No guarantee of 100% accuracy

## Future Enhancements

- Add more ecommerce sites
- Implement ML-based price prediction
- Add price history tracking
- Support international sites
- Improve scraper resilience
- Add product matching confidence scores

## Troubleshooting

**No prices found:**
- Check if site is supported
- Verify scraper selectors are current
- Check browser console for errors

**Slow performance:**
- Reduce concurrent fetch limit
- Decrease timeout values
- Clear cache if stale

**Incorrect prices:**
- Update scraper selectors
- Verify price parsing logic
- Check currency conversion

## Support

For issues or questions:
1. Check browser console logs
2. Verify manifest permissions
3. Test individual components
4. Review scraper selector accuracy
