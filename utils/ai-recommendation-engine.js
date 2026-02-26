// AI Recommendation Engine with Fake Review Detection
// Multi-factor decision system with emotional context awareness

class AIRecommendationEngine {
  constructor() {
    this.fakeReviewDetector = new FakeReviewDetector();
    this.emotionalFactors = {
      'Happy': { impulsivity: 0.7, riskTolerance: 0.8, decisionClarity: 0.9 },
      'Neutral': { impulsivity: 0.3, riskTolerance: 0.5, decisionClarity: 0.8 },
      'Anxious': { impulsivity: 0.6, riskTolerance: 0.2, decisionClarity: 0.4 },
      'Fearful': { impulsivity: 0.4, riskTolerance: 0.1, decisionClarity: 0.3 },
      'Angry': { impulsivity: 0.8, riskTolerance: 0.6, decisionClarity: 0.5 },
      'Sad': { impulsivity: 0.5, riskTolerance: 0.3, decisionClarity: 0.6 },
      'Surprised': { impulsivity: 0.7, riskTolerance: 0.5, decisionClarity: 0.6 },
      'Disgusted': { impulsivity: 0.2, riskTolerance: 0.2, decisionClarity: 0.7 }
    };
  }

  /**
   * Generate comprehensive AI recommendation
   * @param {Object} productData - Product information
   * @param {string} emotion - Current user emotion
   * @param {Object} behaviorData - User browsing behavior
   * @param {Array} reviews - Product reviews
   * @returns {Object} Recommendation with reasoning and confidence
   */
  async generateRecommendation(productData, emotion, behaviorData, reviews = []) {
    const { rating, reviewCount, currentPrice, historicalPrice } = productData;
    
    // Multi-factor analysis
    const reviewAnalysis = await this.analyzeReviewAuthenticity(reviews);
    const emotionalContext = this.analyzeEmotionalState(emotion, behaviorData);
    const priceAnalysis = this.analyzePriceTrend(currentPrice, historicalPrice);
    const ratingAnalysis = this.analyzeRatingQuality(rating, reviewCount);
    
    // Calculate decision factors
    const factors = {
      reviewTrustworthiness: reviewAnalysis.trustScore,
      emotionalStability: emotionalContext.stabilityScore,
      priceAdvantage: priceAnalysis.advantageScore,
      ratingConsistency: ratingAnalysis.consistencyScore,
      fakeReviewRisk: reviewAnalysis.fakeReviewRisk
    };
    
    // Generate decision
    const decision = this.makeDecision(factors, emotionalContext);
    
    // Calculate dynamic confidence
    const confidence = this.calculateConfidence(factors, emotionalContext);
    
    // Generate contextual reasoning
    const reasoning = this.generateReasoning(
      decision,
      factors,
      emotionalContext,
      priceAnalysis,
      reviewAnalysis,
      ratingAnalysis
    );
    
    return {
      decision: decision.recommendation,
      confidence: Math.round(confidence),
      reasoning,
      factors,
      warnings: this.generateWarnings(factors, emotionalContext, reviewAnalysis),
      reviewAnalysis: {
        fakeReviewPercentage: reviewAnalysis.fakePercentage,
        authenticReviews: reviewAnalysis.authenticCount,
        suspiciousPatterns: reviewAnalysis.suspiciousPatterns
      }
    };
  }

  /**
   * Analyze review authenticity with ML-inspired fake detection
   */
  async analyzeReviewAuthenticity(reviews) {
    if (!reviews || reviews.length === 0) {
      return {
        trustScore: 0.3,
        fakeReviewRisk: 0.7,
        fakePercentage: 0,
        authenticCount: 0,
        suspiciousPatterns: ['No reviews available']
      };
    }

    const analysis = this.fakeReviewDetector.detectFakeReviews(reviews);
    
    const trustScore = Math.max(0, Math.min(1, 
      (analysis.authenticCount / reviews.length) * 
      (1 - analysis.fakePercentage / 100) * 
      (analysis.verifiedPurchaseRatio)
    ));
    
    return {
      trustScore,
      fakeReviewRisk: analysis.fakePercentage / 100,
      fakePercentage: analysis.fakePercentage,
      authenticCount: analysis.authenticCount,
      suspiciousPatterns: analysis.suspiciousPatterns,
      verifiedPurchaseRatio: analysis.verifiedPurchaseRatio
    };
  }

  /**
   * Analyze emotional state and browsing behavior
   */
  analyzeEmotionalState(emotion, behaviorData) {
    const emotionProfile = this.emotionalFactors[emotion] || this.emotionalFactors['Neutral'];
    const { clicks = 0, timeSpent = 0, scrolls = 0 } = behaviorData || {};
    
    // Detect behavioral patterns
    const isRushed = clicks > 15 && timeSpent < 30000; // Many clicks, short time
    const isHesitant = scrolls > 20 && clicks < 5; // Lots of scrolling, few clicks
    const isImpulsive = clicks > 10 && timeSpent < 20000;
    const isDeliberative = timeSpent > 120000 && clicks < 10; // Long time, few clicks
    
    let stabilityScore = emotionProfile.decisionClarity;
    let behaviorPattern = 'Calm browsing';
    
    if (isRushed) {
      stabilityScore *= 0.6;
      behaviorPattern = 'Rushed navigation';
    } else if (isHesitant) {
      stabilityScore *= 0.7;
      behaviorPattern = 'Hesitant exploration';
    } else if (isImpulsive) {
      stabilityScore *= 0.5;
      behaviorPattern = 'Impulsive behavior';
    } else if (isDeliberative) {
      stabilityScore *= 1.2;
      behaviorPattern = 'Deliberative research';
    }
    
    return {
      emotion,
      stabilityScore: Math.min(1, stabilityScore),
      impulsivity: emotionProfile.impulsivity,
      riskTolerance: emotionProfile.riskTolerance,
      behaviorPattern,
      isRushed,
      isHesitant,
      isImpulsive,
      isDeliberative
    };
  }

  /**
   * Analyze price trends
   */
  analyzePriceTrend(currentPrice, historicalPrice) {
    if (!historicalPrice || historicalPrice.length === 0) {
      return {
        advantageScore: 0.5,
        trend: 'Unknown',
        priceChange: 0,
        isGoodDeal: false
      };
    }
    
    const avgHistorical = historicalPrice.reduce((a, b) => a + b, 0) / historicalPrice.length;
    const priceChange = ((currentPrice - avgHistorical) / avgHistorical) * 100;
    
    let advantageScore = 0.5;
    let trend = 'Stable';
    let isGoodDeal = false;
    
    if (priceChange < -15) {
      advantageScore = 0.9;
      trend = 'Significant drop';
      isGoodDeal = true;
    } else if (priceChange < -5) {
      advantageScore = 0.75;
      trend = 'Price drop';
      isGoodDeal = true;
    } else if (priceChange > 15) {
      advantageScore = 0.2;
      trend = 'Price spike';
    } else if (priceChange > 5) {
      advantageScore = 0.4;
      trend = 'Price increase';
    }
    
    return { advantageScore, trend, priceChange, isGoodDeal };
  }

  /**
   * Analyze rating quality and consistency
   */
  analyzeRatingQuality(rating, reviewCount) {
    let consistencyScore = 0.5;
    
    if (reviewCount < 10) {
      consistencyScore = 0.3;
    } else if (reviewCount < 50) {
      consistencyScore = 0.5;
    } else if (reviewCount < 200) {
      consistencyScore = 0.7;
    } else {
      consistencyScore = 0.9;
    }
    
    // Adjust for rating value
    if (rating >= 4.5) {
      consistencyScore *= 1.1;
    } else if (rating < 3.5) {
      consistencyScore *= 0.7;
    }
    
    return {
      consistencyScore: Math.min(1, consistencyScore),
      isWellRated: rating >= 4.0 && reviewCount >= 50,
      hasEnoughReviews: reviewCount >= 20
    };
  }

  /**
   * Make final decision based on all factors
   */
  makeDecision(factors, emotionalContext) {
    const { reviewTrustworthiness, emotionalStability, priceAdvantage, ratingConsistency, fakeReviewRisk } = factors;
    
    // Weighted decision score
    const decisionScore = (
      reviewTrustworthiness * 0.30 +
      emotionalStability * 0.20 +
      priceAdvantage * 0.25 +
      ratingConsistency * 0.25
    );
    
    // Apply emotional modifiers
    let recommendation = 'WAIT';
    
    if (fakeReviewRisk > 0.4) {
      recommendation = 'AVOID';
    } else if (emotionalContext.isImpulsive && decisionScore < 0.8) {
      recommendation = 'WAIT';
    } else if (emotionalContext.isRushed) {
      recommendation = 'WAIT';
    } else if (decisionScore >= 0.75) {
      recommendation = 'BUY';
    } else if (decisionScore >= 0.55) {
      recommendation = 'WAIT';
    } else {
      recommendation = 'AVOID';
    }
    
    return { recommendation, decisionScore };
  }

  /**
   * Calculate dynamic confidence score
   */
  calculateConfidence(factors, emotionalContext) {
    const { reviewTrustworthiness, emotionalStability, priceAdvantage, ratingConsistency, fakeReviewRisk } = factors;
    
    // Base confidence from data quality
    let confidence = (
      reviewTrustworthiness * 30 +
      ratingConsistency * 25 +
      priceAdvantage * 20 +
      (1 - fakeReviewRisk) * 25
    );
    
    // Emotional stability modifier
    confidence *= emotionalStability;
    
    // Behavioral pattern adjustments
    if (emotionalContext.isRushed || emotionalContext.isImpulsive) {
      confidence *= 0.7; // Lower confidence for rushed decisions
    }
    
    if (emotionalContext.isHesitant) {
      confidence *= 0.8; // Slightly lower for hesitation
    }
    
    if (emotionalContext.isDeliberative) {
      confidence *= 1.1; // Higher for careful research
    }
    
    // High fake review risk drastically reduces confidence
    if (fakeReviewRisk > 0.5) {
      confidence *= 0.5;
    }
    
    return Math.max(30, Math.min(99, confidence));
  }

  /**
   * Generate contextual reasoning explanation
   */
  generateReasoning(decision, factors, emotionalContext, priceAnalysis, reviewAnalysis, ratingAnalysis) {
    const parts = [];
    
    // 1. Emotional state interpretation
    const emotionText = this.getEmotionalStateText(emotionalContext);
    parts.push(emotionText);
    
    // 2. Review authenticity insight
    const reviewText = this.getReviewAuthenticityText(reviewAnalysis, factors.fakeReviewRisk);
    parts.push(reviewText);
    
    // 3. Product satisfaction trend
    const satisfactionText = this.getSatisfactionTrendText(ratingAnalysis, factors.ratingConsistency);
    parts.push(satisfactionText);
    
    // 4. Price timing insight
    const priceText = this.getPriceTimingText(priceAnalysis);
    parts.push(priceText);
    
    // 5. Risk/regret indicator
    const riskText = this.getRiskIndicatorText(decision, emotionalContext, factors);
    parts.push(riskText);
    
    return parts.join(' ');
  }

  getEmotionalStateText(emotionalContext) {
    const { emotion, behaviorPattern, isRushed, isHesitant, isImpulsive } = emotionalContext;
    
    if (isRushed) {
      return `Your ${emotion.toLowerCase()} state with rushed navigation suggests taking a pause before deciding.`;
    } else if (isHesitant) {
      return `Your ${emotion.toLowerCase()} browsing shows careful consideration, which is wise for this purchase.`;
    } else if (isImpulsive) {
      return `Detected ${emotion.toLowerCase()} emotion with impulsive patterns—consider waiting to avoid regret.`;
    } else {
      return `Your ${emotion.toLowerCase()} state indicates ${behaviorPattern.toLowerCase()}, suitable for decision-making.`;
    }
  }

  getReviewAuthenticityText(reviewAnalysis, fakeReviewRisk) {
    if (fakeReviewRisk > 0.5) {
      return `⚠️ High fake review risk (${Math.round(reviewAnalysis.fakePercentage)}% suspicious)—authenticity is questionable.`;
    } else if (fakeReviewRisk > 0.3) {
      return `${reviewAnalysis.authenticCount} authentic reviews found, but ${Math.round(reviewAnalysis.fakePercentage)}% show suspicious patterns.`;
    } else if (reviewAnalysis.verifiedPurchaseRatio > 0.7) {
      return `Strong review authenticity with ${Math.round(reviewAnalysis.verifiedPurchaseRatio * 100)}% verified purchases.`;
    } else {
      return `Review sentiment appears genuine with ${reviewAnalysis.authenticCount} authentic reviews detected.`;
    }
  }

  getSatisfactionTrendText(ratingAnalysis) {
    if (ratingAnalysis.isWellRated) {
      return `Product shows consistent satisfaction with stable ratings across ${ratingAnalysis.hasEnoughReviews ? 'many' : 'several'} reviews.`;
    } else if (!ratingAnalysis.hasEnoughReviews) {
      return `Limited review history makes satisfaction trends uncertain—more data needed.`;
    } else {
      return `Rating consistency is moderate—customer satisfaction varies.`;
    }
  }

  getPriceTimingText(priceAnalysis) {
    if (priceAnalysis.isGoodDeal) {
      return `Price is ${Math.abs(Math.round(priceAnalysis.priceChange))}% below average—favorable timing for purchase.`;
    } else if (priceAnalysis.trend === 'Price spike') {
      return `Current price is ${Math.round(priceAnalysis.priceChange)}% above average—consider waiting for a drop.`;
    } else if (priceAnalysis.trend === 'Price increase') {
      return `Price trending upward by ${Math.round(priceAnalysis.priceChange)}%—timing is suboptimal.`;
    } else {
      return `Price is stable with no significant trends detected.`;
    }
  }

  getRiskIndicatorText(decision, emotionalContext, factors) {
    const { fakeReviewRisk, emotionalStability } = factors;
    
    if (decision.recommendation === 'AVOID') {
      return `⛔ High regret likelihood—multiple risk factors present.`;
    } else if (fakeReviewRisk > 0.4 || emotionalStability < 0.5) {
      return `⚠️ Moderate risk of post-purchase regret due to uncertainty factors.`;
    } else if (emotionalContext.isImpulsive) {
      return `Impulsive buying detected—waiting reduces regret risk by 60%.`;
    } else if (decision.decisionScore > 0.75) {
      return `✓ Low regret risk—conditions favor a confident decision.`;
    } else {
      return `Moderate confidence—additional research recommended.`;
    }
  }

  generateWarnings(factors, emotionalContext, reviewAnalysis) {
    const warnings = [];
    
    if (factors.fakeReviewRisk > 0.4) {
      warnings.push(`⚠️ ${Math.round(reviewAnalysis.fakePercentage)}% of reviews appear fake or manipulated`);
    }
    
    if (emotionalContext.isImpulsive || emotionalContext.isRushed) {
      warnings.push('⚠️ Your current browsing pattern suggests impulsive behavior');
    }
    
    if (factors.emotionalStability < 0.5) {
      warnings.push('⚠️ Your emotional state may affect decision quality');
    }
    
    if (reviewAnalysis.suspiciousPatterns.length > 0) {
      warnings.push(`⚠️ Suspicious patterns: ${reviewAnalysis.suspiciousPatterns.slice(0, 2).join(', ')}`);
    }
    
    return warnings;
  }
}

/**
 * Fake Review Detector with ML-inspired pattern recognition
 */
class FakeReviewDetector {
  constructor() {
    this.suspiciousPatterns = {
      repeatedChars: /(.)\1{5,}/,
      excessiveSuperlatives: /amazing.*perfect.*best|worst.*terrible.*awful/i,
      urgencyLanguage: /\b(buy|purchase|order)\s+(now|today|immediately)\b/i,
      genericPhrases: /(highly recommend|best product ever|changed my life|must buy|waste of money|don't buy)/i,
      excessiveCaps: /\b[A-Z]{4,}\b/g,
      excessivePunctuation: /[!?]{3,}/g
    };
  }

  detectFakeReviews(reviews) {
    const results = reviews.map(review => this.analyzeReview(review));
    
    const fakeCount = results.filter(r => r.isFake).length;
    const authenticCount = results.filter(r => !r.isFake).length;
    const verifiedCount = results.filter(r => r.isVerified).length;
    
    const fakePercentage = reviews.length > 0 ? (fakeCount / reviews.length) * 100 : 0;
    const verifiedPurchaseRatio = reviews.length > 0 ? verifiedCount / reviews.length : 0;
    
    const suspiciousPatterns = this.detectCollectivePatterns(reviews, results);
    
    return {
      fakeCount,
      authenticCount,
      fakePercentage,
      verifiedPurchaseRatio,
      suspiciousPatterns,
      detailedResults: results
    };
  }

  analyzeReview(reviewElement) {
    const text = reviewElement.textContent || '';
    const textLower = text.toLowerCase();
    
    let suspicionScore = 0;
    const flags = [];
    
    // Check verified purchase
    const isVerified = textLower.includes('verified purchase') || 
                       textLower.includes('verified buyer');
    if (!isVerified) {
      suspicionScore += 15;
      flags.push('Not verified');
    }
    
    // Length analysis
    if (text.length < 30) {
      suspicionScore += 25;
      flags.push('Too short');
    } else if (text.length > 3000) {
      suspicionScore += 10;
      flags.push('Unusually long');
    }
    
    // Pattern matching
    Object.entries(this.suspiciousPatterns).forEach(([name, pattern]) => {
      if (pattern.test(text)) {
        suspicionScore += 15;
        flags.push(name);
      }
    });
    
    // Excessive punctuation
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 5) {
      suspicionScore += 10;
      flags.push('Excessive exclamations');
    }
    
    // Generic phrase density
    const genericMatches = text.match(this.suspiciousPatterns.genericPhrases) || [];
    if (genericMatches.length > 2) {
      suspicionScore += 20;
      flags.push('Generic language');
    }
    
    // Sentiment extremity (all positive or all negative words)
    const positiveWords = (textLower.match(/\b(amazing|perfect|excellent|great|wonderful|fantastic)\b/g) || []).length;
    const negativeWords = (textLower.match(/\b(terrible|awful|horrible|worst|useless|garbage)\b/g) || []).length;
    
    if (positiveWords > 8 || negativeWords > 8) {
      suspicionScore += 15;
      flags.push('Extreme sentiment');
    }
    
    const isFake = suspicionScore >= 40;
    
    return {
      isFake,
      suspicionScore,
      isVerified,
      flags,
      text: text.substring(0, 100)
    };
  }

  detectCollectivePatterns(reviews, results) {
    const patterns = [];
    
    // Check for review bombing (many reviews same day)
    const dates = {};
    reviews.forEach(review => {
      const dateEl = review.querySelector('[data-hook="review-date"], .review-date, time');
      if (dateEl) {
        const date = dateEl.textContent.trim();
        dates[date] = (dates[date] || 0) + 1;
      }
    });
    
    const maxSameDay = Math.max(...Object.values(dates), 0);
    if (maxSameDay > 10) {
      patterns.push('Review bombing detected');
    }
    
    // Check for similar language across reviews
    const texts = results.map(r => r.text.toLowerCase());
    let similarityCount = 0;
    for (let i = 0; i < texts.length - 1; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        if (this.calculateSimilarity(texts[i], texts[j]) > 0.7) {
          similarityCount++;
        }
      }
    }
    
    if (similarityCount > reviews.length * 0.2) {
      patterns.push('Duplicate content detected');
    }
    
    // Check for extreme rating distribution
    const fakePercentage = (results.filter(r => r.isFake).length / reviews.length) * 100;
    if (fakePercentage > 50) {
      patterns.push('Majority fake reviews');
    }
    
    return patterns;
  }

  calculateSimilarity(text1, text2) {
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    const commonWords = words1.filter(w => words2.includes(w)).length;
    return commonWords / Math.max(words1.length, words2.length);
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIRecommendationEngine, FakeReviewDetector };
}
