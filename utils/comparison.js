// Price comparison utilities
class PriceComparison {
  constructor() {
    this.supportedSites = [
      { name: 'Amazon', domain: 'amazon.com', searchUrl: 'https://www.amazon.com/s?k=' },
      { name: 'Walmart', domain: 'walmart.com', searchUrl: 'https://www.walmart.com/search?q=' },
      { name: 'eBay', domain: 'ebay.com', searchUrl: 'https://www.ebay.com/sch/i.html?_nkw=' },
      { name: 'Target', domain: 'target.com', searchUrl: 'https://www.target.com/s?searchTerm=' },
      { name: 'Best Buy', domain: 'bestbuy.com', searchUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=' }
    ];
  }

  async comparePrice(productName, currentPrice, currentSite) {
    // In production, this would call real APIs or scrape data
    // For MVP, we'll simulate comparison data
    
    const comparisons = this.supportedSites.map(site => {
      const isCurrent = window.location.href.includes(site.domain);
      
      // Simulate price variations
      let price = currentPrice;
      if (!isCurrent) {
        const variation = (Math.random() - 0.5) * 0.2; // ±10%
        price = currentPrice * (1 + variation);
      }
      
      return {
        site: site.name,
        price: parseFloat(price.toFixed(2)),
        url: isCurrent ? window.location.href : site.searchUrl + encodeURIComponent(productName),
        current: isCurrent,
        available: Math.random() > 0.2 // 80% availability
      };
    });

    // Sort by price
    comparisons.sort((a, b) => a.price - b.price);

    // Calculate savings
    const lowestPrice = comparisons[0].price;
    const savings = currentPrice - lowestPrice;

    return {
      comparisons: comparisons.filter(c => c.available),
      lowestPrice,
      highestPrice: comparisons[comparisons.length - 1].price,
      savings: parseFloat(savings.toFixed(2)),
      savingsPercent: parseFloat(((savings / currentPrice) * 100).toFixed(2)),
      bestDeal: comparisons[0].site
    };
  }

  generateSearchUrls(productName) {
    return this.supportedSites.map(site => ({
      site: site.name,
      url: site.searchUrl + encodeURIComponent(productName)
    }));
  }

  extractProductInfo() {
    // Extract product information from current page
    const info = {
      name: null,
      price: null,
      rating: null,
      reviews: null,
      image: null
    };

    // Product name
    const titleSelectors = [
      '#productTitle',
      '.product-title',
      'h1[itemprop="name"]',
      '.product-name'
    ];
    
    for (const selector of titleSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        info.name = el.textContent.trim();
        break;
      }
    }

    // Price
    const priceSelectors = [
      '.a-price-whole',
      '.a-price .a-offscreen',
      '[data-price]',
      '.price',
      '[itemprop="price"]'
    ];
    
    for (const selector of priceSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        const priceText = el.textContent.replace(/[^0-9.]/g, '');
        info.price = parseFloat(priceText);
        break;
      }
    }

    // Rating
    const ratingSelectors = [
      '[data-hook="rating-out-of-text"]',
      '.a-icon-star',
      '[itemprop="ratingValue"]'
    ];
    
    for (const selector of ratingSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        const ratingMatch = el.textContent.match(/[\d.]+/);
        if (ratingMatch) {
          info.rating = parseFloat(ratingMatch[0]);
          break;
        }
      }
    }

    // Review count
    const reviewSelectors = [
      '#acrCustomerReviewText',
      '[data-hook="total-review-count"]'
    ];
    
    for (const selector of reviewSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        const countMatch = el.textContent.match(/[\d,]+/);
        if (countMatch) {
          info.reviews = parseInt(countMatch[0].replace(/,/g, ''));
          break;
        }
      }
    }

    // Product image
    const imageSelectors = [
      '#landingImage',
      '.product-image img',
      '[data-old-hires]'
    ];
    
    for (const selector of imageSelectors) {
      const el = document.querySelector(selector);
      if (el) {
        info.image = el.src || el.getAttribute('data-old-hires');
        break;
      }
    }

    return info;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PriceComparison;
}
