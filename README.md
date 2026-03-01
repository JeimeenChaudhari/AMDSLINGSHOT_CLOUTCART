# 🛍️ CloutCart — Emotion-Adaptive AI Shopping Assistant

**AI-Powered Consumer Decision Intelligence for Smarter Online Shopping**

---

## 🚀 Overview

CloutCart is an AI-powered browser extension designed to help consumers make confident, data-driven purchase decisions while shopping online.

Instead of relying only on ratings or marketing content, CloutCart analyzes:

- **Product reviews authenticity**
- **Real price intelligence**
- **User behavioral emotion signals**
- **Purchase risk indicators**

and provides real-time **Buy / Wait / Avoid** recommendations directly on shopping websites.

Built under the theme **AI in Consumer Experiences**, the system introduces an intelligent decision layer over existing e-commerce platforms.

---

## 🎯 Problem Statement

Modern online shoppers face major challenges:

❌ **Fake or manipulated product reviews**  
❌ **Artificial pricing & misleading discounts**  
❌ **Decision fatigue from excessive options**  
❌ **Impulse purchases driven by emotional behavior**

Existing platforms optimize **sales**, not **consumer decisions**.

Users lack a trustworthy assistant that evaluates products objectively.

---

## � Our Solution

CloutCart acts as an **AI Shopping Intelligence Overlay** that runs directly inside the browser.

When a user opens a product page, the system:

1. Detects the product automatically
2. Extracts live product and review data
3. Analyzes review authenticity & sentiment
4. Tracks price intelligence
5. Detects browsing emotion patterns
6. Generates explainable purchase recommendations

All insights appear **instantly** without leaving the shopping website.

---

## 🧠 Core Innovations

✅ **Emotion-Aware Consumer Decision Engine**  
✅ **Review Intelligence & Fake Review Detection**  
✅ **Cross-Platform Price Comparison**  
✅ **Local Price History Tracking**  
✅ **Explainable AI Recommendations**  
✅ **Privacy-First Edge Processing**

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           E-commerce Website (Amazon, Flipkart, etc.)     │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Product Detection Layer                      │  │
│  │  • URL pattern matching                                   │  │
│  │  • DOM element extraction                                 │  │
│  │  • Product metadata parsing                               │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Data Extraction & Normalization              │  │
│  │  • Site-specific scrapers (Factory pattern)              │  │
│  │  • Product name normalization                             │  │
│  │  • Price parsing & currency handling                      │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│              ┌────────────┴────────────┐                        │
│              ▼                         ▼                        │
│  ┌─────────────────────┐   ┌─────────────────────┐            │
│  │  Emotion Detection  │   │  Review Intelligence │            │
│  │       Engine        │   │       Agent          │            │
│  │                     │   │                      │            │
│  │ • Face-api.js       │   │ • NLP Analysis       │            │
│  │ • TensorFlow.js     │   │ • Pattern Detection  │            │
│  │ • Behavioral ML     │   │ • Authenticity Score │            │
│  └──────────┬──────────┘   └──────────┬───────────┘            │
│             │                          │                        │
│             └────────────┬─────────────┘                        │
│                          ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Price Comparison & History Engine               │  │
│  │  • Multi-site parallel search                             │  │
│  │  • Historical price tracking (IndexedDB)                  │  │
│  │  • Trend analysis & predictions                           │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         AI Decision Recommendation Engine                 │  │
│  │  • Multi-factor analysis                                  │  │
│  │  • Confidence scoring                                     │  │
│  │  • Explainable reasoning                                  │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Overlay UI Injection                         │  │
│  │  • Non-intrusive side panel                               │  │
│  │  • Real-time updates                                      │  │
│  │  • Interactive visualizations                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Architectural Decisions**:
- **Content Script Architecture**: Runs in page context for DOM access while maintaining security isolation
- **Service Worker Background**: Handles API calls, storage management, and scheduled tasks
- **IndexedDB for Persistence**: Enables offline-capable price history with efficient querying
- **Factory Pattern for Scrapers**: Extensible design supporting new e-commerce platforms
- **Modular AI Agents**: Independent agents with clear interfaces enable parallel processing

---

## 🤖 AI Agent Design

### 1️⃣ Review Intelligence Agent

Analyzes real product reviews to determine:

- Sentiment distribution
- Duplicate patterns
- Authenticity score
- Regret indicators

**Outputs**:
- Fake Review Probability
- Trust Score
- Consumer Risk Level

**Technical Implementation**:
- **Linguistic Analyzer**: Uses Natural.js for sentiment analysis and pattern matching
- **Temporal Detector**: Identifies review clustering and coordinated campaigns
- **Authenticity Scorer**: Bayesian model combining multiple signals

### 2️⃣ Behavioral Emotion Agent

Infers user shopping emotion using:

- Scroll behavior
- Cursor movement
- Hesitation time
- Interaction intensity

**Detected states**: Calm | Confused | Impulsive | Frustrated | Confident

*(No webcam required — privacy preserving.)*

**Alternative Camera Mode**: Optional facial emotion detection using face-api.js for users who prefer camera-based analysis.

### 3️⃣ Consumer Decision Agent

Combines:
- Review analysis
- Emotion signals
- Price intelligence

Generates explainable decisions:

✅ **BUY** ⏳ **WAIT** ⚠️ **CONSIDER** ❌ **AVOID**

---

## 🧩 Feature Breakdown

| Feature | AI Role | Consumer Benefit |
|---------|---------|------------------|
| AI Recommendation | Decision Agent | Know whether to buy or wait |
| Review Checker | Review Intelligence | Detect fake reviews |
| Price Comparison | Data Intelligence | Find better deals |
| Price History | Analytics Engine | Understand price trends |
| Emotion Detection | Behavioral AI | Prevent impulse buying |
| Focus Mode | UX Optimization | Reduce distraction |

---

## ⚙️ Technology Stack

### Browser Extension
- Chrome Extension (Manifest V3)
- JavaScript / TypeScript
- Vanilla JS Overlay UI

### AI & Intelligence
- Behavioral Signal Analysis
- Statistical Decision Models
- Lightweight ML Logic
- Explainable AI Reasoning
- face-api.js (optional camera mode)
- TensorFlow.js (neural network inference)

### Data Processing
- DOM Extraction
- Site-Specific Scrapers
- Local Data Storage (IndexedDB)
- Product Normalization Engine

### Visualization
- Interactive Price Charts
- Dynamic Recommendation Panels
- Real-time Emotion Indicators

---

## 🔄 How the System Works

1. User opens product page (Amazon, Flipkart, eBay, Walmart supported)
2. Extension detects product automatically
3. Reviews & price data extracted from page
4. AI agents analyze trust, sentiment, and behavior
5. Decision engine evaluates purchase risk
6. Overlay displays intelligent recommendation

**Total Time to First Recommendation**: 3-5 seconds  
**Memory Footprint**: 50-100 MB  
**CPU Usage**: 5-15% (moderate, primarily during emotion detection)

---

## ⚡ AMD AI Alignment

CloutCart follows **Edge AI principles** aligned with AMD's AI ecosystem:

- **Local inference design**
- **Low-latency decision processing**
- **Privacy-preserving computation**
- **Hardware-accelerated future compatibility** (Ryzen AI / NPU-ready architecture)

### Future AMD Integration Opportunities

- **AMD Ryzen AI**: Offload emotion detection to NPU for 90% power reduction
- **AMD ROCm**: Deploy larger, more accurate models with GPU acceleration
- **AMD EPYC**: Scale to server-side deployment for enterprise use cases
- **AMD Instinct**: Train custom models on user data for personalized recommendations

---

## 🧪 Prototype Implementation Status

### ✅ Implemented
- Product detection engine
- Real review extraction
- Review authenticity analysis
- Behavioral emotion inference
- Price comparison prototype
- Local price history visualization
- AI recommendation overlay
- Camera-based emotion detection (optional)
- Multi-site scraper factory

### 🚧 In Progress
- Multi-site expansion
- Advanced predictive pricing
- Hardware NPU acceleration
- Enhanced ML optimization

---

## 🎥 Demo Instructions

### Quick Start

1. **Load extension in Chrome Developer Mode**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project folder

2. **Open a supported shopping product page**
   - Amazon.in / Amazon.com
   - Flipkart.com
   - eBay.com
   - Walmart.com

3. **Activate CloutCart overlay**
   - Extension automatically injects side panel
   - Click extension icon to configure settings

4. **View**:
   - AI Recommendation
   - Review Trust Analysis
   - Price Insights
   - Emotion-aware suggestions

### Enable Features

- **Extension Toggle**: Master ON/OFF switch in the popup header
  - When OFF: All extension features are disabled
  - When ON: Extension operates normally with individual feature controls
- **Emotion Detection**: Toggle ON in extension popup
  - Choose Camera Mode or Keyboard/Cursor Mode
- **Price Comparison**: Toggle ON for multi-site price checking
- **Review Analysis**: Automatically enabled on product pages
- **Price History**: Tracks prices across sessions
- **Focus Mode**: Blur sponsored items for distraction-free browsing

### Extension Toggle Feature

The extension now includes a prominent toggle button at the top of the popup that allows you to:

- **Quickly enable/disable** all extension functionality with one click
- **Preserve your settings** when disabled - all feature preferences are saved
- **Clean deactivation** - when turned off, the extension:
  - Hides all UI overlays and panels
  - Stops emotion detection (camera and behavioral)
  - Removes price comparison widgets
  - Clears focus mode blur effects
  - Stops all background processing
- **Instant reactivation** - when turned back on, all features resume based on your saved preferences

This is useful when you want to temporarily disable the extension without uninstalling it, or when browsing non-shopping sites.

---

## 🔮 Future Scope

### Short-Term (3-6 months)
- Multi-platform marketplace intelligence
- Predictive price drop forecasting
- Mobile browser support
- Voice command integration

### Medium-Term (6-12 months)
- Personalized consumer profiling
- Real-time deal intelligence
- Social shopping features
- Enterprise procurement version

### Long-Term (12-24 months)
- Edge AI acceleration using AMD NPUs
- Native mobile apps (iOS/Android)
- Blockchain review verification
- Smart home integration

---

## ⚠️ Current Limitations

- Prototype optimized for selected e-commerce platforms
- Historical pricing partially simulated for demonstration
- Emotion inference based on behavioral signals (non-biometric in keyboard mode)
- Camera mode requires user permission and supported hardware

---

## 👥 Team

**Team CloutCart**

A group of engineering students building intelligent consumer-centric AI systems focused on improving trust, transparency, and decision quality in digital commerce.

**Project**: CloutCart - Emotion-Adaptive AI Shopping Assistant  
**Hackathon**: AMD Slingshot 2026  
**Category**: AI in Consumer Experiences  

**Technical Focus**:
- Browser-based AI/ML inference
- Real-time emotion detection
- NLP for review analysis
- Distributed price intelligence
- Privacy-preserving edge computing

---

## 🏁 Vision

**Transform online shopping from persuasion-driven decisions into AI-assisted intelligent consumer choices.**

---

## 📄 License

This project is developed for the AMD Slingshot Hackathon 2026.  
Educational and demonstration purposes.

---

## 🙏 Acknowledgments

- **face-api.js** by Vladimir Mandic - Facial recognition models
- **TensorFlow.js** by Google - Browser-based ML inference
- **Natural.js** - NLP and sentiment analysis
- **RapidAPI** - Real-time product search API
- **AMD** - Inspiration for edge AI architecture

---

⭐ **Built for AMD Slingshot — AI in Consumer Experiences**

**Built with ❤️ for smarter, emotion-aware shopping**

*Protecting consumers through AI-powered intelligence*
