/**
 * AI-Powered Review Analysis Agent
 * Analyzes product reviews using real data and AI algorithms
 */

class ReviewAnalysisAgent {
  constructor() {
    this.suspiciousPatterns = {
      // Generic/template phrases
      templates: [
        'highly recommend',
        'must buy',
        'value for money',
        'worth every penny',
        'best product ever',
        'amazing product',
        'excellent quality'
      ],
      
      // Excessive superlatives
      superlatives: [
        'amazing', 'perfect', 'best', 'excellent', 'outstanding',
        'fantastic', 'incredible', 'awesome', 'wonderful', 'superb'
      ],
      
      // Spam indicators
      spam: [
        /(.)\1{4,}/,  // Repeated characters
        /[A-Z]{10,}/, // All caps words
        /\d{10,}/     // Long number sequences
      ]
    };
  }

  /**
   * Extract reviews from page
   */
  extractReviews() {
    const reviewSelectors = [
      '[data-hook="review"]',              // Amazon
      '.review',                           // Generic
      '.a-section.review',                 // Amazon alternative
      '._27M-vq',                          // Flipkart
      '.user-review',                      // Myntra
      '.prod-review',                      // Ajio
      '.review-item',                      // Generic
      '[class*="review-card"]',            // Various
      '.customer-review',                  // Various
      '[data-testid="review"]'             // Test ID based
    ];
    
    let reviews = [];
    for (const selector of reviewSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        reviews = Array.from(elements);
        console.log('[ReviewAgent] Found', reviews.length, 'reviews with selector:', selector);
        break;
      }
    }
    
    return reviews;
  }

  /**
   * Parse individual review data
   */
  parseReview(reviewElement) {
    const review = {
      text: '',
      rating: 0,
      verified: false,
      date: null,
      helpful: 0,
      author: '',
      title: ''
    };

    // Extract text
    const textSelectors = [
      '[data-hook="review-body"]',
      '.review-text',
      '.review-content',
      '[class*="review-text"]',
      'span[data-hook="review-body"] span'
    ];
    
    for (const selector of textSelectors) {
      const textEl = reviewElement.querySelector(selector);
      if (textEl) {
        review.text = textEl.textContent.trim();
        break;
      }
    }

    // Extract rating
    const ratingSelectors = [
      '[data-hook="review-star-rating"]',
      '.review-rating',
      '[class*="star-rating"]',
      '.a-icon-star'
    ];
    
    for (const selector of ratingSelectors) {
      const ratingEl = reviewElement.querySelector(selector);
      if (ratingEl) {
        const ratingText = ratingEl.textContent || ratingEl.getAttribute('class') || '';
        const match = ratingText.match(/(\d+(?:\.\d+)?)/);
        if (match) {
          review.rating = parseFloat(match[1]);
          break;
        }
      }
    }

    // Check if verified purchase
    const verifiedText = reviewElement.textContent.toLowerCase();
    review.verified = verifiedText.includes('verified purchase') || 
                     verifiedText.includes('verified buyer') ||
                     verifiedText.includes('certified buyer');

    // Extract date
    const dateSelectors = [
      '[data-hook="review-date"]',
      '.review-date',
      '[class*="review-date"]'
    ];
    
    for (const selector of dateSelectors) {
      const dateEl = reviewElement.querySelector(selector);
      if (dateEl) {
        review.date = dateEl.textContent.trim();
        break;
      }
    }

    // Extract helpful count
    const helpfulSelectors = [
      '[data-hook="helpful-vote-statement"]',
      '.review-votes',
      '[class*="helpful"]'
    ];
    
    for (const selector of helpfulSelectors) {
      const helpfulEl = reviewElement.querySelector(selector);
      if (helpfulEl) {
        const match = helpfulEl.textContent.match(/(\d+)/);
        if (match) {
          review.helpful = parseInt(match[1]);
        }
        break;
      }
    }

    // Extract title
    const titleSelectors = [
      '[data-hook="review-title"]',
      '.review-title',
      '[class*="review-title"]'
    ];
    
    for (const selector of titleSelectors) {
      const titleEl = reviewElement.querySelector(selector);
      if (titleEl) {
        review.title = titleEl.textContent.trim();
        break;
      }
    }

    return review;
  }

  /**
   * Detect suspicious patterns in review text
   */
  detectSuspiciousPatterns(text) {
    const suspicionScore = {
      total: 0,
      reasons: []
    };

    const lowerText = text.toLowerCase();

    // Check length
    if (text.length < 30) {
      suspicionScore.total += 2;
      suspicionScore.reasons.push('Very short review');
    }

    // Check for templates
    let templateCount = 0;
    for (const template of this.suspiciousPatterns.templates) {
      if (lowerText.includes(template)) {
        templateCount++;
      }
    }
    if (templateCount >= 2) {
      suspicionScore.total += 3;
      suspicionScore.reasons.push('Contains multiple template phrases');
    }

    // Check for excessive superlatives
    let superlativeCount = 0;
    for (const word of this.suspiciousPatterns.superlatives) {
      if (lowerText.includes(word)) {
        superlativeCount++;
      }
    }
    if (superlativeCount >= 4) {
      suspicionScore.total += 3;
      suspicionScore.reasons.push('Excessive use of superlatives');
    }

    // Check for spam patterns
    for (const pattern of this.suspiciousPatterns.spam) {
      if (pattern.test(text)) {
        suspicionScore.total += 2;
        suspicionScore.reasons.push('Contains spam patterns');
        break;
      }
    }

    // Check for generic content
    if (text.length < 100 && templateCount >= 1 && superlativeCount >= 2) {
      suspicionScore.total += 2;
      suspicionScore.reasons.push('Generic/template content');
    }

    return suspicionScore;
  }

  /**
   * Analyze rating distribution
   */
  analyzeRatingDistribution(reviews) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });

    // Calculate suspicious patterns
    const total = reviews.length;
    const fiveStarPercent = (distribution[5] / total) * 100;
    const oneStarPercent = (distribution[1] / total) * 100;

    const warnings = [];
    
    // Too many 5-star reviews
    if (fiveStarPercent > 70) {
      warnings.push('Unusually high number of 5-star reviews');
    }

    // Polarized reviews (many 5-star and 1-star, few in between)
    const extremePercent = fiveStarPercent + oneStarPercent;
    const middlePercent = ((distribution[2] + distribution[3] + distribution[4]) / total) * 100;
    if (extremePercent > 80 && middlePercent < 20) {
      warnings.push('Polarized rating distribution (suspicious)');
    }

    return {
      distribution,
      warnings,
      avgRating: reviews.reduce((sum, r) => sum + r.rating, 0) / total
    };
  }

  /**
   * Detect review bombing or manipulation
   */
  detectManipulation(reviews) {
    const warnings = [];
    
    // Check for review clustering (many reviews on same dates)
    const dateGroups = {};
    reviews.forEach(review => {
      if (review.date) {
        const dateKey = review.date.split(' ').slice(0, 3).join(' '); // Group by date
        dateGroups[dateKey] = (dateGroups[dateKey] || 0) + 1;
      }
    });

    const maxReviewsPerDay = Math.max(...Object.values(dateGroups));
    if (maxReviewsPerDay > reviews.length * 0.3) {
      warnings.push(`${maxReviewsPerDay} reviews posted on the same day (possible review bombing)`);
    }

    // Check for similar review patterns
    const reviewTexts = reviews.map(r => r.text.toLowerCase());
    let similarCount = 0;
    
    for (let i = 0; i < reviewTexts.length - 1; i++) {
      for (let j = i + 1; j < reviewTexts.length; j++) {
        const similarity = this.calculateSimilarity(reviewTexts[i], reviewTexts[j]);
        if (similarity > 0.7) {
          similarCount++;
        }
      }
    }

    if (similarCount > reviews.length * 0.1) {
      warnings.push('Multiple reviews with very similar content detected');
    }

    return warnings;
  }

  /**
   * Calculate text similarity (simple Jaccard similarity)
   */
  calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Calculate authenticity score
   */
  calculateAuthenticityScore(reviews, suspiciousReviews, verifiedPercent, ratingAnalysis) {
    let score = 100;

    // Deduct for suspicious reviews
    const suspiciousPercent = (suspiciousReviews.length / reviews.length) * 100;
    score -= suspiciousPercent * 1.5;

    // Deduct for low verified purchases
    if (verifiedPercent < 40) {
      score -= (40 - verifiedPercent) * 0.5;
    }

    // Deduct for rating distribution issues
    score -= ratingAnalysis.warnings.length * 5;

    // Bonus for good indicators
    if (verifiedPercent > 80) score += 5;
    if (suspiciousPercent < 5) score += 5;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Main analysis method
   */
  analyzeReviews() {
    const reviewElements = this.extractReviews();
    
    if (reviewElements.length === 0) {
      return {
        hasReviews: false,
        message: 'No customer reviews found for this product'
      };
    }

    console.log('[ReviewAgent] Analyzing', reviewElements.length, 'reviews...');

    // Parse all reviews
    const reviews = reviewElements.map(el => this.parseReview(el));
    
    // Filter out empty reviews
    const validReviews = reviews.filter(r => r.text.length > 0);

    if (validReviews.length === 0) {
      return {
        hasReviews: false,
        message: 'Could not extract review content'
      };
    }

    // Analyze each review for suspicious patterns
    const suspiciousReviews = [];
    validReviews.forEach((review, index) => {
      const suspicion = this.detectSuspiciousPatterns(review.text);
      if (suspicion.total >= 5) {
        suspiciousReviews.push({
          index,
          score: suspicion.total,
          reasons: suspicion.reasons,
          review
        });
      }
    });

    // Calculate verified purchase percentage
    const verifiedCount = validReviews.filter(r => r.verified).length;
    const verifiedPercent = Math.round((verifiedCount / validReviews.length) * 100);

    // Analyze rating distribution
    const ratingAnalysis = this.analyzeRatingDistribution(validReviews);

    // Detect manipulation
    const manipulationWarnings = this.detectManipulation(validReviews);

    // Calculate authenticity score
    const authenticityScore = this.calculateAuthenticityScore(
      validReviews,
      suspiciousReviews,
      verifiedPercent,
      ratingAnalysis
    );

    // Compile warnings
    const allWarnings = [
      ...ratingAnalysis.warnings,
      ...manipulationWarnings
    ];

    if (suspiciousReviews.length > validReviews.length * 0.2) {
      allWarnings.push(`${suspiciousReviews.length} reviews show patterns of fake content`);
    }

    if (verifiedPercent < 40) {
      allWarnings.push('Low percentage of verified purchases');
    }

    return {
      hasReviews: true,
      totalReviews: validReviews.length,
      authenticityScore,
      suspicious: suspiciousReviews.length,
      suspiciousIndices: suspiciousReviews.map(s => s.index),
      verified: verifiedPercent,
      verifiedCount,
      ratingDistribution: ratingAnalysis.distribution,
      avgRating: ratingAnalysis.avgRating.toFixed(1),
      warnings: allWarnings,
      details: {
        suspiciousReviews: suspiciousReviews.slice(0, 5), // Top 5 most suspicious
        ratingAnalysis
      }
    };
  }
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.ReviewAnalysisAgent = ReviewAnalysisAgent;
}
