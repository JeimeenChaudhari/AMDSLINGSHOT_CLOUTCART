# Quick Start Guide - Keyboard Emotion Detection

## 🚀 Get Started in 3 Minutes

### Step 1: Load Extension (30 seconds)

1. Open Chrome/Edge
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select your extension folder
6. Extension icon appears in toolbar ✅

### Step 2: Enable Keyboard Mode (30 seconds)

1. Click extension icon in toolbar
2. Toggle **"Emotion Detection"** ON
3. Toggle **"Use Keyboard/Cursor Mode"** ON
4. You'll see training stats appear below ✅

### Step 3: Test It! (2 minutes)

1. Visit any shopping site:
   - Amazon: https://www.amazon.com
   - Flipkart: https://www.flipkart.com
   - Walmart: https://www.walmart.com

2. Look for floating panel (bottom-right corner)

3. Interact with the page:
   - Type in search box
   - Move mouse around
   - Click on products
   - Scroll up and down

4. Watch emotion update in real-time! 😊

## ✅ Verify It's Working

### You Should See:

1. **Floating Panel** (bottom-right)
   - Shows current emotion (e.g., "Happy (85%)")
   - Has 👍 and 👎 feedback buttons
   - Displays training stats

2. **Browser Console** (F12)
   ```
   [BehavioralCollector] Started collecting behavioral data
   [EmotionML] Model initialized, training count: 100
   [EmotionDetector] Behavioral detection initialized successfully
   ```

3. **Extension Popup**
   - Training Samples: increasing
   - Model Accuracy: 60%+
   - Training Count: increasing

### If Something's Wrong:

- **No floating panel?** → Refresh the page
- **No emotion updates?** → Check console for errors
- **Console errors?** → See TESTING_KEYBOARD_EMOTION.md

## 🎯 Improve Accuracy

### Provide Feedback:

- Click **👍 Correct** when emotion is right
- Click **👎 Wrong** when emotion is wrong
- The model learns from your feedback!

### Use Regularly:

- Shop normally on supported sites
- The more you use it, the better it gets
- Aim for 50+ training samples

## 📊 Monitor Progress

### In Extension Popup:

- **Training Samples**: Should increase as you browse
- **Model Accuracy**: Should improve over time (target: 70%+)
- **Training Count**: Shows retraining iterations

### Expected Timeline:

- **0-10 samples**: 60% accuracy (initial)
- **10-50 samples**: 65% accuracy (learning)
- **50-100 samples**: 70% accuracy (trained)
- **100+ samples**: 75%+ accuracy (optimized)

## 🧪 Test Different Emotions

### Happy Shopping:
- Fast, smooth typing
- Quick mouse movements
- Moderate clicking
- **Expected**: Happy (70-90%)

### Anxious Browsing:
- Rapid, erratic movements
- Many clicks quickly
- Frequent direction changes
- **Expected**: Anxious (65-85%)

### Neutral Browsing:
- Moderate typing
- Steady movements
- Occasional clicks
- **Expected**: Neutral (60-80%)

### Frustrated Shopping:
- Fast typing with backspaces
- Aggressive clicking
- Rapid scrolling
- **Expected**: Angry (60-80%)

## 🔧 Debug Commands

### Check Training Data:

```javascript
// In browser console (F12)
chrome.storage.local.get(['trainingStats'], (result) => {
  console.log('Stats:', result.trainingStats);
});
```

### Check Model:

```javascript
chrome.storage.local.get(['emotionMLModel'], (result) => {
  console.log('Training count:', result.emotionMLModel?.trainingCount);
});
```

### Force Retrain:

```javascript
// On shopping site
if (emotionDetector && emotionDetector.modelTrainer) {
  emotionDetector.modelTrainer.retrain();
}
```

## 📚 More Information

- **Full Documentation**: See KEYBOARD_EMOTION_DETECTION.md
- **Testing Guide**: See TESTING_KEYBOARD_EMOTION.md
- **Implementation Details**: See IMPLEMENTATION_COMPLETE.md

## 🎉 Success!

If you see:
- ✅ Emotion predictions appearing
- ✅ Confidence scores showing
- ✅ Training stats increasing
- ✅ No console errors

**Congratulations! The keyboard emotion detection is working!** 🎊

Now just use it normally and watch it improve over time.

---

**Need Help?** Check the troubleshooting section in TESTING_KEYBOARD_EMOTION.md
