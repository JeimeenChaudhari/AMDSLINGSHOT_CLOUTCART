// Base Scraper Class
// Provides common functionality for all site scrapers

class BaseScraper {
  constructor(siteName) {
    this.siteName = siteName;
  }

  // Parse HTML string into DOM
  parseHTML(htmlString) {
    const parser = new DOMParser();
    return parser.parseFromString(htmlString, 'text/html');
  }

  // Extract price from text
  parsePrice(priceText) {
    if (!priceText) return null;
    
    // Remove currency symbols and extract numbers
    const cleaned = priceText.replace(/[^0-9.,]/g, '');
    const normalized = cleaned.replace(/,/g, '');
    const price = parseFloat(normalized);
    
    return isNaN(price) || price <= 0 ? null : price;
  }

  // Clean text content
  cleanText(text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  }

  // Extract first valid result from multiple selectors
  extractFromSelectors(doc, selectors, extractor = null) {
    for (const selector of selectors) {
      try {
        const element = doc.querySelector(selector);
        if (element) {
          const value = extractor ? extractor(element) : element.textContent;
          if (value && value.trim()) {
            return this.cleanText(value);
          }
        }
      } catch (error) {
        console.warn(`Selector failed: ${selector}`, error);
      }
    }
    return null;
  }

  // Main scraping method (to be overridden by child classes)
  async scrape(html) {
    throw new Error('scrape() must be implemented by child class');
  }

  // Validate scraped result
  validateResult(result) {
    return result && result.price && result.price > 0 && result.title;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseScraper;
}
