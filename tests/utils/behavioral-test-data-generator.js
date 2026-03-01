// Behavioral Test Data Generator

class BehavioralTestDataGenerator {
  constructor() {
    this.emotions = ['happy', 'sad', 'angry', 'anxious', 'neutral', 'surprised', 'fearful', 'disgusted'];
  }

  generateKeystrokeSequence(count, options = {}) {
    const keystrokes = [];
    const speed = options.speed || 'normal';
    let baseInterval = 100;
    
    if (speed === 'fast') baseInterval = 50;
    if (speed === 'slow') baseInterval = 200;
    if (speed === 'extreme') baseInterval = 20;
    
    let timestamp = Date.now();
    
    for (let i = 0; i < count; i++) {
      keystrokes.push({
        key: String.fromCharCode(97 + (i % 26)),
        code: `Key${String.fromCharCode(65 + (i % 26))}`,
        timestamp,
        duration: baseInterval + Math.random() * 50
      });
      
      timestamp += baseInterval + Math.random() * 50;
    }
    
    return keystrokes;
  }

  generateMouseMovements(count) {
    const movements = [];
    let x = 100;
    let y = 100;
    let timestamp = Date.now();
    
    for (let i = 0; i < count; i++) {
      x += (Math.random() - 0.5) * 50;
      y += (Math.random() - 0.5) * 50;
      
      movements.push({
        x: Math.max(0, Math.min(1920, x)),
        y: Math.max(0, Math.min(1080, y)),
        timestamp
      });
      
      timestamp += 50 + Math.random() * 50;
    }
    
    return movements;
  }

  generateErraticMouseMovements(count) {
    const movements = [];
    let timestamp = Date.now();
    
    for (let i = 0; i < count; i++) {
      movements.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        timestamp
      });
      
      timestamp += 10 + Math.random() * 20;
    }
    
    return movements;
  }

  generateScrollEvents(count) {
    const scrolls = [];
    let scrollY = 0;
    let timestamp = Date.now();
    
    for (let i = 0; i < count; i++) {
      scrollY += (Math.random() - 0.3) * 100;
      
      scrolls.push({
        scrollY: Math.max(0, scrollY),
        scrollX: 0,
        deltaY: (Math.random() - 0.3) * 100,
        timestamp
      });
      
      timestamp += 100 + Math.random() * 200;
    }
    
    return scrolls;
  }

  generateClickEvents(count) {
    const clicks = [];
    let timestamp = Date.now();
    
    for (let i = 0; i < count; i++) {
      clicks.push({
        x: Math.random() * 1920,
        y: Math.random() * 1080,
        button: 0,
        duration: 50 + Math.random() * 100,
        timestamp
      });
      
      timestamp += 500 + Math.random() * 1000;
    }
    
    return clicks;
  }

  generateSession() {
    return {
      keystrokes: this.generateKeystrokeSequence(50),
      mouseMovements: this.generateMouseMovements(100),
      scrollEvents: this.generateScrollEvents(20),
      clickEvents: this.generateClickEvents(10),
      timestamp: Date.now(),
      sessionDuration: 60000
    };
  }

  generateCompleteSession() {
    return this.generateSession();
  }

  generateRawFeatures() {
    const features = {};
    
    for (let i = 0; i < 40; i++) {
      features[`feature_${i}`] = Math.random() * 10;
    }
    
    return features;
  }

  generateFeatureVector() {
    const vector = [];
    
    for (let i = 0; i < 40; i++) {
      vector.push(Math.random());
    }
    
    return vector;
  }

  generateFeatureBatch(count) {
    const batch = [];
    
    for (let i = 0; i < count; i++) {
      batch.push(this.generateFeatureVector());
    }
    
    return batch;
  }

  generateLabeledTestSet(count) {
    const features = [];
    const labels = [];
    
    for (let i = 0; i < count; i++) {
      features.push(this.generateFeatureVector());
      labels.push(this.emotions[i % this.emotions.length]);
    }
    
    return { features, labels };
  }

  generateBalancedEmotionSet(count) {
    const features = [];
    const labels = [];
    const perEmotion = Math.floor(count / this.emotions.length);
    
    this.emotions.forEach(emotion => {
      for (let i = 0; i < perEmotion; i++) {
        features.push(this.generateFeatureVector());
        labels.push(emotion);
      }
    });
    
    return { features, labels };
  }

  generateTrainingSet(count) {
    const trainCount = Math.floor(count * 0.8);
    const valCount = count - trainCount;
    
    const trainData = this.generateLabeledTestSet(trainCount);
    const valData = this.generateLabeledTestSet(valCount);
    
    return {
      train: trainData,
      validation: valData
    };
  }

  generateFeedbackData(count) {
    return this.generateTrainingSet(count);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BehavioralTestDataGenerator;
}
