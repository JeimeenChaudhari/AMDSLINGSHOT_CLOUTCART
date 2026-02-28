/**
 * Test Data Generator for AI Review Analyzer
 * Generates synthetic review data for comprehensive testing
 */

class TestDataGenerator {
  constructor() {
    this.fakeReviewTemplates = [
      "This [product] is [adjective]! I [verb] it!",
      "[Product] works [adverb]. [Recommendation].",
      "Amazing [product]! [Positive phrase]!"
    ];
    
    this.regretPhrases = [
      'regret buying', 'waste of money', 'disappointed', 'not worth it',
      'returned', 'refund', 'terrible mistake', 'save your money'
    ];
    
    this.sarcasticPatterns = [
      'Oh great', 'Wow, this is exactly', 'Perfect!', 'Love how it'
    ];
  }
  
  generatePositiveReviews(count) {
    const reviews = [];
    const positiveWords = ['excellent', 'amazing', 'great', 'fantastic', 'wonderful', 'perfect'];
    
    for (let i = 0; i < count; i++) {
      const word = positiveWords[Math.floor(Math.random() * positiveWords.length)];
      reviews.push({
        text: `This is a ${word} product. Highly recommend it!`,
        rating: 4 + Math.random(),
        verified: Math.random() > 0.3,
        label: 'positive'
      });
    }
    
    return reviews;
  }
  
  generateNegativeReviews(count) {
    const reviews = [];
    const negativeWords = ['terrible', 'awful', 'poor', 'disappointing', 'waste', 'broken'];
    
    for (let i = 0; i < count; i++) {
      const word = negativeWords[Math.floor(Math.random() * negativeWords.length)];
      reviews.push({
        text: `This is a ${word} product. Do not buy it.`,
        rating: 1 + Math.random(),
        verified: Math.random() > 0.3,
        label: 'negative'
      });
    }
    
    return reviews;
  }
  
  generateDuplicateReviews(count, similarity = 1.0) {
    const reviews = [];
    const baseText = "This product is amazing and works perfectly!";
    
    for (let i = 0; i < count / 2; i++) {
      reviews.push({
        text: baseText,
        rating: 5,
        verified: false
      });
      
      if (similarity < 1.0) {
        const modified = this.modifyText(baseText, similarity);
        reviews.push({
          text: modified,
          rating: 5,
          verified: false
        });
      } else {
        reviews.push({
          text: baseText,
          rating: 5,
          verified: false
        });
      }
    }
    
    return reviews;
  }
  
  generateNearDuplicates(count, similarity) {
    const reviews = [];
    const templates = [
      "Great product, works well",
      "Excellent quality, highly recommend",
      "Amazing purchase, very satisfied"
    ];
    
    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      const modified = this.modifyText(template, similarity);
      reviews.push({
        text: modified,
        rating: 4 + Math.random(),
        verified: Math.random() > 0.5
      });
    }
    
    return reviews;
  }
  
  generateTemplateReviews(templates, count) {
    const reviews = [];
    const adjectives = ['amazing', 'great', 'excellent', 'fantastic'];
    const verbs = ['love', 'recommend', 'enjoy'];
    const adverbs = ['perfectly', 'wonderfully', 'excellently'];
    
    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      let text = template
        .replace('[product]', 'product')
        .replace('[adjective]', adjectives[Math.floor(Math.random() * adjectives.length)])
        .replace('[verb]', verbs[Math.floor(Math.random() * verbs.length)])
        .replace('[adverb]', adverbs[Math.floor(Math.random() * adverbs.length)])
        .replace('[Recommendation]', 'Highly recommend')
        .replace('[Positive phrase]', 'Best purchase ever');
      
      reviews.push({
        text,
        rating: 5,
        verified: false
      });
    }
    
    return reviews;
  }
  
  generateAuthenticReviews(count) {
    const reviews = [];
    const specificDetails = [
      'The battery lasts 12 hours on a single charge',
      'The camera quality is excellent in low light conditions',
      'Build quality feels premium with the aluminum frame',
      'Setup took about 15 minutes and was straightforward',
      'Customer service responded within 24 hours'
    ];
    
    for (let i = 0; i < count; i++) {
      const detail = specificDetails[Math.floor(Math.random() * specificDetails.length)];
      reviews.push({
        text: `After using this for 2 weeks, I can say ${detail}. Overall satisfied with my purchase.`,
        rating: 3 + Math.random() * 2,
        verified: true,
        reviewerHistory: {
          totalReviews: 10 + Math.floor(Math.random() * 50),
          helpfulVotes: 50 + Math.floor(Math.random() * 200)
        }
      });
    }
    
    return reviews;
  }
  
  generateFakeReviews(count) {
    const reviews = [];
    
    for (let i = 0; i < count; i++) {
      reviews.push({
        text: 'Amazing product! Best ever! Highly recommend!!!',
        rating: 5,
        verified: false,
        reviewerHistory: {
          totalReviews: 1,
          helpfulVotes: 0
        }
      });
    }
    
    return reviews;
  }
  
  generateRegretReviews(count) {
    const reviews = [];
    
    for (let i = 0; i < count; i++) {
      const phrase = this.regretPhrases[Math.floor(Math.random() * this.regretPhrases.length)];
      reviews.push({
        text: `I ${phrase}. This product is not what I expected.`,
        rating: 1 + Math.random(),
        verified: true
      });
    }
    
    return reviews;
  }
  
  generateReviewBombing(count, date) {
    const reviews = [];
    const timestamp = new Date(date).getTime();
    
    for (let i = 0; i < count; i++) {
      reviews.push({
        text: 'Terrible product! Worst ever!',
        rating: 1,
        verified: false,
        date: new Date(timestamp + i * 60000) // 1 minute apart
      });
    }
    
    return reviews;
  }
  
  generateBotReviews(count) {
    const reviews = [];
    const botPattern = 'Product is good. I like it. Recommend to others.';
    
    for (let i = 0; i < count; i++) {
      reviews.push({
        text: botPattern,
        rating: 5,
        verified: false,
        reviewerHistory: {
          totalReviews: 100 + i,
          helpfulVotes: 0
        }
      });
    }
    
    return reviews;
  }
  
  generateBalancedTestSet(count) {
    const fakeCount = Math.floor(count * 0.3);
    const realCount = count - fakeCount;
    
    const fakeReviews = this.generateFakeReviews(fakeCount);
    const realReviews = this.generateAuthenticReviews(realCount);
    
    const reviews = [...fakeReviews, ...realReviews];
    const labels = [
      ...Array(fakeCount).fill('fake'),
      ...Array(realCount).fill('real')
    ];
    
    // Shuffle
    const shuffled = this.shuffle(reviews.map((r, i) => ({ review: r, label: labels[i] })));
    
    return {
      reviews: shuffled.map(s => s.review),
      labels: shuffled.map(s => s.label)
    };
  }
  
  generateHighQualityProduct() {
    return {
      reviews: [
        ...this.generateAuthenticReviews(80),
        ...this.generatePositiveReviews(15),
        ...this.generateNegativeReviews(5)
      ],
      reviewCount: 100,
      averageRating: 4.3
    };
  }
  
  generateLowQualityProduct() {
    return {
      reviews: [
        ...this.generateNegativeReviews(60),
        ...this.generateRegretReviews(20),
        ...this.generateFakeReviews(20)
      ],
      reviewCount: 100,
      averageRating: 2.1
    };
  }
  
  generateProduct(options = {}) {
    const reviewCount = options.reviewCount || 50;
    const verifiedRatio = options.verifiedRatio || 0.6;
    
    const reviews = [];
    for (let i = 0; i < reviewCount; i++) {
      reviews.push({
        text: `Review ${i + 1} with some content`,
        rating: 1 + Math.random() * 4,
        verified: Math.random() < verifiedRatio
      });
    }
    
    return { reviews, reviewCount };
  }
  
  generateClusteredReviews(count, clusters) {
    const reviews = [];
    const clusterSize = Math.floor(count / clusters);
    
    for (let c = 0; c < clusters; c++) {
      const baseText = `Cluster ${c} base review text`;
      for (let i = 0; i < clusterSize; i++) {
        reviews.push({
          text: this.modifyText(baseText, 0.9),
          rating: 3 + Math.random() * 2,
          verified: Math.random() > 0.5
        });
      }
    }
    
    return reviews;
  }
  
  generateReviews(count) {
    const reviews = [];
    for (let i = 0; i < count; i++) {
      reviews.push(this.generateReview());
    }
    return reviews;
  }
  
  generateReview() {
    return {
      text: `Review ${Math.random().toString(36).substring(7)}`,
      rating: 1 + Math.random() * 4,
      verified: Math.random() > 0.5,
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    };
  }
  
  generateRawReviews(count) {
    return this.generateReviews(count);
  }
  
  generateAdversarialExamples(count) {
    const examples = [];
    
    for (let i = 0; i < count; i++) {
      examples.push({
        text: '😀'.repeat(50) + ' Amazing!!! ' + '⭐'.repeat(20),
        rating: 5,
        verified: false
      });
    }
    
    return examples;
  }
  
  // Helper methods
  
  modifyText(text, similarity) {
    const words = text.split(' ');
    const numChanges = Math.floor(words.length * (1 - similarity));
    
    for (let i = 0; i < numChanges; i++) {
      const idx = Math.floor(Math.random() * words.length);
      words[idx] = this.getRandomWord();
    }
    
    return words.join(' ');
  }
  
  getRandomWord() {
    const words = ['great', 'good', 'nice', 'excellent', 'amazing', 'wonderful'];
    return words[Math.floor(Math.random() * words.length)];
  }
  
  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

module.exports = TestDataGenerator;
