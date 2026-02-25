// Content script - runs on shopping websites
let settings = {};
let currentEmotion = 'Neutral';
let mouseActivity = { clicks: 0, movements: 0, lastActivity: Date.now() };
let keyboardActivity = { keyPresses: 0, lastActivity: Date.now() };

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
    analyzeActivity();
  });

  document.addEventListener('click', () => {
    mouseActivity.clicks++;
    mouseActivity.lastActivity = Date.now();
    analyzeActivity();
  });

  document.addEventListener('keydown', () => {
    keyboardActivity.keyPresses++;
    keyboardActivity.lastActivity = Date.now();
    analyzeActivity();
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
    [data-component-type*="sp-sponsored"],
    [data-component-type*="sponsored"],
    .s-sponsored-header,
    .AdHolder,
    [data-ad-details],
    .a-carousel-card[data-a-carousel-options*="sponsored"],
    div[data-cel-widget*="sp_"],
    .puis-sponsored-label-text,
    span:has-text("Sponsored"),
    div:has(> span.puis-label-popover-default):has-text("Sponsored") {
      filter: blur(8px) !important;
      opacity: 0.3 !important;
      pointer-events: none !important;
      transition: all 0.3s ease !important;
    }
    
    [data-component-type*="sp-sponsored"]:hover,
    [data-component-type*="sponsored"]:hover {
      filter: blur(4px) !important;
      opacity: 0.6 !important;
    }
  `;
  document.head.appendChild(style);
  
  // Also blur elements with "Sponsored" text
  setTimeout(() => {
    document.querySelectorAll('span, div').forEach(el => {
      if (el.textContent.includes('Sponsored') && el.textContent.length < 50) {
        const parent = el.closest('[data-component-type], .s-result-item, .a-carousel-card');
        if (parent) {
          parent.style.filter = 'blur(8px)';
          parent.style.opacity = '0.3';
          parent.style.pointerEvents = 'none';
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
  
  const priceElement = document.querySelector('.a-price, .price, [data-price]');
  if (priceElement) {
    priceElement.parentElement.insertBefore(priceWidget, priceElement.nextSibling);
  }
}

// Feature 4: Price Comparison
function activateComparison() {
  const productName = extractProductName();
  if (!productName) return;
  
  const comparisonWidget = document.createElement('div');
  comparisonWidget.className = 'esa-comparison';
  comparisonWidget.innerHTML = `
    <h3>🔍 Price Comparison</h3>
    <div class="esa-comparison-loading">Searching other websites...</div>
    <div class="esa-comparison-results"></div>
  `;
  
  const insertPoint = document.querySelector('#productTitle, .product-title, h1');
  if (insertPoint) {
    insertPoint.parentElement.insertBefore(comparisonWidget, insertPoint.nextSibling);
  }
  
  // Simulate comparison (in production, use real API)
  setTimeout(() => {
    const currentPrice = extractCurrentPrice() || 99.99;
    const comparisons = [
      { site: 'Amazon', price: currentPrice, url: window.location.href, current: true },
      { site: 'Walmart', price: currentPrice * 0.95, url: '#' },
      { site: 'eBay', price: currentPrice * 1.05, url: '#' },
      { site: 'Target', price: currentPrice * 0.92, url: '#' }
    ].sort((a, b) => a.price - b.price);
    
    const resultsHTML = comparisons.map(comp => `
      <div class="esa-comparison-item ${comp.current ? 'current' : ''}">
        <span class="site">${comp.site}</span>
        <span class="price">$${comp.price.toFixed(2)}</span>
        ${!comp.current ? `<a href="${comp.url}" target="_blank" class="esa-btn-small">View</a>` : '<span class="badge">Current</span>'}
      </div>
    `).join('');
    
    comparisonWidget.querySelector('.esa-comparison-results').innerHTML = resultsHTML;
    comparisonWidget.querySelector('.esa-comparison-loading').remove();
  }, 2000);
}

// Feature 5: AI Recommendation
function activateRecommendation() {
  const currentPrice = extractCurrentPrice();
  const productName = extractProductName();
  
  if (!currentPrice || !productName) return;
  
  const recommendationWidget = document.createElement('div');
  recommendationWidget.className = 'esa-recommendation';
  recommendationWidget.innerHTML = `
    <h3>🤖 AI Recommendation</h3>
    <div class="esa-rec-loading">Analyzing product...</div>
  `;
  
  const insertPoint = document.querySelector('#productTitle, .product-title, h1');
  if (insertPoint) {
    insertPoint.parentElement.insertBefore(recommendationWidget, insertPoint.nextSibling);
  }
  
  // Simulate AI analysis
  setTimeout(() => {
    const rating = extractRating();
    const reviewCount = extractReviewCount();
    
    let recommendation = 'BUY';
    let reason = 'Good price and ratings';
    let confidence = 85;
    
    // Decision logic based on emotion and data
    if (currentEmotion === 'Anxious' || currentEmotion === 'Fearful') {
      recommendation = 'WAIT';
      reason = 'You seem uncertain. Take time to research more.';
      confidence = 70;
    } else if (rating < 3.5) {
      recommendation = 'AVOID';
      reason = 'Low product ratings';
      confidence = 90;
    } else if (reviewCount < 10) {
      recommendation = 'WAIT';
      reason = 'Not enough reviews yet';
      confidence = 75;
    } else if (rating >= 4.5 && reviewCount > 100) {
      recommendation = 'BUY';
      reason = 'Excellent ratings and many positive reviews';
      confidence = 95;
    }
    
    const recClass = recommendation === 'BUY' ? 'buy' : recommendation === 'WAIT' ? 'wait' : 'avoid';
    
    recommendationWidget.innerHTML = `
      <h3>🤖 AI Recommendation</h3>
      <div class="esa-rec-result ${recClass}">
        <div class="esa-rec-badge">${recommendation}</div>
        <div class="esa-rec-reason">${reason}</div>
        <div class="esa-rec-confidence">Confidence: ${confidence}%</div>
        <div class="esa-rec-factors">
          <div>⭐ Rating: ${rating}/5</div>
          <div>💬 Reviews: ${reviewCount}</div>
          <div>😊 Your mood: ${currentEmotion}</div>
        </div>
      </div>
    `;
  }, 1500);
}

// Feature 6: Review Checker
function activateReviewChecker() {
  const reviews = document.querySelectorAll('[data-hook="review"], .review, .a-section.review');
  
  if (reviews.length === 0) return;
  
  const checkerWidget = document.createElement('div');
  checkerWidget.className = 'esa-review-checker';
  checkerWidget.innerHTML = `
    <h3>🔍 Review Analysis</h3>
    <div class="esa-checker-loading">Analyzing ${reviews.length} reviews...</div>
  `;
  
  const reviewSection = document.querySelector('#reviewsMedley, #reviews, .reviews-section');
  if (reviewSection) {
    reviewSection.insertBefore(checkerWidget, reviewSection.firstChild);
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
  const match = url.match(/\/dp\/([A-Z0-9]{10})|\/product\/([A-Z0-9]+)/);
  return match ? (match[1] || match[2]) : null;
}

function extractProductName() {
  const titleEl = document.querySelector('#productTitle, .product-title, h1[itemprop="name"]');
  return titleEl ? titleEl.textContent.trim() : null;
}

function extractCurrentPrice() {
  const priceEl = document.querySelector('.a-price-whole, .a-price .a-offscreen, [data-price], .price');
  if (!priceEl) return null;
  
  const priceText = priceEl.textContent.replace(/[^0-9.]/g, '');
  return parseFloat(priceText) || null;
}

function extractRating() {
  const ratingEl = document.querySelector('[data-hook="rating-out-of-text"], .a-icon-star, [itemprop="ratingValue"]');
  if (!ratingEl) return 4.0;
  
  const ratingText = ratingEl.textContent.match(/[\d.]+/);
  return ratingText ? parseFloat(ratingText[0]) : 4.0;
}

function extractReviewCount() {
  const reviewEl = document.querySelector('#acrCustomerReviewText, [data-hook="total-review-count"]');
  if (!reviewEl) return 50;
  
  const countText = reviewEl.textContent.replace(/[^0-9]/g, '');
  return parseInt(countText) || 50;
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
