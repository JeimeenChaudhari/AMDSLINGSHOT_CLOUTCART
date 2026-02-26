# Testing the Enhanced AI Recommendation System

## Quick Test Guide

### Prerequisites
1. Load the extension in Chrome (chrome://extensions/)
2. Enable Developer Mode
3. Click "Load unpacked" and select the extension folder
4. Ensure all scripts are loaded in manifest.json

### Test Scenarios

## Scenario 1: High-Quality Product with Authentic Reviews

**Test Product**: Find a product with:
- Rating: 4.5+ stars
- Reviews: 100+ reviews
- Many "Verified Purchase" badges
- Varied review content

**Expected Result**:
```
Decision: BUY
Confidence: 85-95%
Reasoning: Should mention:
  - Strong review authenticity
  - Consistent satisfaction
  - Low fake review risk
Warnings: None or minimal
```

**How to Test**:
1. Navigate to the product page
2. Wait for AI Recommendation card to appear
3. Verify the decision is BUY
4. Check confidence is high (>85%)
5. Read reasoning - should be positive
6. Check "Fake Risk" percentage is low (<20%)

---

## Scenario 2: Suspicious Product with Fake Reviews

**Test Product**: Find a product with:
- Many 5-star reviews posted on same day
- Generic review text ("Best product ever!", "Must buy!")
- Few verified purchases
- Excessive exclamation marks

**Expected Result**:
```
Decision: AVOID or WAIT
Confidence: 30-60%
Reasoning: Should mention:
  - High fake review risk
  - Questionable authenticity
  - High regret likelihood
Warnings: Multiple warnings about fake reviews
```

**How to Test**:
1. Navigate to suspicious product
2. Wait for analysis
3. Verify decision is AVOID or WAIT
4. Check confidence is low (<60%)
5. Look for warnings about fake reviews
6. Check "Fake Risk" percentage is high (>40%)

---

## Scenario 3: Impulsive Browsing Behavior

**Test Product**: Any product

**Simulate Impulsive Behavior**:
1. Click rapidly on different elements (10+ clicks in 15 seconds)
2. Scroll quickly
3. Navigate to product page within 20 seconds

**Expected Result**:
```
Decision: WAIT (even if product is good)
Confidence: Reduced by 30%
Reasoning: Should mention:
  - Impulsive behavior detected
  - Rushed navigation
  - Waiting reduces regret risk
Warnings: "Your current browsing pattern suggests impulsive behavior"
```

---

## Scenario 4: Deliberative Research Behavior

**Test Product**: Any product

**Simulate Deliberative Behavior**:
1. Spend 2+ minutes on product page
2. Scroll slowly through reviews
3. Make few clicks (<10)
4. Read product description

**Expected Result**:
```
Decision: Based on product quality
Confidence: Increased by 10%
Reasoning: Should mention:
  - Deliberative research
  - Careful consideration
  - Suitable for decision-making
Warnings: Minimal
```

---

## Scenario 5: Price Drop Detection

**Test Product**: Product with price history

**Expected Result**:
```
If price dropped 15%+:
  Reasoning: "Price is X% below average—favorable timing for purchase"
  Price Advantage Score: High

If price increased 15%+:
  Reasoning: "Current price is X% above average—consider waiting for a drop"
  Decision: More likely WAIT
```

---

## Scenario 6: Limited Reviews

**Test Product**: Find a product with:
- Rating: Any
- Reviews: <10 reviews

**Expected Result**:
```
Decision: WAIT
Confidence: 50-70%
Reasoning: Should mention:
  - Limited review history
  - Uncertain satisfaction trends
  - More data needed
```

---

## Scenario 7: Emotional State Testing

**Test Different Emotions**:

### Happy Emotion
- Expected: Higher risk tolerance, but still checks for impulsivity
- Confidence: Normal to high

### Anxious Emotion
- Expected: Lower confidence, recommendation to wait
- Reasoning: "Your anxious state suggests taking a pause"

### Fearful Emotion
- Expected: Very conservative recommendations
- Decision: More likely WAIT or AVOID

---

## Verification Checklist

### ✅ Fake Review Detection
- [ ] Detects reviews with excessive exclamation marks
- [ ] Flags reviews with generic phrases
- [ ] Identifies non-verified purchases
- [ ] Detects review bombing (many same-day reviews)
- [ ] Calculates fake review percentage
- [ ] Shows authentic review count

### ✅ Emotional Context
- [ ] Displays current emotion
- [ ] Adjusts confidence based on emotion
- [ ] Detects rushed behavior
- [ ] Detects impulsive behavior
- [ ] Detects deliberative behavior
- [ ] Mentions emotional state in reasoning

### ✅ Multi-Factor Analysis
- [ ] Analyzes review trustworthiness
- [ ] Evaluates emotional stability
- [ ] Assesses price advantage
- [ ] Checks rating consistency
- [ ] Calculates fake review risk

### ✅ Dynamic Confidence
- [ ] Confidence varies by product (not static)
- [ ] Lower confidence for impulsive behavior
- [ ] Lower confidence for high fake review risk
- [ ] Higher confidence for deliberative behavior
- [ ] Range: 30-99%

### ✅ Contextual Reasoning
- [ ] Mentions emotional state
- [ ] Discusses review authenticity
- [ ] Explains satisfaction trends
- [ ] Provides price timing insight
- [ ] Indicates risk/regret likelihood
- [ ] No generic static text

### ✅ Warning System
- [ ] Shows warnings for fake reviews (>40%)
- [ ] Warns about impulsive behavior
- [ ] Alerts on low emotional stability
- [ ] Lists suspicious patterns
- [ ] Warnings are contextual

### ✅ UI Display
- [ ] Shows decision badge (BUY/WAIT/AVOID)
- [ ] Displays confidence percentage
- [ ] Shows reasoning text
- [ ] Lists warnings (if any)
- [ ] Shows factors (rating, authentic reviews, fake risk, mood)
- [ ] Proper color coding (green/orange/red)

---

## Debug Console Checks

Open Chrome DevTools Console and check for:

```javascript
// Should see these logs:
"Emotion detection model loaded (simulated)"
"AI Recommendation error:" // Only if there's an error

// Check stored data:
chrome.storage.local.get(['recommendations'], (data) => {
  console.log('Stored recommendations:', data.recommendations);
});
```

---

## Common Issues & Solutions

### Issue: "AIRecommendationEngine is not defined"
**Solution**: Check manifest.json script loading order. ai-recommendation-engine.js must load before content.js

### Issue: Confidence always same value
**Solution**: Verify behavioral data is being tracked (clicks, movements, timeSpent)

### Issue: No warnings shown
**Solution**: Test with products that have obvious fake reviews (same-day reviews, generic text)

### Issue: Reasoning is generic
**Solution**: Ensure emotion detection is working and behavioral data is collected

### Issue: Fake review percentage is 0%
**Solution**: Check if reviews are being extracted correctly with extractReviews()

---

## Performance Testing

### Load Time
- AI analysis should complete within 1.5-3 seconds
- No page freezing or lag

### Memory Usage
- Check Chrome Task Manager
- Extension should use <50MB memory

### Review Analysis
- Should analyze up to 50 reviews
- Processing time: <500ms for 50 reviews

---

## Manual Testing Script

```javascript
// Run in console to test fake review detection
const detector = new FakeReviewDetector();
const testReview = document.createElement('div');
testReview.textContent = "AMAZING!!! BEST PRODUCT EVER!!! BUY NOW!!!";
const result = detector.analyzeReview(testReview);
console.log('Fake review test:', result);
// Should show high suspicion score

// Test AI engine
const engine = new AIRecommendationEngine();
const testData = {
  rating: 4.5,
  reviewCount: 100,
  currentPrice: 999,
  historicalPrice: [1200, 1100, 1050],
  productName: "Test Product"
};
engine.generateRecommendation(testData, 'Happy', {clicks: 5, timeSpent: 60000}, [])
  .then(result => console.log('AI Recommendation:', result));
```

---

## Success Criteria

The AI Recommendation system is working correctly if:

1. ✅ Decisions vary based on product quality and user behavior
2. ✅ Confidence scores are dynamic (not always same value)
3. ✅ Reasoning is contextual and mentions specific factors
4. ✅ Fake reviews are detected and flagged
5. ✅ Warnings appear for risky situations
6. ✅ Emotional state influences recommendations
7. ✅ Impulsive behavior triggers WAIT recommendations
8. ✅ No console errors
9. ✅ UI displays all information correctly
10. ✅ System works across different e-commerce sites

---

## Reporting Issues

If you find issues, report with:
1. Product URL (if public)
2. Screenshot of recommendation card
3. Console errors (if any)
4. Expected vs actual behavior
5. Browser and extension version
