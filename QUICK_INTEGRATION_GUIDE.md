# Quick Integration Guide - Smart Price Comparison

## 🚀 Quick Start (5 Minutes)

### Step 1: Load Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select your extension folder

### Step 2: Test on Amazon
1. Go to any Amazon product page (e.g., amazon.com/dp/B0XXXXXX)
2. Open browser console (F12)
3. The extension should automatically detect the product

### Step 3: Verify Comparison
Check console logs for:
```
[PriceComparison] Product detected: {...}
[PriceComparison] Search query: "..."
[PriceComparison] Fetching from: flipkart, ebay, walmart
```

## 📋 Integration Checklist

- [x] All module files created
- [x] Manifest.json updated with new scripts
- [x] Background script includes price-fetcher.js
- [x] Content scripts load in correct order
- [ ] Test on real Amazon product page
- [ ] Verify price extraction
- [ ] Check comparison results
- [ ] Test caching behavior

## 🔧 How to Use in Your Code

### Option 1: Use Smart Comparison (Recommended)
```javascript
// In content script
const smartComparison = new SmartPriceComparison();

// Automatic comparison
const result = await smartComparison.comparePrice(
  productName,
  currentPrice,
  'amazon'
);

// Display results
if (result.availableProducts.length > 0) {
  console.log('Best price:', result.bestPrice);
  console.log('Savings:', result.bestPrice.savings);
}
```

### Option 2: Use Engine Directly
```javascript
// Direct engine access
const engine = new PriceComparisonEngine();
const comparison = await engine.compareCurrentProduct();

if (comparison.success) {
  console.log('Current:', comparison.currentPrice);
  console.log('Best:', comparison.bestPrice);
  console.log('Savings:', comparison.savings);
}
```

## 🎯 Key Functions

### Detect Product
```javascript
const detector = new ProductDetector();
const product = detector.detectProductPage();
// Returns: { site, title, price, asin, url, image }
```

### Normalize Title
```javascript
const normalizer = new ProductNormalizer();
const clean = normalizer.normalize(title);
// "Apple iPhone 15 Pro (256GB)" → "apple iphone pro"
```

### Generate URLs
```javascript
const urlGen = new SearchURLGenerator();
const urls = urlGen.generateAllURLs(searchQuery);
// Returns: { flipkart: "...", ebay: "...", walmart: "..." }
```

### Fetch Pages (Background)
```javascript
chrome.runtime.sendMessage({
  action: 'fetchMultiplePages',
  urls: ['url1', 'url2'],
  options: { maxConcurrent: 2, timeout: 8000 }
}, (response) => {
  console.log(response.results);
});
```

## 🧪 Testing

### Test Individual Modules
Open `test-smart-comparison.html` in browser:
- Test normalizer
- Test URL generator
- Test scrapers
- Test full integration

### Test in Extension
1. Load extension
2. Go to Amazon product page
3. Open console
4. Run:
```javascript
const engine = new PriceComparisonEngine();
engine.compareCurrentProduct().then(console.log);
```

## 🐛 Debugging

### Enable Detailed Logging
All modules log to console with prefixes:
- `[PriceComparison]` - Main engine
- `[PriceFetcher]` - Background fetcher
- `[SmartComparison]` - Integration layer

### Common Issues

**No prices found:**
```javascript
// Check if product detected
const detector = new ProductDetector();
console.log(detector.detectProductPage());
```

**Fetch failing:**
```javascript
// Check background script
chrome.runtime.sendMessage({
  action: 'fetchProductPage',
  url: 'https://www.flipkart.com/search?q=test'
}, console.log);
```

**Scraper not working:**
```javascript
// Test scraper directly
const factory = new ScraperFactory();
const scraper = factory.getScraper('flipkart');
scraper.scrape(htmlString).then(console.log);
```

## 📊 Performance Tips

### Optimize Fetching
```javascript
// Reduce concurrent requests
options: { maxConcurrent: 2 }

// Decrease timeout
options: { timeout: 5000 }
```

### Clear Cache
```javascript
// Clear comparison cache
engine.clearCache();

// Clear fetch cache
chrome.runtime.sendMessage({ action: 'clearPriceCache' });
```

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
    const priceText = this.extractFromSelectors(doc, this.priceSelectors);
    const price = this.parsePrice(priceText);

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
// In scraper-factory.js registerDefaultScrapers()
if (typeof NewSiteScraper !== 'undefined') {
  this.register('newsite', NewSiteScraper);
}
```

### 3. Add URL Config
```javascript
// In search-url-generator.js siteConfigs
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

## 📈 Monitoring

### Check Cache Stats
```javascript
// In background script
priceFetcher.getCacheStats();
// Returns: { size: 5, entries: [...] }
```

### Monitor Performance
```javascript
console.time('comparison');
await engine.compareCurrentProduct();
console.timeEnd('comparison');
// Typical: 5-15 seconds
```

## 🎨 UI Integration

### Display Results
```javascript
const result = await smartComparison.comparePrice(...);

result.availableProducts.forEach(product => {
  console.log(`${product.site}: $${product.price}`);
  console.log(`Savings: ${product.savingsPercent}%`);
  console.log(`Link: ${product.url}`);
});
```

### Show Best Price
```javascript
if (result.bestPrice.savings > 0) {
  alert(`Save $${result.bestPrice.savings} on ${result.bestPrice.site}!`);
}
```

## 🔒 Security Notes

- All fetching happens in background script
- No eval() or unsafe HTML injection
- CORS handled by extension permissions
- User-Agent headers prevent blocking
- Timeout protection prevents hanging

## 📚 Additional Resources

- **Full Guide**: `SMART_PRICE_COMPARISON_GUIDE.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Test Suite**: `test-smart-comparison.html`
- **Module Docs**: See comments in each file

## 💡 Pro Tips

1. **Cache is your friend**: Results cached for 10 minutes
2. **Batch requests**: Fetch multiple sites concurrently
3. **Fail gracefully**: Always check `result.success`
4. **Log everything**: Use console for debugging
5. **Test scrapers**: Site layouts change frequently

## 🆘 Need Help?

1. Check console logs
2. Run test suite
3. Verify manifest permissions
4. Test individual modules
5. Check scraper selectors

## ✅ Success Indicators

You'll know it's working when you see:
- Product detected on Amazon pages
- Search URLs generated for multiple sites
- Background fetching HTML successfully
- Scrapers extracting prices
- Comparison results with savings

That's it! You're ready to use the Smart Price Comparison Engine. 🎉
