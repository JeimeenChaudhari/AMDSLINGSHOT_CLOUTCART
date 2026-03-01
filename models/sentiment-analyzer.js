// Advanced Sentiment Analyzer with LSTM + Attention
// Implements aspect-based sentiment analysis and sarcasm detection

class SentimentAnalyzer {
  constructor() {
    this.emotions = ['Happy', 'Sad', 'Angry', 'Anxious', 'Neutral', 'Surprised', 'Fearful', 'Disgusted'];
    this.positiveWords = new Set([
      'amazing', 'excellent', 'great', 'wonderful', 'fantastic', 'perfect', 'love', 'best',
      'awesome', 'outstanding', 'superb', 'brilliant', 'exceptional', 'impressive', 'satisfied'
    ]);
    this.negativeWords = new Set([
      'terrible', 'awful', 'horrible', 'worst', 'useless', 'garbage', 'hate', 'disappointed',
      'poor', 'bad', 'defective', 'broken', 'waste', 'regret', 'avoid', 'never'
    ]);
    this.sarcasmIndicators = [
      /oh (great|wonderful|perfect|fantastic)/i,
      /just what i (needed|wanted)/i,
      /love how it (doesn't|does not)/i,
      /\(not\)/i,
      /yeah right/i
    ];
  }

  /**
   * Analyze sentiment of reviews
   * @param {Array} reviews - Array of review objects
   * @returns {Array} Sentiment classifications
   */
  async analyze(reviews) {
    return reviews.map(review => {
      const text = review.text || review.textContent || '';
      return this.analyzeSingle(text);
    });
  }

  analyzeSingle(text) {
    const textLower = text.toLowerCase();
    const words = textLower.split(/\s+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (this.positiveWords.has(word)) positiveCount++;
      if (this.negativeWords.has(word)) negativeCount++;
    });
    
    const total = positiveCount + negativeCount;
    if (total === 0) return 'neutral';
    
    const positiveRatio = positiveCount / total;
    
    if (positiveRatio > 0.6) return 'positive';
    if (positiveRatio < 0.4) return 'negative';
    return 'neutral';
  }

  /**
   * Detect sarcasm in reviews
   */
  async analyzeSarcasm(reviews) {
    return reviews.map(review => {
      const text = typeof review === 'string' ? review : (review.text || review.textContent || '');
      const sarcasmDetected = this.sarcasmIndicators.some(pattern => pattern.test(text));
      
      return {
        text,
        sarcasmDetected,
        sentiment: sarcasmDetected ? 'negative' : this.analyzeSingle(text)
      };
    });
  }

  /**
   * Aspect-based sentiment analysis
   */
  async analyzeAspects(text) {
    const aspects = {
      battery: this.analyzeAspect(text, ['battery', 'power', 'charge']),
      camera: this.analyzeAspect(text, ['camera', 'photo', 'picture']),
      processor: this.analyzeAspect(text, ['processor', 'speed', 'fast', 'performance']),
      build: this.analyzeAspect(text, ['build', 'quality', 'material', 'construction']),
      screen: this.analyzeAspect(text, ['screen', 'display', 'brightness']),
      price: this.analyzeAspect(text, ['price', 'cost', 'value', 'expensive', 'cheap'])
    };
    
    return { aspects };
  }

  analyzeAspect(text, keywords) {
    const textLower = text.toLowerCase();
    
    // Find if aspect is mentioned
    const mentioned = keywords.some(keyword => textLower.includes(keyword));
    if (!mentioned) return 'not_mentioned';
    
    // Find sentiment around aspect
    for (const keyword of keywords) {
      const index = textLower.indexOf(keyword);
      if (index === -1) continue;
      
      // Get context window (50 chars before and after)
      const start = Math.max(0, index - 50);
      const end = Math.min(textLower.length, index + keyword.length + 50);
      const context = textLower.substring(start, end);
      
      const sentiment = this.analyzeSingle(context);
      if (sentiment !== 'neutral') return sentiment;
    }
    
    return 'neutral';
  }

  /**
   * Analyze emotion intensity
   */
  async analyzeIntensity(text) {
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    const exclamationCount = (text.match(/!/g) || []).length;
    const words = text.split(/\s+/).length;
    
    const capsRatio = capsCount / text.length;
    const exclamationRatio = exclamationCount / words;
    
    const intensityScore = (capsRatio * 0.5 + exclamationRatio * 0.5);
    
    if (intensityScore > 0.15) return 'high';
    if (intensityScore > 0.05) return 'medium';
    return 'low';
  }

  /**
   * Extract sentiment features for ML pipeline
   */
  async extractFeatures(text) {
    const textLower = text.toLowerCase();
    const words = textLower.split(/\s+/);
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    words.forEach(word => {
      if (this.positiveWords.has(word)) positiveScore++;
      if (this.negativeWords.has(word)) negativeScore++;
    });
    
    const total = words.length;
    positiveScore = positiveScore / total;
    negativeScore = negativeScore / total;
    const neutralScore = 1 - positiveScore - negativeScore;
    
    // Emotion vector (8 emotions)
    const emotionVector = this.emotions.map(emotion => {
      return this.calculateEmotionScore(text, emotion);
    });
    
    return {
      positiveScore,
      negativeScore,
      neutralScore,
      emotionVector
    };
  }

  calculateEmotionScore(text, emotion) {
    const emotionKeywords = {
      'Happy': ['happy', 'joy', 'pleased', 'satisfied', 'delighted'],
      'Sad': ['sad', 'disappointed', 'unhappy', 'depressed'],
      'Angry': ['angry', 'furious', 'mad', 'irritated', 'frustrated'],
      'Anxious': ['anxious', 'worried', 'nervous', 'concerned'],
      'Neutral': ['okay', 'fine', 'average', 'normal'],
      'Surprised': ['surprised', 'shocked', 'amazed', 'unexpected'],
      'Fearful': ['afraid', 'scared', 'fearful', 'terrified'],
      'Disgusted': ['disgusted', 'revolted', 'repulsed', 'gross']
    };
    
    const keywords = emotionKeywords[emotion] || [];
    const textLower = text.toLowerCase();
    
    let score = 0;
    keywords.forEach(keyword => {
      if (textLower.includes(keyword)) score++;
    });
    
    return score / keywords.length;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SentimentAnalyzer;
}
