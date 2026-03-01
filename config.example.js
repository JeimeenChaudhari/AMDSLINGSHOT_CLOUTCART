/**
 * Configuration Template
 * Copy this file to config.js and add your API keys
 * config.js is gitignored for security
 */

const CONFIG = {
  // Apify API Configuration
  apify: {
    token: 'YOUR_APIFY_API_KEY_HERE',
    // Get your API key from: https://console.apify.com/account/integrations
  },
  
  // RapidAPI Configuration
  rapidapi: {
    key: 'YOUR_RAPIDAPI_KEY_HERE',
    host: 'real-time-product-search.p.rapidapi.com'
    // Get your API key from: https://rapidapi.com/
  }
};

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
