// Ensemble Fake Review Detector
// Uses multiple signals to detect fake reviews

class FakeReviewDetector {
  constructor() {
    this.models = ['randomForest', 'gradientBoosting', 'neuralNetwork'];
  }

  /**
   * Predict fake reviews using ensemble
   */
  async predict(reviews) {
    return reviews.map(review => {
      const features = this.extractFeatures(review);
      const prediction = this.ensemblePredict(features);
      
      return {
        isFake: prediction.finalPrediction === 'fake',
        confidence: prediction.confidence,
        votes: prediction.votes
      };
    });
  }

  extractFeatures(review) {
    const text = this.extractText(review);
    
    return {
      length: text.length,
      capsRatio: (text.match(/[A-Z]/g) || []).length / text.length,
      exclamationCount: (text.match(/!/g) || []).length,
      genericPhraseCount: this.countGenericPhrases(text),
      verified: this.isVerified(review),
      rating: this.extractRating(review)
    };
  }

  extractText(review) {
    if (typeof review === 'string') return review;
    return review.text || review.textContent || '';
  }

  isVerified(review) {
    if (typeof review === 'string') return false;
    const text = this.extractText(review);
    return text.toLowerCase().includes('verified purchase') || review.verified === true;
  }

  extractRating(review) {
    if (typeof review === 'string') return 3;
    return review.rating || 3;
  }

  countGenericPhrases(text) {
    const genericPhrases = [
      'highly recommend', 'best product ever', 'changed my life',
      'must buy', 'waste of money', 'don\'t buy'
    ];
    
    const textLower = text.toLowerCase();
    return genericPhrases.filter(phrase => textLower.includes(phrase)).length;
  }

  /**
   * Ensemble prediction with voting
   */
  ensemblePredict(features) {
    const votes = this.models.map(model => this.predictWithModel(model, features));
    
    const fakeVotes = votes.filter(v => v.prediction === 'fake').length;
    const finalPrediction = fakeVotes >= 2 ? 'fake' : 'authentic';
    const confidence = fakeVotes / votes.length;
    
    return {
      votes,
      finalPrediction,
      confidence
    };
  }

  predictWithModel(modelName, features) {
    // Simplified model predictions
    let score = 0;
    
    if (!features.verified) score += 0.3;
    if (features.length < 30) score += 0.25;
    if (features.genericPhraseCount > 2) score += 0.25;
    if (features.exclamationCount > 5) score += 0.1;
    if (features.capsRatio > 0.15) score += 0.1;
    
    const prediction = score > 0.5 ? 'fake' : 'authentic';
    
    return {
      model: modelName,
      prediction,
      score
    };
  }

  /**
   * Detect review bombing
   */
  async detectReviewBombing(reviews) {
    const dates = {};
    
    reviews.forEach(review => {
      const date = this.extractDate(review);
      dates[date] = (dates[date] || 0) + 1;
    });
    
    const maxSameDay = Math.max(...Object.values(dates), 0);
    const bombingDetected = maxSameDay > 10;
    
    let suspiciousTimeWindow = null;
    if (bombingDetected) {
      suspiciousTimeWindow = Object.keys(dates).find(date => dates[date] === maxSameDay);
    }
    
    return {
      bombingDetected,
      suspiciousTimeWindow,
      maxReviewsInOneDay: maxSameDay
    };
  }

  extractDate(review) {
    if (typeof review === 'string') return new Date().toISOString().split('T')[0];
    return review.date || new Date().toISOString().split('T')[0];
  }

  /**
   * Predict with calibrated confidence
   */
  async predictWithCalibration(reviews) {
    const predictions = await this.predict(reviews);
    
    // Calibrate confidence scores
    return predictions.map(pred => ({
      ...pred,
      confidence: this.calibrateConfidence(pred.confidence)
    }));
  }

  calibrateConfidence(rawConfidence) {
    // Simple calibration: compress extreme confidences
    if (rawConfidence > 0.9) return 0.85 + (rawConfidence - 0.9) * 0.5;
    if (rawConfidence < 0.1) return 0.15 - (0.1 - rawConfidence) * 0.5;
    return rawConfidence;
  }

  /**
   * Provide feature importance
   */
  async predictWithExplanation(review) {
    const features = this.extractFeatures(review);
    const prediction = this.ensemblePredict(features);
    
    const featureImportance = {
      verified: features.verified ? -0.3 : 0.3,
      length: features.length < 30 ? 0.25 : -0.1,
      genericPhrases: features.genericPhraseCount * 0.125,
      exclamations: features.exclamationCount > 5 ? 0.1 : 0,
      caps: features.capsRatio > 0.15 ? 0.1 : 0
    };
    
    return {
      ...prediction,
      featureImportance,
      features
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FakeReviewDetector;
}
