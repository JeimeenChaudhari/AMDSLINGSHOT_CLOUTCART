// Bayesian Authenticity Scorer
// Implements probabilistic authenticity assessment

class AuthenticityScorer {
  constructor() {
    this.priorAuthentic = 0.7; // Prior probability of authentic review
  }

  /**
   * Score individual reviews for authenticity
   */
  async score(reviews) {
    return reviews.map(review => this.scoreReview(review));
  }

  scoreReview(review) {
    const text = this.extractText(review);
    const verified = this.isVerified(review);
    const rating = this.extractRating(review);
    
    let score = 50; // Base score
    
    // Verified purchase bonus
    if (verified) score += 20;
    else score -= 10;
    
    // Text quality
    const textQuality = this.scoreTextQuality(text);
    score += textQuality.uniqueness * 20;
    score += textQuality.specificity * 10;
    
    // Length check
    if (text.length < 30) score -= 20;
    else if (text.length > 100) score += 10;
    
    // Rating consistency
    const sentiment = this.quickSentiment(text);
    if (this.isConsistent(rating, sentiment)) {
      score += 15;
    } else {
      score -= 20;
    }
    
    return Math.max(0, Math.min(100, score));
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

  /**
   * Bayesian scoring with prior/posterior
   */
  async bayesianScore(review) {
    const evidence = this.collectEvidence(review);
    
    // Calculate likelihood
    const likelihood = this.calculateLikelihood(evidence);
    
    // Bayesian update
    const posterior = (likelihood * this.priorAuthentic) / 
                     ((likelihood * this.priorAuthentic) + ((1 - likelihood) * (1 - this.priorAuthentic)));
    
    // Confidence interval (simplified)
    const confidenceInterval = {
      lower: Math.max(0, posterior - 0.1),
      upper: Math.min(1, posterior + 0.1)
    };
    
    return {
      prior: this.priorAuthentic,
      likelihood,
      posterior,
      confidenceInterval,
      score: Math.round(posterior * 100)
    };
  }

  collectEvidence(review) {
    return {
      verified: this.isVerified(review),
      textLength: this.extractText(review).length,
      rating: this.extractRating(review),
      hasDetails: this.extractText(review).length > 100,
      reviewerHistory: review.reviewerHistory || null
    };
  }

  calculateLikelihood(evidence) {
    let likelihood = 0.5;
    
    if (evidence.verified) likelihood += 0.3;
    if (evidence.hasDetails) likelihood += 0.2;
    if (evidence.textLength > 50) likelihood += 0.1;
    if (evidence.reviewerHistory && evidence.reviewerHistory.totalReviews > 10) {
      likelihood += 0.1;
    }
    
    return Math.min(0.95, likelihood);
  }

  /**
   * Score set of reviews
   */
  async scoreSet(reviews) {
    const scores = await this.score(reviews);
    const verifiedCount = reviews.filter(r => this.isVerified(r)).length;
    
    return {
      averageAuthenticity: scores.reduce((a, b) => a + b, 0) / scores.length,
      verifiedRatio: verifiedCount / reviews.length,
      scores
    };
  }

  /**
   * Detect rating-text sentiment mismatch
   */
  async detectMismatch(review) {
    const rating = this.extractRating(review);
    const text = this.extractText(review);
    const sentiment = this.quickSentiment(text);
    
    const mismatchDetected = !this.isConsistent(rating, sentiment);
    
    return {
      mismatchDetected,
      rating,
      sentiment,
      severity: mismatchDetected ? Math.abs(rating - this.sentimentToRating(sentiment)) : 0
    };
  }

  quickSentiment(text) {
    const positive = ['great', 'excellent', 'amazing', 'love', 'perfect', 'best'];
    const negative = ['terrible', 'awful', 'worst', 'hate', 'bad', 'poor'];
    
    const textLower = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positive.forEach(word => {
      if (textLower.includes(word)) positiveCount++;
    });
    negative.forEach(word => {
      if (textLower.includes(word)) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  isConsistent(rating, sentiment) {
    if (rating >= 4 && sentiment === 'positive') return true;
    if (rating <= 2 && sentiment === 'negative') return true;
    if (rating === 3 && sentiment === 'neutral') return true;
    return false;
  }

  sentimentToRating(sentiment) {
    if (sentiment === 'positive') return 5;
    if (sentiment === 'negative') return 1;
    return 3;
  }

  /**
   * Score text quality and uniqueness
   */
  scoreTextQuality(text) {
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    
    // Uniqueness: ratio of unique words
    const uniqueness = uniqueWords.size / Math.max(words.length, 1);
    
    // Specificity: presence of numbers, specific details
    const hasNumbers = /\d+/.test(text);
    const hasSpecificWords = /\b(day|week|month|hour|inch|cm|mm|kg|lb)\b/i.test(text);
    const specificity = (hasNumbers ? 0.5 : 0) + (hasSpecificWords ? 0.5 : 0);
    
    return {
      uniqueness: Math.min(1, uniqueness * 2), // Scale up
      specificity
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthenticityScorer;
}
