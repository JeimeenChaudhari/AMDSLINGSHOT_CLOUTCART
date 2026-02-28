# AI Recommendation Engine - Decision Logic

## Overview
The AI recommendation engine analyzes multiple factors to provide intelligent purchase recommendations that consider review authenticity, emotional state, pricing, and product ratings.

## Decision Flow

### Input Factors (Weighted)
1. **Review Trustworthiness** (30%) - Based on authentic vs fake review ratio
2. **Emotional Stability** (20%) - User's emotional state and browsing behavior
3. **Price Advantage** (25%) - Current price vs historical average
4. **Rating Consistency** (25%) - Product rating quality and review count

### Decision Matrix

| Fake Risk | Decision Score | Emotional State | Recommendation |
|-----------|---------------|-----------------|----------------|
| >50% | Any | Any | **AVOID** |
| >30% | <60% | Any | **AVOID** |
| <30% | ≥75% | Calm | **BUY** |
| <20% | ≥60% | Calm | **BUY** |
| Any | <80% | Impulsive | **WAIT** |
| Any | <70% | Rushed | **WAIT** |
| Any | ≥50% | Any | **WAIT** |
| Any | <50% | Any | **AVOID** |

## Review Analysis

### Fake Review Detection
Reviews are flagged as suspicious based on:
- Not verified purchase (+15 suspicion)
- Too short (<30 chars) (+25 suspicion)
- Suspicious patterns (+15 each):
  - Repeated characters (e.g., "amazingggg")
  - Excessive superlatives
  - Urgency language ("buy now!")
  - Generic phrases
- Excessive punctuation (+10)
- Extreme sentiment (+15)

**Threshold:** Suspicion score ≥40 = Fake review

### Trust Score Calculation
```
trustScore = (authenticRatio × 0.5) + 
             ((1 - fakeRatio) × 0.3) + 
             (verifiedRatio × 0.2)
```

### Fake Risk Levels
- **High Risk** (>50%): "⚠️ High fake review risk - authenticity questionable"
- **Moderate Risk** (30-50%): "⚠️ Moderate fake review risk"
- **Low Risk** (15-30%): "Minor concerns detected"
- **Very Low Risk** (<15%): "✓ Strong authenticity" or "✓ Genuine sentiment"

## Emotional State Analysis

### Behavioral Patterns
- **Rushed**: Many clicks (>15), short time (<30s) → Stability ×0.6
- **Hesitant**: Many scrolls (>20), few clicks (<5) → Stability ×0.7
- **Impulsive**: Many clicks (>10), short time (<20s) → Stability ×0.5
- **Deliberative**: Long time (>2min), few clicks (<10) → Stability ×1.2

### Emotional Modifiers
- **Happy/Excited**: Higher impulsivity, may need protection
- **Sad/Angry**: Lower decision clarity, recommend waiting
- **Neutral**: Baseline stability
- **Surprised**: Moderate impulsivity

## Price Analysis

### Price Trends
- **Significant Drop** (<-15%): Advantage score 0.9, "Good deal"
- **Price Drop** (-5% to -15%): Advantage score 0.75, "Good deal"
- **Stable** (-5% to +5%): Advantage score 0.5
- **Price Increase** (+5% to +15%): Advantage score 0.4
- **Price Spike** (>+15%): Advantage score 0.2

## Rating Quality

### Consistency Score
- <10 reviews: 0.3 (Low confidence)
- 10-50 reviews: 0.5 (Moderate)
- 50-200 reviews: 0.7 (Good)
- >200 reviews: 0.9 (Excellent)

**Adjustments:**
- Rating ≥4.5: ×1.1 bonus
- Rating <3.5: ×0.7 penalty

## Confidence Calculation

```
baseConfidence = (trustworthiness × 30) + 
                 (ratingConsistency × 25) + 
                 (priceAdvantage × 20) + 
                 ((1 - fakeRisk) × 25)

finalConfidence = baseConfidence × emotionalStability × behaviorModifier
```

**Behavior Modifiers:**
- Rushed/Impulsive: ×0.7
- Hesitant: ×0.8
- Deliberative: ×1.1
- High fake risk (>50%): ×0.5

**Range:** 30% - 99%

## Purchase Recommendation Labels

| Fake Risk | Rating | Reviews | Label |
|-----------|--------|---------|-------|
| >50% | Any | Any | ❌ Not Recommended |
| 30-50% | Any | Any | ⚠️ Select Alternative |
| <20% | ≥4.0 | ≥50 | ✅ You Should Buy |
| <25% | ≥3.5 | Any | ⏳ Consider Later |
| Any | <3.5 | Any | ⚠️ Select Alternative |

## Example Scenarios

### Scenario 1: High Quality Product
- Rating: 4.5/5, 100 reviews
- Fake risk: 10%
- Price: 20% below average
- Emotion: Neutral
- **Result:** BUY (Confidence: 85%)

### Scenario 2: Suspicious Product
- Rating: 4.8/5, 30 reviews
- Fake risk: 60%
- Price: Stable
- Emotion: Excited
- **Result:** AVOID (Confidence: 35%)

### Scenario 3: Impulsive Buyer
- Rating: 4.2/5, 80 reviews
- Fake risk: 15%
- Price: 10% above average
- Emotion: Excited, rushed behavior
- **Result:** WAIT (Confidence: 55%)

## Debugging

Enable console logs to see:
```javascript
[AI Engine] Starting recommendation generation
[Fake Review Detector] Analyzing reviews: X
[AI Engine] Review analysis: {...}
[AI Engine] Decision factors: {...}
[AI Engine] Decision: {...}
[AI Engine] Final recommendation: {...}
```

## Testing

Use `test-recommendation-logic.html` to validate different scenarios and ensure consistent behavior.
