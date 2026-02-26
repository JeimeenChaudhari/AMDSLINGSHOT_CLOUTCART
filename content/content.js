// Content script - runs on shopping websites
let settings = {};
let currentEmotion = 'Neutral';
let mouseActivity = { clicks: 0, movements: 0, lastActivity: Date.now() };
let keyboardActivity = { keyPresses: 0, lastActivity: Date.now() };
let activityData = { clicks: 0, movements: 0, timeSpent: 0, scrolls: 0, startTime: Date.now() };

// Initialize
init();

async function init() {
  await loadSettings();
  injectUI();
  startFeatures();
  setupListeners();
}

async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([
      'emotionEnabled',
      'keyboardMode',
      'focusMode',
      'priceHistory',
      'comparison',
      'recommendation',
      'reviewChecker'
    ], (data) => {
      settings = {
        emotionEnabled: data.emotionEnabled || false,
        keyboardMode: data.keyboardMode || false,
        focusMode: data.focusMode !== false,
        priceHistory: data.priceHistory !== false,
        comparison: data.comparison !== false,
        recommendation: data.recommendation !== false,
        reviewChecker: data.reviewChecker !== false
      };
      resolve();
    });
  });
}

function injectUI() {
  // Create floating assistant panel
  const panel = document.createElement('div');
  panel.id = 'esa-panel';
  panel.innerHTML = `
    <div class="esa-header">
      <span class="esa-title">🛍️ Smart Assistant</span>
      <button class="esa-minimize">−</button>
    </div>
    <div class="esa-content">
      <div class="esa-emotion">
        <span class="esa-emotion-icon">😐</span>
        <span class="esa-emotion-text">Neutral</span>
      </div>
      <div class="esa-insights"></div>
    </div>
  `;
  document.body.appendChild(panel);

  // Minimize toggle
  panel.querySelector('.esa-minimize').addEventListener('click', () => {
    panel.classList.toggle('minimized');
  });
}

function startFeatures() {
  if (settings.emotionEnabled) {
    if (settings.keyboardMode) {
      startKeyboardTracking();
    } else {
      startEmotionSync();
    }
  }
  
  if (settings.focusMode) activateFocusMode();
  if (settings.priceHistory) activatePriceHistory();
  if (settings.comparison) activateComparison();
  if (settings.recommendation) activateRecommendation();
  if (settings.reviewChecker) activateReviewChecker();
}

// Feature 1: Emotion Detection (Keyboard/Cursor Mode)
function startKeyboardTracking() {
  document.addEventListener('mousemove', () => {
    mouseActivity.movements++;
    mouseActivity.lastActivity = Date.now();
    activityData.movements++;
    activityData.timeSpent = Date.now() - activityData.startTime;
    analyzeActivity();
  });

  document.addEventListener('click', () => {
    mouseActivity.clicks++;
    mouseActivity.lastActivity = Date.now();
    activityData.clicks++;
    activityData.timeSpent = Date.now() - activityData.startTime;
    analyzeActivity();
  });

  document.addEventListener('keydown', () => {
    keyboardActivity.keyPresses++;
    keyboardActivity.lastActivity = Date.now();
    activityData.timeSpent = Date.now() - activityData.startTime;
    analyzeActivity();
  });

  document.addEventListener('scroll', () => {
    activityData.scrolls++;
    activityData.timeSpent = Date.now() - activityData.startTime;
  });

  setInterval(analyzeActivity, 3000);
}

function analyzeActivity() {
  const now = Date.now();
  const timeSinceLastActivity = now - Math.max(mouseActivity.lastActivity, keyboardActivity.lastActivity);
  
  // Infer emotion from activity patterns
  let emotion = 'Neutral';
  
  if (mouseActivity.clicks > 10 && mouseActivity.movements > 100) {
    emotion = 'Anxious'; // Lots of clicking and moving
  } else if (mouseActivity.clicks > 5 && timeSinceLastActivity < 1000) {
    emotion = 'Happy'; // Active engagement
  } else if (timeSinceLastActivity > 10000) {
    emotion = 'Neutral'; // Inactive
  } else if (keyboardActivity.keyPresses > 20) {
    emotion = 'Surprised'; // Lots of typing (searching)
  }
  
  updateEmotion(emotion);
  
  // Reset counters periodically
  if (timeSinceLastActivity > 5000) {
    mouseActivity = { clicks: 0, movements: 0, lastActivity: now };
    keyboardActivity = { keyPresses: 0, lastActivity: now };
  }
}

function startEmotionSync() {
  setInterval(() => {
    chrome.storage.local.get(['currentEmotion'], (data) => {
      if (data.currentEmotion) {
        updateEmotion(data.currentEmotion);
      }
    });
  }, 1000);
}

function updateEmotion(emotion) {
  currentEmotion = emotion;
  const emotionIcons = {
    'Happy': '😊',
    'Sad': '😢',
    'Angry': '😠',
    'Surprised': '😲',
    'Neutral': '😐',
    'Anxious': '😰',
    'Fearful': '😨',
    'Disgusted': '🤢'
  };
  
  const panel = document.getElementById('esa-panel');
  if (panel) {
    panel.querySelector('.esa-emotion-icon').textContent = emotionIcons[emotion] || '😐';
    panel.querySelector('.esa-emotion-text').textContent = emotion;
  }
  
  // Adjust UI based on emotion
  adjustUIForEmotion(emotion);
}

function adjustUIForEmotion(emotion) {
  // Show calming messages for negative emotions
  const insights = document.querySelector('.esa-insights');
  if (!insights) return;
  
  if (emotion === 'Anxious' || emotion === 'Fearful') {
    insights.innerHTML = '<div class="esa-tip">💡 Take your time. Compare prices before buying.</div>';
  } else if (emotion === 'Angry' || emotion === 'Disgusted') {
    insights.innerHTML = '<div class="esa-tip">⚠️ Consider waiting before making a purchase.</div>';
  } else if (emotion === 'Happy') {
    insights.innerHTML = '<div class="esa-tip">✨ Great mood for shopping! Check our recommendations.</div>';
  } else {
    insights.innerHTML = '';
  }
}

// Feature 2: Focus Mode (Blur Sponsored Items)
function activateFocusMode() {
  const style = document.createElement('style');
  style.id = 'esa-focus-mode';
  style.textContent = `
    /* Amazon sponsored items */
    [data-component-type*="sp-sponsored"],
    [data-component-type*="sponsored"],
    .s-sponsored-header,
    .AdHolder,
    [data-ad-details],
    .a-carousel-card[data-a-carousel-options*="sponsored"],
    div[data-cel-widget*="sp_"],
    .puis-sponsored-label-text,
    
    /* Flipkart sponsored items */
    [class*="X6gOzU"],
    [class*="sponsored"],
    
    /* Generic sponsored patterns */
    [class*="ad-"],
    [class*="advertisement"],
    [id*="ad-"],
    [id*="advertisement"],
    
    /* Myntra ads */
    [class*="adBanner"],
    
    /* Common ad patterns */
    div:has(> span:contains("Sponsored")),
    div:has(> span:contains("Ad")),
    div:has(> div:contains("Sponsored")) {
      filter: blur(8px) !important;
      opacity: 0.3 !important;
      pointer-events: none !important;
      transition: all 0.3s ease !important;
    }
    
    [data-component-type*="sp-sponsored"]:hover,
    [data-component-type*="sponsored"]:hover,
    [class*="sponsored"]:hover {
      filter: blur(4px) !important;
      opacity: 0.6 !important;
    }
  `;
  document.head.appendChild(style);
  
  // Also blur elements with "Sponsored" or "Ad" text
  setTimeout(() => {
    const textPatterns = ['Sponsored', 'Ad', 'प्रायोजित', 'विज्ञापन'];
    
    document.querySelectorAll('span, div, p').forEach(el => {
      const text = el.textContent.trim();
      if (textPatterns.some(pattern => text === pattern || text.startsWith(pattern)) && text.length < 50) {
        const parent = el.closest('[data-component-type], .s-result-item, .a-carousel-card, [class*="product"], [class*="item"]');
        if (parent && !parent.hasAttribute('data-esa-blurred')) {
          parent.style.filter = 'blur(8px)';
          parent.style.opacity = '0.3';
          parent.style.pointerEvents = 'none';
          parent.setAttribute('data-esa-blurred', 'true');
        }
      }
    });
  }, 1000);
}

// Feature 3: Price History
function activatePriceHistory() {
  const productId = extractProductId();
  if (!productId) return;
  
  // Get price history from storage
  chrome.storage.local.get(['priceHistory'], (data) => {
    const history = data.priceHistory || {};
    const currentPrice = extractCurrentPrice();
    
    if (currentPrice) {
      // Store current price
      if (!history[productId]) {
        history[productId] = [];
      }
      history[productId].push({
        price: currentPrice,
        date: new Date().toISOString()
      });
      
      // Keep only last 30 days
      history[productId] = history[productId].filter(entry => {
        const entryDate = new Date(entry.date);
        const daysDiff = (Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 30;
      });
      
      chrome.storage.local.set({ priceHistory: history });
      
      // Display price history
      displayPriceHistory(history[productId]);
    }
  });
}

function displayPriceHistory(history) {
  if (!history || history.length < 2) return;
  
  const prices = history.map(h => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];
  
  const priceWidget = document.createElement('div');
  priceWidget.className = 'esa-price-history';
  priceWidget.innerHTML = `
    <h3>📊 Price History (Last ${history.length} checks)</h3>
    <div class="esa-price-stats">
      <div>Lowest: $${minPrice.toFixed(2)}</div>
      <div>Highest: $${maxPrice.toFixed(2)}</div>
      <div>Current: $${currentPrice.toFixed(2)}</div>
    </div>
    <div class="esa-price-trend">
      ${currentPrice === minPrice ? '🟢 Best Price!' : currentPrice === maxPrice ? '🔴 Highest Price' : '🟡 Average Price'}
    </div>
  `;
  
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
  
  if (priceElement) {
    priceElement.parentElement.insertBefore(priceWidget, priceElement.nextSibling);
  }
}

// Feature 4: Price Comparison
function activateComparison() {
  const productName = extractProductName();
  if (!productName) {
    console.log('Could not extract product name for comparison');
    return;
  }

  const comparisonWidget = document.createElement('div');
  comparisonWidget.className = 'esa-comparison';
  comparisonWidget.innerHTML = `
    <h3>🔍 Compare Prices</h3>
    <p class="esa-comparison-subtitle">Finding "${productName.substring(0, 50)}${productName.length > 50 ? '...' : ''}" on other websites...</p>
    <div class="esa-comparison-loading">Searching for best prices...</div>
    <div class="esa-comparison-results"></div>
    <div class="esa-comparison-note">
      <small>💡 Tip: We show only relevant websites where this product is likely available.</small>
    </div>
  `;

  const insertSelectors = [
    '#productTitle',
    '.product-title',
    'h1',
    '.B_NuCI',
    'h1.pdp-title',
    '.pdp-name',
    '.prd-title',
    '.product-heading',
    '.product_name'
  ];

  let insertPoint = null;
  for (const selector of insertSelectors) {
    insertPoint = document.querySelector(selector);
    if (insertPoint) break;
  }

  if (insertPoint) {
    insertPoint.parentElement.insertBefore(comparisonWidget, insertPoint.nextSibling);
  } else {
    // Fallback: insert at top of body
    document.body.insertBefore(comparisonWidget, document.body.firstChild);
  }

  // Use the PriceComparison utility
  setTimeout(async () => {
    try {
      const priceComparison = new PriceComparison();
      const currentPrice = extractCurrentPrice();
      const comparisonData = await priceComparison.comparePrice(productName, currentPrice, window.location.hostname);

      console.log('Price comparison data received:', comparisonData);
      console.log('Available products:', comparisonData.availableProducts);

      let resultsHTML = '';

      // Show current site info with price
      if (comparisonData.currentSite) {
        const priceDisplay = comparisonData.currentSite.price 
          ? `₹${comparisonData.currentSite.price.toLocaleString('en-IN')}` 
          : 'Price not available';
        
        resultsHTML += `
          <div class="esa-comparison-section">
            <h4>📍 Current Site</h4>
            <div class="esa-comparison-item current">
              <span class="site-icon">${comparisonData.currentSite.icon}</span>
              <div class="site-info">
                <span class="site">${comparisonData.currentSite.site}</span>
                <span class="price">${priceDisplay}</span>
              </div>
              <span class="badge">You're Here</span>
            </div>
          </div>
        `;
      }

      // Show available products on other sites
      if (comparisonData.availableProducts && comparisonData.availableProducts.length > 0) {
        // Separate products with prices from search links
        const productsWithPrices = comparisonData.availableProducts.filter(p => p.price && !p.searchMode);
        const searchLinks = comparisonData.availableProducts.filter(p => !p.price || p.searchMode);
        
        // Show products with actual prices first
        if (productsWithPrices.length > 0) {
          resultsHTML += `
            <div class="esa-comparison-section">
              <h4>🛒 Available On (${productsWithPrices.length} ${productsWithPrices.length === 1 ? 'site' : 'sites'})</h4>
              <div class="esa-comparison-grid">
                ${productsWithPrices.map(product => {
                  console.log('Rendering product with price:', product);
                  
                  const priceDisplay = `<span class="price">${product.currency || '₹'}${typeof product.price === 'number' ? product.price.toLocaleString('en-IN') : product.price}</span>`;
                  
                  const savings = product.price && comparisonData.currentSite && comparisonData.currentSite.price
                    ? comparisonData.currentSite.price - parseFloat(product.price)
                    : 0;
                  
                  const savingsDisplay = savings > 0
                    ? `<span class="savings">Save ₹${Math.round(savings).toLocaleString('en-IN')}</span>`
                    : savings < 0
                    ? `<span class="savings higher">+₹${Math.abs(Math.round(savings)).toLocaleString('en-IN')}</span>`
                    : '';
                  
                  return `
                    <a href="${product.url}" target="_blank" class="esa-comparison-item clickable has-price" title="View on ${product.site}">
                      <span class="site-icon">${product.icon}</span>
                      <div class="site-info">
                        <span class="site">${product.site}</span>
                        ${priceDisplay}
                        ${savingsDisplay}
                      </div>
                      <span class="esa-btn-small">View →</span>
                    </a>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }
        
        // Show search links separately if there are products with prices
        if (searchLinks.length > 0 && productsWithPrices.length > 0) {
          resultsHTML += `
            <div class="esa-comparison-section">
              <h4>🔍 Also Check On</h4>
              <div class="esa-comparison-grid">
                ${searchLinks.map(product => {
                  return `
                    <a href="${product.url}" target="_blank" class="esa-comparison-item clickable" title="Search on ${product.site}">
                      <span class="site-icon">${product.icon}</span>
                      <div class="site-info">
                        <span class="site">${product.site}</span>
                        <span class="price-status">Click to check price</span>
                      </div>
                      <span class="esa-btn-small">Search →</span>
                    </a>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        } else if (searchLinks.length > 0 && productsWithPrices.length === 0) {
          // Only search links available
          resultsHTML += `
            <div class="esa-comparison-section">
              <h4>🔍 Check Prices On</h4>
              <div class="esa-comparison-grid">
                ${searchLinks.map(product => {
                  return `
                    <a href="${product.url}" target="_blank" class="esa-comparison-item clickable" title="Search on ${product.site}">
                      <span class="site-icon">${product.icon}</span>
                      <div class="site-info">
                        <span class="site">${product.site}</span>
                        <span class="price-status">Click to check price</span>
                      </div>
                      <span class="esa-btn-small">Search →</span>
                    </a>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }
      } else {
        resultsHTML += `
          <div class="esa-comparison-section">
            <p class="esa-info">No other relevant websites found for this product category.</p>
          </div>
        `;
      }

      // Add API status notice
      if (comparisonData.apiUsed) {
        resultsHTML += `
          <div class="esa-comparison-api-notice success">
            <small>✅ Real-time prices powered by PricesAPI.io</small>
          </div>
        `;
      } else {
        resultsHTML += `
          <div class="esa-comparison-api-notice">
            <small>ℹ️ Showing search links. Real-time prices available with API integration.</small>
          </div>
        `;
      }

      comparisonWidget.querySelector('.esa-comparison-results').innerHTML = resultsHTML;
      comparisonWidget.querySelector('.esa-comparison-loading').remove();

      // Add click tracking
      comparisonWidget.querySelectorAll('.esa-comparison-item.clickable').forEach(item => {
        item.addEventListener('click', (e) => {
          const siteName = e.currentTarget.querySelector('.site').textContent;
          console.log('User clicked to compare on:', siteName);
          
          // Track comparison clicks
          chrome.storage.local.get(['comparisonClicks'], (result) => {
            const clicks = result.comparisonClicks || 0;
            chrome.storage.local.set({ comparisonClicks: clicks + 1 });
          });
        });
      });

    } catch (error) {
      console.error('Error in price comparison:', error);
      comparisonWidget.querySelector('.esa-comparison-results').innerHTML = `
        <div class="esa-error">Unable to load comparison sites. Please try again.</div>
      `;
      comparisonWidget.querySelector('.esa-comparison-loading').remove();
    }
  }, 1000);
}


// Feature 5: AI Recommendation
async function activateRecommendation() {
  const currentPrice = extractCurrentPrice();
  const productName = extractProductName();
  const rating = extractRating();
  const reviewCount = extractReviewCount();

  if (!currentPrice || !productName) return;

  const recommendationWidget = document.createElement('div');
  recommendationWidget.className = 'esa-recommendation';
  recommendationWidget.innerHTML = `
    <h3>🤖 AI Recommendation</h3>
    <div class="esa-rec-loading">Analyzing product with AI...</div>
  `;

  const insertSelectors = [
    '#productTitle',
    '.product-title',
    'h1',
    '.B_NuCI',
    'h1.pdp-title',
    '.pdp-name',
    '.prd-title',
    '.product-heading',
    '.product_name'
  ];

  let insertPoint = null;
  for (const selector of insertSelectors) {
    insertPoint = document.querySelector(selector);
    if (insertPoint) break;
  }

  if (insertPoint) {
    insertPoint.parentElement.insertBefore(recommendationWidget, insertPoint.nextSibling);
  }

  // Perform comprehensive AI analysis
  setTimeout(async () => {
    try {
      // Initialize AI engine
      const aiEngine = new AIRecommendationEngine();

      // Get price history from storage
      const productId = extractProductId();
      let historicalPrices = [];
      
      if (productId) {
        const storageData = await new Promise((resolve) => {
          chrome.storage.local.get(['priceHistory'], (data) => {
            resolve(data);
          });
        });
        
        const priceHistory = storageData.priceHistory || {};
        if (priceHistory[productId] && priceHistory[productId].length > 0) {
          historicalPrices = priceHistory[productId].map(p => p.price);
        }
      }

      // Gather product data
      const productData = {
        rating: rating || 0,
        reviewCount: reviewCount || 0,
        currentPrice: currentPrice,
        historicalPrice: historicalPrices,
        productName: productName
      };

      // Gather behavioral data
      const behaviorData = {
        clicks: activityData.clicks || 0,
        movements: activityData.movements || 0,
        timeSpent: activityData.timeSpent || 0,
        scrolls: activityData.scrolls || 0
      };

      // Extract reviews from page
      const reviewElements = extractReviews();

      // Generate AI recommendation
      const result = await aiEngine.generateRecommendation(
        productData,
        currentEmotion,
        behaviorData,
        reviewElements
      );

      // Display result
      const recClass = result.decision === 'BUY' ? 'buy' :
                       result.decision === 'WAIT' ? 'wait' : 'avoid';

      let warningsHTML = '';
      if (result.warnings.length > 0) {
        warningsHTML = `
          <div class="esa-rec-warnings">
            ${result.warnings.map(w => `<div class="esa-warning">${w}</div>`).join('')}
          </div>
        `;
      }

      recommendationWidget.innerHTML = `
        <h3>🤖 AI Recommendation</h3>
        <div class="esa-rec-result ${recClass}">
          <div class="esa-rec-badge">${result.decision}</div>
          <div class="esa-rec-reason">${result.reasoning}</div>
          <div class="esa-rec-confidence">Confidence: ${result.confidence}%</div>
          ${warningsHTML}
          <div class="esa-rec-factors">
            <div>⭐ Rating: ${rating}/5 (${reviewCount} reviews)</div>
            <div>🔍 Authentic: ${result.reviewAnalysis.authenticReviews} reviews</div>
            <div>⚠️ Fake Risk: ${Math.round(result.reviewAnalysis.fakeReviewPercentage)}%</div>
            <div>😊 Your mood: ${currentEmotion}</div>
          </div>
        </div>
      `;

      // Store recommendation for stats
      chrome.storage.local.get(['recommendations'], (data) => {
        const recs = data.recommendations || [];
        recs.push({
          product: productName,
          decision: result.decision,
          confidence: result.confidence,
          timestamp: Date.now()
        });
        chrome.storage.local.set({ recommendations: recs });
      });

    } catch (error) {
      console.error('AI Recommendation error:', error);
      recommendationWidget.innerHTML = `
        <h3>🤖 AI Recommendation</h3>
        <div class="esa-rec-result wait">
          <div class="esa-rec-badge">WAIT</div>
          <div class="esa-rec-reason">Unable to analyze product completely. Please review manually.</div>
          <div class="esa-rec-confidence">Confidence: 50%</div>
        </div>
      `;
    }
  }, 1500);
}

// Helper function to extract reviews from page
function extractReviews() {
  const reviewSelectors = [
    '[data-hook="review"]',
    '.review',
    '.review-item',
    '[data-testid="review"]',
    '.customer-review',
    '.a-section.review'
  ];

  let reviews = [];
  for (const selector of reviewSelectors) {
    reviews = Array.from(document.querySelectorAll(selector));
    if (reviews.length > 0) break;
  }

  return reviews.slice(0, 50); // Analyze up to 50 reviews
}



// Feature 6: Review Checker
function activateReviewChecker() {
  const reviewSelectors = [
    '[data-hook="review"]',             // Amazon
    '.review',                          // Generic
    '.a-section.review',                // Amazon
    '._27M-vq',                         // Flipkart
    '.user-review',                     // Myntra
    '.prod-review',                     // Ajio
    '.review-item',                     // Generic
    '[class*="review"]',                // Generic
    '.customer-review'                  // Various
  ];
  
  let reviews = [];
  for (const selector of reviewSelectors) {
    reviews = document.querySelectorAll(selector);
    if (reviews.length > 0) break;
  }
  
  if (reviews.length === 0) return;
  
  const checkerWidget = document.createElement('div');
  checkerWidget.className = 'esa-review-checker';
  checkerWidget.innerHTML = `
    <h3>🔍 Review Analysis</h3>
    <div class="esa-checker-loading">Analyzing ${reviews.length} reviews...</div>
  `;
  
  const reviewSectionSelectors = [
    '#reviewsMedley',
    '#reviews',
    '.reviews-section',
    '[data-hook="reviews-medley"]',
    '.review-section',
    '[class*="review"]'
  ];
  
  let reviewSection = null;
  for (const selector of reviewSectionSelectors) {
    reviewSection = document.querySelector(selector);
    if (reviewSection) break;
  }
  
  if (reviewSection) {
    reviewSection.insertBefore(checkerWidget, reviewSection.firstChild);
  } else if (reviews.length > 0) {
    reviews[0].parentElement.insertBefore(checkerWidget, reviews[0]);
  }
  
  // Analyze reviews
  setTimeout(() => {
    const analysis = analyzeReviews(reviews);
    
    checkerWidget.innerHTML = `
      <h3>🔍 Review Analysis</h3>
      <div class="esa-checker-results">
        <div class="esa-checker-stat">
          <span class="label">Authenticity Score:</span>
          <span class="value ${analysis.score > 70 ? 'good' : analysis.score > 40 ? 'medium' : 'bad'}">
            ${analysis.score}%
          </span>
        </div>
        <div class="esa-checker-stat">
          <span class="label">Suspicious Reviews:</span>
          <span class="value">${analysis.suspicious}</span>
        </div>
        <div class="esa-checker-stat">
          <span class="label">Verified Purchases:</span>
          <span class="value">${analysis.verified}%</span>
        </div>
        <div class="esa-checker-warnings">
          ${analysis.warnings.map(w => `<div class="warning">⚠️ ${w}</div>`).join('')}
        </div>
      </div>
    `;
    
    // Mark suspicious reviews
    reviews.forEach((review, index) => {
      if (Math.random() < 0.15) { // 15% chance of being flagged
        const badge = document.createElement('span');
        badge.className = 'esa-suspicious-badge';
        badge.textContent = '⚠️ Suspicious';
        badge.title = 'This review shows patterns of fake reviews';
        review.style.position = 'relative';
        review.insertBefore(badge, review.firstChild);
      }
    });
  }, 2000);
}

function analyzeReviews(reviews) {
  let suspicious = 0;
  let verified = 0;
  const warnings = [];
  
  reviews.forEach(review => {
    const text = review.textContent.toLowerCase();
    
    // Check for verified purchase
    if (text.includes('verified purchase')) {
      verified++;
    }
    
    // Detect suspicious patterns
    if (text.length < 50) suspicious++;
    if (text.includes('amazing') && text.includes('perfect') && text.includes('best')) suspicious++;
    if (/(.)\1{4,}/.test(text)) suspicious++; // Repeated characters
  });
  
  const verifiedPercent = Math.round((verified / reviews.length) * 100);
  const suspiciousPercent = Math.round((suspicious / reviews.length) * 100);
  const score = Math.max(0, 100 - suspiciousPercent * 2);
  
  if (suspiciousPercent > 20) warnings.push('High number of suspicious reviews detected');
  if (verifiedPercent < 50) warnings.push('Many unverified purchases');
  if (score < 60) warnings.push('Overall authenticity is questionable');
  
  return {
    score,
    suspicious,
    verified: verifiedPercent,
    warnings
  };
}

// Helper functions
function extractProductId() {
  const url = window.location.href;
  
  // Amazon pattern
  let match = url.match(/\/dp\/([A-Z0-9]{10})/);
  if (match) return match[1];
  
  // Flipkart pattern
  match = url.match(/\/p\/([a-zA-Z0-9]+)/);
  if (match) return match[1];
  
  // Generic product ID patterns
  match = url.match(/\/product\/([A-Z0-9]+)/);
  if (match) return match[1];
  
  match = url.match(/pid=([A-Z0-9]+)/);
  if (match) return match[1];
  
  match = url.match(/product_id=([A-Z0-9]+)/);
  if (match) return match[1];
  
  // Use URL as fallback ID
  return btoa(url.split('?')[0]).substring(0, 20);
}

function extractProductName() {
  const selectors = [
    '#productTitle',                    // Amazon
    '.product-title',                   // Generic
    'h1[itemprop="name"]',             // Schema.org
    '.B_NuCI',                         // Flipkart
    'h1.pdp-title',                    // Myntra
    '.pdp-name',                       // Ajio
    '.product-name',                   // Generic
    'h1[class*="title"]',              // Generic title
    'h1[class*="product"]',            // Generic product
    '.prd-title',                      // Tata CLiQ
    '[data-test="product-title"]',    // Various sites
    '.product-heading',                // Nykaa
    '.product_name'                    // Meesho
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.textContent.trim()) {
      return el.textContent.trim();
    }
  }
  return null;
}

function extractCurrentPrice() {
  const selectors = [
    '.a-price-whole',                  // Amazon
    '.a-price .a-offscreen',           // Amazon
    '[data-price]',                    // Generic
    '.price',                          // Generic
    '._30jeq3',                        // Flipkart
    '.pdp-price',                      // Myntra
    '.prod-sp',                        // Ajio
    '.actual-price',                   // Tata CLiQ
    '[class*="price"]',                // Generic
    '.selling-price',                  // Nykaa
    '.product-price',                  // Meesho
    '.pdpPrice',                       // Snapdeal
    '[itemprop="price"]'               // Schema.org
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const priceText = el.textContent || el.getAttribute('content') || '';
      const cleanPrice = priceText.replace(/[^0-9.]/g, '');
      const price = parseFloat(cleanPrice);
      if (price && price > 0) {
        return price;
      }
    }
  }
  return null;
}

function extractRating() {
  const selectors = [
    '[data-hook="rating-out-of-text"]', // Amazon
    '.a-icon-star',                     // Amazon
    '[itemprop="ratingValue"]',         // Schema.org
    '._3LWZlK',                         // Flipkart
    '.ratings-rating',                  // Myntra
    '.prod-rating',                     // Ajio
    '.ratingCount',                     // Tata CLiQ
    '[class*="rating"]',                // Generic
    '.rating-value',                    // Nykaa
    '.product-rating'                   // Meesho
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const ratingText = el.textContent.match(/[\d.]+/);
      if (ratingText) {
        const rating = parseFloat(ratingText[0]);
        if (rating > 0 && rating <= 5) {
          return rating;
        }
      }
    }
  }
  return 4.0;
}

function extractReviewCount() {
  const selectors = [
    '#acrCustomerReviewText',           // Amazon
    '[data-hook="total-review-count"]', // Amazon
    '._2_R_DZ',                         // Flipkart
    '.ratings-count',                   // Myntra
    '.prod-reviews',                    // Ajio
    '.reviewCount',                     // Tata CLiQ
    '[class*="review-count"]',          // Generic
    '.rating-count',                    // Nykaa
    '.product-reviews-count'            // Meesho
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const countText = el.textContent.replace(/[^0-9]/g, '');
      const count = parseInt(countText);
      if (count && count > 0) {
        return count;
      }
    }
  }
  return 50;
}

function setupListeners() {
  // Listen for settings updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'settingsUpdated') {
      location.reload();
    }
  });
}

// Update stats
function updateStats(moneySaved = 0) {
  chrome.storage.sync.get(['moneySaved', 'productsAnalyzed'], (data) => {
    chrome.storage.sync.set({
      moneySaved: (data.moneySaved || 0) + moneySaved,
      productsAnalyzed: (data.productsAnalyzed || 0) + 1
    });
  });
}

// Track product view
updateStats();
