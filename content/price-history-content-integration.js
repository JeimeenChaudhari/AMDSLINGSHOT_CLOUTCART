/**
 * Price History Content Script Integration
 * Integrates price history engine into content script
 */

// Initialize price history integration
let priceHistoryIntegration = null;

/**
 * Initialize and activate price history feature
 */
async function initializePriceHistory() {
  try {
    // Create integration instance
    priceHistoryIntegration = new PriceHistoryIntegration();
    
    // Extract product information
    const productName = extractProductName();
    const currentPrice = extractCurrentPrice();
    
    if (!productName || !currentPrice) {
      console.log('[PriceHistory] Could not extract product info, skipping');
      return;
    }
    
    const productData = {
      title: productName,
      url: window.location.href
    };
    
    // Initialize tracking (saves snapshot if not already saved today)
    await priceHistoryIntegration.initialize(
      window.location.href,
      currentPrice,
      productData
    );
    
    console.log('[PriceHistory] ✅ Tracking initialized for:', productName.substring(0, 50));
    
    // Add price history button to page
    addPriceHistoryButton(currentPrice, productData);
    
    // Add price badge near price element
    await addPriceBadge(currentPrice, productData);
    
  } catch (error) {
    console.error('[PriceHistory] Initialization error:', error);
  }
}

/**
 * Add price history button to page
 */
function addPriceHistoryButton(currentPrice, productData) {
  // Find price element to insert button near
  const priceSelectors = [
    '.a-price',
    '.price',
    '[data-price]',
    '._30jeq3',
    '.pdp-price',
    '.prod-sp',
    '.actual-price',
    '.selling-price',
    '.product-price',
    '.pdpPrice',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price-whole'
  ];
  
  let priceElement = null;
  for (const selector of priceSelectors) {
    priceElement = document.querySelector(selector);
    if (priceElement) {
      console.log('[PriceHistory] Found price element with selector:', selector);
      break;
    }
  }
  
  if (priceElement && priceHistoryIntegration) {
    priceHistoryIntegration.addPriceHistoryButton(
      priceElement,
      window.location.href,
      currentPrice,
      productData
    );
    console.log('[PriceHistory] ✅ Button added to page');
  } else {
    console.log('[PriceHistory] Could not find price element for button placement');
  }
}

/**
 * Add price badge near price element
 */
async function addPriceBadge(currentPrice, productData) {
  if (!priceHistoryIntegration) return;
  
  try {
    const badge = await priceHistoryIntegration.createPriceBadge(
      window.location.href,
      currentPrice,
      productData
    );
    
    if (badge) {
      // Find price element to insert badge near
      const priceSelectors = [
        '.a-price',
        '.price',
        '[data-price]',
        '._30jeq3',
        '.pdp-price',
        '.prod-sp',
        '.actual-price',
        '.selling-price',
        '.product-price',
        '.pdpPrice'
      ];
      
      let priceElement = null;
      for (const selector of priceSelectors) {
        priceElement = document.querySelector(selector);
        if (priceElement) break;
      }
      
      if (priceElement && priceElement.parentElement) {
        priceElement.parentElement.insertBefore(badge, priceElement.nextSibling);
        console.log('[PriceHistory] ✅ Badge added to page');
      }
    }
  } catch (error) {
    console.error('[PriceHistory] Error adding badge:', error);
  }
}

/**
 * Legacy price history function (for backward compatibility)
 * This replaces the old activatePriceHistory function
 */
function activatePriceHistory() {
  console.log('[PriceHistory] Activating price history feature...');
  
  // Use new implementation
  initializePriceHistory();
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.initializePriceHistory = initializePriceHistory;
  window.activatePriceHistory = activatePriceHistory;
}
