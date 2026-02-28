// Scraper Factory
// Creates appropriate scraper instance for each site

class ScraperFactory {
  constructor() {
    this.scrapers = new Map();
    this.registerDefaultScrapers();
  }

  registerDefaultScrapers() {
    // Scrapers will be registered when their classes are loaded
    if (typeof FlipkartScraper !== 'undefined') {
      this.register('flipkart', FlipkartScraper);
    }
    if (typeof EbayScraper !== 'undefined') {
      this.register('ebay', EbayScraper);
    }
    if (typeof WalmartScraper !== 'undefined') {
      this.register('walmart', WalmartScraper);
    }
  }

  // Register a scraper class for a site
  register(siteName, ScraperClass) {
    this.scrapers.set(siteName.toLowerCase(), ScraperClass);
  }

  // Get scraper instance for a site
  getScraper(siteName) {
    const ScraperClass = this.scrapers.get(siteName.toLowerCase());
    
    if (!ScraperClass) {
      console.warn(`No scraper registered for site: ${siteName}`);
      return null;
    }

    return new ScraperClass();
  }

  // Check if scraper exists for site
  hasScraper(siteName) {
    return this.scrapers.has(siteName.toLowerCase());
  }

  // Get list of supported sites
  getSupportedSites() {
    return Array.from(this.scrapers.keys());
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScraperFactory;
}
