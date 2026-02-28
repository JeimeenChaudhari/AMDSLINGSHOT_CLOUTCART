// Walmart Scraper
// Extracts product information from Walmart search results

class WalmartScraper extends BaseScraper {
  constructor() {
    super('walmart');
    
    this.priceSelectors = [
      '[data-automation-id="product-price"]',
      '.price-main .price-characteristic',
      'span[itemprop="price"]'
    ];

    this.titleSelectors = [
      '[data-automation-id="product-title"]',
      'span[itemprop="name"]',
      '.product-title-link span'
    ];

    this.linkSelectors = [
      'a[link-identifier*="product"]',
      '[data-automation-id="product-title"]'
    ];
  }

  async scrape(html) {
    const doc = this.parseHTML(html);

    // Find product items
    const items = doc.querySelectorAll('[data-item-id], [data-automation-id="product"]');

    for (const item of items) {
      const result = this.extractProductFromItem(item);
      if (this.validateResult(result)) {
        return result;
      }
    }

    return null;
  }

  extractProductFromItem(item) {
    const title = this.extractFromSelectors(item, this.titleSelectors);
    const priceText = this.extractFromSelectors(item, this.priceSelectors);
    const price = this.parsePrice(priceText);

    let link = null;
    const linkElement = item.querySelector(this.linkSelectors.join(','));
    if (linkElement) {
      link = linkElement.href || linkElement.closest('a')?.href;
      if (link && !link.startsWith('http')) {
        link = `https://www.walmart.com${link}`;
      }
    }

    return {
      site: this.siteName,
      title: title,
      price: price,
      link: link,
      available: price !== null
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WalmartScraper;
}
