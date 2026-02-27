// Behavioral Data Collector
// Collects real-time keyboard, mouse, and scroll behavioral data

class BehavioralDataCollector {
  constructor() {
    this.isCollecting = false;
    this.buffer = {
      keystrokes: [],
      mouseMovements: [],
      clicks: [],
      scrolls: [],
      pageInteractions: []
    };
    
    this.sessionStart = Date.now();
    this.lastActivity = Date.now();
    
    // Feature aggregation window (5 seconds)
    this.windowSize = 5000;
    this.lastFeatureExtraction = Date.now();
    
    // Callbacks
    this.onFeaturesReady = null;
  }

  start(onFeaturesCallback) {
    if (this.isCollecting) return;
    
    this.isCollecting = true;
    this.onFeaturesReady = onFeaturesCallback;
    this.sessionStart = Date.now();
    
    this.attachListeners();
    this.startFeatureExtractionLoop();
    
    console.log('[BehavioralCollector] Started collecting behavioral data');
  }

  stop() {
    this.isCollecting = false;
    this.detachListeners();
    console.log('[BehavioralCollector] Stopped collecting');
  }

  attachListeners() {
    // Keyboard events
    this.keydownHandler = this.handleKeydown.bind(this);
    this.keyupHandler = this.handleKeyup.bind(this);
    
    // Mouse events
    this.mousemoveHandler = this.handleMousemove.bind(this);
    this.clickHandler = this.handleClick.bind(this);
    this.mousedownHandler = this.handleMousedown.bind(this);
    this.mouseupHandler = this.handleMouseup.bind(this);
    
    // Scroll events
    this.scrollHandler = this.handleScroll.bind(this);
    
    // Page interaction events
    this.focusHandler = this.handleFocus.bind(this);
    this.blurHandler = this.handleBlur.bind(this);
    
    document.addEventListener('keydown', this.keydownHandler, true);
    document.addEventListener('keyup', this.keyupHandler, true);
    document.addEventListener('mousemove', this.mousemoveHandler, true);
    document.addEventListener('click', this.clickHandler, true);
    document.addEventListener('mousedown', this.mousedownHandler, true);
    document.addEventListener('mouseup', this.mouseupHandler, true);
    document.addEventListener('scroll', this.scrollHandler, true);
    document.addEventListener('focus', this.focusHandler, true);
    document.addEventListener('blur', this.blurHandler, true);
  }

  detachListeners() {
    document.removeEventListener('keydown', this.keydownHandler, true);
    document.removeEventListener('keyup', this.keyupHandler, true);
    document.removeEventListener('mousemove', this.mousemoveHandler, true);
    document.removeEventListener('click', this.clickHandler, true);
    document.removeEventListener('mousedown', this.mousedownHandler, true);
    document.removeEventListener('mouseup', this.mouseupHandler, true);
    document.removeEventListener('scroll', this.scrollHandler, true);
    document.removeEventListener('focus', this.focusHandler, true);
    document.removeEventListener('blur', this.blurHandler, true);
  }

  handleKeydown(e) {
    const now = Date.now();
    this.lastActivity = now;
    
    this.buffer.keystrokes.push({
      type: 'keydown',
      key: e.key,
      code: e.code,
      timestamp: now,
      isBackspace: e.key === 'Backspace',
      isModifier: e.ctrlKey || e.altKey || e.shiftKey || e.metaKey
    });
    
    this.trimBuffer();
  }

  handleKeyup(e) {
    const now = Date.now();
    
    // Find matching keydown to calculate hold duration
    const keydownIndex = this.buffer.keystrokes.findIndex(
      k => k.type === 'keydown' && k.code === e.code && !k.holdDuration
    );
    
    if (keydownIndex !== -1) {
      this.buffer.keystrokes[keydownIndex].holdDuration = now - this.buffer.keystrokes[keydownIndex].timestamp;
    }
  }

  handleMousemove(e) {
    const now = Date.now();
    this.lastActivity = now;
    
    this.buffer.mouseMovements.push({
      x: e.clientX,
      y: e.clientY,
      timestamp: now
    });
    
    this.trimBuffer();
  }

  handleClick(e) {
    const now = Date.now();
    this.lastActivity = now;
    
    this.buffer.clicks.push({
      x: e.clientX,
      y: e.clientY,
      button: e.button,
      timestamp: now
    });
    
    this.trimBuffer();
  }

  handleMousedown(e) {
    const now = Date.now();
    this.buffer.clicks.push({
      type: 'mousedown',
      timestamp: now
    });
  }

  handleMouseup(e) {
    const now = Date.now();
    
    // Find matching mousedown to calculate click duration
    const mousedownIndex = this.buffer.clicks.findIndex(
      c => c.type === 'mousedown' && !c.duration
    );
    
    if (mousedownIndex !== -1) {
      this.buffer.clicks[mousedownIndex].duration = now - this.buffer.clicks[mousedownIndex].timestamp;
    }
  }

  handleScroll(e) {
    const now = Date.now();
    this.lastActivity = now;
    
    this.buffer.scrolls.push({
      scrollY: window.scrollY,
      scrollX: window.scrollX,
      timestamp: now
    });
    
    this.trimBuffer();
  }

  handleFocus(e) {
    const now = Date.now();
    this.buffer.pageInteractions.push({
      type: 'focus',
      element: e.target.tagName,
      timestamp: now
    });
    
    this.trimBuffer();
  }

  handleBlur(e) {
    const now = Date.now();
    this.buffer.pageInteractions.push({
      type: 'blur',
      element: e.target.tagName,
      timestamp: now
    });
    
    this.trimBuffer();
  }

  trimBuffer() {
    const now = Date.now();
    const cutoff = now - this.windowSize * 2; // Keep 2x window size for overlap
    
    this.buffer.keystrokes = this.buffer.keystrokes.filter(k => k.timestamp > cutoff);
    this.buffer.mouseMovements = this.buffer.mouseMovements.filter(m => m.timestamp > cutoff);
    this.buffer.clicks = this.buffer.clicks.filter(c => c.timestamp > cutoff);
    this.buffer.scrolls = this.buffer.scrolls.filter(s => s.timestamp > cutoff);
    this.buffer.pageInteractions = this.buffer.pageInteractions.filter(p => p.timestamp > cutoff);
  }

  startFeatureExtractionLoop() {
    if (!this.isCollecting) return;
    
    const now = Date.now();
    
    // Extract features every windowSize milliseconds
    if (now - this.lastFeatureExtraction >= this.windowSize) {
      this.extractAndNotify();
      this.lastFeatureExtraction = now;
    }
    
    // Schedule next extraction
    setTimeout(() => this.startFeatureExtractionLoop(), 1000);
  }

  extractAndNotify() {
    const features = this.extractCurrentFeatures();
    
    if (this.onFeaturesReady && features) {
      this.onFeaturesReady(features);
    }
  }

  extractCurrentFeatures() {
    const now = Date.now();
    const windowStart = now - this.windowSize;
    
    // Filter data within current window
    const recentKeystrokes = this.buffer.keystrokes.filter(k => k.timestamp > windowStart);
    const recentMouse = this.buffer.mouseMovements.filter(m => m.timestamp > windowStart);
    const recentClicks = this.buffer.clicks.filter(c => c.timestamp > windowStart);
    const recentScrolls = this.buffer.scrolls.filter(s => s.timestamp > windowStart);
    const recentInteractions = this.buffer.pageInteractions.filter(p => p.timestamp > windowStart);
    
    // Not enough data yet
    if (recentKeystrokes.length === 0 && recentMouse.length === 0 && recentClicks.length === 0) {
      return null;
    }
    
    return {
      keystrokes: recentKeystrokes,
      mouseMovements: recentMouse,
      clicks: recentClicks,
      scrolls: recentScrolls,
      pageInteractions: recentInteractions,
      sessionDuration: now - this.sessionStart,
      timeSinceLastActivity: now - this.lastActivity,
      timestamp: now
    };
  }

  getBuffer() {
    return { ...this.buffer };
  }

  clearBuffer() {
    this.buffer = {
      keystrokes: [],
      mouseMovements: [],
      clicks: [],
      scrolls: [],
      pageInteractions: []
    };
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BehavioralDataCollector;
}
