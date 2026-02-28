/**
 * Behavioral Test Data Generator
 * Generates synthetic behavioral data for emotion detection testing
 */

class BehavioralTestDataGenerator {
  constructor() {
    this.emotions = ['happy', 'sad', 'angry', 'anxious', 'neutral', 'surprised', 'fearful', 'disgusted'];
  }
  
  // ============================================================================
  // KEYSTROKE DATA GENERATION
  // ============================================================================
  
  generateKeystrokeSequence(count, options = {}) {
    const keystrokes = [];
    const speed = options.speed || 'normal';
    const emotion = options.emotion || 'neutral';
    
    const baseInterval = this.getTypingInterval(speed, emotion);
    let timestamp = Date.now();
    
    const keys = 'abcdefghijklmnopqrstuvwxyz '.split('');
    
    for (let i = 0; i < count; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const duration = this.getKeyDuration(emotion);
      const interval = baseInterval + (Math.random() - 0.5) * baseInterval * 0.3;
      
      keystrokes.push({
        key,
        timestamp,
        duration,
        keyCode: key.charCodeAt(0)
      });
      
      timestamp += interval;
    }
    
    // Add some backspaces for realism
    if (Math.random() > 0.7) {
      const backspaceCount = Math.floor(count * 0.1);
      for (let i = 0; i < backspaceCount; i++) {
        const idx = Math.floor(Math.random() * keystrokes.length);
        keystrokes.splice(idx, 0, {
          key: 'Backspace',
          timestamp: keystrokes[idx].timestamp + 50,
          duration: 100,
          keyCode: 8
        });
      }
    }
    
    return keystrokes;
  }
  
  getTypingInterval(speed, emotion) {
    const baseIntervals = {
      slow: 300,
      normal: 150,
      fast: 80,
      extreme: 40
    };
    
    let interval = baseIntervals[speed] || baseIntervals.normal;
    
    // Emotion modifiers
    const emotionModifiers = {
      happy: 0.9,
      angry: 0.7,
      anxious: 0.8,
      sad: 1.3,
      fearful: 1.2,
      neutral: 1.0,
      surprised: 0.85,
      disgusted: 1.1
    };
    
    return interval * (emotionModifiers[emotion] || 1.0);
  }
  
  getKeyDuration(emotion) {
    const baseDuration = 100;
    
    const emotionModifiers = {
      happy: 0.9,
      angry: 1.3,
      anxious: 1.1,
      sad: 1.2,
      fearful: 1.15,
      neutral: 1.0,
      surprised: 0.95,
      disgusted: 1.05
    };
    
    return baseDuration * (emotionModifiers[emotion] || 1.0);
  }
  
  // ============================================================================
  // MOUSE MOVEMENT DATA GENERATION
  // ============================================================================
  
  generateMouseMovements(count, options = {}) {
    const movements = [];
    const emotion = options.emotion || 'neutral';
    const pattern = options.pattern || 'smooth';
    
    let x = 500;
    let y = 300;
    let timestamp = Date.now();
    
    const velocity = this.getMouseVelocity(emotion);
    const jitter = this.getMouseJitter(emotion);
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = velocity + (Math.random() - 0.5) * jitter;
      
      x += Math.cos(angle) * distance;
      y += Math.sin(angle) * distance;
      
      // Keep within bounds
      x = Math.max(0, Math.min(1920, x));
      y = Math.max(0, Math.min(1080, y));
      
      movements.push({
        x: Math.round(x),
        y: Math.round(y),
        timestamp,
        movementX: Math.cos(angle) * distance,
        movementY: Math.sin(angle) * distance
      });
      
      timestamp += 16; // ~60fps
    }
    
    return movements;
  }
  
  generateErraticMouseMovements(count) {
    return this.generateMouseMovements(count, { emotion: 'anxious', pattern: 'erratic' });
  }
  
  getMouseVelocity(emotion) {
    const baseVelocity = 10;
    
    const emotionModifiers = {
      happy: 1.2,
      angry: 1.5,
      anxious: 1.4,
      sad: 0.7,
      fearful: 1.3,
      neutral: 1.0,
      surprised: 1.6,
      disgusted: 0.9
    };
    
    return baseVelocity * (emotionModifiers[emotion] || 1.0);
  }
  
  getMouseJitter(emotion) {
    const baseJitter = 5;
    
    const emotionModifiers = {
      happy: 0.8,
      angry: 1.5,
      anxious: 2.0,
      sad: 0.6,
      fearful: 1.7,
      neutral: 1.0,
      surprised: 1.3,
      disgusted: 1.1
    };
    
    return baseJitter * (emotionModifiers[emotion] || 1.0);
  }
  
  // ============================================================================
  // SCROLL EVENT DATA GENERATION
  // ============================================================================
  
  generateScrollEvents(count, options = {}) {
    const scrolls = [];
    const emotion = options.emotion || 'neutral';
    
    let timestamp = Date.now();
    const scrollSpeed = this.getScrollSpeed(emotion);
    
    for (let i = 0; i < count; i++) {
      const direction = Math.random() > 0.7 ? -1 : 1;
      const deltaY = direction * (scrollSpeed + (Math.random() - 0.5) * scrollSpeed * 0.5);
      
      scrolls.push({
        deltaY,
        deltaX: 0,
        timestamp
      });
      
      timestamp += 100 + Math.random() * 200;
    }
    
    return scrolls;
  }
  
  getScrollSpeed(emotion) {
    const baseSpeed = 100;
    
    const emotionModifiers = {
      happy: 1.1,
      angry: 1.4,
      anxious: 1.5,
      sad: 0.8,
      fearful: 1.2,
      neutral: 1.0,
      surprised: 1.3,
      disgusted: 0.9
    };
    
    return baseSpeed * (emotionModifiers[emotion] || 1.0);
  }
  
  // ============================================================================
  // CLICK EVENT DATA GENERATION
  // ============================================================================
  
  generateClickEvents(count, options = {}) {
    const clicks = [];
    const emotion = options.emotion || 'neutral';
    
    let timestamp = Date.now();
    
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * 1920);
      const y = Math.floor(Math.random() * 1080);
      const duration = this.getClickDuration(emotion);
      
      clicks.push({
        x,
        y,
        timestamp,
        duration,
        button: 0
      });
      
      timestamp += 500 + Math.random() * 2000;
    }
    
    return clicks;
  }
  
  getClickDuration(emotion) {
    const baseDuration = 100;
    
    const emotionModifiers = {
      happy: 0.9,
      angry: 1.4,
      anxious: 1.2,
      sad: 1.1,
      fearful: 1.3,
      neutral: 1.0,
      surprised: 0.95,
      disgusted: 1.05
    };
    
    return baseDuration * (emotionModifiers[emotion] || 1.0);
  }
  
  // ============================================================================
  // SESSION DATA GENERATION
  // ============================================================================
  
  generateSession(options = {}) {
    const emotion = options.emotion || this.emotions[Math.floor(Math.random() * this.emotions.length)];
    const duration = options.duration || 60000; // 1 minute default
    
    return {
      keystrokes: this.generateKeystrokeSequence(50, { emotion }),
      mouseMovements: this.generateMouseMovements(100, { emotion }),
      scrollEvents: this.generateScrollEvents(20, { emotion }),
      clickEvents: this.generateClickEvents(10, { emotion }),
      timestamp: Date.now(),
      duration,
      emotion // Ground truth for testing
    };
  }
  
  generateCompleteSession() {
    return this.generateSession({ duration: 120000 });
  }
  
  // ============================================================================
  // FEATURE VECTOR GENERATION
  // ============================================================================
  
  generateFeatureVector(emotion = null) {
    const selectedEmotion = emotion || this.emotions[Math.floor(Math.random() * this.emotions.length)];
    
    return {
      // Keystroke features (10)
      avgTypingSpeed: this.randomFeature(2, 8, selectedEmotion, 'typing'),
      typingRhythmVariance: this.randomFeature(0.1, 0.5, selectedEmotion, 'rhythm'),
      backspaceRatio: this.randomFeature(0.05, 0.2, selectedEmotion, 'backspace'),
      avgKeyHoldDuration: this.randomFeature(80, 150, selectedEmotion, 'hold'),
      pauseFrequency: this.randomFeature(1, 5, selectedEmotion, 'pause'),
      burstTypingScore: this.randomFeature(0, 1, selectedEmotion, 'burst'),
      
      // Mouse features (12)
      avgMouseVelocity: this.randomFeature(50, 200, selectedEmotion, 'velocity'),
      mouseAcceleration: this.randomFeature(10, 50, selectedEmotion, 'acceleration'),
      trajectoryJitter: this.randomFeature(0.1, 0.8, selectedEmotion, 'jitter'),
      clickFrequency: this.randomFeature(1, 10, selectedEmotion, 'click'),
      avgClickDuration: this.randomFeature(80, 150, selectedEmotion, 'clickDuration'),
      hoverDuration: this.randomFeature(500, 3000, selectedEmotion, 'hover'),
      movementDirectionChanges: this.randomFeature(5, 30, selectedEmotion, 'direction'),
      
      // Scroll features (6)
      avgScrollSpeed: this.randomFeature(50, 200, selectedEmotion, 'scroll'),
      scrollDirectionChanges: this.randomFeature(1, 10, selectedEmotion, 'scrollDir'),
      scrollPauseFrequency: this.randomFeature(1, 5, selectedEmotion, 'scrollPause'),
      
      // Interaction features (8)
      timeOnPage: this.randomFeature(10, 300, selectedEmotion, 'time'),
      interactionDensity: this.randomFeature(5, 30, selectedEmotion, 'density'),
      focusChangeFrequency: this.randomFeature(1, 10, selectedEmotion, 'focus'),
      sessionDuration: this.randomFeature(30, 600, selectedEmotion, 'session'),
      
      // Temporal features (4)
      timeOfDay: Math.random(),
      dayOfWeek: Math.random(),
      
      // Padding to reach 40 features
      feature35: Math.random(),
      feature36: Math.random(),
      feature37: Math.random(),
      feature38: Math.random(),
      feature39: Math.random(),
      feature40: Math.random()
    };
  }
  
  randomFeature(min, max, emotion, featureType) {
    const base = min + Math.random() * (max - min);
    
    // Apply emotion-specific modifiers
    const modifiers = this.getEmotionModifiers(emotion);
    const modifier = modifiers[featureType] || 1.0;
    
    return base * modifier;
  }
  
  getEmotionModifiers(emotion) {
    const modifiers = {
      happy: { typing: 1.1, velocity: 1.2, jitter: 0.8 },
      angry: { typing: 1.3, velocity: 1.5, jitter: 1.5 },
      anxious: { typing: 1.2, velocity: 1.4, jitter: 2.0 },
      sad: { typing: 0.7, velocity: 0.7, jitter: 0.6 },
      fearful: { typing: 0.9, velocity: 1.3, jitter: 1.7 },
      neutral: { typing: 1.0, velocity: 1.0, jitter: 1.0 },
      surprised: { typing: 1.2, velocity: 1.6, jitter: 1.3 },
      disgusted: { typing: 0.9, velocity: 0.9, jitter: 1.1 }
    };
    
    return modifiers[emotion] || modifiers.neutral;
  }
  
  generateFeatureBatch(count) {
    const batch = [];
    for (let i = 0; i < count; i++) {
      batch.push(this.generateFeatureVector());
    }
    return batch;
  }
  
  generateRawFeatures() {
    return {
      avgTypingSpeed: 100 + Math.random() * 200,
      avgMouseVelocity: 50 + Math.random() * 150,
      trajectoryJitter: Math.random() * 2,
      avgScrollSpeed: 50 + Math.random() * 150
    };
  }
  
  // ============================================================================
  // TRAINING DATA GENERATION
  // ============================================================================
  
  generateTrainingSet(count) {
    const data = [];
    const labels = [];
    
    for (let i = 0; i < count; i++) {
      const emotion = this.emotions[i % this.emotions.length];
      data.push(this.generateFeatureVector(emotion));
      labels.push(emotion);
    }
    
    // Split into train/validation
    const splitIdx = Math.floor(count * 0.8);
    
    return {
      train: {
        features: data.slice(0, splitIdx),
        labels: labels.slice(0, splitIdx)
      },
      validation: {
        features: data.slice(splitIdx),
        labels: labels.slice(splitIdx)
      }
    };
  }
  
  generateLabeledTestSet(count) {
    const features = [];
    const labels = [];
    
    for (let i = 0; i < count; i++) {
      const emotion = this.emotions[i % this.emotions.length];
      features.push(this.generateFeatureVector(emotion));
      labels.push(emotion);
    }
    
    return { features, labels };
  }
  
  generateBalancedEmotionSet(count) {
    const perEmotion = Math.floor(count / this.emotions.length);
    const features = [];
    const labels = [];
    
    for (const emotion of this.emotions) {
      for (let i = 0; i < perEmotion; i++) {
        features.push(this.generateFeatureVector(emotion));
        labels.push(emotion);
      }
    }
    
    return { features, labels };
  }
  
  generateFeedbackData(count) {
    const train = [];
    const validation = [];
    
    for (let i = 0; i < count; i++) {
      const emotion = this.emotions[i % this.emotions.length];
      const features = this.generateFeatureVector(emotion);
      const feedback = Math.random() > 0.2 ? 'correct' : 'incorrect';
      
      const item = { features, emotion, feedback };
      
      if (i < count * 0.8) {
        train.push(item);
      } else {
        validation.push(item);
      }
    }
    
    return { train, validation };
  }
}

module.exports = BehavioralTestDataGenerator;
