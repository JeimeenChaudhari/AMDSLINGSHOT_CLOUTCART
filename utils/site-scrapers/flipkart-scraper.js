// Flipkart Scraper
// Extracts product information from Flipkart search results

class FlipkartScraper extends BaseScraper {
  constructor() {
    super('flipkart');
    
    this.priceSelectors = [
      '._30jeq3._16Jk6d',
      'div._30jeq3',
      '._25b18c ._16Jk6d',
      'div._30jeq3._1_WHN1',
      '._1_WHN1'
    ];

    this.titleSelectors = [
      '._4rR01T',
      '.s1Q9rs',
      '._2B099V',
      'a._1fQZEK',
      'div._4rR01T'
    ];

    this.linkSelectors = [
      'a._1fQZEK',
      'a._2rpwqI',
      'a[href*="/p/"]'
    ];
  }

  async scrape(html) {
    console.log('[FlipkartScraper] Starting scrape...');
    const doc = this.parseHTML(html);

    // Find first product in search results
    const productContainers = doc.querySelectorAll('._1AtVbE, ._2kHMtA, .tUxRFH, ._13oc-S, .cPHDOP');
    console.log(`[FlipkartScraper] Found ${productContainers.length} product containers`);

    for (const container of productContainers) {
      const result = this.extractProductFromContainer(container);
      if (this.validateResult(result)) {
        console.log('[FlipkartScraper] ✅ Valid product found:', result);
        return result;
      }
    }

    // Fallback: try to extract from entire page
    console.log('[FlipkartScraper] No valid container found, trying page-level extraction');
    const fallbackResult = this.extractFromPage(doc);
    
    if (this.validateResult(fallbackResult)) {
      console.log('[FlipkartScraper] ✅ Fallback extraction successful:', fallbackResult);
      return fallbackResult;
    }
    
    console.warn('[FlipkartScraper] ❌ No valid product data found');
    return null;
  }

  extractProductFromContainer(container) {
    const title = this.extractFromSelectors(container, this.titleSelectors);
    const priceText = this.extractFromSelectors(container, this.priceSelectors);
    const price = this.parsePrice(priceText);

    console.log(`[FlipkartScraper] Container extraction - Title: ${title ? 'Found' : 'Missing'}, Price: ${price || 'Missing'}`);

    let link = null;
    const linkElement = container.querySelector(this.linkSelectors.join(','));
    if (linkElement && linkElement.href) {
      link = linkElement.href.startsWith('http') 
        ? linkElement.href 
        : `https://www.flipkart.com${linkElement.href}`;
    }

    return {
      site: this.siteName,
      title: title,
      price: price,
      link: link,
      available: price !== null && price > 0
    };
  }

  extractFromPage(doc) {
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FlipkartScraper;
}
