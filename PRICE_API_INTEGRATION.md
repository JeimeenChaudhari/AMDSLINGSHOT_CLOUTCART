# Price Comparison API Integration Guide

## Overview
This guide explains how to integrate real-time price fetching APIs to get accurate prices from multiple shopping websites.

## Current Implementation
The extension currently generates search URLs for 25+ shopping websites including:
- **US Sites**: Amazon, Walmart, eBay, Target, Best Buy, Newegg, AliExpress, Etsy
- **Indian Sites**: Flipkart, Amazon India, Myntra, Ajio, Snapdeal, Meesho, Tata CLiQ, Nykaa, FirstCry, Pepperfry, Croma, Reliance Digital
- **International**: Amazon UK, Amazon DE, Amazon CA, Argos

When users click on a site, they are redirected to the actual product search on that website.

## API Options for Real Price Fetching

### 1. Rainforest API (Recommended)
**Best for**: Amazon, Walmart, eBay product data

```javascript
// Example integration in utils/comparison.js
async fetchRealPrice(productName, site) {
  const apiKey = 'YOUR_RAINFOREST_API_KEY';
  const params = {
    api_key: apiKey,
    type: 'search',
    amazon_domain: 'amazon.com',
    search_term: productName
  };
  
  const response = await fetch(`https://api.rainforestapi.com/request?${new URLSearchParams(params)}`);
  const data = await response.json();
  
  return {
    price: data.search_results[0]?.price?.value,
    url: data.search_results[0]?.link,
    title: data.search_results[0]?.title
  };
}
```

**Pricing**: Starting at $49/month for 5,000 requests
**Website**: https://www.rainforestapi.com/

### 2. ScraperAPI
**Best for**: General web scraping across multiple sites

```javascript
async fetchWithScraperAPI(url) {
  const apiKey = 'YOUR_SCRAPER_API_KEY';
  const response = await fetch(`http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(url)}`);
  const html = await response.text();
  
  // Parse HTML to extract price
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  // Extract price based on site-specific selectors
}
```

**Pricing**: Starting at $49/month for 100,000 API credits
**Website**: https://www.scraperapi.com/

### 3. Oxylabs E-Commerce Scraper API
**Best for**: Large-scale price monitoring

```javascript
async fetchWithOxylabs(productUrl) {
  const username = 'YOUR_USERNAME';
  const password = 'YOUR_PASSWORD';
  
  const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(`${username}:${password}`)
    },
    body: JSON.stringify({
      source: 'amazon',
      url: productUrl,
      parse: true
    })
  });
  
  const data = await response.json();
  return data.results[0].content;
}
```

**Pricing**: Custom pricing based on volume
**Website**: https://oxylabs.io/

### 4. Bright Data (formerly Luminati)
**Best for**: Enterprise-level scraping with high reliability

**Pricing**: Custom enterprise pricing
**Website**: https://brightdata.com/

### 5. Free Alternative: Custom Scraping
For development/testing, you can implement custom scraping:

```javascript
async scrapePrice(url, selectors) {
  try {
    // Note: This requires CORS proxy or backend service
    const response = await fetch(url);
    const html = await response.text();
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    for (const selector of selectors) {
      const element = doc.querySelector(selector);
      if (element) {
        const priceText = element.textContent.replace(/[^0-9.]/g, '');
        return parseFloat(priceText);
      }
    }
  } catch (error) {
    console.error('Scraping error:', error);
    return null;
  }
}
```

## Implementation Steps

### Step 1: Choose an API Provider
Select based on your needs:
- **Budget**: Free custom scraping (limited reliability)
- **Small scale**: ScraperAPI or Rainforest API
- **Large scale**: Oxylabs or Bright Data

### Step 2: Update comparison.js

```javascript
class PriceComparison {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.supportedSites = [...]; // existing sites
  }
  
  async fetchRealPrices(productName, sites) {
    const promises = sites.map(site => 
      this.fetchPriceForSite(productName, site)
    );
    
    const results = await Promise.allSettled(promises);
    return results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);
  }
  
  async fetchPriceForSite(productName, site) {
    if (!this.apiKey) {
      // Return search URL if no API key
      return {
        site: site.name,
        url: site.searchUrl + encodeURIComponent(productName),
        priceAvailable: false
      };
    }
    
    // Use API to fetch real price
    const data = await this.callPriceAPI(productName, site);
    
    return {
      site: site.name,
      price: data.price,
      url: data.productUrl,
      priceAvailable: true,
      lastUpdated: new Date()
    };
  }
}
```

### Step 3: Add API Key Management

Create a settings page in your extension:

```javascript
// In popup.js or settings page
chrome.storage.sync.set({
  priceApiKey: 'YOUR_API_KEY',
  priceApiProvider: 'rainforest' // or 'scraperapi', etc.
});

// Retrieve in comparison.js
chrome.storage.sync.get(['priceApiKey', 'priceApiProvider'], (result) => {
  const priceComparison = new PriceComparison(result.priceApiKey);
});
```

### Step 4: Handle Rate Limiting

```javascript
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }
  
  async throttle() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}
```

### Step 5: Cache Results

```javascript
class PriceCache {
  constructor(ttl = 3600000) { // 1 hour default
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
}
```

## Site-Specific Price Selectors

For custom scraping, here are common price selectors:

```javascript
const priceSelectors = {
  'amazon.com': [
    '.a-price-whole',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price .a-offscreen'
  ],
  'walmart.com': [
    '[itemprop="price"]',
    '.price-characteristic',
    '[data-automation-id="product-price"]'
  ],
  'flipkart.com': [
    '._30jeq3',
    '._1_WHN1',
    '.CEmiEU'
  ],
  'amazon.in': [
    '.a-price-whole',
    '#priceblock_ourprice',
    '#priceblock_dealprice'
  ],
  'ebay.com': [
    '.x-price-primary',
    '#prcIsum',
    '.display-price'
  ],
  'target.com': [
    '[data-test="product-price"]',
    '.h-text-bs'
  ]
};
```

## Best Practices

1. **Always use HTTPS** for API calls
2. **Implement caching** to reduce API costs
3. **Handle errors gracefully** - fall back to search URLs
4. **Respect rate limits** to avoid API bans
5. **Store API keys securely** - never commit to version control
6. **Add loading states** for better UX
7. **Implement retry logic** for failed requests
8. **Monitor API usage** to stay within budget

## Testing

Test with various products:
```javascript
// Test cases
const testProducts = [
  'iPhone 15 Pro',
  'Samsung Galaxy S24',
  'Sony WH-1000XM5',
  'Nike Air Max 270'
];

for (const product of testProducts) {
  const results = await priceComparison.comparePrice(product);
  console.log(`${product}:`, results);
}
```

## Cost Estimation

For 10,000 monthly active users:
- Average 5 comparisons per user = 50,000 requests/month
- Rainforest API: ~$99/month
- ScraperAPI: ~$99/month
- Custom solution: Server costs only (~$20/month)

## Legal Considerations

⚠️ **Important**: Web scraping may violate terms of service. Always:
1. Check robots.txt
2. Review website terms of service
3. Consider using official APIs where available
4. Implement respectful rate limiting
5. Consult legal counsel for commercial use

## Next Steps

1. Choose an API provider
2. Sign up and get API key
3. Update `utils/comparison.js` with API integration
4. Add API key management in extension settings
5. Test thoroughly with various products
6. Monitor usage and costs
7. Optimize caching strategy

## Support

For questions or issues:
- Check API provider documentation
- Review browser console for errors
- Test with simple products first
- Verify API key is valid and has credits
