// Training Data Manager
// Manages storage and retrieval of behavioral training data using IndexedDB

class TrainingDataManager {
  constructor() {
    this.dbName = 'EmotionTrainingDB';
    this.dbVersion = 1;
    this.db = null;
    this.maxSamples = 1000; // Keep last 1000 samples
    this.retentionDays = 30;
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('[TrainingData] Error opening database');
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[TrainingData] Database initialized');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store for training samples
        if (!db.objectStoreNames.contains('trainingSamples')) {
          const store = db.createObjectStore('trainingSamples', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('emotion', 'emotion', { unique: false });
          store.createIndex('confidence', 'confidence', { unique: false });
        }
        
        // Create object store for feedback
        if (!db.objectStoreNames.contains('feedback')) {
          const feedbackStore = db.createObjectStore('feedback', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          feedbackStore.createIndex('timestamp', 'timestamp', { unique: false });
          feedbackStore.createIndex('sampleId', 'sampleId', { unique: false });
        }
        
        console.log('[TrainingData] Database schema created');
      };
    });
  }

  /**
   * Store a training sample
   * @param {Array} features - Feature vector
   * @param {String} emotion - Emotion label
   * @param {Number} confidence - Prediction confidence
   * @param {Object} context - Additional context (page URL, product, etc.)
   */
  async storeSample(features, emotion, confidence, context = {}) {
    if (!this.db) {
      await this.initialize();
    }
    
    const sample = {
      features,
      emotion,
      confidence,
      context,
      timestamp: Date.now(),
      feedback: null
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['trainingSamples'], 'readwrite');
      const store = transaction.objectStore('trainingSamples');
      const request = store.add(sample);
      
      request.onsuccess = () => {
        console.log('[TrainingData] Sample stored, ID:', request.result);
        this.cleanupOldSamples(); // Async cleanup
        resolve(request.result);
      };
      
      request.onerror = () => {
        console.error('[TrainingData] Error storing sample:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Store user feedback for a prediction
   * @param {Number} sampleId - ID of the sample
   * @param {String} feedbackType - 'correct', 'incorrect', 'corrected'
   * @param {String} correctedEmotion - If corrected, the correct emotion
   */
  async storeFeedback(sampleId, feedbackType, correctedEmotion = null) {
    if (!this.db) {
      await this.initialize();
    }
    
    const feedback = {
      sampleId,
      feedbackType,
      correctedEmotion,
      timestamp: Date.now()
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['feedback', 'trainingSamples'], 'readwrite');
      const feedbackStore = transaction.objectStore('feedback');
      const samplesStore = transaction.objectStore('trainingSamples');
      
      // Store feedback
      const feedbackRequest = feedbackStore.add(feedback);
      
      feedbackRequest.onsuccess = () => {
        // Update sample with feedback
        const getSampleRequest = samplesStore.get(sampleId);
        
        getSampleRequest.onsuccess = () => {
          const sample = getSampleRequest.result;
          if (sample) {
            sample.feedback = feedbackType;
            if (correctedEmotion) {
              sample.correctedEmotion = correctedEmotion;
            }
            samplesStore.put(sample);
          }
        };
        
        console.log('[TrainingData] Feedback stored for sample:', sampleId);
        resolve();
      };
      
      feedbackRequest.onerror = () => {
        console.error('[TrainingData] Error storing feedback:', feedbackRequest.error);
        reject(feedbackRequest.error);
      };
    });
  }

  /**
   * Get training samples for retraining
   * @param {Number} limit - Maximum number of samples to retrieve
   * @param {Boolean} onlyWithFeedback - Only get samples with user feedback
   */
  async getTrainingSamples(limit = 100, onlyWithFeedback = false) {
    if (!this.db) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['trainingSamples'], 'readonly');
      const store = transaction.objectStore('trainingSamples');
      const index = store.index('timestamp');
      
      const samples = [];
      const request = index.openCursor(null, 'prev'); // Most recent first
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (cursor && samples.length < limit) {
          const sample = cursor.value;
          
          // Filter based on feedback requirement
          if (!onlyWithFeedback || sample.feedback) {
            samples.push(sample);
          }
          
          cursor.continue();
        } else {
          console.log('[TrainingData] Retrieved', samples.length, 'samples');
          resolve(samples);
        }
      };
      
      request.onerror = () => {
        console.error('[TrainingData] Error retrieving samples:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get samples by emotion
   */
  async getSamplesByEmotion(emotion, limit = 50) {
    if (!this.db) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['trainingSamples'], 'readonly');
      const store = transaction.objectStore('trainingSamples');
      const index = store.index('emotion');
      
      const samples = [];
      const request = index.openCursor(IDBKeyRange.only(emotion));
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (cursor && samples.length < limit) {
          samples.push(cursor.value);
          cursor.continue();
        } else {
          resolve(samples);
        }
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Get statistics about training data
   */
  async getStatistics() {
    if (!this.db) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['trainingSamples', 'feedback'], 'readonly');
      const samplesStore = transaction.objectStore('trainingSamples');
      const feedbackStore = transaction.objectStore('feedback');
      
      const stats = {
        totalSamples: 0,
        totalFeedback: 0,
        emotionCounts: {},
        feedbackCounts: {},
        avgConfidence: 0,
        oldestSample: null,
        newestSample: null
      };
      
      // Count samples
      const countRequest = samplesStore.count();
      countRequest.onsuccess = () => {
        stats.totalSamples = countRequest.result;
      };
      
      // Count feedback
      const feedbackCountRequest = feedbackStore.count();
      feedbackCountRequest.onsuccess = () => {
        stats.totalFeedback = feedbackCountRequest.result;
      };
      
      // Get emotion distribution
      const samplesRequest = samplesStore.openCursor();
      let confidenceSum = 0;
      let sampleCount = 0;
      
      samplesRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (cursor) {
          const sample = cursor.value;
          
          // Count emotions
          stats.emotionCounts[sample.emotion] = (stats.emotionCounts[sample.emotion] || 0) + 1;
          
          // Count feedback types
          if (sample.feedback) {
            stats.feedbackCounts[sample.feedback] = (stats.feedbackCounts[sample.feedback] || 0) + 1;
          }
          
          // Sum confidence
          confidenceSum += sample.confidence || 0;
          sampleCount++;
          
          // Track oldest and newest
          if (!stats.oldestSample || sample.timestamp < stats.oldestSample) {
            stats.oldestSample = sample.timestamp;
          }
          if (!stats.newestSample || sample.timestamp > stats.newestSample) {
            stats.newestSample = sample.timestamp;
          }
          
          cursor.continue();
        } else {
          // Calculate average confidence
          stats.avgConfidence = sampleCount > 0 ? Math.round(confidenceSum / sampleCount) : 0;
          
          console.log('[TrainingData] Statistics:', stats);
          resolve(stats);
        }
      };
      
      samplesRequest.onerror = () => {
        reject(samplesRequest.error);
      };
    });
  }

  /**
   * Clean up old samples (keep only recent ones)
   */
  async cleanupOldSamples() {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction(['trainingSamples'], 'readwrite');
      const store = transaction.objectStore('trainingSamples');
      const index = store.index('timestamp');
      
      const cutoffDate = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
      const range = IDBKeyRange.upperBound(cutoffDate);
      
      const request = index.openCursor(range);
      let deletedCount = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            console.log('[TrainingData] Cleaned up', deletedCount, 'old samples');
          }
        }
      };
    } catch (error) {
      console.error('[TrainingData] Error during cleanup:', error);
    }
  }

  /**
   * Clear all training data
   */
  async clearAllData() {
    if (!this.db) {
      await this.initialize();
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['trainingSamples', 'feedback'], 'readwrite');
      
      const samplesStore = transaction.objectStore('trainingSamples');
      const feedbackStore = transaction.objectStore('feedback');
      
      const clearSamples = samplesStore.clear();
      const clearFeedback = feedbackStore.clear();
      
      transaction.oncomplete = () => {
        console.log('[TrainingData] All data cleared');
        resolve();
      };
      
      transaction.onerror = () => {
        console.error('[TrainingData] Error clearing data:', transaction.error);
        reject(transaction.error);
      };
    });
  }

  /**
   * Export training data for backup
   */
  async exportData() {
    const samples = await this.getTrainingSamples(this.maxSamples);
    const stats = await this.getStatistics();
    
    return {
      samples,
      stats,
      exportDate: Date.now(),
      version: this.dbVersion
    };
  }

  /**
   * Import training data from backup
   */
  async importData(data) {
    if (!data || !data.samples) {
      throw new Error('Invalid import data');
    }
    
    if (!this.db) {
      await this.initialize();
    }
    
    const transaction = this.db.transaction(['trainingSamples'], 'readwrite');
    const store = transaction.objectStore('trainingSamples');
    
    let importedCount = 0;
    
    for (const sample of data.samples) {
      // Remove id to let autoIncrement assign new ones
      delete sample.id;
      store.add(sample);
      importedCount++;
    }
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('[TrainingData] Imported', importedCount, 'samples');
        resolve(importedCount);
      };
      
      transaction.onerror = () => {
        console.error('[TrainingData] Error importing data:', transaction.error);
        reject(transaction.error);
      };
    });
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrainingDataManager;
}
