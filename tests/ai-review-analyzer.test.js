/**
 * AI Review Analyzer - Comprehensive Test Suite
 * AMD Slingshot Hackathon Edition
 * 
 * Target: 95%+ code coverage, 90%+ accuracy benchmarks
 */

const { expect } = require('@jest/globals');
const AIReviewAnalyzer = require('../utils/ai-recommendation-engine');
const SentimentAnalyzer = require('../models/sentiment-analyzer');
const DuplicateDetector = require('../models/duplicate-detector');
const AuthenticityScorer = require('../models/authenticity-scorer');
const RegretPredictor = require('../models/regret-predictor');
const FakeReviewDetector = require('../models/fake-review-detector');
const DecisionEngine = require('../models/decision-engine');

// Test data generators
const TestDataGenerator = require('./utils/test-data-generator');
const PerformanceBenchmark = require('./utils/performance-benchmark');

describe('🏆 AI Review Analyzer - Advanced Testing Suite', () => {
  
  let analyzer;
  let testDataGenerator;
  let benchmark;
  
  beforeAll(async () => {
    analyzer = new AIReviewAnalyzer();
    testDataGenerator = new TestDataGenerator();
    benchmark = new PerformanceBenchmark();
    
    // Load pre-trained models
    await analyzer.loadModels();
  });
  
  // ============================================================================
  // MODULE 1: SENTIMENT ANALYSIS TESTING
  // ============================================================================
  
  describe('📊 Module 1: Advanced Sentiment Analysis', () => {
    
    test('should achieve 92%+ accuracy on positive sentiment', async () => {
      const positiveReviews = testDataGenerator.generatePositiveReviews(1000);
      const predictions = await analyzer.sentimentAnalyzer.analyze(positiveReviews);
      
      const accuracy = calculateAccuracy(predictions, positiveReviews.map(r => 'positive'));
      expect(accuracy).toBeGreaterThan(0.92);
    });
    
    test('should achieve 90%+ accuracy on negative sentiment', async () => {
      const negativeReviews = testDataGenerator.generateNegativeReviews(1000);
      const predictions = await analyzer.sentimentAnalyzer.analyze(negativeReviews);
      
      const accuracy = calculateAccuracy(predictions, negativeReviews.map(r => 'negative'));
      expect(accuracy).toBeGreaterThan(0.90);
    });
    
    test('should detect sarcasm with 75%+ accuracy', async () => {
      const sarcasticReviews = [
        "Oh great, another broken product. Just what I needed!",
        "Wow, this is exactly as terrible as I expected!",
        "Perfect! It broke after one day. Amazing quality!",
        "Love how it doesn't work at all. Best purchase ever!",
        "Fantastic waste of money. Highly recommend! (not)"
      ];
      
      const results = await analyzer.sentimentAnalyzer.analyzeSarcasm(sarcasticReviews);
      const sarcasmDetected = results.filter(r => r.sarcasmDetected).length;
      
      expect(sarcasmDetected / sarcasticReviews.length).toBeGreaterThan(0.75);
    });
    
    test('should perform aspect-based sentiment analysis', async () => {
      const review = "Great battery life and fast processor, but terrible camera quality and poor build quality";
      const result = await analyzer.sentimentAnalyzer.analyzeAspects(review);
      
      expect(result.aspects.battery).toBe('positive');
      expect(result.aspects.processor).toBe('positive');
      expect(result.aspects.camera).toBe('negative');
      expect(result.aspects.build).toBe('negative');
    });
    
    test('should calculate emotion intensity scores', async () => {
      const reviews = [
        { text: "I absolutely LOVE this product!!!", expected: 'high' },
        { text: "It's okay, works fine.", expected: 'low' },
        { text: "This is the WORST product ever made!", expected: 'high' }
      ];
      
      for (const review of reviews) {
        const result = await analyzer.sentimentAnalyzer.analyzeIntensity(review.text);
        expect(result.intensity).toBe(review.expected);
      }
    });
    
    test('should handle multilingual reviews', async () => {
      const multilingualReviews = [
        { text: "Excelente producto, muy recomendado", lang: 'es', sentiment: 'positive' },
        { text: "Très mauvais, ne fonctionne pas", lang: 'fr', sentiment: 'negative' },
        { text: "素晴らしい製品です", lang: 'ja', sentiment: 'positive' }
      ];
      
      for (const review of multilingualReviews) {
        const result = await analyzer.sentimentAnalyzer.analyze([review]);
        expect(result[0].sentiment).toBe(review.sentiment);
      }
    });
    
    test('should extract sentiment features for ML pipeline', async () => {
      const review = "This product exceeded my expectations!";
      const features = await analyzer.sentimentAnalyzer.extractFeatures(review);
      
      expect(features).toHaveProperty('positiveScore');
      expect(features).toHaveProperty('negativeScore');
      expect(features).toHaveProperty('neutralScore');
      expect(features).toHaveProperty('emotionVector');
      expect(features.emotionVector).toHaveLength(8); // 8 emotion classes
    });
  });
  
  // ============================================================================
  // MODULE 2: DUPLICATE DETECTION TESTING
  // ============================================================================
  
  describe('🔍 Module 2: Graph-Based Duplicate Detection', () => {
    
    test('should detect exact duplicates with 100% accuracy', async () => {
      const reviews = testDataGenerator.generateDuplicateReviews(100, 1.0);
      const result = await analyzer.duplicateDetector.detect(reviews);
      
      expect(result.exactDuplicates).toBe(50);
      expect(result.duplicationRatio).toBe(0.5);
    });
    
    test('should detect near-duplicates using cosine similarity', async () => {
      const reviews = testDataGenerator.generateNearDuplicates(100, 0.85);
      const result = await analyzer.duplicateDetector.detect(reviews);
      
      expect(result.nearDuplicates).toBeGreaterThan(40);
      expect(result.averageSimilarity).toBeGreaterThan(0.80);
    });
    
    test('should build similarity graph correctly', async () => {
      const reviews = testDataGenerator.generateReviews(50);
      const graph = await analyzer.duplicateDetector.buildSimilarityGraph(reviews);
      
      expect(graph.nodes).toBe(50);
      expect(graph.edges).toBeGreaterThan(0);
      expect(graph.adjacencyMatrix).toBeDefined();
    });
    
    test('should detect community clusters in review network', async () => {
      const reviews = testDataGenerator.generateClusteredReviews(100, 5);
      const communities = await analyzer.duplicateDetector.detectCommunities(reviews);
      
      expect(communities.length).toBeGreaterThanOrEqual(3);
      expect(communities.length).toBeLessThanOrEqual(7);
    });
    
    test('should identify template-based spam patterns', async () => {
      const templates = [
        "This [product] is [adjective]! I [verb] it!",
        "[Product] works [adverb]. [Recommendation]."
      ];
      const reviews = testDataGenerator.generateTemplateReviews(templates, 50);
      const result = await analyzer.duplicateDetector.detectTemplates(reviews);
      
      expect(result.templatesDetected).toBeGreaterThan(0);
      expect(result.templateSpamRatio).toBeGreaterThan(0.7);
    });
    
    test('should calculate n-gram similarity efficiently', async () => {
      const review1 = "This is an amazing product that works great";
      const review2 = "This is an excellent product that works perfectly";
      
      const similarity = await analyzer.duplicateDetector.calculateNGramSimilarity(
        review1, 
        review2, 
        3
      );
      
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThan(1.0);
    });
    
    test('should handle large-scale duplicate detection', async () => {
      const reviews = testDataGenerator.generateReviews(5000);
      const startTime = Date.now();
      const result = await analyzer.duplicateDetector.detect(reviews);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(3000); // <3s for 5000 reviews
      expect(result.duplicationRatio).toBeDefined();
    });
  });
  
  // ============================================================================
  // MODULE 3: AUTHENTICITY SCORING TESTING
  // ============================================================================
  
  describe('🎯 Module 3: Bayesian Authenticity Scoring', () => {
    
    test('should score authentic reviews >70', async () => {
      const authenticReviews = testDataGenerator.generateAuthenticReviews(100);
      const scores = await analyzer.authenticityScorer.score(authenticReviews);
      
      const avgScore = scores.reduce((a, b) => a + b) / scores.length;
      expect(avgScore).toBeGreaterThan(70);
    });
    
    test('should score fake reviews <40', async () => {
      const fakeReviews = testDataGenerator.generateFakeReviews(100);
      const scores = await analyzer.authenticityScorer.score(fakeReviews);
      
      const avgScore = scores.reduce((a, b) => a + b) / scores.length;
      expect(avgScore).toBeLessThan(40);
    });
    
    test('should use Bayesian inference correctly', async () => {
      const review = {
        verified: true,
        rating: 4,
        text: 'Detailed review with specific examples and personal experience',
        reviewerHistory: { totalReviews: 50, helpfulVotes: 200 }
      };
      
      const result = await analyzer.authenticityScorer.bayesianScore(review);
      
      expect(result.prior).toBeGreaterThan(0);
      expect(result.likelihood).toBeGreaterThan(0);
      expect(result.posterior).toBeGreaterThan(result.prior);
      expect(result.confidenceInterval).toBeDefined();
    });
    
    test('should calculate verification ratio impact', async () => {
      const highVerification = testDataGenerator.generateReviews(100, { verifiedRatio: 0.9 });
      const lowVerification = testDataGenerator.generateReviews(100, { verifiedRatio: 0.2 });
      
      const highScore = await analyzer.authenticityScorer.scoreSet(highVerification);
      const lowScore = await analyzer.authenticityScorer.scoreSet(lowVerification);
      
      expect(highScore.averageAuthenticity).toBeGreaterThan(lowScore.averageAuthenticity);
    });
    
    test('should detect rating-text sentiment mismatch', async () => {
      const mismatches = [
        { rating: 5, text: "Terrible product, broke immediately", expected: true },
        { rating: 1, text: "Amazing quality, works perfectly!", expected: true },
        { rating: 4, text: "Good product, works as expected", expected: false }
      ];
      
      for (const review of mismatches) {
        const result = await analyzer.authenticityScorer.detectMismatch(review);
        expect(result.mismatchDetected).toBe(review.expected);
      }
    });
    
    test('should evaluate text uniqueness and specificity', async () => {
      const generic = "Great product! Highly recommend!";
      const specific = "The 12-hour battery life exceeded expectations. The camera's 48MP sensor captures stunning detail in low light. Build quality feels premium with the aluminum frame.";
      
      const genericScore = await analyzer.authenticityScorer.scoreTextQuality(generic);
      const specificScore = await analyzer.authenticityScorer.scoreTextQuality(specific);
      
      expect(specificScore.uniqueness).toBeGreaterThan(genericScore.uniqueness);
      expect(specificScore.specificity).toBeGreaterThan(genericScore.specificity);
    });
  });
  
  // ============================================================================
  // MODULE 4: REGRET RISK PREDICTION TESTING
  // ============================================================================
  
  describe('⚠️ Module 4: Deep Regret Risk Prediction', () => {
    
    test('should predict high regret for negative reviews', async () => {
      const regretReviews = testDataGenerator.generateRegretReviews(100);
      const predictions = await analyzer.regretPredictor.predict(regretReviews);
      
      const avgRisk = predictions.reduce((a, b) => a + b.risk, 0) / predictions.length;
      expect(avgRisk).toBeGreaterThan(60);
    });
    
    test('should extract regret phrases accurately', async () => {
      const review = "I deeply regret buying this. Complete waste of money. Should have read reviews first.";
      const result = await analyzer.regretPredictor.extractRegretPhrases(review);
      
      expect(result.phrases).toContain('regret buying');
      expect(result.phrases).toContain('waste of money');
      expect(result.regretScore).toBeGreaterThan(0.7);
    });
    
    test('should detect return/refund mentions', async () => {
      const reviews = [
        "Returned it the next day",
        "Requested a refund immediately",
        "Sent it back after one use"
      ];
      
      for (const review of reviews) {
        const result = await analyzer.regretPredictor.detectReturnMentions(review);
        expect(result.returnMentioned).toBe(true);
      }
    });
    
    test('should calculate regret probability distribution', async () => {
      const review = testDataGenerator.generateReview();
      const result = await analyzer.regretPredictor.predictWithDistribution(review);
      
      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.probability).toBeLessThanOrEqual(1);
      expect(result.distribution).toBeDefined();
      expect(result.confidenceInterval).toBeDefined();
    });
    
    test('should identify quality complaint patterns', async () => {
      const complaints = [
        "Broke after one week",
        "Poor quality materials",
        "Stopped working completely",
        "Defective out of the box"
      ];
      
      for (const complaint of complaints) {
        const result = await analyzer.regretPredictor.detectQualityComplaints(complaint);
        expect(result.qualityIssueDetected).toBe(true);
      }
    });
  });
  
  // ============================================================================
  // MODULE 5: FAKE REVIEW DETECTION TESTING
  // ============================================================================
  
  describe('🛡️ Module 5: Ensemble Fake Review Detection', () => {
    
    test('should achieve 88%+ accuracy on balanced test set', async () => {
      const testSet = testDataGenerator.generateBalancedTestSet(5000);
      const predictions = await analyzer.fakeDetector.predict(testSet.reviews);
      
      const accuracy = calculateAccuracy(predictions, testSet.labels);
      expect(accuracy).toBeGreaterThan(0.88);
    });
    
    test('should use ensemble voting correctly', async () => {
      const review = testDataGenerator.generateReview();
      const result = await analyzer.fakeDetector.ensemblePredict(review);
      
      expect(result.votes).toHaveLength(3); // Random Forest, Gradient Boosting, Neural Network
      expect(result.confidence).toBeDefined();
      expect(result.finalPrediction).toBeDefined();
    });
    
    test('should detect review bombing patterns', async () => {
      const bombingPattern = testDataGenerator.generateReviewBombing(100, '2024-01-15');
      const result = await analyzer.fakeDetector.detectReviewBombing(bombingPattern);
      
      expect(result.bombingDetected).toBe(true);
      expect(result.suspiciousTimeWindow).toBeDefined();
    });
    
    test('should identify bot-generated reviews', async () => {
      const botReviews = testDataGenerator.generateBotReviews(50);
      const predictions = await analyzer.fakeDetector.predict(botReviews);
      
      const botDetectionRate = predictions.filter(p => p.isFake).length / botReviews.length;
      expect(botDetectionRate).toBeGreaterThan(0.80);
    });
    
    test('should calculate calibrated confidence scores', async () => {
      const reviews = testDataGenerator.generateReviews(100);
      const predictions = await analyzer.fakeDetector.predictWithCalibration(reviews);
      
      // Check confidence calibration
      const confidences = predictions.map(p => p.confidence);
      const avgConfidence = confidences.reduce((a, b) => a + b) / confidences.length;
      
      expect(avgConfidence).toBeGreaterThan(0.5);
      expect(avgConfidence).toBeLessThan(0.95);
    });
    
    test('should provide feature importance rankings', async () => {
      const review = testDataGenerator.generateReview();
      const result = await analyzer.fakeDetector.predictWithExplanation(review);
      
      expect(result.featureImportance).toBeDefined();
      expect(Object.keys(result.featureImportance).length).toBeGreaterThan(0);
    });
  });
  
  // ============================================================================
  // ENSEMBLE DECISION ENGINE TESTING
  // ============================================================================
  
  describe('🎯 Ensemble Decision Engine', () => {
    
    test('should make correct BUY decisions with high confidence', async () => {
      const goodProduct = testDataGenerator.generateHighQualityProduct();
      const decision = await analyzer.decisionEngine.decide(goodProduct);
      
      expect(decision.decision).toBe('BUY');
      expect(decision.confidence).toBeGreaterThan(75);
      expect(decision.fake_review_probability).toBeLessThan(30);
    });
    
    test('should make correct AVOID decisions', async () => {
      const badProduct = testDataGenerator.generateLowQualityProduct();
      const decision = await analyzer.decisionEngine.decide(badProduct);
      
      expect(decision.decision).toBe('AVOID');
      expect(decision.confidence).toBeGreaterThan(70);
    });
    
    test('should recommend WAIT for insufficient data', async () => {
      const limitedData = testDataGenerator.generateProduct({ reviewCount: 5 });
      const decision = await analyzer.decisionEngine.decide(limitedData);
      
      expect(decision.decision).toBe('WAIT');
      expect(decision.technical_flags).toContain('low_sample_size');
    });
    
    test('should provide explainable AI output with SHAP values', async () => {
      const product = testDataGenerator.generateProduct();
      const decision = await analyzer.decisionEngine.decideWithExplanation(product);
      
      expect(decision.shapValues).toBeDefined();
      expect(decision.featureImportance).toBeDefined();
      expect(decision.explanation).toBeDefined();
      expect(decision.explanation.length).toBeGreaterThan(100);
    });
    
    test('should generate counterfactual explanations', async () => {
      const product = testDataGenerator.generateProduct();
      const decision = await analyzer.decisionEngine.decideWithCounterfactuals(product);
      
      expect(decision.counterfactuals).toBeDefined();
      expect(decision.counterfactuals.length).toBeGreaterThan(0);
    });
    
    test('should aggregate signals with proper weighting', async () => {
      const signals = {
        authenticity_score: 80,
        fake_review_probability: 20,
        regret_risk: 10,
        sentiment_balance_score: 0.85,
        unique_content_score: 0.90
      };
      
      const overallScore = await analyzer.decisionEngine.calculateOverallScore(signals);
      
      expect(overallScore).toBeGreaterThan(70);
      expect(overallScore).toBeLessThan(100);
    });
    
    test('should apply sample size reliability adjustment', async () => {
      const smallSample = { reviewCount: 8 };
      const largeSample = { reviewCount: 200 };
      
      const smallAdjustment = await analyzer.decisionEngine.calculateReliabilityPenalty(smallSample);
      const largeAdjustment = await analyzer.decisionEngine.calculateReliabilityPenalty(largeSample);
      
      expect(smallAdjustment).toBeLessThan(largeAdjustment);
    });
  });
  
  // ============================================================================
  // PERFORMANCE & SCALABILITY TESTING
  // ============================================================================
  
  describe('⚡ Performance & Scalability', () => {
    
    test('should process 1000 reviews in <5 seconds', async () => {
      const reviews = testDataGenerator.generateReviews(1000);
      const result = await benchmark.measureThroughput(async () => {
        return await analyzer.analyzeAll(reviews);
      });
      
      expect(result.duration).toBeLessThan(5000);
      expect(result.throughput).toBeGreaterThan(200); // reviews/second
    });
    
    test('should achieve <100ms average inference latency', async () => {
      const review = testDataGenerator.generateReview();
      const latencies = [];
      
      for (let i = 0; i < 100; i++) {
        const start = performance.now();
        await analyzer.analyze(review);
        latencies.push(performance.now() - start);
      }
      
      const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
      const p95Latency = latencies.sort((a, b) => a - b)[95];
      
      expect(avgLatency).toBeLessThan(100);
      expect(p95Latency).toBeLessThan(200);
    });
    
    test('should handle concurrent requests efficiently', async () => {
      const reviews = testDataGenerator.generateReviews(100);
      const startTime = Date.now();
      
      const promises = reviews.map(r => analyzer.analyze(r));
      const results = await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      
      expect(results).toHaveLength(100);
      expect(duration).toBeLessThan(3000);
    });
    
    test('should maintain memory efficiency', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Process large batch
      const reviews = testDataGenerator.generateReviews(5000);
      await analyzer.analyzeAll(reviews);
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      expect(memoryIncrease).toBeLessThan(100); // <100MB increase
    });
  });
  
  // ============================================================================
  // EDGE CASES & ROBUSTNESS TESTING
  // ============================================================================
  
  describe('🛡️ Edge Cases & Robustness', () => {
    
    test('should handle empty reviews gracefully', async () => {
      const emptyReview = { text: '', rating: 5 };
      const result = await analyzer.analyze(emptyReview);
      
      expect(result.decision).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });
    
    test('should handle very long reviews', async () => {
      const longReview = { text: 'a'.repeat(10000), rating: 4 };
      const result = await analyzer.analyze(longReview);
      
      expect(result.decision).toBeDefined();
    });
    
    test('should handle special characters and emojis', async () => {
      const specialReview = { text: '😀😀😀 Amazing!!! ⭐⭐⭐⭐⭐ #BestProduct', rating: 5 };
      const result = await analyzer.analyze(specialReview);
      
      expect(result.decision).toBeDefined();
    });
    
    test('should handle null and undefined values', async () => {
      const invalidReviews = [
        { text: null, rating: 4 },
        { text: undefined, rating: 3 },
        { text: 'Good', rating: null }
      ];
      
      for (const review of invalidReviews) {
        const result = await analyzer.analyze(review);
        expect(result.decision).toBeDefined();
      }
    });
    
    test('should handle adversarial examples', async () => {
      const adversarial = testDataGenerator.generateAdversarialExamples(50);
      const results = await analyzer.analyzeAll(adversarial);
      
      // Should still make reasonable decisions
      results.forEach(result => {
        expect(result.decision).toMatch(/BUY|WAIT|AVOID|CONSIDER/);
        expect(result.confidence).toBeGreaterThan(0);
      });
    });
  });
  
  // ============================================================================
  // INTEGRATION & END-TO-END TESTING
  // ============================================================================
  
  describe('🔗 Integration & End-to-End', () => {
    
    test('should integrate with recommendation engine', async () => {
      const product = testDataGenerator.generateProduct();
      const recommendation = await analyzer.getRecommendation(product);
      
      expect(recommendation).toHaveProperty('decision');
      expect(recommendation).toHaveProperty('confidence');
      expect(recommendation).toHaveProperty('explanation');
    });
    
    test('should export results in required JSON format', async () => {
      const product = testDataGenerator.generateProduct();
      const result = await analyzer.analyze(product);
      
      // Validate JSON structure
      expect(result).toHaveProperty('decision');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('fake_review_probability');
      expect(result).toHaveProperty('authenticity_score');
      expect(result).toHaveProperty('regret_risk');
      expect(result).toHaveProperty('sentiment_distribution');
      expect(result).toHaveProperty('explanation');
      expect(result).toHaveProperty('technical_flags');
    });
    
    test('should handle full pipeline from raw data to decision', async () => {
      const rawReviews = testDataGenerator.generateRawReviews(100);
      
      // Full pipeline
      const processed = await analyzer.preprocessReviews(rawReviews);
      const features = await analyzer.extractFeatures(processed);
      const predictions = await analyzer.predictAll(features);
      const decision = await analyzer.makeDecision(predictions);
      
      expect(decision.decision).toBeDefined();
      expect(decision.confidence).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function calculateAccuracy(predictions, labels) {
  let correct = 0;
  for (let i = 0; i < predictions.length; i++) {
    if (predictions[i] === labels[i]) correct++;
  }
  return correct / predictions.length;
}

module.exports = {
  calculateAccuracy
};
