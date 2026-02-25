# 🛍️ Emotion-Adaptive Shopping Assistant

An AI-powered browser extension for AMD Slingshot Hackathon that enhances online shopping with emotion detection, price tracking, and smart recommendations.

## 🎯 Main Features (6 Working MVPs)

### 1. 😊 Emotion Detection (Dual Mode)
- **Webcam Mode**: Real-time emotion detection (Happy, Sad, Angry, Surprised, Neutral, Anxious, Fearful, Disgusted)
- **Keyboard/Cursor Mode**: Privacy-focused emotion inference from user activity patterns
- Adapts shopping recommendations based on emotional state

### 2. 🎯 Focus Mode
- Automatically blurs sponsored items and ads
- Helps users focus on organic search results
- Reduces impulse buying from promoted content

### 3. 📊 Price History Tracker
- Tracks price changes for every product
- Shows lowest, highest, and average prices
- Alerts when product is at best price
- 90-day price history storage

### 4. 🔍 Multi-Website Price Comparison (25+ Sites!)
- **US Sites**: Amazon, Walmart, eBay, Target, Best Buy, Newegg, AliExpress, Etsy
- **Indian Sites**: Flipkart, Amazon India, Myntra, Ajio, Snapdeal, Meesho, Tata CLiQ, Nykaa, FirstCry, Pepperfry, Croma, Reliance Digital
- **International**: Amazon UK, Amazon DE, Amazon CA, Argos
- One-click search on any website
- Organized by region for easy navigation
- Real product search URLs (no fake links!)
- Works on all supported e-commerce sites

### 5. 🤖 AI Buy/Not Buy Recommendations
- Analyzes product ratings, reviews, and price trends
- Considers user's emotional state
- Provides confidence scores
- Explains reasoning behind recommendations

### 6. ✅ Fake Review Checker
- Detects suspicious review patterns
- Analyzes review authenticity
- Flags potentially fake reviews
- Shows verified purchase percentage

## 🚀 Installation

### For Development/Testing

1. **Clone or download this repository**

2. **Open Chrome/Edge browser**

3. **Navigate to Extensions page**:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

4. **Enable Developer Mode** (toggle in top-right corner)

5. **Click "Load unpacked"**

6. **Select the extension folder** containing `manifest.json`

7. **Extension is now installed!** Look for the icon in your toolbar

## 📱 How to Use

### Initial Setup

1. Click the extension icon in your browser toolbar
2. Configure your preferences:
   - Enable/disable emotion detection
   - Choose webcam or keyboard mode
   - Toggle individual features on/off

### Using Emotion Detection

**Webcam Mode:**
- Click "Enable Emotion Detection"
- Allow webcam access when prompted
- Your emotion will be detected in real-time

**Keyboard/Cursor Mode (Privacy-Friendly):**
- Check "Use Keyboard/Cursor Mode"
- Extension infers emotion from your browsing patterns
- No webcam required!

### Shopping with the Assistant

1. Visit any supported shopping website:
   - Amazon.com / Amazon.in
   - Flipkart.com
   - eBay.com
   - Walmart.com
   - Target.com

2. Browse products normally

3. The assistant will automatically:
   - Show price history
   - Compare prices across websites
   - Provide AI recommendations
   - Check review authenticity
   - Blur sponsored content (if enabled)

4. Check the floating panel (bottom-right) for:
   - Current emotion status
   - Smart shopping tips
   - Real-time insights

## 🎨 Features in Detail

### Emotion-Based Recommendations

The AI adjusts recommendations based on your emotional state:

- **Happy** 😊: Encourages smart shopping with good deals
- **Anxious/Fearful** 😰😨: Suggests taking time, comparing prices
- **Angry/Disgusted** 😠🤢: Recommends waiting before purchasing
- **Neutral** 😐: Standard recommendations based on data
- **Surprised** 😲: Highlights unexpected deals

### Price Intelligence

- Tracks every product you view
- Builds historical price database
- Identifies price drops and increases
- Shows best time to buy

### Multi-Site Price Comparison

The extension helps you find the same product on 25+ shopping websites:

**How it works:**
1. Detects the product you're viewing
2. Generates search links for all supported sites
3. Organizes sites by region (US, India, International)
4. Click any site to search for the product there
5. Compare prices manually across all sites

**Supported Sites:**
- **US**: Amazon, Walmart, eBay, Target, Best Buy, Newegg, AliExpress, Etsy
- **India**: Flipkart, Amazon India, Myntra, Ajio, Snapdeal, Meesho, Tata CLiQ, Nykaa, FirstCry, Pepperfry, Croma, Reliance Digital
- **International**: Amazon UK, Amazon DE, Amazon CA, Argos

**Future Enhancement:**
For automatic price fetching with real-time data, see `PRICE_API_INTEGRATION.md` for API integration options.

### Review Analysis

Detects fake reviews by checking:
- Review length and quality
- Suspicious patterns
- Verified purchase status
- Generic phrases
- Excessive punctuation/caps

## 🛠️ Technical Stack

- **Manifest V3** (Latest Chrome Extension API)
- **Vanilla JavaScript** (No frameworks for better performance)
- **Chrome Storage API** (Data persistence)
- **Content Scripts** (Page interaction)
- **Background Service Worker** (Background tasks)

## 🔒 Privacy & Security

- **No data collection**: All data stays on your device
- **No external servers**: Everything runs locally
- **Optional webcam**: Use keyboard mode for privacy
- **Secure storage**: Chrome's encrypted storage API
- **No tracking**: We don't track your shopping habits

## 📊 Supported Websites

### International
- ✅ Amazon.com
- ✅ eBay.com
- ✅ Walmart.com
- ✅ Target.com

### India - General E-commerce
- ✅ Amazon.in
- ✅ Flipkart.com
- ✅ Meesho.com
- ✅ Snapdeal.com
- ✅ ShopClues.com
- ✅ Paytm Mall

### India - Fashion & Lifestyle
- ✅ Myntra.com
- ✅ Ajio.com
- ✅ Tata CLiQ
- ✅ Koovs.com
- ✅ Limeroad.com
- ✅ Bewakoof.com

### India - Beauty & Personal Care
- ✅ Nykaa.com
- ✅ Purplle.com
- ✅ Sugar Cosmetics

### India - Electronics & Gadgets
- ✅ Croma.com
- ✅ Reliance Digital
- ✅ Vijay Sales

### India - Grocery & Quick Commerce
- ✅ BigBasket.com
- ✅ Blinkit (Grofers)
- ✅ Zepto
- ✅ JioMart
- ✅ Spencers Retail

### India - Baby & Family
- ✅ FirstCry.com
- ✅ Hopscotch.in

### India - Furniture & Home
- ✅ Pepperfry.com
- ✅ Urban Ladder
- ✅ IKEA India

### India - B2B
- ✅ IndiaMART.com

**Total: 35+ websites supported!**

## 🎯 Hackathon Theme: AI in Consumer

This extension demonstrates AI's potential in consumer technology:

1. **Emotion AI**: Adapts to user's emotional state
2. **Recommendation AI**: Smart buy/not buy decisions
3. **Pattern Recognition**: Fake review detection
4. **Price Intelligence**: Historical analysis and predictions
5. **User Behavior Analysis**: Keyboard/cursor emotion inference

## 🚧 Future Enhancements

- [ ] Real ML model for emotion detection (TensorFlow.js)
- [ ] Real-time price comparison APIs
- [ ] Browser notifications for price drops
- [ ] Wishlist with price alerts
- [ ] Chrome sync across devices
- [ ] More shopping websites
- [ ] Voice commands
- [ ] Dark mode

## 🐛 Known Limitations (MVP)

- Emotion detection is simulated (use TensorFlow.js for production)
- Price comparison uses mock data (integrate real APIs)
- Limited to major shopping websites
- Review analysis is pattern-based (can be enhanced with NLP)

## 📝 Development Notes

### Adding New Shopping Sites

Edit `manifest.json` and add to `content_scripts.matches`:

```json
"matches": [
  "*://your-new-site.com/*"
]
```

### Customizing Features

All features can be toggled in `popup/popup.html` and controlled via `content/content.js`.

## 🏆 AMD Slingshot Hackathon

**Theme**: AI in Consumer  
**Project**: Emotion-Adaptive Shopping Assistant  
**Goal**: Make online shopping smarter, safer, and more personalized

## 📄 License

MIT License - Feel free to use and modify for your hackathon!

## 🤝 Contributing

This is a hackathon project, but contributions are welcome:
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues or questions about this hackathon project, please open an issue in the repository.

---

**Built with ❤️ for AMD Slingshot Hackathon**

*Making online shopping intelligent, one emotion at a time!* 🛍️✨
