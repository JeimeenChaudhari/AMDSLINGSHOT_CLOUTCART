// eBay Scraper
// Extracts product information from eBay search results

class EbayScraper extends BaseScraper {
  constructor() {
    super('ebay');
    
    this.priceSelectors = [
      '.s-item__price',
      'span.POSITIVE',
      '.s-item__detail--primary .s-item__price'
    ];

    this.titleSelectors = [
      '.s-item__title',
      'h3.s-item__title'
    ];

    this.linkSelectors = [
      'a.s-item__link',
      '.s-item__link'
    ];
  }

  async scrape(html) {
    const doc = this.parseHTML(html);

    // Find first valid product in search results
    const items = doc.querySelectorAll('.s-item');

    for (const item of items) {
      // Skip sponsored/ad items
      if (item.classList.contains('s-item--ad')) {
        continue;
      }

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
    if (linkElement && linkElement.href) {
      link = linkElement.href;
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
  module.exports = EbayScraper;
}
