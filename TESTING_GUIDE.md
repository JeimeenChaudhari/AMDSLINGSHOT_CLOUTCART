# 🧪 Testing Guide

## Pre-Testing Checklist

- [ ] Extension installed in Chrome/Edge
- [ ] Developer mode enabled
- [ ] Extension icon visible in toolbar
- [ ] All features enabled in popup

## Feature Testing

### 1. Emotion Detection Testing

#### Webcam Mode
1. Click extension icon
2. Enable "Emotion Detection"
3. Allow webcam access
4. Verify:
   - [ ] Webcam feed appears in popup
   - [ ] Emotion is detected and displayed
   - [ ] Emotion icon changes
   - [ ] Confidence percentage shows

#### Keyboard/Cursor Mode
1. Enable "Use Keyboard/Cursor Mode"
2. Visit a shopping site
3. Perform actions:
   - Click multiple times rapidly
   - Move mouse around
   - Type in search box
4. Verify:
   - [ ] Emotion changes based on activity
   - [ ] "Anxious" appears with lots of clicks
   - [ ] "Happy" appears with normal activity
   - [ ] Floating panel shows emotion

### 2. Focus Mode Testing

1. Visit Amazon.com
2. Search for any product
3. Verify:
   - [ ] Sponsored items are blurred
   - [ ] Items with "Sponsored" label are faded
   - [ ] Organic results remain clear
   - [ ] Hover slightly unblurs items

**Test URLs:**
- https://www.amazon.com/s?k=laptop
- https://www.walmart.com/search?q=phone
- https://www.ebay.com/sch/i.html?_nkw=tablet

### 3. Price History Testing

1. Visit a product page
2. Wait 2-3 seconds for widget to load
3. Verify:
   - [ ] Price history widget appears near price
   - [ ] Shows lowest, highest, current price
   - [ ] Displays price trend indicator
   - [ ] Green badge if best price

**Test URLs:**
- https://www.amazon.com/dp/B08N5WRWNW (Example product)
- Any product detail page

**Note**: Price history builds over time. First visit will show limited data.

### 4. Price Comparison Testing

1. Visit a product page
2. Wait for comparison widget to load
3. Verify:
   - [ ] Comparison widget appears below title
   - [ ] Shows 4-5 different websites
   - [ ] Prices are sorted (lowest first)
   - [ ] Current site is marked
   - [ ] "View" buttons work

**Expected Behavior:**
- Loading message appears first
- Results populate after 2 seconds
- Prices vary by ±10%

### 5. AI Recommendation Testing

1. Visit a product page
2. Wait for recommendation widget
3. Test different scenarios:

**Scenario A: Good Product**
- Product with 4.5+ stars
- 100+ reviews
- Verify: "BUY" recommendation

**Scenario B: Poor Product**
- Product with <3.5 stars
- Verify: "AVOID" recommendation

**Scenario C: Uncertain**
- Product with <10 reviews
- Verify: "WAIT" recommendation

**Scenario D: Emotional State**
- Set emotion to "Anxious"
- Verify: "WAIT" recommendation regardless

Verify:
- [ ] Recommendation badge shows (BUY/WAIT/AVOID)
- [ ] Reason is displayed
- [ ] Confidence percentage shows
- [ ] Factors include rating, reviews, emotion

### 6. Review Checker Testing

1. Visit a product with reviews
2. Scroll to reviews section
3. Verify:
   - [ ] Review analysis widget appears at top
   - [ ] Authenticity score displays
   - [ ] Suspicious review count shows
   - [ ] Verified purchase percentage shows
   - [ ] Warnings appear if issues found
   - [ ] Some reviews have "⚠️ Suspicious" badge

**Test URLs:**
- Any Amazon product with 20+ reviews
- Look for products with mixed reviews

**Expected Patterns:**
- Short reviews flagged as suspicious
- Reviews with excessive punctuation flagged
- All-caps reviews flagged

## Integration Testing

### Full Workflow Test

1. **Setup** (2 minutes)
   - Install extension
   - Enable all features
   - Choose emotion mode

2. **Browse Products** (3 minutes)
   - Visit Amazon.com
   - Search for "wireless headphones"
   - Browse search results
   - Verify Focus Mode working

3. **View Product** (5 minutes)
   - Click on a product
   - Wait for all widgets to load
   - Check each feature:
     - Price history
     - Comparison
     - Recommendation
     - Review analysis

4. **Test Emotion Impact** (2 minutes)
   - Change emotion (click rapidly for "Anxious")
   - Verify recommendation changes
   - Check floating panel tips

5. **Check Stats** (1 minute)
   - Click extension icon
   - Verify stats updated:
     - Products analyzed count
     - Money saved (if applicable)

## Browser Compatibility Testing

### Chrome
- [ ] Extension installs
- [ ] All features work
- [ ] No console errors
- [ ] Performance acceptable

### Edge
- [ ] Extension installs
- [ ] All features work
- [ ] No console errors
- [ ] Performance acceptable

## Performance Testing

### Load Time
- [ ] Extension loads in <100ms
- [ ] Widgets appear in <3 seconds
- [ ] No page lag or freezing

### Memory Usage
1. Open Chrome Task Manager (Shift+Esc)
2. Find extension process
3. Verify:
   - [ ] Memory <100MB
   - [ ] CPU <5% when idle

### Network
- [ ] No external API calls (privacy)
- [ ] All processing local

## Error Testing

### Common Errors to Test

1. **No Webcam**
   - Deny camera permission
   - Verify: Graceful error message

2. **Unsupported Website**
   - Visit non-shopping site
   - Verify: Extension doesn't interfere

3. **No Product Found**
   - Visit shopping site homepage
   - Verify: No errors, features don't activate

4. **Slow Connection**
   - Throttle network in DevTools
   - Verify: Features still load

## Debug Testing

### Console Checks
1. Open DevTools (F12)
2. Go to Console tab
3. Verify:
   - [ ] No red errors
   - [ ] Only info/log messages
   - [ ] Extension messages visible

### Storage Checks
1. Open DevTools > Application > Storage
2. Check Chrome Storage
3. Verify:
   - [ ] Settings saved correctly
   - [ ] Price history stored
   - [ ] Stats updated

## Regression Testing

After any code changes, test:
- [ ] All 6 features still work
- [ ] No new console errors
- [ ] Settings persist after reload
- [ ] Extension icon clickable
- [ ] Popup opens correctly

## User Acceptance Testing

### Usability
- [ ] UI is intuitive
- [ ] Features are discoverable
- [ ] Tooltips are helpful
- [ ] Colors are accessible

### Functionality
- [ ] All features work as described
- [ ] No unexpected behavior
- [ ] Performance is acceptable
- [ ] Privacy is maintained

## Bug Reporting Template

If you find a bug, report it with:

```
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Browser**: Chrome/Edge [version]
**Extension Version**: 1.0.0
**URL**: [Where it happened]
**Console Errors**: [Any errors from F12]
**Screenshots**: [If applicable]
```

## Test Results Template

```
**Test Date**: [Date]
**Tester**: [Name]
**Browser**: [Chrome/Edge + version]

**Feature Test Results**:
- Emotion Detection: ✅/❌
- Focus Mode: ✅/❌
- Price History: ✅/❌
- Price Comparison: ✅/❌
- AI Recommendation: ✅/❌
- Review Checker: ✅/❌

**Issues Found**: [Number]
**Critical Issues**: [Number]
**Notes**: [Any observations]
```

## Automated Testing (Future)

For production, consider:
- Jest for unit tests
- Puppeteer for E2E tests
- Chrome Extension Testing Framework
- CI/CD pipeline

## Support

If tests fail:
1. Check browser console for errors
2. Verify extension is enabled
3. Try refreshing the page
4. Reload the extension
5. Check TROUBLESHOOTING.md

---

**Happy Testing! 🧪**