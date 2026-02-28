// Price comparison utilities
class PriceComparison {
  constructor() {
    // API configuration for RapidAPI
    this.apiConfig = {
      endpoint: 'https://real-time-product-search.p.rapidapi.com',
      apiKey: '6915393b67msh53d3dc15a192ddep1fbc58jsnbeeed16e35f8',
      apiHost: 'real-time-product-search.p.rapidapi.com',
      enabled: true,
      timeout: 15000 // 15 second timeout for real-time scraping
    };
    
    // Site icons mapping for known retailers
    this.siteIcons = {
      'amazon': '🛒',
      'flipkart': '🛍️',
      'walmart': '🏪',
      'ebay': '🔨',
      'target': '🎯',
      'bestbuy': '💻',
      'myntra': '👗',
      'snapdeal': '🛍️',
      'croma': '📱',
      'reliance': '🔌',
      'tata': '🏬',
      'ajio': '👔',
      'nykaa': '💄',
      'meesho': '🛒',
      'default': '🛒'
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
    
    // Always use API - no fallback to predefined sites
    if (this.apiConfig.enabled && this.apiConfig.apiKey) {
      const apiResults = await this.searchProductWithAPI(productName, identifiers, currentPrice);
      
      // If API returns null, return empty results structure
      if (!apiResults) {
        return {
          currentSite: this.getCurrentSiteInfo(currentPrice),
          availableProducts: [],
          productName: productName,
          identifiers: identifiers,
          apiUsed: false,
          error: 'API request failed'
        };
      }
      
      return apiResults;
    }
    
    // If API is disabled, return empty results
    return {
      currentSite: this.getCurrentSiteInfo(currentPrice),
      availableProducts: [],
      productName: productName,
      identifiers: identifiers,
      apiUsed: false,
      error: 'API is disabled'
    };
  }
  
  getCurrentSiteInfo(currentPrice) {
    const currentDomain = window.location.hostname;
    const siteName = this.extractSiteName(currentDomain);
    const icon = this.getSiteIcon(currentDomain);
    
    return {
      site: siteName,
      icon: icon,
      price: currentPrice,
      url: window.location.href,
      domain: currentDomain
    };
  }
  
  extractSiteName(domain) {
    // Extract readable site name from domain
    const domainParts = domain.replace('www.', '').split('.');
    const mainDomain = domainParts[0];
    return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
  }
  
  getSiteIcon(domain) {
    // Get icon based on domain
    for (const [key, icon] of Object.entries(this.siteIcons)) {
      if (domain.includes(key)) {
        return icon;
      }
    }
    return this.siteIcons.default;
  }

  async searchProductWithAPI(productName, identifiers, currentPrice) {
    const currentDomain = window.location.hostname;
    const results = {
      currentSite: this.getCurrentSiteInfo(currentPrice),
      availableProducts: [],
      productName: productName,
      identifiers: identifiers,
      apiUsed: true
    };

    try {
      // Step 1: Try multiple search variations to find the product
      const searchVariations = this.generateSearchVariations(productName);
      console.log('PricesAPI: Trying search variations:', searchVariations);
      
      let allProducts = [];
      
      // Try each search variation
      for (const searchTerm of searchVariations) {
        console.log('PricesAPI: Searching for:', searchTerm);
        
        const searchResponse = await Promise.race([
          new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
              action: 'pricesApiSearch',
              productName: searchTerm,
              country: 'in',
              limit: 50,
              apiKey: this.apiConfig.apiKey,
              apiHost: this.apiConfig.apiHost
            }, response => {
              if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
              } else if (response && response.success) {
                resolve(response.data);
              } else {
                reject(new Error(response?.error || 'Search failed'));
              }
            });
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), this.apiConfig.timeout)
          )
        ]).catch(err => {
          console.warn('PricesAPI: Search error for', searchTerm, ':', err.message);
          return null;
        });
        
        if (searchResponse && searchResponse.data && searchResponse.data.length > 0) {
          console.log('PricesAPI: Found', searchResponse.data.length, 'products for:', searchTerm);
          allProducts = allProducts.concat(searchResponse.data);
          
          // If we found enough products, stop searching
          if (allProducts.length >= 20) {
            break;
          }
        }
      }
      
      // Remove duplicates based on product ID
      const uniqueProducts = Array.from(new Map(allProducts.map(p => [p.product_id, p])).values());
      console.log('PricesAPI: Total unique products found:', uniqueProducts.length);
      
      if (uniqueProducts.length === 0) {
        console.log('PricesAPI: No products found in search results');
        return results;
      }
      
      // Step 2: Get offers for ALL matching products
      const seenRetailers = new Set();
      const productsToCheck = uniqueProducts.slice(0, 10); // Check top 10 matches
      
      for (const product of productsToCheck) {
        const productId = product.product_id;
        console.log('PricesAPI: Fetching offers for product:', product.product_title);
        
        try {
          const offersResponse = await Promise.race([
            new Promise((resolve, reject) => {
              chrome.runtime.sendMessage({
                action: 'pricesApiOffers',
                productId: productId,
                country: 'in',
                apiKey: this.apiConfig.apiKey,
                apiHost: this.apiConfig.apiHost
              }, response => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else if (response && response.success) {
                  resolve(response.data);
                } else {
                  reject(new Error(response?.error || 'Offers fetch failed'));
                }
              });
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('API timeout')), this.apiConfig.timeout)
            )
          ]);
          
          console.log('PricesAPI: Offers response for', product.product_title, ':', offersResponse);
          
          // Step 3: Process offers from different retailers
          if (offersResponse && offersResponse.data && offersResponse.data.offers && offersResponse.data.offers.length > 0) {
            console.log('PricesAPI: Found', offersResponse.data.offers.length, 'offers for this product');
            
            for (const offer of offersResponse.data.offers) {
              const retailerName = offer.store_name || 'Unknown Retailer';
              const offerUrl = offer.offer_page_url;
              const priceStr = offer.price || '';
              const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
              const currency = '₹';
              const availability = offer.store_rating ? `Rating: ${offer.store_rating}` : 'Check Availability';
              
              if (!offerUrl || !price) {
                continue;
              }
              
              // Extract domain from URL
              let urlDomain = '';
              try {
                urlDomain = new URL(offerUrl).hostname.replace('www.', '');
              } catch (e) {
                console.error('Invalid offer URL:', offerUrl);
                continue;
              }
              
              // Skip if it's the current site
              if (currentDomain.includes(urlDomain) || urlDomain.includes(currentDomain.replace('www.', ''))) {
                continue;
              }
              
              // Skip if we already have this retailer (avoid duplicates)
              if (seenRetailers.has(urlDomain)) {
                continue;
              }
              
              seenRetailers.add(urlDomain);
              
              // Get site name and icon
              const siteName = this.extractSiteName(urlDomain);
              const siteIcon = this.getSiteIcon(urlDomain);
              
              // Add offer to results
              results.availableProducts.push({
                site: siteName,
                icon: siteIcon,
                url: offerUrl,
                domain: urlDomain,
                price: price,
                currency: currency,
                availability: availability,
                searchMode: false,
                retailerName: retailerName,
                productTitle: product.product_title
              });
              
              console.log('Added offer:', siteName, price, currency);
            }
          }
        } catch (err) {
          console.warn('PricesAPI: Error fetching offers for product', productId, ':', err.message);
          // Continue with next product
        }
      }
      
      console.log('PricesAPI: Total unique retailers found:', results.availableProducts.length);
      
      // If no offers found, add fallback search links
      if (results.availableProducts.length === 0) {
        console.log('PricesAPI: No offers found, adding fallback search links');
        const fallbackLinks = this.generateFallbackSearchLinks(productName);
        results.availableProducts = fallbackLinks;
        results.fallbackMode = true;
      }
      
      // Sort by price (lowest first)
      if (results.availableProducts.length > 0 && !results.fallbackMode) {
        results.availableProducts.sort((a, b) => a.price - b.price);
        console.log('PricesAPI: Successfully found', results.availableProducts.length, 'offers with prices');
      } else if (results.fallbackMode) {
        console.log('PricesAPI: Using fallback search links for', results.availableProducts.length, 'retailers');
      } else {
        console.log('PricesAPI: No products with prices found');
      }
      
    } catch (error) {
      console.warn('PricesAPI error:', error.message);
      results.error = error.message;
      return results;
    }

    return results;
  }

  // Generate multiple search variations to improve product matching
  generateSearchVariations(productName) {
    const variations = [productName]; // Original search term
    
    // Remove common words that might limit results
    const wordsToRemove = ['\\(', '\\)', '-', 'GB', 'TB', 'MB', 'Blue', 'Black', 'White', 'Red', 'Green', 'Gold', 'Silver'];
    let simplified = productName;
    
    wordsToRemove.forEach(word => {
      // Escape special regex characters
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      simplified = simplified.replace(new RegExp(escapedWord, 'gi'), ' ');
    });
    simplified = simplified.replace(/\s+/g, ' ').trim();
    
    if (simplified !== productName && simplified.length > 3) {
      variations.push(simplified);
    }
    
    // Extract brand and model (first 2-3 words)
    const words = productName.split(' ');
    if (words.length >= 3) {
      const brandModel = words.slice(0, 3).join(' ');
      if (!variations.includes(brandModel)) {
        variations.push(brandModel);
      }
    }
    
    // Try just brand and first word of model
    if (words.length >= 2) {
      const shortVersion = words.slice(0, 2).join(' ');
      if (!variations.includes(shortVersion)) {
        variations.push(shortVersion);
      }
    }
    
    return variations.slice(0, 3); // Return max 3 variations
  }

  // Helper method to process search results when offers are not available
  processSearchResults(searchData, currentDomain, results) {
    // No fallback - if offers API fails, return empty results
    console.log('PricesAPI: Offers API failed, no fallback available');
    return results;
  }

  // Generate direct search links for major Indian retailers as fallback
  generateFallbackSearchLinks(productName) {
    const encodedName = encodeURIComponent(productName);
    const fallbackRetailers = [
      {
        name: 'Flipkart',
        domain: 'flipkart.com',
        icon: '🛍️',
        searchUrl: `https://www.flipkart.com/search?q=${encodedName}`
      },
      {
        name: 'Snapdeal',
        domain: 'snapdeal.com',
        icon: '🛍️',
        searchUrl: `https://www.snapdeal.com/search?keyword=${encodedName}`
      },
      {
        name: 'Croma',
        domain: 'croma.com',
        icon: '📱',
        searchUrl: `https://www.croma.com/search?q=${encodedName}`
      },
      {
        name: 'Reliance Digital',
        domain: 'reliancedigital.in',
        icon: '🔌',
        searchUrl: `https://www.reliancedigital.in/search?q=${encodedName}`
      },
      {
        name: 'Tata CLiQ',
        domain: 'tatacliq.com',
        icon: '🏬',
        searchUrl: `https://www.tatacliq.com/search/?searchText=${encodedName}`
      }
    ];

    const currentDomain = window.location.hostname;
    
    return fallbackRetailers.filter(retailer => 
      !currentDomain.includes(retailer.domain)
    ).map(retailer => ({
      site: retailer.name,
      icon: retailer.icon,
      url: retailer.searchUrl,
      domain: retailer.domain,
      price: null,
      currency: '₹',
      availability: 'Search on site',
      searchMode: true,
      retailerName: retailer.name,
      productTitle: productName
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
