// Product Detection Module
// Detects when user is on a product page and extracts product information

class ProductDetector {
  constructor() {
    this.siteDetectors = {
      amazon: this.detectAmazon.bind(this),
      flipkart: this.detectFlipkart.bind(this),
      ebay: this.detectEbay.bind(this)
    };
  }

  // Detect current site and if it's a product page
  detectProductPage() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('amazon')) {
      return this.detectAmazon();
    } else if (hostname.includes('flipkart')) {
      return this.detectFlipkart();
    } else if (hostname.includes('ebay')) {
      return this.detectEbay();
    }
    
    return null;
  }

  // Amazon product detection
  detectAmazon() {
    const url = window.location.href;
    
    // Check if it's a product page (contains /dp/ or /gp/product/)
    if (!url.includes('/dp/') && !url.includes('/gp/product/')) {
      return null;
    }

    const productInfo = {
      site: 'amazon',
      title: this.extractAmazonTitle(),
      price: this.extractAmazonPrice(),
      asin: this.extractAmazonASIN(),
      url: window.location.href,
      image: this.extractAmazonImage()
    };

    return productInfo.title && productInfo.price ? productInfo : null;
  }

  extractAmazonTitle() {
    const selectors = [
      '#productTitle',
      '#title',
      'h1.product-title',
      '[data-feature-name="title"] h1'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return null;
  }

  extractAmazonPrice() {
    const selectors = [
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price-whole',
      '[data-a-color="price"] .a-offscreen'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const priceText = element.textContent.trim();
        const price = this.parsePrice(priceText);
        if (price > 0) return price;
      }
    }
    return null;
  }

  extractAmazonASIN() {
    const url = window.location.href;
    const match = url.match(/\/dp\/([A-Z0-9]{10})/i) || url.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    return match ? match[1] : null;
  }

  extractAmazonImage() {
    const selectors = [
      '#landingImage',
      '#imgBlkFront',
      '.a-dynamic-image'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.src) {
        return element.src;
      }
    }
    return null;
  }

  // Flipkart product detection
  detectFlipkart() {
    const url = window.location.href;
    
    if (!url.includes('/p/')) {
      return null;
    }

    return {
      site: 'flipkart',
      title: this.extractFlipkartTitle(),
      price: this.extractFlipkartPrice(),
      url: window.location.href
    };
  }

  extractFlipkartTitle() {
    const selectors = [
      '.B_NuCI',
      'h1.yhB1nd',
      'span.B_NuCI'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return null;
  }

  extractFlipkartPrice() {
    const selectors = [
      '._30jeq3._16Jk6d',
      'div._30jeq3',
      '._25b18c ._16Jk6d'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const price = this.parsePrice(element.textContent);
        if (price > 0) return price;
      }
    }
    return null;
  }

  // eBay product detection
  detectEbay() {
    const url = window.location.href;
    
    if (!url.includes('/itm/')) {
      return null;
    }

    return {
      site: 'ebay',
      title: this.extractEbayTitle(),
      price: this.extractEbayPrice(),
      url: window.location.href
    };
  }

  extractEbayTitle() {
    const selectors = [
      '.x-item-title__mainTitle',
      'h1.it-ttl'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return null;
  }

  extractEbayPrice() {
    const selectors = [
      '.x-price-primary .ux-textspans',
      '#prcIsum'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const price = this.parsePrice(element.textContent);
        if (price > 0) return price;
      }
    }
    return null;
  }

  // Parse price from text
  parsePrice(priceText) {
    if (!priceText) return 0;
    
    // Remove currency symbols and extract numbers
    const cleaned = priceText.replace(/[^0-9.,]/g, '');
    const normalized = cleaned.replace(/,/g, '');
    const price = parseFloat(normalized);
    
    return isNaN(price) ? 0 : price;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductDetector;
}
