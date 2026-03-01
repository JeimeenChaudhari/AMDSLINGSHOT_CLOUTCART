// Decision Engine
// Synthesizes all signals into final recommendation

class DecisionEngine {
  constructor() {
    this.weights = {
      authenticity: 0.30,
      fakeReview: 0.25,
      regret: 0.20,
      sentiment: 0.15,
      uniqueness: 0.10
    };
  }

  /**
   * Make decision based on all signals
   */
  async decide(productData) {
    const signals = this.extractSignals(productData);
    const overallScore = this.calculateOverallScore(signals);
    const reliabilityPenalty = this.calculateReliabilityPenalty(productData);
    const adjustedScore = overallScore * reliabilityPenalty;
    
    const decision = this.determineDecision(adjustedScore, signals);
    const confidence = this.calculateConfidence(adjustedScore, signals, reliabilityPenalty);
    const technicalFlags = this.generateTechnicalFlags(signals, productData);
    
    return {
      decision,
      confidence: Math.round(confidence),
      fake_review_probability: Math.round(signals.fake_review_probability * 100),
      authenticity_score: Math.round(signals.authenticity_score),
      regret_risk: Math.round(signals.regret_risk * 100),
      sentiment_distribution: signals.sentiment_distribution,
      explanation: this.generateExplanation(decision, signals, adjustedScore),
      technical_flags: technicalFlags
    };
  }

  extractSignals(productData) {
    return {
      authenticity_score: productData.authenticity_score || 50,
      fake_review_probability: productData.fake_review_probability || 0.5,
      regret_risk: productData.regret_risk || 0.3,
      sentiment_balance_score: productData.sentiment_balance_score || 0.7,
      unique_content_score: productData.unique_content_score || 0.6,
      sentiment_distribution: productData.sentiment_distribution || {
        positive: 60,
        neutral: 25,
        negative: 15
      }
    };
  }

  /**
   * Calculate overall quality score
   */
  calculateOverallScore(signals) {
    const score = (
      signals.authenticity_score * this.weights.authenticity +
      (100 - signals.fake_review_probability * 100) * this.weights.fakeReview +
      (100 - signals.regret_risk * 100) * this.weights.regret +
      signals.sentiment_balance_score * 100 * this.weights.sentiment +
      signals.unique_content_score * 100 * this.weights.uniqueness
    );
    
    return score;
  }

  /**
   * Calculate reliability penalty based on sample size
   */
  calculateReliabilityPenalty(productData) {
    const reviewCount = productData.reviewCount || 0;
    
    if (reviewCount < 5) return 0.4;
    if (reviewCount < 10) return 0.6;
    if (reviewCount < 20) return 0.8;
    if (reviewCount < 50) return 0.9;
    return 1.0;
  }

  determineDecision(adjustedScore, signals) {
    // Critical thresholds
    if (signals.fake_review_probability > 0.6) return 'AVOID';
    if (signals.authenticity_score < 30) return 'AVOID';
    if (signals.regret_risk > 0.4) return 'AVOID';
    if (adjustedScore < 40) return 'AVOID';
    
    // Wait conditions
    if (signals.fake_review_probability > 0.4) return 'WAIT';
    if (adjustedScore >= 40 && adjustedScore < 60) return 'WAIT';
    if (signals.authenticity_score < 50) return 'WAIT';
    
    // Consider conditions
    if (adjustedScore >= 60 && adjustedScore < 75) return 'CONSIDER';
    
    // Buy conditions
    if (adjustedScore >= 75) return 'BUY';
    if (signals.authenticity_score > 70 && 
        signals.fake_review_probability < 0.25 && 
        signals.regret_risk < 0.2) return 'BUY';
    
    return 'WAIT';
  }

  calculateConfidence(adjustedScore, signals, reliabilityPenalty) {
    let confidence = adjustedScore;
    
    // Modifiers
    if (signals.authenticity_score > 70) confidence += 10;
    if (signals.fake_review_probability < 0.2) confidence += 10;
    if (signals.fake_review_probability > 0.5) confidence -= 15;
    if (signals.regret_risk > 0.3) confidence -= 10;
    if (reliabilityPenalty < 0.7) confidence -= 20;
    
    return Math.max(30, Math.min(99, confidence));
  }

  generateTechnicalFlags(signals, productData) {
    const flags = [];
    
    if (signals.fake_review_probability > 0.5) flags.push('high_fake_probability');
    else if (signals.fake_review_probability > 0.3) flags.push('moderate_fake_probability');
    
    if (signals.authenticity_score < 40) flags.push('low_authenticity');
    else if (signals.authenticity_score < 60) flags.push('moderate_authenticity');
    
    if (signals.regret_risk > 0.3) flags.push('high_regret_risk');
    else if (signals.regret_risk > 0.15) flags.push('moderate_regret_risk');
    
    const reviewCount = productData.reviewCount || 0;
    if (reviewCount < 10) flags.push('low_sample_size');
    if (reviewCount < 5) flags.push('insufficient_data');
    
    return flags;
  }

  generateExplanation(decision, signals, adjustedScore) {
    const parts = [];
    
    // Overall assessment
    parts.push(`Overall quality score: ${Math.round(adjustedScore)}/100.`);
    
    // Authenticity
    if (signals.authenticity_score > 70) {
      parts.push(`Strong authenticity (${Math.round(signals.authenticity_score)}/100).`);
    } else if (signals.authenticity_score < 40) {
      parts.push(`Low authenticity (${Math.round(signals.authenticity_score)}/100) raises concerns.`);
    }
    
    // Fake reviews
    const fakePercent = Math.round(signals.fake_review_probability * 100);
    if (fakePercent > 50) {
      parts.push(`High fake review risk (${fakePercent}%).`);
    } else if (fakePercent > 30) {
      parts.push(`Moderate fake review concerns (${fakePercent}%).`);
    }
    
    // Regret risk
    const regretPercent = Math.round(signals.regret_risk * 100);
    if (regretPercent > 30) {
      parts.push(`Elevated regret risk (${regretPercent}%).`);
    }
    
    // Sentiment
    const sentiment = signals.sentiment_distribution;
    parts.push(`Sentiment: ${sentiment.positive}% positive, ${sentiment.negative}% negative.`);
    
    // Decision rationale
    if (decision === 'BUY') {
      parts.push('Conditions favor a confident purchase decision.');
    } else if (decision === 'AVOID') {
      parts.push('Multiple risk factors suggest avoiding this product.');
    } else if (decision === 'WAIT') {
      parts.push('Recommend waiting for more data or better conditions.');
    } else {
      parts.push('Mixed signals warrant careful consideration.');
    }
    
    return parts.join(' ');
  }

  /**
   * Decision with explainability (SHAP-like values)
   */
  async decideWithExplanation(productData) {
    const decision = await this.decide(productData);
    const signals = this.extractSignals(productData);
    
    // Calculate feature contributions (simplified SHAP)
    const shapValues = {
      authenticity: (signals.authenticity_score - 50) * this.weights.authenticity,
      fakeReview: (50 - signals.fake_review_probability * 100) * this.weights.fakeReview,
      regret: (50 - signals.regret_risk * 100) * this.weights.regret,
      sentiment: (signals.sentiment_balance_score * 100 - 50) * this.weights.sentiment,
      uniqueness: (signals.unique_content_score * 100 - 50) * this.weights.uniqueness
    };
    
    const featureImportance = {
      authenticity: Math.abs(shapValues.authenticity),
      fakeReview: Math.abs(shapValues.fakeReview),
      regret: Math.abs(shapValues.regret),
      sentiment: Math.abs(shapValues.sentiment),
      uniqueness: Math.abs(shapValues.uniqueness)
    };
    
    return {
      ...decision,
      shapValues,
      featureImportance
    };
  }

  /**
   * Generate counterfactual explanations
   */
  async decideWithCounterfactuals(productData) {
    const decision = await this.decide(productData);
    const counterfactuals = [];
    
    // What would change the decision?
    if (decision.decision === 'AVOID') {
      counterfactuals.push({
        change: 'Reduce fake review probability to <30%',
        newDecision: 'WAIT'
      });
      counterfactuals.push({
        change: 'Increase authenticity score to >70',
        newDecision: 'BUY'
      });
    } else if (decision.decision === 'WAIT') {
      counterfactuals.push({
        change: 'Increase authenticity to >75 and reduce fake reviews to <20%',
        newDecision: 'BUY'
      });
    }
    
    return {
      ...decision,
      counterfactuals
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DecisionEngine;
}
