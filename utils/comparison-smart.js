// Smart Price Comparison - Main Integration Module
// Integrates new browser-based comparison engine with legacy API fallback

class SmartPriceComparison {
  constructor() {
    // Initialize smart engine
    this.engine = null;
    this.initEngine();
    
    // Legacy API config (fallback only)
    // Replace with your actual API key
    this.apiConfig = {
      endpoint: 'https://real-time-product-search.p.rapidapi.com',
      apiKey: 'YOUR_RAPIDAPI_KEY', // Replace with your key
      apiHost: 'real-time-product-search.p.rapidapi.com',
      enabled: false, // Disabled by default - use smart engine
      timeout: 15000
    };

    this.siteIcons = {
      'amazon': '🛒',
      'flipkart': '🛍️',
      'walmart': '🏪',
      'ebay': '🔨',
      'target': '🎯',
      'default': '🛒'
    };
  }

  async initEngine() {
    try {
      if (typeof PriceComparisonEngine !== 'undefined') {
        this.engine = new PriceComparisonEngine();
        console.log('[SmartComparison] Engine initialized');
      }
    } catch (error) {
      console.error('[SmartComparison] Engine init failed:', error);
    }
  }

  // Main comparison entry point
  async comparePrice(productName, currentPrice, currentSite) {
    console.log('[SmartComparison] Starting comparison');

    // Use smart engine (browser-based, no API)
    if (this.engine) {
      try {
        const result = await this.engine.compareCurrentProduct();
        
        if (result && result.success) {
          return this.formatResult(result);
        }
      } catch (error) {
        console.error('[SmartComparison] Engine failed:', error);
      }
    }

    // Return empty result if engine fails
    return {
      currentSite: { name: currentSite, price: currentPrice },
      availableProducts: [],
      productName: productName,
      error: 'Comparison unavailable'
    };
  }

  // Format engine result for UI
  formatResult(result) {
    const products = [];

    for (const [site, data] of Object.entries(result.prices)) {
      if (site !== result.currentSite && data.price) {
        products.push({
          site: this.formatSiteName(site),
          siteIcon: this.siteIcons[site.toLowerCase()] || this.siteIcons.default,
          price: data.price,
          currency: 'USD',
          url: data.link,
          title: data.title,
          available: data.available !== false,
          isBestPrice: site === result.bestSite,
          priceDifference: (data.price - result.currentPrice).toFixed(2),
          savingsPercent: (((result.currentPrice - data.price) / result.currentPrice) * 100).toFixed(1)
        });
      }
    }

    // Sort by price
    products.sort((a, b) => a.price - b.price);

    return {
      currentSite: {
        name: this.formatSiteName(result.currentSite),
        price: result.currentPrice,
        currency: 'USD'
      },
      availableProducts: products,
      bestPrice: {
        site: this.formatSiteName(result.bestSite),
        price: result.bestPrice,
        savings: result.savings,
        savingsPercent: result.savingsPercent
      },
      productName: result.prices[result.currentSite]?.title || '',
      timestamp: result.timestamp,
      source: 'smart-engine'
    };
  }

  formatSiteName(site) {
    const names = {
      'amazon': 'Amazon',
      'flipkart': 'Flipkart',
      'ebay': 'eBay',
      'walmart': 'Walmart',
      'target': 'Target'
    };
    return names[site.toLowerCase()] || site.charAt(0).toUpperCase() + site.slice(1);
  }

  // Extract product identifiers
  extractProductIdentifiers() {
    const identifiers = {
      asin: null,
      upc: null,
      ean: null
    };

    const asinMatch = window.location.href.match(/\/dp\/([A-Z0-9]{10})/i);
    if (asinMatch) {
      identifiers.asin = asinMatch[1];
    }

    return identifiers;
  }

  getCurrentSiteInfo(currentPrice) {
    const hostname = window.location.hostname;
    let siteName = 'Unknown';

    if (hostname.includes('amazon')) siteName = 'Amazon';
    else if (hostname.includes('flipkart')) siteName = 'Flipkart';
    else if (hostname.includes('ebay')) siteName = 'eBay';
    else if (hostname.includes('walmart')) siteName = 'Walmart';

    return {
      name: siteName,
      price: currentPrice,
      currency: 'USD',
      icon: this.siteIcons[siteName.toLowerCase()] || this.siteIcons.default
    };
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartPriceComparison;
}
