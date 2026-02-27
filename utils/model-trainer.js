// Model Trainer
// Handles periodic retraining of the emotion ML model

class ModelTrainer {
  constructor(mlModel, trainingDataManager) {
    this.mlModel = mlModel;
    this.trainingDataManager = trainingDataManager;
    this.isTraining = false;
    this.lastTrainingTime = 0;
    this.trainingInterval = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Start automatic retraining scheduler
   */
  startAutoTraining() {
    console.log('[ModelTrainer] Auto-training started');
    
    // Initial training
    this.scheduleTraining();
    
    // Schedule periodic retraining
    setInterval(() => {
      this.scheduleTraining();
    }, this.trainingInterval);
  }

  async scheduleTraining() {
    if (this.isTraining) {
      console.log('[ModelTrainer] Training already in progress');
      return;
    }
    
    const now = Date.now();
    if (now - this.lastTrainingTime < this.trainingInterval) {
      return;
    }
    
    // Check if we have enough new data
    const stats = await this.trainingDataManager.getStatistics();
    
    if (stats.totalSamples < 10) {
      console.log('[ModelTrainer] Not enough samples for training:', stats.totalSamples);
      return;
    }
    
    await this.retrain();
  }

  /**
   * Retrain model with accumulated data
   */
  async retrain() {
    if (this.isTraining) return;
    
    this.isTraining = true;
    this.lastTrainingTime = Date.now();
    
    console.log('[ModelTrainer] Starting retraining...');
    
    try {
      // Get training samples (prioritize those with feedback)
      const samplesWithFeedback = await this.trainingDataManager.getTrainingSamples(50, true);
      const samplesWithoutFeedback = await this.trainingDataManager.getTrainingSamples(50, false);
      
      const allSamples = [...samplesWithFeedback, ...samplesWithoutFeedback];
      
      console.log('[ModelTrainer] Training with', allSamples.length, 'samples');
      
      // Train model with each sample
      for (const sample of allSamples) {
        const emotion = sample.correctedEmotion || sample.emotion;
        await this.mlModel.train(sample.features, emotion);
      }
      
      console.log('[ModelTrainer] Retraining complete');
      
      // Update training stats
      await this.updateTrainingStats(allSamples.length);
      
    } catch (error) {
      console.error('[ModelTrainer] Error during retraining:', error);
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * Train with implicit feedback (e.g., purchase = positive emotion)
   */
  async trainWithImplicitFeedback(features, action) {
    let emotion = null;
    
    // Map actions to emotions
    switch (action) {
      case 'purchase':
      case 'add_to_cart':
        emotion = 'Happy';
        break;
      case 'quick_exit':
      case 'close_tab':
        emotion = 'Disgusted';
        break;
      case 'long_hesitation':
        emotion = 'Anxious';
        break;
      case 'rapid_comparison':
        emotion = 'Surprised';
        break;
    }
    
    if (emotion && features) {
      await this.mlModel.train(features, emotion);
      console.log('[ModelTrainer] Trained with implicit feedback:', action, '->', emotion);
    }
  }

  async updateTrainingStats(sampleCount) {
    try {
      const stats = await this.trainingDataManager.getStatistics();
      
      await chrome.storage.local.set({
        trainingStats: {
          lastTrainingTime: this.lastTrainingTime,
          totalSamples: stats.totalSamples,
          totalFeedback: stats.totalFeedback,
          avgConfidence: stats.avgConfidence,
          emotionDistribution: stats.emotionCounts,
          lastTrainingSampleCount: sampleCount
        }
      });
    } catch (error) {
      console.error('[ModelTrainer] Error updating stats:', error);
    }
  }

  stopAutoTraining() {
    console.log('[ModelTrainer] Auto-training stopped');
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModelTrainer;
}
