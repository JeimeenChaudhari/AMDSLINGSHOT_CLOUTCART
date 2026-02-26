# AI Recommendation Engine - Visual Examples

## What Users Will See

### Example 1: High-Quality Product + Calm User

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI Recommendation                                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  ┌──────┐                                              │ │
│ │  │ BUY  │  ← Green badge                               │ │
│ │  └──────┘                                              │ │
│ │                                                         │ │
│ │  Your neutral state indicates calm browsing, suitable  │ │
│ │  for decision-making. Strong review authenticity with  │ │
│ │  78% verified purchases. Product shows consistent      │ │
│ │  satisfaction with stable ratings across many reviews. │ │
│ │  Price is 15% below average—favorable timing for       │ │
│ │  purchase. ✓ Low regret risk—conditions favor a        │ │
│ │  confident decision.                                    │ │
│ │                                                         │ │
│ │  Confidence: 92%                                        │ │
│ │                                                         │ │
│ │  ┌──────────────┬──────────────┬──────────────┐       │ │
│ │  │ ⭐ Rating:   │ 🔍 Authentic:│ ⚠️ Fake Risk:│       │ │
│ │  │ 4.7/5        │ 142 reviews  │ 8%           │       │ │
│ │  │ (182 reviews)│              │              │       │ │
│ │  ├──────────────┴──────────────┴──────────────┤       │ │
│ │  │ 😊 Your mood: Neutral                      │       │ │
│ │  └────────────────────────────────────────────┘       │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### Example 2: Suspicious Product + Anxious User

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI Recommendation                                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  ┌────────┐                                            │ │
│ │  │ AVOID  │  ← Red badge                               │ │
│ │  └────────┘                                            │ │
│ │                                                         │ │
│ │  Your anxious state with rushed navigation suggests    │ │
│ │  taking a pause before deciding. ⚠️ High fake review   │ │
│ │  risk (58% suspicious)—authenticity is questionable.   │ │
│ │  Rating consistency is moderate—customer satisfaction  │ │
│ │  varies. Current price is 12% above average—consider   │ │
│ │  waiting for a drop. ⛔ High regret likelihood—        │ │
│ │  multiple risk factors present.                        │ │
│ │                                                         │ │
│ │  Confidence: 38%                                        │ │
│ │                                                         │ │
│ │  ┌────────────────────────────────────────────────┐   │ │
│ │  │ ⚠️ WARNINGS                                    │   │ │
│ │  ├────────────────────────────────────────────────┤   │ │
│ │  │ ⚠️ 58% of reviews appear fake or manipulated   │   │ │
│ │  │ ⚠️ Your current browsing pattern suggests      │   │ │
│ │  │    impulsive behavior                          │   │ │
│ │  │ ⚠️ Your emotional state may affect decision    │   │ │
│ │  │    quality                                      │   │ │
│ │  │ ⚠️ Suspicious patterns: Review bombing,        │   │ │
│ │  │    Duplicate content                           │   │ │
│ │  └────────────────────────────────────────────────┘   │ │
│ │                                                         │ │
│ │  ┌──────────────┬──────────────┬──────────────┐       │ │
│ │  │ ⭐ Rating:   │ 🔍 Authentic:│ ⚠️ Fake Risk:│       │ │
│ │  │ 4.2/5        │ 19 reviews   │ 58%          │       │ │
│ │  │ (85 reviews) │              │              │       │ │
│ │  ├──────────────┴──────────────┴──────────────┤       │ │
│ │  │ 😊 Your mood: Anxious                      │       │ │
│ │  └────────────────────────────────────────────┘       │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### Example 3: Good Deal + Impulsive User

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI Recommendation                                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  ┌──────┐                                              │ │
│ │  │ WAIT │  ← Orange badge                              │ │
│ │  └──────┘                                              │ │
│ │                                                         │ │
│ │  Detected happy emotion with impulsive patterns—       │ │
│ │  consider waiting to avoid regret. Review sentiment    │ │
│ │  appears genuine with 34 authentic reviews detected.   │ │
│ │  Product shows consistent satisfaction with stable     │ │
│ │  ratings across several reviews. Price is 22% below    │ │
│ │  average—favorable timing for purchase. Impulsive      │ │
│ │  buying detected—waiting reduces regret risk by 60%.   │ │
│ │                                                         │ │
│ │  Confidence: 68%                                        │ │
│ │                                                         │ │
│ │  ┌────────────────────────────────────────────────┐   │ │
│ │  │ ⚠️ WARNINGS                                    │   │ │
│ │  ├────────────────────────────────────────────────┤   │ │
│ │  │ ⚠️ Your current browsing pattern suggests      │   │ │
│ │  │    impulsive behavior                          │   │ │
│ │  └────────────────────────────────────────────────┘   │ │
│ │                                                         │ │
│ │  ┌──────────────┬──────────────┬──────────────┐       │ │
│ │  │ ⭐ Rating:   │ 🔍 Authentic:│ ⚠️ Fake Risk:│       │ │
│ │  │ 4.6/5        │ 34 reviews   │ 18%          │       │ │
│ │  │ (42 reviews) │              │              │       │ │
│ │  ├──────────────┴──────────────┴──────────────┤       │ │
│ │  │ 😊 Your mood: Happy                        │       │ │
│ │  └────────────────────────────────────────────┘       │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### Example 4: Limited Reviews + Neutral User

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI Recommendation                                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  ┌──────┐                                              │ │
│ │  │ WAIT │  ← Orange badge                              │ │
│ │  └──────┘                                              │ │
│ │                                                         │ │
│ │  Your neutral state indicates calm browsing, suitable  │ │
│ │  for decision-making. Review sentiment appears genuine │ │
│ │  with 7 authentic reviews detected. Limited review     │ │
│ │  history makes satisfaction trends uncertain—more data │ │
│ │  needed. Price is stable with no significant trends    │ │
│ │  detected. Moderate confidence—additional research     │ │
│ │  recommended.                                           │ │
│ │                                                         │ │
│ │  Confidence: 58%                                        │ │
│ │                                                         │ │
│ │  ┌──────────────┬──────────────┬──────────────┐       │ │
│ │  │ ⭐ Rating:   │ 🔍 Authentic:│ ⚠️ Fake Risk:│       │ │
│ │  │ 4.3/5        │ 7 reviews    │ 12%          │       │ │
│ │  │ (8 reviews)  │              │              │       │ │
│ │  ├──────────────┴──────────────┴──────────────┤       │ │
│ │  │ 😊 Your mood: Neutral                      │       │ │
│ │  └────────────────────────────────────────────┘       │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### Example 5: Price Spike + Fearful User

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI Recommendation                                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  ┌──────┐                                              │ │
│ │  │ WAIT │  ← Orange badge                              │ │
│ │  └──────┘                                              │ │
│ │                                                         │ │
│ │  Your fearful state indicates hesitant exploration,    │ │
│ │  which is wise for this purchase. Strong review        │ │
│ │  authenticity with 82% verified purchases. Product     │ │
│ │  shows consistent satisfaction with stable ratings     │ │
│ │  across many reviews. Current price is 24% above       │ │
│ │  average—consider waiting for a drop. ⚠️ Moderate     │ │
│ │  risk of post-purchase regret due to uncertainty       │ │
│ │  factors.                                               │ │
│ │                                                         │ │
│ │  Confidence: 52%                                        │ │
│ │                                                         │ │
│ │  ┌────────────────────────────────────────────────┐   │ │
│ │  │ ⚠️ WARNINGS                                    │   │ │
│ │  ├────────────────────────────────────────────────┤   │ │
│ │  │ ⚠️ Your emotional state may affect decision    │   │ │
│ │  │    quality                                      │   │ │
│ │  └────────────────────────────────────────────────┘   │ │
│ │                                                         │ │
│ │  ┌──────────────┬──────────────┬──────────────┐       │ │
│ │  │ ⭐ Rating:   │ 🔍 Authentic:│ ⚠️ Fake Risk:│       │ │
│ │  │ 4.8/5        │ 156 reviews  │ 6%           │       │ │
│ │  │ (189 reviews)│              │              │       │ │
│ │  ├──────────────┴──────────────┴──────────────┤       │ │
│ │  │ 😊 Your mood: Fearful                      │       │ │
│ │  └────────────────────────────────────────────┘       │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### Example 6: Excellent Product + Deliberative User

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI Recommendation                                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  ┌──────┐                                              │ │
│ │  │ BUY  │  ← Green badge                               │ │
│ │  └──────┘                                              │ │
│ │                                                         │ │
│ │  Your neutral state indicates deliberative research,   │ │
│ │  suitable for decision-making. Strong review           │ │
│ │  authenticity with 91% verified purchases. Product     │ │
│ │  shows consistent satisfaction with stable ratings     │ │
│ │  across many reviews. Price is 18% below average—      │ │
│ │  favorable timing for purchase. ✓ Low regret risk—     │ │
│ │  conditions favor a confident decision.                │ │
│ │                                                         │ │
│ │  Confidence: 96%                                        │ │
│ │                                                         │ │
│ │  ┌──────────────┬──────────────┬──────────────┐       │ │
│ │  │ ⭐ Rating:   │ 🔍 Authentic:│ ⚠️ Fake Risk:│       │ │
│ │  │ 4.9/5        │ 287 reviews  │ 3%           │       │ │
│ │  │ (315 reviews)│              │              │       │ │
│ │  ├──────────────┴──────────────┴──────────────┤       │ │
│ │  │ 😊 Your mood: Neutral                      │       │ │
│ │  └────────────────────────────────────────────┘       │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Color Coding

### Decision Badges

```
┌──────┐
│ BUY  │  ← Green background (#48bb78), white text
└──────┘

┌──────┐
│ WAIT │  ← Orange background (#ed8936), white text
└──────┘

┌────────┐
│ AVOID  │  ← Red background (#f56565), white text
└────────┘
```

### Border Colors

```
BUY card:   Left border = Green (#48bb78)
WAIT card:  Left border = Orange (#ed8936)
AVOID card: Left border = Red (#f56565)
```

### Warning Box

```
┌────────────────────────────────────────────────┐
│ ⚠️ WARNINGS                                    │
├────────────────────────────────────────────────┤
│ Yellow background (#fff3cd)                    │
│ Orange left border (#ffc107)                   │
│ Brown text (#856404)                           │
└────────────────────────────────────────────────┘
```

---

## Confidence Visualization

```
Confidence: 96%  ← Very High (90-99%)   Green feeling
Confidence: 85%  ← High (80-89%)        Confident
Confidence: 72%  ← Moderate (70-79%)    Okay
Confidence: 58%  ← Medium (50-69%)      Uncertain
Confidence: 42%  ← Low (40-49%)         Doubtful
Confidence: 35%  ← Very Low (30-39%)    Risky
```

---

## Emoji Usage

```
🤖  AI Recommendation (header)
⭐  Rating
🔍  Authentic reviews
⚠️  Fake risk / Warnings
😊  User mood
✓   Low risk (positive)
⛔  High risk (negative)
```

---

## Responsive Layout

### Desktop (>768px)
```
┌─────────────────────────────────────────────────┐
│ Full width card with 3-column factor grid       │
└─────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌───────────────────────┐
│ Stacked layout        │
│ 2-column factor grid  │
└───────────────────────┘
```

---

## Animation

```
Card appears with:
- Slide in from right (400px → 0)
- Fade in (opacity 0 → 1)
- Duration: 0.5s ease-out
```

---

## Loading State

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI Recommendation                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│              Analyzing product with AI...                   │
│                    (italic, gray)                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Error State

```
┌─────────────────────────────────────────────────────────────┐
│ 🤖 AI Recommendation                                        │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │  ┌──────┐                                              │ │
│ │  │ WAIT │                                              │ │
│ │  └──────┘                                              │ │
│ │                                                         │ │
│ │  Unable to analyze product completely. Please review   │ │
│ │  manually.                                              │ │
│ │                                                         │ │
│ │  Confidence: 50%                                        │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Placement on Page

```
Product Page Layout:

┌─────────────────────────────────────────┐
│ [Product Image]                         │
│                                         │
│ Product Title                           │
│ ⭐⭐⭐⭐⭐ 4.5 (182 reviews)            │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🤖 AI Recommendation                │ │ ← Inserted here
│ │ [Full recommendation card]          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Price: $99.99                           │
│ [Add to Cart]                           │
│                                         │
│ Product Description...                  │
└─────────────────────────────────────────┘
```

---

## User Interaction

```
No interaction required - card is informational only

Future enhancements could add:
- Click to expand reasoning
- Thumbs up/down feedback
- "Tell me more" button
- Share recommendation
```

---

## Accessibility

```
- Semantic HTML structure
- ARIA labels for screen readers
- Color contrast ratios meet WCAG AA
- Keyboard navigation support
- Focus indicators
- Alt text for icons
```

---

## Print View

```
Card maintains layout when printed
Colors convert to grayscale appropriately:
- BUY: Dark border
- WAIT: Medium border
- AVOID: Light border
```

---

This visual guide shows exactly what users will experience with the new AI Recommendation system. Each example demonstrates different scenarios with realistic reasoning, confidence scores, and warnings.
