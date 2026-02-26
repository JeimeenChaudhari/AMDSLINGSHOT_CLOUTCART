# AI Recommendation Engine - Developer Quick Reference

## 🚀 Quick Start

```bash
# 1. Load extension
chrome://extensions/ → Developer Mode → Load unpacked

# 2. Test on product page
Visit: amazon.com/product-page

# 3. Check console
F12 → Console → Look for AI Recommendation logs
```

## 📁 File Structure

```
utils/
├── ai-recommendation-engine.js  ← NEW: Main AI engine
├── review-analyzer.js           ← Existing review utils
├── comparison.js                ← Price comparison
└── price-tracker.js             ← Price history

content/
├── content.js                   ← UPDATED: Uses AI engine
└── content.css                  ← UPDATED: Warning styles

models/
└── emotion-detection.js         ← Emotion tracking

manifest.json                    ← UPDATED: Script order
```

## 🔧 Key Classes

### AIRecommendationEngine

```javascript
const engine = new AIRecommendationEngine();

// Main method
const result = await engine.generateRecommendation(
  productData,    // {rating, reviewCount, currentPrice, historicalPrice, productName}
  emotion,        // 'Happy', 'Anxious', 'Neutral', etc.
  behaviorData,   // {clicks, movements, timeSpent, scrolls}
  reviews         // Array of review DOM elements
);

// Returns
{
  decision: 'BUY' | 'WAIT' | 'AVOID',
  confidence: 30-99,
  reasoning: 'Multi-part contextual explanation...',
  factors: {
    reviewTrustworthiness: 0-1,
    emotionalStability: 0-1,
    priceAdvantage: 0-1,
    ratingConsistency: 0-1,
    fakeReviewRisk: 0-1
  },
  warnings: ['Warning 1', 'Warning 2', ...],
  reviewAnalysis: {
    fakeReviewPercentage: 0-100,
    authenticReviews: number,
    suspiciousPatterns: ['Pattern 1', ...]
  }
}
```

### FakeReviewDetector

```javascript
const detector = new FakeReviewDetector();

// Analyze multiple reviews
const result = detector.detectFakeReviews(reviewElements);

// Returns
{
  fakeCount: number,
  authenticCount: number,
  fakePercentage: 0-100,
  verifiedPurchaseRatio: 0-1,
  suspiciousPatterns: ['Pattern 1', ...],
  detailedResults: [...]
}

// Analyze single review
const analysis = detector.analyzeReview(reviewElement);

// Returns
{
  isFake: boolean,
  suspicionScore: 0-100,
  isVerified: boolean,
  flags: ['flag1', 'flag2', ...],
  text: 'First 100 chars...'
}
```

## 🎯 Decision Logic

```javascript
// Pseudo-code
if (fakeReviewRisk > 0.4) {
  return 'AVOID';
} else if (isImpulsive && decisionScore < 0.8) {
  return 'WAIT';
} else if (isRushed) {
  return 'WAIT';
} else if (decisionScore >= 0.75) {
  return 'BUY';
} else if (decisionScore >= 0.55) {
  return 'WAIT';
} else {
  return 'AVOID';
}
```

## 📊 Factor Weights

| Factor | Weight | Range |
|--------|--------|-------|
| Review Trustworthiness | 30% | 0-1 |
| Emotional Stability | 20% | 0-1 |
| Price Advantage | 25% | 0-1 |
| Rating Consistency | 25% | 0-1 |

## 🧠 Emotional Profiles

```javascript
emotionalFactors = {
  'Happy':     { impulsivity: 0.7, riskTolerance: 0.8, decisionClarity: 0.9 },
  'Neutral':   { impulsivity: 0.3, riskTolerance: 0.5, decisionClarity: 0.8 },
  'Anxious':   { impulsivity: 0.6, riskTolerance: 0.2, decisionClarity: 0.4 },
  'Fearful':   { impulsivity: 0.4, riskTolerance: 0.1, decisionClarity: 0.3 },
  'Angry':     { impulsivity: 0.8, riskTolerance: 0.6, decisionClarity: 0.5 },
  'Sad':       { impulsivity: 0.5, riskTolerance: 0.3, decisionClarity: 0.6 },
  'Surprised': { impulsivity: 0.7, riskTolerance: 0.5, decisionClarity: 0.6 },
  'Disgusted': { impulsivity: 0.2, riskTolerance: 0.2, decisionClarity: 0.7 }
}
```

## 🎭 Behavior Patterns

```javascript
// Detection logic
isRushed       = clicks > 15 && timeSpent < 30000
isHesitant     = scrolls > 20 && clicks < 5
isImpulsive    = clicks > 10 && timeSpent < 20000
isDeliberative = timeSpent > 120000 && clicks < 10

// Confidence modifiers
Rushed/Impulsive:  ×0.7
Hesitant:          ×0.8
Deliberative:      ×1.1
High Fake Risk:    ×0.5
```

## 🔍 Fake Review Patterns

```javascript
suspiciousPatterns = {
  repeatedChars:         /(.)\1{5,}/,
  excessiveSuperlatives: /amazing.*perfect.*best|worst.*terrible.*awful/i,
  urgencyLanguage:       /\b(buy|purchase|order)\s+(now|today|immediately)\b/i,
  genericPhrases:        /(highly recommend|best product ever|changed my life)/i,
  excessiveCaps:         /\b[A-Z]{4,}\b/g,
  excessivePunctuation:  /[!?]{3,}/g
}

// Scoring
suspicionScore += 15  // Not verified
suspicionScore += 25  // Too short (<30 chars)
suspicionScore += 15  // Pattern match
suspicionScore += 10  // Excessive punctuation
suspicionScore += 20  // Generic phrases
suspicionScore += 15  // Extreme sentiment

// Threshold
isFake = suspicionScore >= 40
```

## 💰 Price Analysis

```javascript
// Price change calculation
priceChange = ((current - avgHistorical) / avgHistorical) * 100

// Advantage scoring
if (priceChange < -15)      advantageScore = 0.9  // Significant drop
else if (priceChange < -5)  advantageScore = 0.75 // Price drop
else if (priceChange > 15)  advantageScore = 0.2  // Price spike
else if (priceChange > 5)   advantageScore = 0.4  // Price increase
else                        advantageScore = 0.5  // Stable
```

## ⭐ Rating Analysis

```javascript
// Consistency scoring
if (reviewCount < 10)       consistencyScore = 0.3
else if (reviewCount < 50)  consistencyScore = 0.5
else if (reviewCount < 200) consistencyScore = 0.7
else                        consistencyScore = 0.9

// Adjust for rating value
if (rating >= 4.5)          consistencyScore *= 1.1
else if (rating < 3.5)      consistencyScore *= 0.7
```

## 🎨 CSS Classes

```css
/* Recommendation card */
.esa-recommendation          /* Main container */
.esa-rec-result              /* Result container */
.esa-rec-result.buy          /* Green border */
.esa-rec-result.wait         /* Orange border */
.esa-rec-result.avoid        /* Red border */

/* Content */
.esa-rec-badge               /* BUY/WAIT/AVOID badge */
.esa-rec-reason              /* Reasoning text */
.esa-rec-confidence          /* Confidence percentage */
.esa-rec-factors             /* Factor grid */

/* Warnings */
.esa-rec-warnings            /* Warning container */
.esa-warning                 /* Individual warning */
```

## 🐛 Debug Commands

```javascript
// Test fake review detector
const detector = new FakeReviewDetector();
const testReview = document.createElement('div');
testReview.textContent = "AMAZING!!! BUY NOW!!!";
console.log(detector.analyzeReview(testReview));

// Test AI engine
const engine = new AIRecommendationEngine();
engine.generateRecommendation(
  {rating: 4.5, reviewCount: 100, currentPrice: 999, historicalPrice: [1200], productName: "Test"},
  'Happy',
  {clicks: 5, timeSpent: 60000},
  []
).then(console.log);

// Check stored recommendations
chrome.storage.local.get(['recommendations'], console.log);

// Check current emotion
console.log('Current emotion:', currentEmotion);

// Check activity data
console.log('Activity:', activityData);
```

## 📝 Common Tasks

### Add New Suspicious Pattern

```javascript
// In FakeReviewDetector constructor
this.suspiciousPatterns = {
  // ... existing patterns
  newPattern: /your-regex-here/i
};

// In analyzeReview method
if (this.suspiciousPatterns.newPattern.test(text)) {
  suspicionScore += 15;
  flags.push('newPattern');
}
```

### Add New Emotion Profile

```javascript
// In AIRecommendationEngine constructor
this.emotionalFactors = {
  // ... existing emotions
  'NewEmotion': { 
    impulsivity: 0.5, 
    riskTolerance: 0.5, 
    decisionClarity: 0.5 
  }
};
```

### Adjust Factor Weights

```javascript
// In makeDecision method
const decisionScore = (
  reviewTrustworthiness * 0.30 +  // Change these
  emotionalStability * 0.20 +     // weights as
  priceAdvantage * 0.25 +         // needed
  ratingConsistency * 0.25        // (must sum to 1.0)
);
```

### Modify Confidence Calculation

```javascript
// In calculateConfidence method
let confidence = (
  reviewTrustworthiness * 30 +  // Change these
  ratingConsistency * 25 +      // weights as
  priceAdvantage * 20 +         // needed
  (1 - fakeReviewRisk) * 25     // (must sum to 100)
);
```

## ⚠️ Common Issues

### Issue: AIRecommendationEngine not defined
```javascript
// Check manifest.json script order
"js": [
  "models/emotion-detection.js",
  "utils/review-analyzer.js",
  "utils/ai-recommendation-engine.js",  // Must be before content.js
  "utils/price-tracker.js",
  "utils/comparison.js",
  "content/content.js"
]
```

### Issue: Reviews not extracted
```javascript
// Check extractReviews() selectors
const reviewSelectors = [
  '[data-hook="review"]',        // Amazon
  '.review',                     // Generic
  '.review-item',                // Flipkart
  '[data-testid="review"]',      // Modern sites
  '.customer-review',            // Walmart
  '.a-section.review'            // Amazon alternate
];
```

### Issue: Confidence always same
```javascript
// Verify behavioral data is tracked
console.log('Activity data:', activityData);
// Should show: {clicks: N, movements: N, timeSpent: N, scrolls: N}
```

## 📚 Documentation Files

- `AI_RECOMMENDATION_UPGRADE.md` - Detailed technical guide
- `TEST_AI_RECOMMENDATION.md` - Testing scenarios
- `AI_RECOMMENDATION_SUMMARY.md` - Quick overview
- `AI_RECOMMENDATION_FLOW.md` - System flow diagrams
- `IMPLEMENTATION_CHECKLIST.md` - Implementation status
- `DEVELOPER_QUICK_REFERENCE.md` - This file

## 🔗 Key Functions

```javascript
// In content.js
activateRecommendation()     // Main entry point
extractReviews()             // Extract review elements
extractCurrentPrice()        // Get product price
extractRating()              // Get product rating
extractReviewCount()         // Get review count
extractProductName()         // Get product name

// In ai-recommendation-engine.js
generateRecommendation()     // Main AI method
analyzeReviewAuthenticity()  // Fake review detection
analyzeEmotionalState()      // Behavior analysis
analyzePriceTrend()          // Price analysis
analyzeRatingQuality()       // Rating analysis
makeDecision()               // Decision logic
calculateConfidence()        // Confidence calculation
generateReasoning()          // Reasoning generation
```

## 🎯 Testing Checklist

- [ ] Load extension without errors
- [ ] Visit product page
- [ ] AI card appears
- [ ] Decision varies by product
- [ ] Confidence is dynamic
- [ ] Reasoning is contextual
- [ ] Warnings appear when needed
- [ ] Fake reviews detected
- [ ] Emotion affects decision
- [ ] Behavior affects confidence

## 📊 Performance Targets

- Analysis time: <3 seconds
- Memory usage: <50MB
- Reviews analyzed: Up to 50
- Confidence range: 30-99%
- No page lag or freezing

## 🚀 Deployment

```bash
# 1. Verify no errors
npm run lint  # If you have linting

# 2. Test thoroughly
# Follow TEST_AI_RECOMMENDATION.md

# 3. Package extension
# Zip all files except docs

# 4. Upload to Chrome Web Store
# Or distribute as unpacked extension
```

---

**Quick Links**:
- Main Engine: `utils/ai-recommendation-engine.js`
- Integration: `content/content.js` line 545
- Styles: `content/content.css` line 280
- Manifest: `manifest.json` line 40

**Version**: 1.0.0
**Status**: Ready for Testing
