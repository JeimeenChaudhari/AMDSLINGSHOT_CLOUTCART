// Search URL Generator
// Generates search URLs for different ecommerce sites

class SearchURLGenerator {
  constructor() {
    this.siteConfigs = {
      flipkart: {
        baseUrl: 'https://www.flipkart.com/search',
        queryParam: 'q',
        additionalParams: {}
      },
      ebay: {
        baseUrl: 'https://www.ebay.com/sch/i.html',
        queryParam: '_nkw',
        additionalParams: {
          '_sop': '12' // Sort by price + shipping: lowest first
        }
      },
      walmart: {
        baseUrl: 'https://www.walmart.com/search',
        queryParam: 'q',
        additionalParams: {}
      },
      target: {
        baseUrl: 'https://www.target.com/s',
        queryParam: 'searchTerm',
        additionalParams: {}
      },
      meesho: {
        baseUrl: 'https://www.meesho.com/search',
        queryParam: 'q',
        additionalParams: {}
      },
      snapdeal: {
        baseUrl: 'https://www.snapdeal.com/search',
        queryParam: 'keyword',
        additionalParams: {}
      }
    };
  }

  // Generate search URL for a specific site
  generateURL(site, searchQuery) {
    const config = this.siteConfigs[site.toLowerCase()];
    
    if (!config) {
      console.warn(`No URL config for site: ${site}`);
      return null;
    }

    const url = new URL(config.baseUrl);
    
    // Add search query
    url.searchParams.set(config.queryParam, searchQuery);

    // Add additional parameters
    for (const [key, value] of Object.entries(config.additionalParams)) {
      url.searchParams.set(key, value);
    }

    return url.toString();
  }

  // Generate URLs for all supported sites
  generateAllURLs(searchQuery) {
    const urls = {};

    for (const site of Object.keys(this.siteConfigs)) {
      urls[site] = this.generateURL(site, searchQuery);
    }

    return urls;
  }

  // Generate URLs for specific sites only
  generateURLsForSites(searchQuery, sites) {
    const urls = {};

    for (const site of sites) {
      const url = this.generateURL(site, searchQuery);
      if (url) {
        urls[site] = url;
      }
    }

    return urls;
  }

  // Get list of supported sites
  getSupportedSites() {
    return Object.keys(this.siteConfigs);
  }

  // Add custom site configuration
  addSiteConfig(siteName, config) {
    this.siteConfigs[siteName.toLowerCase()] = config;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchURLGenerator;
}
