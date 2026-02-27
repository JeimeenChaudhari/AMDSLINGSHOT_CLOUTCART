# Keyboard & Cursor Emotion Detection Agent - Usage Guide

## Overview

The `keyboard-cursor-emotion-detector` agent is now available in your workspace. This autonomous agent will implement a complete keyboard and cursor-based emotion detection system for your browser extension.

## What This Agent Does

This agent will create a production-ready emotion detection system that:

1. **Collects Behavioral Data** - Tracks keystroke patterns, mouse movements, scroll behavior, and page interactions
2. **Extracts Features** - Processes raw data into meaningful features (40+ behavioral metrics)
3. **Predicts Emotions** - Uses a lightweight ML model (TensorFlow.js) to classify emotions in real-time
4. **Learns Continuously** - Improves accuracy over time based on user feedback and interactions
5. **Integrates Seamlessly** - Works with your existing emotion detection and recommendation system
6. **Respects Privacy** - All data stays local in the browser, no external transmission

## How to Use This Agent

### Option 1: Using Kiro's Agent Invocation (Recommended)

Simply ask Kiro to invoke the agent:

```
@keyboard-cursor-emotion-detector implement the complete keyboard emotion detection system
```

Or more specifically:

```
@keyboard-cursor-emotion-detector analyze the codebase and implement all necessary modules for keyboard-based emotion detection
```

### Option 2: Direct Request

You can also just ask Kiro naturally:

```
Use the keyboard-cursor-emotion-detector agent to build the emotion detection feature
```

## What the Agent Will Create

### New Files (6 core modules)
1. `models/behavioral-data-collector.js` - Real-time data collection
2. `models/feature-extractor.js` - Feature engineering pipeline
3. `models/emotion-ml-model.js` - TensorFlow.js ML model
4. `utils/training-data-manager.js` - IndexedDB storage
5. `utils/model-trainer.js` - Training pipeline
6. `background/training-scheduler.js` - Background retraining

### Modified Files (5 integrations)
1. `models/emotion-detection.js` - Enhanced with behavioral detection
2. `content/content.js` - Initialize behavioral collector
3. `popup/popup.js` - Training UI and status
4. `popup/popup.html` - Training controls
5. `manifest.json` - Updated permissions if needed

## Expected Implementation Flow

The agent will work through these phases autonomously:

### Phase 1: Analysis (5-10 minutes)
- Analyze existing emotion detection architecture
- Review integration points with AIRecommendationEngine
- Understand current popup UI and settings system

### Phase 2: Core Infrastructure (15-20 minutes)
- Create behavioral data collector
- Implement feature extraction pipeline
- Set up IndexedDB storage manager

### Phase 3: ML Model (20-30 minutes)
- Implement TensorFlow.js neural network
- Create training pipeline with backpropagation
- Add model serialization/deserialization
- Generate initial training dataset

### Phase 4: Integration (10-15 minutes)
- Update EmotionDetector class
- Modify content scripts
- Enhance popup UI with training controls
- Add keyboard mode settings

### Phase 5: Testing & Optimization (10-15 minutes)
- Test end-to-end pipeline
- Verify performance metrics
- Optimize for browser context
- Document usage

**Total Estimated Time: 60-90 minutes**

## Technical Specifications

### Input Features (40 total)
- **Keystroke**: typing speed, rhythm, pauses, corrections, hold duration
- **Mouse**: velocity, acceleration, jitter, clicks, hover patterns
- **Scroll**: speed, direction changes, pause frequency
- **Interaction**: time on page, action density, focus changes
- **Temporal**: time of day, day of week

### ML Model Architecture
```
Input: 40 features
Hidden Layer 1: 64 neurons (ReLU)
Hidden Layer 2: 32 neurons (ReLU)
Output: 8 emotions (Softmax)
```

### Emotion Classes
- Happy
- Sad
- Angry
- Anxious
- Neutral
- Surprised
- Fearful
- Disgusted

### Performance Targets
- Model size: <500KB
- Inference latency: <100ms
- Memory usage: <50MB
- CPU usage: <5% average
- Initial accuracy: >60%
- Trained accuracy: >70%

## After Implementation

### Testing the Feature

1. **Load the Extension**
   ```bash
   # In Chrome: chrome://extensions/
   # Enable Developer Mode
   # Click "Load unpacked" and select your extension directory
   ```

2. **Enable Keyboard Mode**
   - Open extension popup
   - Toggle "Keyboard Mode" ON
   - Toggle "Emotion Detection" ON

3. **Test Behavioral Detection**
   - Visit a shopping site (Amazon, Flipkart, etc.)
   - Interact naturally (type, click, scroll)
   - Check console for emotion predictions
   - Verify recommendations adapt to detected emotions

4. **Monitor Training**
   - Open popup to see training progress
   - Provide feedback on emotion predictions
   - Watch accuracy improve over time

### Verifying Success

Check that:
- ✅ No console errors during data collection
- ✅ Emotion predictions appear in real-time
- ✅ Training data is stored in IndexedDB
- ✅ Model retrains with new data
- ✅ Recommendations adapt to detected emotions
- ✅ Performance remains smooth (<5% CPU)
- ✅ Privacy is maintained (no external requests)

## Customization Options

After implementation, you can customize:

1. **Feature Weights** - Adjust importance of different behavioral signals
2. **Model Architecture** - Change layer sizes or add dropout
3. **Training Schedule** - Modify retraining frequency
4. **Data Retention** - Adjust storage limits and cleanup policies
5. **Emotion Mapping** - Fine-tune behavioral patterns to emotions
6. **Feedback Mechanisms** - Add more implicit feedback signals

## Troubleshooting

If the agent encounters issues:

1. **Check Dependencies**
   - Ensure TensorFlow.js can be loaded
   - Verify IndexedDB is available
   - Check browser compatibility

2. **Review Integration Points**
   - Confirm existing files haven't changed structure
   - Verify manifest.json permissions
   - Check content script injection

3. **Monitor Performance**
   - Use Chrome DevTools Performance tab
   - Check memory usage in Task Manager
   - Profile data collection overhead

## Privacy & Security

The agent implements:
- ✅ Local-only data storage (IndexedDB)
- ✅ No external API calls
- ✅ Data anonymization
- ✅ User-controlled data deletion
- ✅ 30-day data retention limit
- ✅ Transparent data collection disclosure

## Next Steps

After the agent completes implementation:

1. **Test thoroughly** on multiple shopping sites
2. **Collect training data** through normal usage
3. **Monitor accuracy** improvements over time
4. **Gather user feedback** on emotion predictions
5. **Fine-tune parameters** based on real-world performance
6. **Document findings** for future improvements

## Support

If you need modifications or enhancements:
- Ask Kiro to invoke the agent again with specific requests
- The agent can iterate on its implementation
- All code is well-documented for manual adjustments

---

**Ready to start?** Just say:

```
@keyboard-cursor-emotion-detector implement the complete system
```

The agent will handle everything autonomously!
