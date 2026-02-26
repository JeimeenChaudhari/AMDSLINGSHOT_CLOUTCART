// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Emotion-Adaptive Shopping Assistant installed');
  
  // Set default settings
  chrome.storage.sync.set({
    emotionEnabled: false,
    keyboardMode: false,
    focusMode: true,
    priceHistory: true,
    comparison: true,
    recommendation: true,
    reviewChecker: true,
    moneySaved: 0,
    productsAnalyzed: 0
  });
});

// Listen for tab updates to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const shoppingSites = [
      'amazon.com',
      'amazon.in',
      'flipkart.com',
      'ebay.com',
      'walmart.com',
      'target.com'
    ];
    
    const isShoppingSite = shoppingSites.some(site => tab.url.includes(site));
    
    if (isShoppingSite) {
      // Check if extension context is still valid before sending message
      try {
        chrome.tabs.sendMessage(tabId, { action: 'pageLoaded' }).catch((err) => {
          // Silently ignore - content script not ready or extension reloaded
          if (err.message && !err.message.includes('Extension context invalidated')) {
            console.log('Message send failed:', err.message);
          }
        });
      } catch (err) {
        // Extension context invalidated - ignore silently
      }
    }
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateStats') {
    chrome.storage.sync.get(['moneySaved', 'productsAnalyzed'], (data) => {
      chrome.storage.sync.set({
        moneySaved: (data.moneySaved || 0) + (message.moneySaved || 0),
        productsAnalyzed: (data.productsAnalyzed || 0) + 1
      });
    });
  }
  
  if (message.action === 'getPriceComparison') {
    // In production, call real price comparison API
    // For now, return mock data
    sendResponse({
      success: true,
      comparisons: [
        { site: 'Amazon', price: message.currentPrice, current: true },
        { site: 'Walmart', price: message.currentPrice * 0.95 },
        { site: 'eBay', price: message.currentPrice * 1.05 },
        { site: 'Target', price: message.currentPrice * 0.92 }
      ]
    });
  }
  
  return true;
});

// Periodic cleanup of old price history
chrome.alarms.create('cleanupPriceHistory', { periodInMinutes: 1440 }); // Daily

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupPriceHistory') {
    chrome.storage.local.get(['priceHistory'], (data) => {
      const history = data.priceHistory || {};
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      Object.keys(history).forEach(productId => {
        history[productId] = history[productId].filter(entry => {
          return new Date(entry.date).getTime() > thirtyDaysAgo;
        });
        
        if (history[productId].length === 0) {
          delete history[productId];
        }
      });
      
      chrome.storage.local.set({ priceHistory: history });
    });
  }
});
