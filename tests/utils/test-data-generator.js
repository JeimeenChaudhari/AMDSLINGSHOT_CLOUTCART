// Test Data Generator for AI Review Analyzer

class TestDataGenerator {
  constructor() {
    this.emotions = ['Happy', 'Sad', 'Angry', 'Anxious', 'Neutral', 'Surprised', 'Fearful', 'Disgusted'];
  }

  generatePositiveReviews(count) {
    const reviews = [];
    const positiveTexts = [
      'Amazing product! Highly recommend.',
      'Excellent quality, works perfectly.',
      'Best purchase I\'ve made this year.',
      'Love it! Exceeded my expectations.',
      'Great value for money, very satisfied.'
    ];
    
    for (let i = 0; i < count; i++) {
      reviews.push({
        text: positiveTexts[i % positiveTexts.length],
        rating: 5,
        verified: true
      });
    }
    
    return reviews;
  }

  generateNegativeReviews(count) {
    const reviews = [];
    const negativeTexts = [
      'Terrible quality, broke immediately.',
      'Worst purchase ever, complete waste.',
      'Awful product, don\'t buy this.',
      'Disappointed, not as described.',
      'Poor quality, returned it.'
    ];
    
    for (let i = 0; i < count; i++) {
      reviews.push({
        text: negativeTexts[i % negativeTexts.length],
        rating: 1,
        verified: true
      });
    }
    
    return reviews;
  }

  generateDuplicateReviews(count, duplicateRatio = 0.5) {
    const reviews = [];
    const template = 'This product is amazing! Highly recommend.';
    const duplicateCount = Math.floor(count * duplicateRatio);
    
    for (let i = 0; i < duplicateCount; i++) {
      reviews.push({ text: template, rating: 5 });
    }
    
    for (let i = duplicateCount; i < count; i++) {
      reviews.push({
        text: `Unique review ${i} with different content.`,
        rating: 4
      });
    }
    
    return reviews;
  }

  generateNearDuplicates(count, similarity = 0.85) {
    const reviews = [];
    const base = 'This product works great and I love it';
    
    for (let i = 0; i < count; i++) {
      const variation = i % 3;
      let text = base;
      
      if (variation === 1) text = 'This product works great and I really love it';
      else if (variation === 2) text = 'This product works amazingly and I love it';
      
      reviews.push({ text, rating: 5 });
    }
    
    return reviews;
  }

  generateReviews(count, options = {}) {
    const reviews = [];
    const verifiedRatio = options.verifiedRatio || 0.5;
    
    for (let i = 0; i < count; i++) {
      reviews.push({
        text: `Review ${i} with some content about the product.`,
        rating: Math.floor(Math.random() * 5) + 1,
        verified: Math.random() < verifiedRatio
      });
    }
    
    return reviews;
  }

  generateAuthenticReviews(count) {
    const reviews = [];
    
    for (let i = 0; i < count; i++) {
      reviews.push({
        text: `Detailed review ${i} with specific information about my experience using this product for several weeks. The build quality is solid and it performs as expected.`,
        rating: 4,
        verified: true,
        reviewerHistory: {
          totalReviews: 20 + Math.floor(Math.random() * 30),
          helpfulVotes: 50 + Math.floor(Math.random() * 100)
        }
      });
    }
    
    return reviews;
  }

  generateFakeReviews(count) {
    const reviews = [];
    const fakeTexts = [
      'Best!!!',
      'Amazing product buy now!!!',
      'PERFECT MUST BUY',
      'Great great great'
    ];
    
    for (let i = 0; i < count; i++) {
      reviews.push({
        text: fakeTexts[i % fakeTexts.length],
        rating: 5,
        verified: false
      });
    }
    
    return reviews;
  }

  generateRegretReviews(count) {
    const reviews = [];
    const regretTexts = [
      'I regret buying this product. Waste of money.',
      'Terrible purchase, should have read reviews first.',
      'Returned it immediately, not worth it.',
      'Disappointed, expected much better quality.'
    ];
    
    for (let i = 0; i < count; i++) {
      reviews.push({
        text: regretTexts[i % regretTexts.length],
        rating: 1,
        verified: true
      });
    }
    
    return reviews;
  }

  generateBalancedTestSet(count) {
    const reviews = [];
    const labels = [];
    const half = Math.floor(count / 2);
    
    // Half authentic
    for (let i = 0; i < half; i++) {
      reviews.push(this.generateAuthenticReviews(1)[0]);
      labels.push('authentic');
    }
    
    // Half fake
    for (let i = 0; i < half; i++) {
      reviews.push(this.generateFakeReviews(1)[0]);
      labels.push('fake');
    }
    
    return { reviews, labels };
  }

  generateReviewBombing(count, date) {
    const reviews = [];
    
    for (let i = 0; i < count; i++) {
      reviews.push({
        text: `Review ${i}`,
        rating: 5,
        date: date
      });
    }
    
    return reviews;
  }

  generateBotReviews(count) {
    return this.generateFakeReviews(count);
  }

  generateHighQualityProduct() {
    return {
      reviewCount: 150,
      rating: 4.5,
      authenticity_score: 85,
      fake_review_probability: 0.15,
      regret_risk: 0.1,
      sentiment_balance_score: 0.85,
      unique_content_score: 0.9,
      sentiment_distribution: {
        positive: 80,
        neutral: 15,
        negative: 5
      }
    };
  }

  generateLowQualityProduct() {
    return {
      reviewCount: 80,
      rating: 2.5,
      authenticity_score: 35,
      fake_review_probability: 0.65,
      regret_risk: 0.5,
      sentiment_balance_score: 0.4,
      unique_content_score: 0.3,
      sentiment_distribution: {
        positive: 20,
        neutral: 20,
        negative: 60
      }
    };
  }

  generateProduct(options = {}) {
    return {
      reviewCount: options.reviewCount || 50,
      rating: options.rating || 4.0,
      authenticity_score: options.authenticity_score || 60,
      fake_review_probability: options.fake_review_probability || 0.3,
      regret_risk: options.regret_risk || 0.2,
      sentiment_balance_score: options.sentiment_balance_score || 0.7,
      unique_content_score: options.unique_content_score || 0.6,
      sentiment_distribution: options.sentiment_distribution || {
        positive: 60,
        neutral: 25,
        negative: 15
      }
    };
  }

  generateReview() {
    return {
      text: 'This is a sample review with some content.',
      rating: 4,
      verified: true
    };
  }

  generateRawReviews(count) {
    return this.generateReviews(count);
  }

  generateAdversarialExamples(count) {
    const reviews = [];
    
    for (let i = 0; i < count; i++) {
      reviews.push({
        text: '!@#$%^&*()' + 'a'.repeat(1000),
        rating: null,
        verified: undefined
      });
    }
    
    return reviews;
  }

  generateClusteredReviews(count, clusters) {
    const reviews = [];
    const templates = [];
    
    for (let i = 0; i < clusters; i++) {
      templates.push(`Template ${i} with similar content`);
    }
    
    for (let i = 0; i < count; i++) {
      const template = templates[i % clusters];
      reviews.push({
        text: template + ` variation ${i}`,
        rating: 4
      });
    }
    
    return reviews;
  }

  generateTemplateReviews(templates, count) {
    const reviews = [];
    
    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      const filled = template
        .replace('[product]', 'product')
        .replace('[adjective]', 'great')
        .replace('[verb]', 'love')
        .replace('[adverb]', 'well')
        .replace('[Recommendation]', 'Highly recommend');
      
      reviews.push({ text: filled, rating: 5 });
    }
    
    return reviews;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestDataGenerator;
}
