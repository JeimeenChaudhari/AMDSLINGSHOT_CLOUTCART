// Review analysis utilities
class ReviewAnalyzer {
  constructor() {
    this.suspiciousPatterns = [
      /(.)\1{5,}/, // Repeated characters
      /amazing.*perfect.*best/i,
      /worst.*terrible.*awful/i,
      /\b(buy|purchase|order)\s+(now|today|immediately)\b/i
    ];
  }

  analyzeReviews(reviews) {
    let totalScore = 0;
    let suspiciousCount = 0;
    let verifiedCount = 0;
    const warnings = [];
    const suspiciousReviews = [];

    reviews.forEach((review, index) => {
      const analysis = this.analyzeReview(review);
      
      if (analysis.isSuspicious) {
        suspiciousCount++;
        suspiciousReviews.push(index);
      }
      
      if (analysis.isVerified) {
        verifiedCount++;
      }
      
      totalScore += analysis.score;
    });

    const avgScore = reviews.length > 0 ? totalScore / reviews.length : 0;
    const verifiedPercent = reviews.length > 0 ? (verifiedCount / reviews.length) * 100 : 0;
    const suspiciousPercent = reviews.length > 0 ? (suspiciousCount / reviews.length) * 100 : 0;

    // Generate warnings
    if (suspiciousPercent > 25) {
      warnings.push('High percentage of suspicious reviews detected');
    }
    if (verifiedPercent < 40) {
      warnings.push('Low percentage of verified purchases');
    }
    if (avgScore < 50) {
      warnings.push('Overall review authenticity is questionable');
    }

    return {
      overallScore: Math.round(avgScore),
      suspiciousCount,
      suspiciousPercent: Math.round(suspiciousPercent),
      verifiedCount,
      verifiedPercent: Math.round(verifiedPercent),
      warnings,
      suspiciousReviews,
      totalReviews: reviews.length
    };
  }

  analyzeReview(reviewElement) {
    const text = reviewElement.textContent || '';
    const textLower = text.toLowerCase();
    let score = 100;
    let isSuspicious = false;
    const flags = [];

    // Check for verified purchase
    const isVerified = textLower.includes('verified purchase');
    if (isVerified) {
      score += 20;
    } else {
      score -= 10;
    }

    // Check review length
    if (text.length < 50) {
      score -= 20;
      flags.push('Too short');
      isSuspicious = true;
    } else if (text.length > 2000) {
      score -= 10;
      flags.push('Unusually long');
    }

    // Check for suspicious patterns
    this.suspiciousPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        score -= 15;
        flags.push('Suspicious pattern detected');
        isSuspicious = true;
      }
    });

    // Check for excessive punctuation
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 5) {
      score -= 10;
      flags.push('Excessive punctuation');
    }

    // Check for all caps
    const capsWords = text.match(/\b[A-Z]{3,}\b/g) || [];
    if (capsWords.length > 3) {
      score -= 10;
      flags.push('Excessive caps');
    }

    // Check for generic phrases
    const genericPhrases = [
      'highly recommend',
      'best product ever',
      'changed my life',
      'must buy',
      'waste of money'
    ];
    
    let genericCount = 0;
    genericPhrases.forEach(phrase => {
      if (textLower.includes(phrase)) {
        genericCount++;
      }
    });
    
    if (genericCount > 2) {
      score -= 15;
      flags.push('Too many generic phrases');
      isSuspicious = true;
    }

    // Normalize score
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      isSuspicious,
      isVerified,
      flags
    };
  }

  detectFakeReviewPatterns(reviews) {
    const patterns = {
      sameDayReviews: 0,
      similarLanguage: 0,
      extremeRatings: 0
    };

    // Check for reviews posted on same day
    const dates = {};
    reviews.forEach(review => {
      const dateEl = review.querySelector('[data-hook="review-date"]');
      if (dateEl) {
        const date = dateEl.textContent;
        dates[date] = (dates[date] || 0) + 1;
      }
    });

    Object.values(dates).forEach(count => {
      if (count > 5) {
        patterns.sameDayReviews++;
      }
    });

    // Check for extreme ratings (all 5 or all 1)
    const ratings = [];
    reviews.forEach(review => {
      const ratingEl = review.querySelector('[data-hook="review-star-rating"]');
      if (ratingEl) {
        const rating = parseFloat(ratingEl.textContent);
        ratings.push(rating);
      }
    });

    const fiveStars = ratings.filter(r => r === 5).length;
    const oneStars = ratings.filter(r => r === 1).length;
    
    if (fiveStars > ratings.length * 0.8 || oneStars > ratings.length * 0.8) {
      patterns.extremeRatings = 1;
    }

    return patterns;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReviewAnalyzer;
}
