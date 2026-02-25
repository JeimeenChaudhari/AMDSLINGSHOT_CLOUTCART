# ⚡ Quick Reference Card

## Installation (30 seconds)
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select extension folder
5. Done! ✅

## Features Cheat Sheet

| Feature | What It Does | Where to See It |
|---------|-------------|-----------------|
| 😊 Emotion Detection | Tracks your mood | Popup + Floating panel |
| 🎯 Focus Mode | Blurs sponsored items | Product listings |
| 📊 Price History | Shows price trends | Product page (near price) |
| 🔍 Comparison | Compares websites | Product page (below title) |
| 🤖 AI Recommendation | Buy/Wait/Avoid advice | Product page |
| ✅ Review Checker | Detects fake reviews | Reviews section |

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Open popup | Click extension icon |
| Toggle features | Use switches in popup |
| Minimize panel | Click "−" on floating panel |

## Supported Websites
- ✅ Amazon.com / Amazon.in
- ✅ Flipkart.com
- ✅ eBay.com
- ✅ Walmart.com
- ✅ Target.com

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Extension not working | Refresh page |
| Webcam not starting | Allow camera permission |
| Features not showing | Enable in popup |
| Floating panel missing | Scroll down page |
| Sponsored items not blurred | Enable Focus Mode |

## File Structure
```
manifest.json          → Extension config
popup/                 → User interface
content/               → Page features
background/            → Background tasks
models/                → AI models
utils/                 → Helper functions
```

## Key Settings

### Emotion Detection
- **Webcam Mode**: Real-time face detection
- **Keyboard Mode**: Activity-based inference

### Privacy
- All data stored locally
- No external tracking
- Optional webcam

## Demo Flow (2 minutes)
1. Install extension
2. Visit Amazon.com
3. Search "laptop"
4. Click product
5. See all 6 features!

## Stats Tracking
- Money saved
- Products analyzed
- View in popup

## For Developers

### Edit Features
- `content/content.js` → Main logic
- `popup/popup.js` → UI controls
- `content/content.css` → Styling

### Add Website Support
Edit `manifest.json`:
```json
"matches": ["*://newsite.com/*"]
```

### Debug
1. F12 → Console
2. Check for errors
3. View Chrome Storage

## Important Links
- README.md → Full documentation
- SETUP_GUIDE.md → Installation help
- TESTING_GUIDE.md → Testing instructions
- API_INTEGRATION_GUIDE.md → API setup

## Support
- Check console (F12) for errors
- Reload extension if issues
- Refresh page after changes

---

**Print this for quick reference! 📄**
