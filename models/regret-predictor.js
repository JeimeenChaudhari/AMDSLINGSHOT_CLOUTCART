// Deep Regret Risk Predictor
// Predicts purchase regret probability

class RegretPredictor {
  constructor() {
    this.regretPhrases = [
      'regret', 'waste of money', 'not worth', 'disappointed', 'expected better',
      'misleading', 'returned', 'refund', 'don\'t buy', 'save your money', 'avoid',
      'terrible mistake', 'wish i hadn\'t', 'should have read', 'buyer beware'
    ];
    
    this.qualityComplaints = [
      'broke', 'broken', 'defective', 'poor quality', 'cheap', 'flimsy',
      'stopped working', 'doesn\'t work', 'not as described', 'fake'
    ];
  }

  /**
   * Predict regret risk for reviews
   */
  async predict(reviews) {
    return reviews.map(review => {
      const text = this.extractText(review);
      const risk = this.calculateRegretRisk(text);
      
      return {
        review,
        risk: Math.round(risk * 100),
        indicators: this.extractRegretIndicators(text)
      };
    });
  }

  extractText(review) {
    if (typeof review === 'string') return review;
    return review.text || review.textContent || '';
  }

  calculateRegretRisk(text) {
    const textLower = text.toLowerCase();
    
    let regretScore = 0;
    let qualityScore = 0;
    let returnScore = 0;
    
    // Check regret phrases
    this.regretPhrases.forEach(phrase => {
      if (textLower.includes(phrase)) regretScore += 0.15;
    });
    
    // Check quality complaints
    this.qualityComplaints.forEach(complaint => {
      if (textLower.includes(complaint)) qualityScore += 0.1;
    });
    
    // Check return mentions
    if (this.detectReturnMentions(text).returnMentioned) {
      returnScore = 0.25;
    }
    
    const totalRisk = Math.min(1, regretScore * 0.4 + qualityScore * 0.35 + returnScore * 0.25);
    
    return totalRisk;
  }

  /**
   * Extract regret phrases from text
   */
  async extractRegretPhrases(text) {
    const textLower = text.toLowerCase();
    const foundPhrases = [];
    
    this.regretPhrases.forEach(phrase => {
      if (textLower.includes(phrase)) {
        foundPhrases.push(phrase);
      }
    });
    
    const regretScore = foundPhrases.length / this.regretPhrases.length;
    
    return {
      phrases: foundPhrases,
      regretScore
    };
  }

  extractRegretIndicators(text) {
    const indicators = [];
    const textLower = text.toLowerCase();
    
    this.regretPhrases.forEach(phrase => {
      if (textLower.includes(phrase)) {
        indicators.push(phrase);
      }
    });
    
    return indicators;
  }

  /**
   * Detect return/refund mentions
   */
  detectReturnMentions(text) {
    const returnKeywords = ['return', 'returned', 'refund', 'sent back', 'sending back'];
    const textLower = text.toLowerCase();
    
    const returnMentioned = returnKeywords.some(keyword => textLower.includes(keyword));
    
    return {
      returnMentioned,
      keywords: returnKeywords.filter(k => textLower.includes(k))
    };
  }

  /**
   * Predict with probability distribution
   */
  async predictWithDistribution(review) {
    const text = this.extractText(review);
    const probability = this.calculateRegretRisk(text);
    
    // Simple distribution (beta-like)
    const distribution = {
      low: Math.max(0, 1 - probability - 0.2),
      medium: Math.min(1, probability < 0.5 ? probability * 2 : (1 - probability) * 2),
      high: Math.max(0, probability - 0.5) * 2
    };
    
    const confidenceInterval = {
      lower: Math.max(0, probability - 0.1),
      upper: Math.min(1, probability + 0.1)
    };
    
    return {
      probability,
      distribution,
      confidenceInterval
    };
  }

  /**
   * Detect quality complaint patterns
   */
  async detectQualityComplaints(text) {
    const textLower = text.toLowerCase();
    const foundComplaints = [];
    
    this.qualityComplaints.forEach(complaint => {
      if (textLower.includes(complaint)) {
        foundComplaints.push(complaint);
      }
    });
    
    return {
      qualityIssueDetected: foundComplaints.length > 0,
      complaints: foundComplaints,
      severity: foundComplaints.length / this.qualityComplaints.length
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RegretPredictor;
}
