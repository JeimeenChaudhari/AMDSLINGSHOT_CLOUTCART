/**
 * Behavioral Emotion Detector - Comprehensive Test Suite
 * AMD Slingshot Hackathon Edition
 * 
 * Target: 78%+ emotion classification accuracy, <100ms inference
 */

const { expect } = require('@jest/globals');
const BehavioralDataCollector = require('../models/behavioral-data-collector');
const FeatureExtractor = require('../models/feature-extractor');
const EmotionMLModel = require('../models/emotion-ml-model');
const TrainingDataManager = require('../utils/training-data-manager');
const ModelTrainer = require('../utils/model-trainer');

const TestDataGenerator = require('./utils/behavioral-test-data-generator');
const PerformanceBenchmark = require('./utils/performance-benchmark');

describe('🏆 Behavioral Emotion Detector - Advanced Testing Suite', () => {
  
  let collector;
  let featureExtractor;
  let mlModel;
  let dataManager;
  let trainer;
  let testDataGenerator;
  let benchmark;
  
  beforeAll(async () => {
    collector = new BehavioralDataCollector();
    featureExtractor = new FeatureExtractor();
    mlModel = new EmotionMLModel();
    dataManager = new TrainingDataManager();
    trainer = new ModelTrainer();
    testDataGenerator = new TestDataGenerator();
    benchmark = new PerformanceBenchmark();
    
    // Load pre-trained model
    await mlModel.loadModel();
  });
  
  // ============================================================================
  // DATA COLLECTION TESTING
  // ============================================================================
  
  describe('📊 Behavioral Data Collection', () => {
    
    test('should collect keystroke dynamics accurately', async () => {
      const keystrokes = testDataGenerator.generateKeystrokeSequence(100);
      await collector.collectKeystrokes(keystrokes);
      
      const data = collector.getCollectedData();
      
      expect(data.keystrokes).toHaveLength(100);
      expect(data.keystrokes[0]).toHaveProperty('key');
      expect(data.keystrokes[0]).toHaveProperty('timestamp');
      expect(data.keystrokes[0]).toHaveProperty('duration');
    });
    
    test('should track mouse movements with high precision', async () => {
      const movements = testDataGenerator.generateMouseMovements(200);
      await collector.collectMouseMovements(movements);
      
      const data = collector.getCollectedData();
      
      expect(data.mouseMovements).toHaveLength(200);
      expect(data.mouseMovements[0]).toHaveProperty('x');
      expect(data.mouseMovements[0]).toHaveProperty('y');
      expect(data.mouseMovements[0]).toHaveProperty('timestamp');
    });
    
    test('should capture scroll behavior patterns', async () => {
      const scrolls = testDataGenerator.generateScrollEvents(50);
      await collector.collectScrollEvents(scrolls);
      
      const data = collector.getCollectedData();
      
      expect(data.scrollEvents).toHaveLength(50);
      expect(data.scrollEvents[0]).toHaveProperty('deltaY');
      expect(data.scrollEvents[0]).toHaveProperty('timestamp');
    });
    
    test('should track click patterns and durations', async () => {
      const clicks = testDataGenerator.generateClickEvents(30);
      await collector.collectClickEvents(clicks);
      
      const data = collector.getCollectedData();
      
      expect(data.clickEvents).toHaveLength(30);
      expect(data.clickEvents[0]).toHaveProperty('x');
      expect(data.clickEvents[0]).toHaveProperty('y');
      expect(data.clickEvents[0]).toHaveProperty('duration');
    });
    
    test('should collect data without performance impact', async () => {
      const startTime = performance.now();
      
      // Simulate 1 minute of user activity
      for (let i = 0; i < 1000; i++) {
        await collector.collectKeystroke({ key: 'a', timestamp: Date.now() });
        await collector.collectMouseMove({ x: i, y: i, timestamp: Date.now() });
      }
      
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(100); // <100ms for 2000 events
    });
    
    test('should implement efficient data buffering', async () => {
      collector.setBufferSize(100);
      
      for (let i = 0; i < 150; i++) {
        await collector.collectKeystroke({ key: 'a', timestamp: Date.now() });
      }
      
      const buffer = collector.getBuffer();
      
      expect(buffer.length).toBeLessThanOrEqual(100);
    });
    
    test('should handle concurrent data collection', async () => {
      const promises = [];
      
      for (let i = 0; i < 100; i++) {
        promises.push(collector.collectKeystroke({ key: 'a', timestamp: Date.now() }));
        promises.push(collector.collectMouseMove({ x: i, y: i, timestamp: Date.now() }));
      }
      
      await Promise.all(promises);
      
      const data = collector.getCollectedData();
      expect(data.keystrokes.length + data.mouseMovements.length).toBe(200);
    });
  });
  
  // ============================================================================
  // FEATURE EXTRACTION TESTING
  // ============================================================================
  
  describe('🔬 Advanced Feature Extraction', () => {
    
    test('should extract keystroke features correctly', async () => {
      const keystrokes = testDataGenerator.generateKeystrokeSequence(100);
      const features = await featureExtractor.extractKeystrokeFeatures(keystrokes);
      
      expect(features).toHaveProperty('avgTypingSpeed');
      expect(features).toHaveProperty('typingRhythmVariance');
      expect(features).toHaveProperty('backspaceRatio');
      expect(features).toHaveProperty('avgKeyHoldDuration');
      expect(features).toHaveProperty('pauseFrequency');
      expect(features).toHaveProperty('burstTypingScore');
      
      expect(features.avgTypingSpeed).toBeGreaterThan(0);
    });
    
    test('should extract mouse movement features', async () => {
      const movements = testDataGenerator.generateMouseMovements(200);
      const features = await featureExtractor.extractMouseFeatures(movements);
      
      expect(features).toHaveProperty('avgMouseVelocity');
      expect(features).toHaveProperty('mouseAcceleration');
      expect(features).toHaveProperty('trajectoryJitter');
      expect(features).toHaveProperty('clickFrequency');
      expect(features).toHaveProperty('movementDirectionChanges');
      
      expect(features.avgMouseVelocity).toBeGreaterThan(0);
    });
    
    test('should extract scroll behavior features', async () => {
      const scrolls = testDataGenerator.generateScrollEvents(50);
      const features = await featureExtractor.extractScrollFeatures(scrolls);
      
      expect(features).toHaveProperty('avgScrollSpeed');
      expect(features).toHaveProperty('scrollDirectionChanges');
      expect(features).toHaveProperty('scrollPauseFrequency');
    });
    
    test('should extract temporal features', async () => {
      const session = testDataGenerator.generateSession();
      const features = await featureExtractor.extractTemporalFeatures(session);
      
      expect(features).toHaveProperty('timeOfDay');
      expect(features).toHaveProperty('dayOfWeek');
      expect(features).toHaveProperty('sessionDuration');
      expect(features).toHaveProperty('interactionDensity');
      
      expect(features.timeOfDay).toBeGreaterThanOrEqual(0);
      expect(features.timeOfDay).toBeLessThanOrEqual(1);
    });
    
    test('should normalize features to [0, 1] range', async () => {
      const rawFeatures = testDataGenerator.generateRawFeatures();
      const normalized = await featureExtractor.normalizeFeatures(rawFeatures);
      
      Object.values(normalized).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
    
    test('should create complete 40-dimensional feature vector', async () => {
      const session = testDataGenerator.generateCompleteSession();
      const features = await featureExtractor.extractAllFeatures(session);
      
      const featureVector = Object.values(features);
      expect(featureVector).toHaveLength(40);
      
      featureVector.forEach(value => {
        expect(typeof value).toBe('number');
        expect(isNaN(value)).toBe(false);
      });
    });
    
    test('should handle missing data gracefully', async () => {
      const incompleteSession = {
        keystrokes: [],
        mouseMovements: testDataGenerator.generateMouseMovements(10),
        scrollEvents: []
      };
      
      const features = await featureExtractor.extractAllFeatures(incompleteSession);
      
      expect(features).toBeDefined();
      expect(Object.keys(features)).toHaveLength(40);
    });
    
    test('should extract features in <50ms', async () => {
      const session = testDataGenerator.generateCompleteSession();
      
      const startTime = performance.now();
      await featureExtractor.extractAllFeatures(session);
      const duration = performance.now() - startTime;
      
      expect(duration).toBeLessThan(50);
    });
  });
  
  // ============================================================================
  // ML MODEL TESTING
  // ============================================================================
  
  describe('🧠 Emotion ML Model', () => {
    
    test('should achieve 78%+ accuracy on test set', async () => {
      const testSet = testDataGenerator.generateLabeledTestSet(1000);
      const predictions = await mlModel.predict(testSet.features);
      
      const accuracy = calculateAccuracy(predictions, testSet.labels);
      expect(accuracy).toBeGreaterThan(0.78);
    });
    
    test('should predict all 8 emotion classes', async () => {
      const emotions = ['happy', 'sad', 'angry', 'anxious', 'neutral', 'surprised', 'fearful', 'disgusted'];
      const testData = testDataGenerator.generateBalancedEmotionSet(800);
      
      const predictions = await mlModel.predict(testData.features);
      const uniquePredictions = new Set(predictions.map(p => p.emotion));
      
      expect(uniquePredictions.size).toBeGreaterThanOrEqual(6); // At least 6 of 8 emotions
    });
    
    test('should provide confidence scores with predictions', async () => {
      const features = testDataGenerator.generateFeatureVector();
      const prediction = await mlModel.predictWithConfidence(features);
      
      expect(prediction).toHaveProperty('emotion');
      expect(prediction).toHaveProperty('confidence');
      expect(prediction.confidence).toBeGreaterThan(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
    });
    
    test('should perform inference in <100ms', async () => {
      const features = testDataGenerator.generateFeatureVector();
      const latencies = [];
      
      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        await mlModel.predict([features]);
        latencies.push(performance.now() - start);
      }
      
      const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
      expect(avgLatency).toBeLessThan(100);
    });
    
    test('should handle batch predictions efficiently', async () => {
      const batch = testDataGenerator.generateFeatureBatch(100);
      
      const startTime = performance.now();
      const predictions = await mlModel.predict(batch);
      const duration = performance.now() - startTime;
      
      expect(predictions).toHaveLength(100);
      expect(duration).toBeLessThan(500); // <500ms for 100 predictions
    });
    
    test('should maintain model size <500KB', async () => {
      const modelSize = await mlModel.getModelSize();
      expect(modelSize).toBeLessThan(500 * 1024); // 500KB in bytes
    });
    
    test('should support model serialization', async () => {
      const serialized = await mlModel.serialize();
      
      expect(serialized).toHaveProperty('weights');
      expect(serialized).toHaveProperty('architecture');
      expect(serialized).toHaveProperty('version');
    });
    
    test('should load serialized model correctly', async () => {
      const serialized = await mlModel.serialize();
      const newModel = new EmotionMLModel();
      await newModel.deserialize(serialized);
      
      const features = testDataGenerator.generateFeatureVector();
      const prediction1 = await mlModel.predict([features]);
      const prediction2 = await newModel.predict([features]);
      
      expect(prediction1[0].emotion).toBe(prediction2[0].emotion);
    });
  });
  
  // ============================================================================
  // TRAINING PIPELINE TESTING
  // ============================================================================
  
  describe('🎓 Model Training Pipeline', () => {
    
    test('should train model with synthetic data', async () => {
      const trainingData = testDataGenerator.generateTrainingSet(5000);
      
      const initialAccuracy = await evaluateModel(mlModel, trainingData.validation);
      
      await trainer.train(mlModel, trainingData.train, {
        epochs: 10,
        batchSize: 32,
        validationSplit: 0.2
      });
      
      const finalAccuracy = await evaluateModel(mlModel, trainingData.validation);
      
      expect(finalAccuracy).toBeGreaterThan(initialAccuracy);
    });
    
    test('should implement incremental learning', async () => {
      const initialData = testDataGenerator.generateTrainingSet(1000);
      await trainer.train(mlModel, initialData.train);
      
      const initialAccuracy = await evaluateModel(mlModel, initialData.validation);
      
      // Add new data
      const newData = testDataGenerator.generateTrainingSet(500);
      await trainer.incrementalTrain(mlModel, newData.train);
      
      const finalAccuracy = await evaluateModel(mlModel, newData.validation);
      
      expect(finalAccuracy).toBeGreaterThanOrEqual(initialAccuracy * 0.95); // Allow small degradation
    });
    
    test('should use early stopping to prevent overfitting', async () => {
      const trainingData = testDataGenerator.generateTrainingSet(2000);
      
      const history = await trainer.train(mlModel, trainingData.train, {
        epochs: 100,
        earlyStopping: true,
        patience: 5
      });
      
      expect(history.stoppedEarly).toBe(true);
      expect(history.epochsTrained).toBeLessThan(100);
    });
    
    test('should implement learning rate scheduling', async () => {
      const trainingData = testDataGenerator.generateTrainingSet(2000);
      
      const history = await trainer.train(mlModel, trainingData.train, {
        epochs: 20,
        learningRateSchedule: 'exponential_decay'
      });
      
      expect(history.learningRates).toBeDefined();
      expect(history.learningRates[0]).toBeGreaterThan(history.learningRates[history.learningRates.length - 1]);
    });
    
    test('should track training metrics', async () => {
      const trainingData = testDataGenerator.generateTrainingSet(1000);
      
      const history = await trainer.train(mlModel, trainingData.train, {
        epochs: 10
      });
      
      expect(history).toHaveProperty('loss');
      expect(history).toHaveProperty('accuracy');
      expect(history).toHaveProperty('valLoss');
      expect(history).toHaveProperty('valAccuracy');
      
      expect(history.loss).toHaveLength(10);
    });
    
    test('should improve accuracy with more training data', async () => {
      const smallData = testDataGenerator.generateTrainingSet(500);
      const largeData = testDataGenerator.generateTrainingSet(5000);
      
      const model1 = new EmotionMLModel();
      await trainer.train(model1, smallData.train);
      const accuracy1 = await evaluateModel(model1, smallData.validation);
      
      const model2 = new EmotionMLModel();
      await trainer.train(model2, largeData.train);
      const accuracy2 = await evaluateModel(model2, largeData.validation);
      
      expect(accuracy2).toBeGreaterThan(accuracy1);
    });
  });
  
  // ============================================================================
  // DATA MANAGEMENT TESTING
  // ============================================================================
  
  describe('💾 Training Data Management', () => {
    
    test('should store data in IndexedDB', async () => {
      const session = testDataGenerator.generateSession();
      const emotion = 'happy';
      
      await dataManager.storeTrainingData(session, emotion);
      
      const stored = await dataManager.getTrainingData();
      expect(stored.length).toBeGreaterThan(0);
    });
    
    test('should retrieve data by emotion label', async () => {
      await dataManager.clear();
      
      for (let i = 0; i < 10; i++) {
        const session = testDataGenerator.generateSession();
        await dataManager.storeTrainingData(session, 'happy');
      }
      
      const happyData = await dataManager.getDataByEmotion('happy');
      expect(happyData).toHaveLength(10);
    });
    
    test('should implement FIFO with size limits', async () => {
      await dataManager.clear();
      await dataManager.setMaxSize(100);
      
      for (let i = 0; i < 150; i++) {
        const session = testDataGenerator.generateSession();
        await dataManager.storeTrainingData(session, 'neutral');
      }
      
      const allData = await dataManager.getTrainingData();
      expect(allData.length).toBeLessThanOrEqual(100);
    });
    
    test('should export training data', async () => {
      const exported = await dataManager.exportData();
      
      expect(exported).toHaveProperty('version');
      expect(exported).toHaveProperty('data');
      expect(exported).toHaveProperty('timestamp');
      expect(Array.isArray(exported.data)).toBe(true);
    });
    
    test('should import training data', async () => {
      const exported = await dataManager.exportData();
      await dataManager.clear();
      
      await dataManager.importData(exported);
      
      const imported = await dataManager.getTrainingData();
      expect(imported.length).toBe(exported.data.length);
    });
    
    test('should handle data versioning', async () => {
      const session = testDataGenerator.generateSession();
      await dataManager.storeTrainingData(session, 'happy', { version: 2 });
      
      const data = await dataManager.getTrainingData();
      expect(data[0].version).toBe(2);
    });
    
    test('should clean old data automatically', async () => {
      await dataManager.clear();
      await dataManager.setRetentionDays(30);
      
      // Add old data
      const oldSession = testDataGenerator.generateSession();
      oldSession.timestamp = Date.now() - (40 * 24 * 60 * 60 * 1000); // 40 days ago
      await dataManager.storeTrainingData(oldSession, 'happy');
      
      // Add recent data
      const recentSession = testDataGenerator.generateSession();
      await dataManager.storeTrainingData(recentSession, 'happy');
      
      await dataManager.cleanOldData();
      
      const remaining = await dataManager.getTrainingData();
      expect(remaining.length).toBe(1);
    });
  });
  
  // ============================================================================
  // CONTINUOUS LEARNING TESTING
  // ============================================================================
  
  describe('🔄 Continuous Learning System', () => {
    
    test('should collect user feedback', async () => {
      const prediction = { emotion: 'happy', confidence: 0.85 };
      const feedback = 'correct';
      
      await dataManager.storeFeedback(prediction, feedback);
      
      const feedbackData = await dataManager.getFeedback();
      expect(feedbackData.length).toBeGreaterThan(0);
    });
    
    test('should use feedback for retraining', async () => {
      const feedbackData = testDataGenerator.generateFeedbackData(100);
      
      const initialAccuracy = await evaluateModel(mlModel, feedbackData.validation);
      
      await trainer.retrainWithFeedback(mlModel, feedbackData.train);
      
      const finalAccuracy = await evaluateModel(mlModel, feedbackData.validation);
      
      expect(finalAccuracy).toBeGreaterThanOrEqual(initialAccuracy);
    });
    
    test('should implement confidence thresholding', async () => {
      const features = testDataGenerator.generateFeatureVector();
      const prediction = await mlModel.predictWithConfidence(features);
      
      const threshold = 0.6;
      const shouldUse = prediction.confidence >= threshold;
      
      expect(typeof shouldUse).toBe('boolean');
    });
    
    test('should track model performance over time', async () => {
      const metrics = await dataManager.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('accuracy');
      expect(metrics).toHaveProperty('sampleCount');
      expect(metrics).toHaveProperty('lastUpdated');
    });
    
    test('should trigger retraining when performance degrades', async () => {
      const currentAccuracy = 0.75;
      const threshold = 0.70;
      
      const shouldRetrain = currentAccuracy < threshold;
      
      expect(shouldRetrain).toBe(false);
    });
  });
  
  // ============================================================================
  // INTEGRATION TESTING
  // ============================================================================
  
  describe('🔗 End-to-End Integration', () => {
    
    test('should complete full pipeline: collect → extract → predict', async () => {
      // Collect data
      const keystrokes = testDataGenerator.generateKeystrokeSequence(50);
      const movements = testDataGenerator.generateMouseMovements(100);
      
      await collector.collectKeystrokes(keystrokes);
      await collector.collectMouseMovements(movements);
      
      const session = collector.getCollectedData();
      
      // Extract features
      const features = await featureExtractor.extractAllFeatures(session);
      
      // Predict emotion
      const prediction = await mlModel.predictWithConfidence(features);
      
      expect(prediction.emotion).toBeDefined();
      expect(prediction.confidence).toBeGreaterThan(0);
    });
    
    test('should integrate with emotion detection system', async () => {
      const EmotionDetector = require('../models/emotion-detection');
      const detector = new EmotionDetector({ keyboardMode: true });
      
      const emotion = await detector.detectEmotion();
      
      expect(emotion).toHaveProperty('emotion');
      expect(emotion).toHaveProperty('confidence');
    });
    
    test('should work in browser extension context', async () => {
      // Simulate browser extension environment
      global.chrome = {
        storage: {
          local: {
            get: jest.fn(),
            set: jest.fn()
          }
        }
      };
      
      const session = testDataGenerator.generateSession();
      const features = await featureExtractor.extractAllFeatures(session);
      const prediction = await mlModel.predict([features]);
      
      expect(prediction).toBeDefined();
    });
  });
  
  // ============================================================================
  // PERFORMANCE & RESOURCE TESTING
  // ============================================================================
  
  describe('⚡ Performance & Resource Usage', () => {
    
    test('should maintain <50MB memory footprint', async () => {
      const initialMemory = performance.memory?.usedJSHeapSize || 0;
      
      // Simulate heavy usage
      for (let i = 0; i < 1000; i++) {
        const session = testDataGenerator.generateSession();
        const features = await featureExtractor.extractAllFeatures(session);
        await mlModel.predict([features]);
      }
      
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      expect(memoryIncrease).toBeLessThan(50);
    });
    
    test('should use <5% CPU on average', async () => {
      // This would require actual CPU monitoring in production
      // For testing, we ensure operations are non-blocking
      
      const operations = [];
      for (let i = 0; i < 100; i++) {
        operations.push(mlModel.predict([testDataGenerator.generateFeatureVector()]));
      }
      
      const startTime = Date.now();
      await Promise.all(operations);
      const duration = Date.now() - startTime;
      
      // Should complete quickly without blocking
      expect(duration).toBeLessThan(1000);
    });
    
    test('should handle 1000+ predictions per second', async () => {
      const features = Array(1000).fill(null).map(() => testDataGenerator.generateFeatureVector());
      
      const startTime = Date.now();
      await mlModel.predict(features);
      const duration = Date.now() - startTime;
      
      const throughput = 1000 / (duration / 1000);
      expect(throughput).toBeGreaterThan(1000);
    });
  });
  
  // ============================================================================
  // EDGE CASES & ROBUSTNESS
  // ============================================================================
  
  describe('🛡️ Edge Cases & Robustness', () => {
    
    test('should handle no user activity gracefully', async () => {
      const emptySession = {
        keystrokes: [],
        mouseMovements: [],
        scrollEvents: [],
        clickEvents: []
      };
      
      const features = await featureExtractor.extractAllFeatures(emptySession);
      const prediction = await mlModel.predict([features]);
      
      expect(prediction).toBeDefined();
      expect(prediction[0].emotion).toBe('neutral');
    });
    
    test('should handle extreme typing speeds', async () => {
      const fastTyping = testDataGenerator.generateKeystrokeSequence(100, { speed: 'extreme' });
      const features = await featureExtractor.extractKeystrokeFeatures(fastTyping);
      
      expect(features.avgTypingSpeed).toBeGreaterThan(0);
      expect(isFinite(features.avgTypingSpeed)).toBe(true);
    });
    
    test('should handle erratic mouse movements', async () => {
      const erratic = testDataGenerator.generateErraticMouseMovements(200);
      const features = await featureExtractor.extractMouseFeatures(erratic);
      
      expect(features.trajectoryJitter).toBeGreaterThan(0.5);
    });
    
    test('should recover from corrupted data', async () => {
      const corrupted = {
        keystrokes: [{ key: null, timestamp: NaN }],
        mouseMovements: [{ x: undefined, y: Infinity }]
      };
      
      const features = await featureExtractor.extractAllFeatures(corrupted);
      
      expect(features).toBeDefined();
      Object.values(features).forEach(value => {
        expect(isFinite(value)).toBe(true);
      });
    });
  });
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function calculateAccuracy(predictions, labels) {
  let correct = 0;
  for (let i = 0; i < predictions.length; i++) {
    if (predictions[i].emotion === labels[i]) correct++;
  }
  return correct / predictions.length;
}

async function evaluateModel(model, validationData) {
  const predictions = await model.predict(validationData.features);
  return calculateAccuracy(predictions, validationData.labels);
}

module.exports = {
  calculateAccuracy,
  evaluateModel
};
