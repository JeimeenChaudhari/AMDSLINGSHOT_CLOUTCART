// Feature Extractor
// Processes raw behavioral data into ML-ready feature vectors

class FeatureExtractor {
  constructor() {
    this.featureCount = 40;
  }

  /**
   * Extract features from raw behavioral data
   * @param {Object} rawData - Raw data from BehavioralDataCollector
   * @returns {Array} Feature vector of length 40
   */
  extract(rawData) {
    if (!rawData) return null;
    
    const features = [];
    
    // Keystroke features (10 features)
    features.push(...this.extractKeystrokeFeatures(rawData.keystrokes, rawData.sessionDuration));
    
    // Mouse features (12 features)
    features.push(...this.extractMouseFeatures(rawData.mouseMovements, rawData.clicks));
    
    // Scroll features (6 features)
    features.push(...this.extractScrollFeatures(rawData.scrolls));
    
    // Interaction features (8 features)
    features.push(...this.extractInteractionFeatures(rawData));
    
    // Temporal features (4 features)
    features.push(...this.extractTemporalFeatures());
    
    // Normalize features
    const normalized = this.normalizeFeatures(features);
    
    return normalized;
  }

  extractKeystrokeFeatures(keystrokes, sessionDuration) {
    if (keystrokes.length === 0) {
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    
    const keydowns = keystrokes.filter(k => k.type === 'keydown');
    const timeSpan = sessionDuration / 1000; // seconds
    
    // 1. Average typing speed (chars per second)
    const avgTypingSpeed = keydowns.length / Math.max(timeSpan, 1);
    
    // 2. Typing rhythm variance
    const intervals = [];
    for (let i = 1; i < keydowns.length; i++) {
      intervals.push(keydowns[i].timestamp - keydowns[i - 1].timestamp);
    }
    const typingRhythmVariance = this.variance(intervals) / 1000;
    
    // 3. Backspace ratio
    const backspaceCount = keydowns.filter(k => k.isBackspace).length;
    const backspaceRatio = backspaceCount / Math.max(keydowns.length, 1);
    
    // 4. Average key hold duration
    const holdDurations = keydowns.filter(k => k.holdDuration).map(k => k.holdDuration);
    const avgKeyHoldDuration = this.mean(holdDurations) || 0;
    
    // 5. Pause frequency (pauses > 2 seconds)
    const pauseCount = intervals.filter(i => i > 2000).length;
    const pauseFrequency = pauseCount / Math.max(timeSpan / 60, 1); // per minute
    
    // 6. Burst typing score (rapid sequences)
    const burstCount = intervals.filter(i => i < 100).length;
    const burstTypingScore = burstCount / Math.max(keydowns.length, 1);
    
    // 7. Modifier key usage
    const modifierCount = keydowns.filter(k => k.isModifier).length;
    const modifierRatio = modifierCount / Math.max(keydowns.length, 1);
    
    // 8. Average inter-key interval
    const avgInterKeyInterval = this.mean(intervals) || 0;
    
    // 9. Typing consistency (inverse of coefficient of variation)
    const typingConsistency = intervals.length > 0 
      ? 1 / (Math.sqrt(this.variance(intervals)) / this.mean(intervals) + 1)
      : 0;
    
    // 10. Error correction rate (backspaces per total keys)
    const errorCorrectionRate = backspaceCount / Math.max(keydowns.length + backspaceCount, 1);
    
    return [
      avgTypingSpeed,
      typingRhythmVariance,
      backspaceRatio,
      avgKeyHoldDuration / 1000, // normalize to seconds
      pauseFrequency,
      burstTypingScore,
      modifierRatio,
      avgInterKeyInterval / 1000,
      typingConsistency,
      errorCorrectionRate
    ];
  }

  extractMouseFeatures(movements, clicks) {
    if (movements.length === 0 && clicks.length === 0) {
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    
    // 1. Average mouse velocity (pixels per second)
    const velocities = [];
    for (let i = 1; i < movements.length; i++) {
      const dx = movements[i].x - movements[i - 1].x;
      const dy = movements[i].y - movements[i - 1].y;
      const dt = (movements[i].timestamp - movements[i - 1].timestamp) / 1000;
      const distance = Math.sqrt(dx * dx + dy * dy);
      velocities.push(distance / Math.max(dt, 0.001));
    }
    const avgMouseVelocity = this.mean(velocities) || 0;
    
    // 2. Mouse acceleration (change in velocity)
    const accelerations = [];
    for (let i = 1; i < velocities.length; i++) {
      accelerations.push(Math.abs(velocities[i] - velocities[i - 1]));
    }
    const mouseAcceleration = this.mean(accelerations) || 0;
    
    // 3. Trajectory jitter (smoothness)
    const angles = [];
    for (let i = 2; i < movements.length; i++) {
      const dx1 = movements[i - 1].x - movements[i - 2].x;
      const dy1 = movements[i - 1].y - movements[i - 2].y;
      const dx2 = movements[i].x - movements[i - 1].x;
      const dy2 = movements[i].y - movements[i - 1].y;
      const angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
      angles.push(Math.abs(angle));
    }
    const trajectoryJitter = this.mean(angles) || 0;
    
    // 4. Click frequency (clicks per minute)
    const timeSpan = movements.length > 0 
      ? (movements[movements.length - 1].timestamp - movements[0].timestamp) / 1000 / 60
      : 1;
    const clickFrequency = clicks.length / Math.max(timeSpan, 1);
    
    // 5. Average click duration
    const clickDurations = clicks.filter(c => c.duration).map(c => c.duration);
    const avgClickDuration = this.mean(clickDurations) || 0;
    
    // 6. Hover duration (time between movements)
    const hoverDurations = [];
    for (let i = 1; i < movements.length; i++) {
      hoverDurations.push(movements[i].timestamp - movements[i - 1].timestamp);
    }
    const avgHoverDuration = this.mean(hoverDurations) || 0;
    
    // 7. Movement direction changes
    let directionChanges = 0;
    for (let i = 2; i < movements.length; i++) {
      const dx1 = movements[i - 1].x - movements[i - 2].x;
      const dx2 = movements[i].x - movements[i - 1].x;
      const dy1 = movements[i - 1].y - movements[i - 2].y;
      const dy2 = movements[i].y - movements[i - 1].y;
      if ((dx1 * dx2 < 0) || (dy1 * dy2 < 0)) {
        directionChanges++;
      }
    }
    const movementDirectionChanges = directionChanges / Math.max(movements.length, 1);
    
    // 8. Movement coverage (area covered)
    const xCoords = movements.map(m => m.x);
    const yCoords = movements.map(m => m.y);
    const xRange = Math.max(...xCoords) - Math.min(...xCoords);
    const yRange = Math.max(...yCoords) - Math.min(...yCoords);
    const movementCoverage = (xRange * yRange) / (window.innerWidth * window.innerHeight);
    
    // 9. Click clustering (clicks in same area)
    let clusteredClicks = 0;
    for (let i = 1; i < clicks.length; i++) {
      const dx = clicks[i].x - clicks[i - 1].x;
      const dy = clicks[i].y - clicks[i - 1].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 50) clusteredClicks++;
    }
    const clickClustering = clusteredClicks / Math.max(clicks.length, 1);
    
    // 10. Movement smoothness (inverse of jitter)
    const movementSmoothness = 1 / (trajectoryJitter + 1);
    
    // 11. Velocity variance
    const velocityVariance = this.variance(velocities);
    
    // 12. Idle time ratio
    const longHovers = hoverDurations.filter(h => h > 1000).length;
    const idleTimeRatio = longHovers / Math.max(hoverDurations.length, 1);
    
    return [
      avgMouseVelocity / 1000, // normalize
      mouseAcceleration / 1000,
      trajectoryJitter,
      clickFrequency,
      avgClickDuration / 1000,
      avgHoverDuration / 1000,
      movementDirectionChanges,
      movementCoverage,
      clickClustering,
      movementSmoothness,
      velocityVariance / 1000000,
      idleTimeRatio
    ];
  }

  extractScrollFeatures(scrolls) {
    if (scrolls.length === 0) {
      return [0, 0, 0, 0, 0, 0];
    }
    
    // 1. Average scroll speed
    const scrollSpeeds = [];
    for (let i = 1; i < scrolls.length; i++) {
      const dy = Math.abs(scrolls[i].scrollY - scrolls[i - 1].scrollY);
      const dt = (scrolls[i].timestamp - scrolls[i - 1].timestamp) / 1000;
      scrollSpeeds.push(dy / Math.max(dt, 0.001));
    }
    const avgScrollSpeed = this.mean(scrollSpeeds) || 0;
    
    // 2. Scroll direction changes
    let directionChanges = 0;
    for (let i = 2; i < scrolls.length; i++) {
      const dy1 = scrolls[i - 1].scrollY - scrolls[i - 2].scrollY;
      const dy2 = scrolls[i].scrollY - scrolls[i - 1].scrollY;
      if (dy1 * dy2 < 0) directionChanges++;
    }
    const scrollDirectionChanges = directionChanges / Math.max(scrolls.length, 1);
    
    // 3. Scroll pause frequency
    const scrollIntervals = [];
    for (let i = 1; i < scrolls.length; i++) {
      scrollIntervals.push(scrolls[i].timestamp - scrolls[i - 1].timestamp);
    }
    const pauseCount = scrollIntervals.filter(i => i > 2000).length;
    const scrollPauseFrequency = pauseCount / Math.max(scrolls.length, 1);
    
    // 4. Scroll depth (how far down the page)
    const maxScroll = Math.max(...scrolls.map(s => s.scrollY));
    const scrollDepth = maxScroll / Math.max(document.body.scrollHeight, 1);
    
    // 5. Scroll consistency
    const scrollConsistency = scrollIntervals.length > 0
      ? 1 / (Math.sqrt(this.variance(scrollIntervals)) / this.mean(scrollIntervals) + 1)
      : 0;
    
    // 6. Rapid scroll ratio
    const rapidScrolls = scrollSpeeds.filter(s => s > 1000).length;
    const rapidScrollRatio = rapidScrolls / Math.max(scrollSpeeds.length, 1);
    
    return [
      avgScrollSpeed / 1000,
      scrollDirectionChanges,
      scrollPauseFrequency,
      scrollDepth,
      scrollConsistency,
      rapidScrollRatio
    ];
  }

  extractInteractionFeatures(rawData) {
    const sessionDuration = rawData.sessionDuration / 1000; // seconds
    const timeSinceLastActivity = rawData.timeSinceLastActivity / 1000;
    
    // 1. Time on page
    const timeOnPage = sessionDuration;
    
    // 2. Interaction density (actions per minute)
    const totalActions = rawData.keystrokes.length + rawData.mouseMovements.length + 
                        rawData.clicks.length + rawData.scrolls.length;
    const interactionDensity = totalActions / Math.max(sessionDuration / 60, 1);
    
    // 3. Focus change frequency
    const focusChanges = rawData.pageInteractions.filter(p => p.type === 'focus').length;
    const focusChangeFrequency = focusChanges / Math.max(sessionDuration / 60, 1);
    
    // 4. Session duration (normalized)
    const normalizedSessionDuration = Math.min(sessionDuration / 600, 1); // cap at 10 minutes
    
    // 5. Activity ratio (active time / total time)
    const activityRatio = Math.max(0, 1 - (timeSinceLastActivity / sessionDuration));
    
    // 6. Engagement score (combination of interactions)
    const engagementScore = Math.min(
      (rawData.clicks.length * 2 + rawData.keystrokes.length + rawData.scrolls.length) / 100,
      1
    );
    
    // 7. Idle periods
    const idlePeriods = timeSinceLastActivity > 5 ? 1 : 0;
    
    // 8. Multi-tasking indicator (focus changes)
    const multiTaskingIndicator = focusChanges / Math.max(sessionDuration / 60, 1);
    
    return [
      timeOnPage / 600, // normalize to 10 minutes
      interactionDensity / 100, // normalize
      focusChangeFrequency,
      normalizedSessionDuration,
      activityRatio,
      engagementScore,
      idlePeriods,
      multiTaskingIndicator
    ];
  }

  extractTemporalFeatures() {
    const now = new Date();
    
    // 1. Time of day (0-1, normalized)
    const timeOfDay = (now.getHours() * 60 + now.getMinutes()) / 1440;
    
    // 2. Day of week (0-1, normalized)
    const dayOfWeek = now.getDay() / 7;
    
    // 3. Is weekend (0 or 1)
    const isWeekend = (now.getDay() === 0 || now.getDay() === 6) ? 1 : 0;
    
    // 4. Is work hours (9am-5pm)
    const isWorkHours = (now.getHours() >= 9 && now.getHours() < 17) ? 1 : 0;
    
    return [timeOfDay, dayOfWeek, isWeekend, isWorkHours];
  }

  normalizeFeatures(features) {
    // Clip extreme values and ensure all features are in reasonable range
    return features.map(f => {
      if (isNaN(f) || !isFinite(f)) return 0;
      return Math.max(-10, Math.min(10, f)); // clip to [-10, 10]
    });
  }

  // Statistical helper functions
  mean(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  variance(arr) {
    if (!arr || arr.length === 0) return 0;
    const avg = this.mean(arr);
    return arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length;
  }

  getFeatureNames() {
    return [
      // Keystroke features (10)
      'avgTypingSpeed', 'typingRhythmVariance', 'backspaceRatio', 'avgKeyHoldDuration',
      'pauseFrequency', 'burstTypingScore', 'modifierRatio', 'avgInterKeyInterval',
      'typingConsistency', 'errorCorrectionRate',
      
      // Mouse features (12)
      'avgMouseVelocity', 'mouseAcceleration', 'trajectoryJitter', 'clickFrequency',
      'avgClickDuration', 'avgHoverDuration', 'movementDirectionChanges', 'movementCoverage',
      'clickClustering', 'movementSmoothness', 'velocityVariance', 'idleTimeRatio',
      
      // Scroll features (6)
      'avgScrollSpeed', 'scrollDirectionChanges', 'scrollPauseFrequency', 'scrollDepth',
      'scrollConsistency', 'rapidScrollRatio',
      
      // Interaction features (8)
      'timeOnPage', 'interactionDensity', 'focusChangeFrequency', 'normalizedSessionDuration',
      'activityRatio', 'engagementScore', 'idlePeriods', 'multiTaskingIndicator',
      
      // Temporal features (4)
      'timeOfDay', 'dayOfWeek', 'isWeekend', 'isWorkHours'
    ];
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FeatureExtractor;
}
