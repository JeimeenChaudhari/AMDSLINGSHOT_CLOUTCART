// Emotion Detection Model
// Supports both camera-based and behavioral (keyboard/cursor) detection

class EmotionDetector {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    
    // Behavioral detection components
    this.behavioralMode = false;
    this.dataCollector = null;
    this.featureExtractor = null;
    this.mlModel = null;
    this.trainingDataManager = null;
    this.modelTrainer = null;
    
    this.lastPrediction = null;
    this.lastFeatures = null;
  }

  async loadModel() {
    // For camera-based detection (placeholder)
    console.log('[EmotionDetector] Camera model loaded (simulated)');
    this.isLoaded = true;
    return true;
  }

  async initializeBehavioralDetection() {
    if (this.behavioralMode) return;
    
    console.log('[EmotionDetector] Initializing behavioral detection...');
    
    try {
      // Initialize components
      this.dataCollector = new BehavioralDataCollector();
      this.featureExtractor = new FeatureExtractor();
      this.mlModel = new EmotionMLModel();
      this.trainingDataManager = new TrainingDataManager();
      this.modelTrainer = new ModelTrainer(this.mlModel, this.trainingDataManager);
      
      // Initialize ML model and training data
      await this.mlModel.initialize();
      await this.trainingDataManager.initialize();
      
      // Start data collection
      this.dataCollector.start((rawData) => {
        this.onBehavioralDataReady(rawData);
      });
      
      // Start auto-training
      this.modelTrainer.startAutoTraining();
      
      this.behavioralMode = true;
      console.log('[EmotionDetector] Behavioral detection initialized successfully');
      
    } catch (error) {
      console.error('[EmotionDetector] Error initializing behavioral detection:', error);
      throw error;
    }
  }

  async onBehavioralDataReady(rawData) {
    try {
      // Extract features
      const features = this.featureExtractor.extract(rawData);
      
      if (!features) return;
      
      // Predict emotion
      const prediction = this.mlModel.predict(features);
      
      // Store for training
      this.lastPrediction = prediction;
      this.lastFeatures = features;
      
      // Store in training data
      await this.trainingDataManager.storeSample(
        features,
        prediction.emotion,
        prediction.confidence,
        {
          url: window.location.href,
          timestamp: Date.now()
        }
      );
      
      // Notify content script
      if (window.updateEmotionFromBehavioral) {
        window.updateEmotionFromBehavioral(prediction);
      }
      
    } catch (error) {
      console.error('[EmotionDetector] Error processing behavioral data:', error);
    }
  }

  async detectEmotion(imageData) {
    if (!this.isLoaded) {
      await this.loadModel();
    }

    // Simulate camera-based emotion detection
    const emotions = [
      { emotion: 'Happy', confidence: 0.85 },
      { emotion: 'Sad', confidence: 0.05 },
      { emotion: 'Angry', confidence: 0.02 },
      { emotion: 'Surprised', confidence: 0.03 },
      { emotion: 'Neutral', confidence: 0.03 },
      { emotion: 'Anxious', confidence: 0.01 },
      { emotion: 'Fearful', confidence: 0.005 },
      { emotion: 'Disgusted', confidence: 0.005 }
    ];

    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    return {
      emotion: randomEmotion.emotion,
      confidence: Math.random() * 0.3 + 0.7,
      allEmotions: emotions
    };
  }

  // Legacy method for backward compatibility
  analyzeActivity(activityData) {
    const { clicks, movements, keyPresses, timeSpent } = activityData;
    
    // Simple rule-based fallback
    if (clicks > 20 && movements > 200) {
      return { emotion: 'Anxious', confidence: 0.75 };
    } else if (clicks < 5 && timeSpent > 60000) {
      return { emotion: 'Neutral', confidence: 0.80 };
    } else if (keyPresses > 50) {
      return { emotion: 'Surprised', confidence: 0.70 };
    } else if (clicks > 10 && timeSpent < 30000) {
      return { emotion: 'Happy', confidence: 0.85 };
    }
    
    return { emotion: 'Neutral', confidence: 0.60 };
  }

  async provideFeedback(feedbackType, correctedEmotion = null) {
    if (!this.behavioralMode || !this.lastPrediction) {
      console.log('[EmotionDetector] No prediction to provide feedback for');
      return;
    }
    
    try {
      // Get the last stored sample ID
      const stats = await this.trainingDataManager.getStatistics();
      
      // Store feedback
      await this.trainingDataManager.storeFeedback(
        stats.totalSamples, // Last sample ID
        feedbackType,
        correctedEmotion
      );
      
      // If corrected, retrain immediately
      if (correctedEmotion && this.lastFeatures) {
        await this.mlModel.train(this.lastFeatures, correctedEmotion);
        console.log('[EmotionDetector] Model updated with corrected emotion:', correctedEmotion);
      }
      
    } catch (error) {
      console.error('[EmotionDetector] Error providing feedback:', error);
    }
  }

  async getTrainingStats() {
    if (!this.trainingDataManager) return null;
    
    try {
      const stats = await this.trainingDataManager.getStatistics();
      const modelTrainingCount = this.mlModel ? this.mlModel.trainingCount : 0;
      
      return {
        ...stats,
        modelTrainingCount,
        behavioralMode: this.behavioralMode
      };
    } catch (error) {
      console.error('[EmotionDetector] Error getting stats:', error);
      return null;
    }
  }

  stopBehavioralDetection() {
    if (this.dataCollector) {
      this.dataCollector.stop();
    }
    if (this.modelTrainer) {
      this.modelTrainer.stopAutoTraining();
    }
    this.behavioralMode = false;
    console.log('[EmotionDetector] Behavioral detection stopped');
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmotionDetector;
}
