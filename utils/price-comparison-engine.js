// Price Comparison Engine
// Main orchestrator for price comparison logic

class PriceComparisonEngine {
  constructor() {
    this.productDetector = new ProductDetector();
    this.productNormalizer = new ProductNormalizer();
    this.urlGenerator = new SearchURLGenerator();
    this.scraperFactory = new ScraperFactory();
    
    this.comparisonCache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
  }

  // Main comparison method
  async compareCurrentProduct() {
    try {
      // Step 1: Detect product
      const productInfo = this.productDetector.detectProductPage();
      
      if (!productInfo) {
        return {
          success: false,
          error: 'Not a product page or unable to extract product info'
        };
      }

      console.log('[PriceComparison] Product detected:', productInfo);

      // Check cache
      const cacheKey = this.getCacheKey(productInfo);
      if (this.comparisonCache.has(cacheKey)) {
        const cached = this.comparisonCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          console.log('[PriceComparison] Using cached results');
          return cached.data;
        }
      }

      // Step 2: Normalize product title
      const searchQuery = this.productNormalizer.normalize(productInfo.title);
      console.log('[PriceComparison] Search query:', searchQuery);

      // Step 3: Generate search URLs (exclude current site)
      const sitesToCompare = this.getSitesToCompare(productInfo.site);
      const searchUrls = this.urlGenerator.generateURLsForSites(searchQuery, sitesToCompare);
      console.log('[PriceComparison] Search URLs:', searchUrls);

      // Step 4: Fetch pages from background script
      const fetchResults = await this.fetchPages(searchUrls);

      // Step 5: Parse and extract prices
      const priceResults = await this.extractPrices(fetchResults);

      // Step 6: Compare and analyze
      const comparison = this.analyzeComparison(productInfo, priceResults);

      // Cache results
      this.comparisonCache.set(cacheKey, {
        data: comparison,
        timestamp: Date.now()
      });

      return comparison;

    } catch (error) {
      console.error('[PriceComparison] Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Fetch pages via background script
  async fetchPages(searchUrls) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: 'fetchMultiplePages',
          urls: Object.values(searchUrls),
          options: { maxConcurrent: 2, timeout: 8000 }
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success) {
            // Map URLs back to site names
            const results = {};
            for (const [site, url] of Object.entries(searchUrls)) {
              results[site] = response.results[url];
            }
            resolve(results);
          } else {
            reject(new Error(response?.error || 'Fetch failed'));
          }
        }
      );
    });
  }

  // Extract prices from fetched HTML
  async extractPrices(fetchResults) {
    const priceResults = {};

    for (const [site, fetchResult] of Object.entries(fetchResults)) {
      if (!fetchResult || !fetchResult.success || !fetchResult.html) {
        console.warn(`[PriceComparison] No HTML for ${site}`);
        priceResults[site] = null;
        continue;
      }

      const scraper = this.scraperFactory.getScraper(site);
      if (!scraper) {
        console.warn(`[PriceComparison] No scraper for ${site}`);
        priceResults[site] = null;
        continue;
      }

      try {
        const result = await scraper.scrape(fetchResult.html);
        priceResults[site] = result;
        console.log(`[PriceComparison] ${site} result:`, result);
      } catch (error) {
        console.error(`[PriceComparison] Scraping error for ${site}:`, error);
        priceResults[site] = null;
      }
    }

    return priceResults;
  }

  // Analyze comparison results
  analyzeComparison(currentProduct, priceResults) {
    const prices = {
      [currentProduct.site]: {
        price: currentProduct.price,
        title: currentProduct.title,
        url: currentProduct.url,
        available: true
      }
    };

    // Add other site prices
    for (const [site, result] of Object.entries(priceResults)) {
      if (result && result.price) {
        prices[site] = result;
      }
    }

    // Find best price
    let bestSite = currentProduct.site;
    let bestPrice = currentProduct.price;

    for (const [site, data] of Object.entries(prices)) {
      if (data.price && data.price < bestPrice) {
        bestPrice = data.price;
        bestSite = site;
      }
    }

    // Calculate savings
    const savings = currentProduct.price - bestPrice;
    const savingsPercent = (savings / currentProduct.price) * 100;

    return {
      success: true,
      currentSite: currentProduct.site,
      currentPrice: currentProduct.price,
      bestSite: bestSite,
      bestPrice: bestPrice,
      savings: savings,
      savingsPercent: savingsPercent.toFixed(1),
      prices: prices,
      timestamp: Date.now()
    };
  }

  // Get sites to compare (exclude current site)
  getSitesToCompare(currentSite) {
    const allSites = this.scraperFactory.getSupportedSites();
    return allSites.filter(site => site !== currentSite.toLowerCase());
  }

  // Generate cache key
  getCacheKey(productInfo) {
    return `${productInfo.site}_${productInfo.asin || productInfo.title.substring(0, 50)}`;
  }

  // Clear cache
  clearCache() {
    this.comparisonCache.clear();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PriceComparisonEngine;
}
