// Price comparison utilities
class PriceComparison {
  constructor() {
    this.supportedSites = [
      // US Sites
      { name: 'Amazon', domain: 'amazon.com', searchUrl: 'https://www.amazon.com/s?k=', icon: '🛒' },
      { name: 'Walmart', domain: 'walmart.com', searchUrl: 'https://www.walmart.com/search?q=', icon: '🏪' },
      { name: 'eBay', domain: 'ebay.com', searchUrl: 'https://www.ebay.com/sch/i.html?_nkw=', icon: '🔨' },
      { name: 'Target', domain: 'target.com', searchUrl: 'https://www.target.com/s?searchTerm=', icon: '🎯' },
      { name: 'Best Buy', domain: 'bestbuy.com', searchUrl: 'https://www.bestbuy.com/site/searchpage.jsp?st=', icon: '💻' },
      
      // Indian Sites
      { name: 'Flipkart', domain: 'flipkart.com', searchUrl: 'https://www.flipkart.com/search?q=', icon: '�️' },
      { name: 'Amazon India', domain: 'amazon.in', searchUrl: 'https://www.amazon.in/s?k=', icon: '�' },
      { name: 'Myntra', domain: 'myntra.com', searchUrl: 'https://www.myntra.com/', icon: '👗' },
      { name: 'Snapdeal', domain: 'snapdeal.com', searchUrl: 'https://www.snapdeal.com/search?keyword=', icon: '�' },
      { name: 'Croma', domain: 'croma.com', searchUrl: 'https://www.croma.com/searchB?q=', icon: '�' },
      { name: 'Reliance Digital', domain: 'reliancedigital.in', searchUrl: 'https://www.reliancedigital.in/search?q=', icon: '🔌' }
    ];
    
    // API configuration for PricesAPI.io
    this.apiConfig = {
      endpoint: 'https://api.pricesapi.io/api/v1',
      apiKey: 'pricesapi_njBc2fq9ye8Ia7LR1vebV38Q3URPWFEt',
      enabled: true
    };
  }

  // Extract product identifiers (ASIN, UPC, EAN, etc.)
  extractProductIdentifiers() {
    const identifiers = {
      asin: null,
      upc: null,
      ean: null,
      isbn: null,
      model: null
    };

    // Extract ASIN from Amazon
    const asinMatch = window.location.href.match(/\/dp\/([A-Z0-9]{10})/i) || 
                      window.location.href.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    if (asinMatch) {
      identifiers.asin = asinMatch[1];
    }

    // Try to find ASIN in page content
    const asinElements = document.querySelectorAll('[data-asin]');
    if (asinElements.length > 0) {
      identifiers.asin = asinElements[0].getAttribute('data-asin');
    }

    // Look for product details table
    const detailsTable = document.querySelector('#productDetails_detailBullets_sections1, #detailBullets_feature_div');
    if (detailsTable) {
      const text = detailsTable.textContent;
      
      // UPC
      const upcMatch = text.match(/UPC[:\s]+(\d{12})/i);
      if (upcMatch) identifiers.upc = upcMatch[1];
      
      // EAN
      const eanMatch = text.match(/EAN[:\s]+(\d{13})/i);
      if (eanMatch) identifiers.ean = eanMatch[1];
      
      // ISBN
      const isbnMatch = text.match(/ISBN[:\s]+(\d{10,13})/i);
      if (isbnMatch) identifiers.isbn = isbnMatch[1];
      
      // Model number
      const modelMatch = text.match(/Model[:\s]+([A-Z0-9\-]+)/i);
      if (modelMatch) identifiers.model = modelMatch[1];
    }

    return identifiers;
  }


  async comparePrice(productName, currentPrice, currentSite) {
    // Extract product identifiers for better matching
    const identifiers = this.extractProductIdentifiers();
    
    // Try to fetch real prices from API
    if (this.apiConfig.enabled && this.apiConfig.apiKey) {
      try {
        const apiResults = await this.searchProductWithAPI(productName, identifiers, currentPrice);
        if (apiResults && apiResults.availableProducts.length > 0) {
          return apiResults;
        }
      } catch (error) {
        console.error('API search failed, falling back to search URLs:', error);
      }
    }
    
    // Fallback: Use search URLs if API fails or is not configured
    const results = await this.searchProductAcrossSites(productName, identifiers, currentPrice);
    return results;
  }

  async searchProductWithAPI(productName, identifiers, currentPrice) {
    const currentDomain = window.location.hostname;
    const results = {
      currentSite: null,
      availableProducts: [],
      productName: productName,
      identifiers: identifiers,
      apiUsed: true
    };

    // Identify current site
    for (const site of this.supportedSites) {
      if (currentDomain.includes(site.domain)) {
        results.currentSite = {
          site: site.name,
          icon: site.icon,
          price: currentPrice,
          url: window.location.href,
          domain: site.domain
        };
        break;
      }
    }

    try {
      // Search for the product using PricesAPI.io
      // Note: PricesAPI uses /jobs endpoint for product searches
      const searchUrl = `${this.apiConfig.endpoint}/jobs?api_key=${this.apiConfig.apiKey}`;
      
      console.log('PricesAPI: Searching for:', productName);
      console.log('PricesAPI: URL:', searchUrl);
      
      // PricesAPI requires POST request with job parameters
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source: 'google_shopping',
          country: 'in',
          query: productName,
          parse: true
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('PricesAPI: Request failed:', response.status, errorText);
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('PricesAPI: Search response:', data);
      
      // Process API results from PricesAPI job response
      if (data && data.results) {
        console.log('PricesAPI: Job results:', data.results);
        
        // PricesAPI returns results with organic_results containing products
        const organicResults = data.results.organic_results || [];
        
        if (organicResults.length > 0) {
          console.log('PricesAPI: Found', organicResults.length, 'products');
          
          // Process each product result
          for (const result of organicResults.slice(0, 10)) { // Limit to first 10 results
            console.log('Processing result:', result);
            
            // Extract merchant/source from the link
            const productUrl = result.link || result.url;
            if (!productUrl) continue;
            
            let urlDomain = '';
            try {
              urlDomain = new URL(productUrl).hostname;
            } catch (e) {
              console.error('Invalid URL:', productUrl);
              continue;
            }
            
            // Extract price from the result
            const priceValue = result.price || result.extracted_price || null;
            
            console.log('Extracted - Domain:', urlDomain, 'Price:', priceValue, 'URL:', productUrl);
            
            // Try to match domain to our supported sites
            const matchingSite = this.supportedSites.find(s => 
              urlDomain.includes(s.domain) || s.domain.includes(urlDomain.replace('www.', ''))
            );
            
            if (matchingSite && !currentDomain.includes(matchingSite.domain)) {
              if (priceValue) {
                results.availableProducts.push({
                  site: matchingSite.name,
                  icon: matchingSite.icon,
                  url: productUrl,
                  domain: matchingSite.domain,
                  price: priceValue,
                  currency: '₹',
                  availability: result.delivery || 'Check Availability',
                  searchMode: false
                });
                console.log('Added product:', matchingSite.name, priceValue);
              }
            } else if (!matchingSite && priceValue) {
              // Add unmatched sites with generic info
              const merchantName = result.source || urlDomain.replace('www.', '').split('.')[0];
              results.availableProducts.push({
                site: merchantName.charAt(0).toUpperCase() + merchantName.slice(1),
                icon: '🛒',
                url: productUrl,
                domain: urlDomain,
                price: priceValue,
                currency: '₹',
                availability: 'Check Availability',
                searchMode: false
              });
              console.log('Added unmatched product:', merchantName, priceValue);
            }
          }
          
          console.log('PricesAPI: Total processed products:', results.availableProducts.length);
        } else {
          console.log('PricesAPI: No organic results found');
        }
      } else {
        console.log('PricesAPI: No results in response');
      }
      
      // If no API results, add relevant sites with search URLs
      if (results.availableProducts.length === 0) {
        const relevantSites = this.getRelevantSites(productName, currentDomain);
        results.availableProducts = relevantSites.map(site => ({
          site: site.name,
          icon: site.icon,
          url: site.searchUrl + encodeURIComponent(productName),
          domain: site.domain,
          searchMode: true
        }));
      }
      
    } catch (error) {
      console.error('Error fetching from PricesAPI:', error);
      // Return empty results, will fallback to search URLs
      return null;
    }

    return results;
  }

  async searchProductAcrossSites(productName, identifiers, currentPrice) {
    // This simulates API calls - in production, you'd use real price comparison APIs
    // For now, we'll use a smart filtering approach
    
    const currentDomain = window.location.hostname;
    const results = {
      currentSite: null,
      availableProducts: [],
      productName: productName,
      identifiers: identifiers
    };

    // Identify current site
    for (const site of this.supportedSites) {
      if (currentDomain.includes(site.domain)) {
        results.currentSite = {
          site: site.name,
          icon: site.icon,
          price: currentPrice,
          url: window.location.href,
          domain: site.domain
        };
        break;
      }
    }

    // For demonstration: Only show relevant sites based on product category
    // In production, this would be replaced with actual API calls
    const relevantSites = this.getRelevantSites(productName, currentDomain);
    
    results.availableProducts = relevantSites.map(site => ({
      site: site.name,
      icon: site.icon,
      url: site.searchUrl + encodeURIComponent(productName),
      domain: site.domain,
      searchMode: true // Indicates this is a search link, not direct product link
    }));

    return results;
  }

  getRelevantSites(productName, currentDomain) {
    // Smart filtering based on product type and current site
    const productLower = productName.toLowerCase();
    let relevantSites = [];

    // Electronics - show tech retailers
    if (productLower.match(/phone|laptop|computer|tablet|tv|camera|headphone|speaker|watch/i)) {
      relevantSites = this.supportedSites.filter(s => 
        ['Amazon', 'Amazon India', 'Flipkart', 'Best Buy', 'Croma', 'Reliance Digital', 'Walmart', 'Target'].includes(s.name)
      );
    }
    // Fashion - show fashion retailers
    else if (productLower.match(/shirt|dress|jeans|shoes|clothing|fashion|wear/i)) {
      relevantSites = this.supportedSites.filter(s => 
        ['Amazon', 'Amazon India', 'Flipkart', 'Myntra', 'Walmart', 'Target'].includes(s.name)
      );
    }
    // General products - show major marketplaces
    else {
      relevantSites = this.supportedSites.filter(s => 
        ['Amazon', 'Amazon India', 'Flipkart', 'Walmart', 'eBay', 'Snapdeal'].includes(s.name)
      );
    }

    // Remove current site from results
    return relevantSites.filter(s => !currentDomain.includes(s.domain));
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
