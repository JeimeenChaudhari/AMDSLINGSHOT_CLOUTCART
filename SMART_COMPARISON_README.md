# 🛒 Smart Price Comparison Engine

## Overview

A complete browser-based price comparison system for Chrome extensions that works **WITHOUT external APIs**. Automatically compares prices across multiple ecommerce sites when users view Amazon products.

## ✨ Key Features

- ✅ **No External APIs** - All processing happens in browser
- ✅ **Automatic Detection** - Detects product pages automatically
- ✅ **Intelligent Matching** - Advanced title normalization for better results
- ✅ **Multi-Site Support** - Flipkart, eBay, Walmart, and more
- ✅ **Background Fetching** - No visible browser tabs
- ✅ **Smart Caching** - 10-minute result cache for performance
- ✅ **Modular Architecture** - Easy to add new sites
- ✅ **Error Handling** - Graceful degradation on failures

## 🚀 Quick Start

### 1. Load Extension
```bash
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select extension folder
```

### 2. Test on Amazon
```bash
1. Go to any Amazon product page
2. Open browser console (F12)
3. Watch for automatic comparison
```

### 3. View Results
```javascript
// Results appear in console and UI overlay
[PriceComparison] Product detected: {...}
[PriceComparison] Best price: $899 on Flipkart (Save $100)
```

## 📁 Project Structure

```
extension/
├── utils/
│   ├── product-detector.js          # Detects product pages
│   ├── product-normalizer.js        # Cleans product titles
│   ├── search-url-generator.js      # Generates search URLs
│   ├── price-comparison-engine.js   # Main orchestrator
│   ├── comparison-smart.js          # Integration layer
│   └── site-scrapers/
│       ├── base-scraper.js          # Base scraper class
│       ├── flipkart-scraper.js      # Flipkart scraper
│       ├── ebay-scraper.js          # eBay scraper
│       ├── walmart-scraper.js       # Walmart scraper
│       └── scraper-factory.js       # Scraper factory
├── background/
│   └── price-fetcher.js             # Background HTML fetcher
├── manifest.json                     # Extension manifest
└── docs/
    ├── SMART_PRICE_COMPARISON_GUIDE.md
    ├── QUICK_INTEGRATION_GUIDE.md
    ├── ARCHITECTURE_DIAGRAM.md
    └── DEPLOYMENT_CHECKLIST.md
```

## 🔧 How It Works

### Step 1: Product Detection
```javascript
const detector = new ProductDetector();
const product = detector.detectProductPage();
// { site: 'amazon', title: '...', price: 999, asin: 'B0XXX' }
```

### Step 2: Title Normalization
```javascript
const normalizer = new ProductNormalizer();
const query = normalizer.normalize(product.title);
// "Apple iPhone 15 Pro (256GB)" → "apple iphone pro"
```

### Step 3: Search URL Generation
```javascript
const urlGen = new SearchURLGenerator();
const urls = urlGen.generateAllURLs(query);
// { flipkart: "...", ebay: "...", walmart: "..." }
```

### Step 4: Background Fetching
```javascript
chrome.runtime.sendMessage({
  action: 'fetchMultiplePages',
  urls: Object.values(urls)
}, (response) => {
  // response.results contains HTML
});
```

### Step 5: HTML Parsing
```javascript
const factory = new ScraperFactory();
const scraper = factory.getScraper('flipkart');
const result = await scraper.scrape(html);
// { site, title, price, link, available }
```

### Step 6: Price Comparison
```javascript
const engine = new PriceComparisonEngine();
const comparison = await engine.compareCurrentProduct();
// { currentPrice, bestPrice, savings, prices: {...} }
```

## 💻 Usage Examples

### Basic Usage
```javascript
// In content script
const smartComparison = new SmartPriceComparison();

const result = await smartComparison.comparePrice(
  productName,
  currentPrice,
  'amazon'
);

if (result.availableProducts.length > 0) {
  console.log('Best price:', result.bestPrice);
  console.log('Savings:', result.bestPrice.savings);
}
```

### Direct Engine Access
```javascript
const engine = new PriceComparisonEngine();
const comparison = await engine.compareCurrentProduct();

if (comparison.success) {
  console.log(`Current: $${comparison.currentPrice}`);
  console.log(`Best: $${comparison.bestPrice} on ${comparison.bestSite}`);
  console.log(`Save: $${comparison.savings} (${comparison.savingsPercent}%)`);
}
```

### Display Results
```javascript
result.availableProducts.forEach(product => {
  console.log(`${product.site}: $${product.price}`);
  console.log(`Savings: ${product.savingsPercent}%`);
  console.log(`Link: ${product.url}`);
});
```

## 🎯 Supported Sites

### Currently Active
- ✅ **Flipkart** - India's largest ecommerce
- ✅ **eBay** - Global marketplace
- ✅ **Walmart** - US retail giant

### Ready to Add (URL configs exist)
- 🔜 Target
- 🔜 Meesho
- 🔜 Snapdeal

## 🔌 Adding New Sites

### 1. Create Scraper
```javascript
// utils/site-scrapers/newsite-scraper.js
class NewSiteScraper extends BaseScraper {
  constructor() {
    super('newsite');
    this.priceSelectors = ['.price', '.cost'];
    this.titleSelectors = ['.title', 'h1'];
  }

  async scrape(html) {
    const doc = this.parseHTML(html);
    const title = this.extractFromSelectors(doc, this.titleSelectors);
    const price = this.parsePrice(
      this.extractFromSelectors(doc, this.priceSelectors)
    );

    return {
      site: this.siteName,
      title: title,
      price: price,
      link: null,
      available: price !== null
    };
  }
}
```

### 2. Register Scraper
```javascript
// In scraper-factory.js
if (typeof NewSiteScraper !== 'undefined') {
  this.register('newsite', NewSiteScraper);
}
```

### 3. Add URL Config
```javascript
// In search-url-generator.js
newsite: {
  baseUrl: 'https://www.newsite.com/search',
  queryParam: 'q',
  additionalParams: {}
}
```

### 4. Update Manifest
```json
"content_scripts": [{
  "js": [
    "...",
    "utils/site-scrapers/newsite-scraper.js",
    "..."
  ]
}]
```

## 📊 Performance

| Operation | Time |
|-----------|------|
| Product Detection | < 10ms |
| Title Normalization | < 5ms |
| URL Generation | < 1ms |
| HTML Fetch (per site) | 2-8s |
| HTML Parsing | < 50ms |
| Price Comparison | < 10ms |
| **Total (3 sites)** | **5-15s** |

## 🧪 Testing

### Run Test Suite
```bash
Open test-smart-comparison.html in browser
```

### Test Individual Modules
```javascript
// Test normalizer
const normalizer = new ProductNormalizer();
console.log(normalizer.normalize("Apple iPhone 15 Pro (256GB)"));

// Test URL generator
const urlGen = new SearchURLGenerator();
console.log(urlGen.generateAllURLs("apple iphone"));

// Test detector
const detector = new ProductDetector();
console.log(detector.detectProductPage());

// Test full comparison
const engine = new PriceComparisonEngine();
engine.compareCurrentProduct().then(console.log);
```

## 🐛 Troubleshooting

### No Product Detected
```javascript
// Check if on product page
const detector = new ProductDetector();
console.log(detector.detectProductPage());
// Should return product object or null
```

### No Prices Found
```javascript
// Check scraper selectors
const factory = new ScraperFactory();
console.log(factory.getSupportedSites());
// Verify site is supported
```

### Slow Performance
```javascript
// Clear cache
engine.clearCache();
chrome.runtime.sendMessage({ action: 'clearPriceCache' });
```

### Fetch Errors
```javascript
// Check background script
chrome.runtime.sendMessage({
  action: 'fetchProductPage',
  url: 'https://www.flipkart.com/search?q=test'
}, console.log);
```

## 📚 Documentation

- **[Complete Guide](SMART_PRICE_COMPARISON_GUIDE.md)** - Full implementation guide
- **[Quick Start](QUICK_INTEGRATION_GUIDE.md)** - Get started in 5 minutes
- **[Architecture](ARCHITECTURE_DIAGRAM.md)** - System design and flow
- **[Deployment](DEPLOYMENT_CHECKLIST.md)** - Deployment checklist
- **[Implementation](IMPLEMENTATION_SUMMARY.md)** - Technical details

## 🔒 Security

- All fetching happens in background service worker
- No eval() or unsafe HTML injection
- CORS handled by extension permissions
- Timeout protection prevents hanging
- User-Agent headers prevent blocking

## ⚡ Performance Features

- **Result Caching** - 10-minute cache for comparison results
- **Request Caching** - 5-minute cache for HTML fetches
- **Concurrent Fetching** - 2-3 sites fetched in parallel
- **Request Deduplication** - Prevents duplicate requests
- **Timeout Protection** - 8-10 second timeout per request
- **Retry Logic** - Up to 2 retries with exponential backoff

## 🎨 Integration with UI

```javascript
// Format results for display
const result = await smartComparison.comparePrice(...);

// Show best price
if (result.bestPrice.savings > 0) {
  showNotification(
    `Save $${result.bestPrice.savings} on ${result.bestPrice.site}!`
  );
}

// Display comparison table
result.availableProducts.forEach(product => {
  addTableRow({
    site: product.site,
    price: product.price,
    savings: product.savingsPercent,
    link: product.url
  });
});
```

## 📈 Future Enhancements

- [ ] Add more ecommerce sites (Target, Meesho, Snapdeal)
- [ ] Implement ML-based price prediction
- [ ] Add price history tracking
- [ ] Support international sites
- [ ] Improve scraper resilience with ML
- [ ] Add product matching confidence scores
- [ ] Implement image-based product matching
- [ ] Add user feedback loop for accuracy

## 🤝 Contributing

### Adding New Sites
1. Create scraper class extending `BaseScraper`
2. Register in `ScraperFactory`
3. Add URL config in `SearchURLGenerator`
4. Update manifest.json
5. Test thoroughly

### Improving Scrapers
1. Update selector patterns
2. Add fallback selectors
3. Improve price parsing
4. Test with various products

## 📝 License

Part of Emotion-Adaptive Shopping Assistant Chrome Extension

## 🆘 Support

### Console Logs
All modules log with prefixes:
- `[PriceComparison]` - Main engine
- `[PriceFetcher]` - Background fetcher
- `[SmartComparison]` - Integration layer

### Debug Mode
```javascript
// Enable detailed logging
localStorage.setItem('debug', 'true');
```

### Common Issues
1. **Not detecting product** - Check if on Amazon product page
2. **No prices found** - Verify site scrapers are working
3. **Slow performance** - Clear cache or reduce timeout
4. **Incorrect prices** - Update scraper selectors

## 🎉 Success Criteria

✅ No external API dependencies  
✅ Automatic product detection  
✅ Clean title normalization  
✅ Dynamic search URL generation  
✅ Background HTML fetching  
✅ Modular scraper system  
✅ Price comparison logic  
✅ Result caching  
✅ Error handling  
✅ Extensible architecture  

## 📞 Contact

For issues or questions:
1. Check browser console logs
2. Run test suite
3. Review documentation
4. Check scraper selectors

---

**Version:** 1.0.0  
**Last Updated:** 2026-02-28  
**Status:** ✅ Production Ready
