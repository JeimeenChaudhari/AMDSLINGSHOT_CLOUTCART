# 🔌 API Integration Guide

## Overview

This guide explains how to integrate real APIs to replace the simulated data in the MVP.

---

## 1. Emotion Detection API

### Current: Simulated
Location: `models/emotion-detection.js`

### Recommended Solutions

#### Option A: TensorFlow.js + Face-API.js
```javascript
// Install
npm install @tensorflow/tfjs face-api.js

// Implementation
import * as faceapi from 'face-api.js';

async function loadModels() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceExpressionNet.loadFromUri('/models');
}

async function detectEmotion(video) {
  const detections = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions();
  
  return detections.expressions;
}
```

**Pros**: Free, offline, privacy-friendly  
**Cons**: Larger extension size (~5MB)

#### Option B: Azure Face API
```javascript
const endpoint = 'https://YOUR-RESOURCE.cognitiveservices.azure.com/';
const apiKey = 'YOUR-API-KEY';

async function detectEmotion(imageData) {
  const response = await fetch(`${endpoint}/face/v1.0/detect?returnFaceAttributes=emotion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': apiKey
    },
    body: imageData
  });
  
  return await response.json();
}
```

**Pros**: High accuracy, cloud-based  
**Cons**: Costs money, privacy concerns

---

## 2. Price Comparison API

### Current: Simulated
Location: `utils/comparison.js`

### Recommended Solutions

#### Option A: Rainforest API
```javascript
const RAINFOREST_API_KEY = 'YOUR-API-KEY';

async function comparePrice(productName) {
  const response = await fetch(`https://api.rainforestapi.com/request?api_key=${RAINFOREST_API_KEY}&type=search&amazon_domain=amazon.com&search_term=${encodeURIComponent(productName)}`);
  
  const data = await response.json();
  return data.search_results;
}
```

**Pricing**: $0.005 per request  
**Website**: https://www.rainforestapi.com/

#### Option B: ScraperAPI
```javascript
const SCRAPER_API_KEY = 'YOUR-API-KEY';

async function scrapePrice(url) {
  const response = await fetch(`http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`);
  
  const html = await response.text();
  // Parse HTML to extract price
  return parsePrice(html);
}
```

**Pricing**: 1000 free requests/month  
**Website**: https://www.scraperapi.com/

#### Option C: Custom Web Scraping
```javascript
// Use background service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapePrice') {
    fetch(request.url)
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const price = extractPrice(doc);
        sendResponse({ price });
      });
    return true;
  }
});
```

**Pros**: Free, customizable  
**Cons**: Breaks if website changes, may violate ToS

---

## 3. Price History API

### Current: Local storage
Location: `utils/price-tracker.js`

### Recommended Solutions

#### Option A: Keepa API (Amazon)
```javascript
const KEEPA_API_KEY = 'YOUR-API-KEY';

async function getPriceHistory(asin) {
  const response = await fetch(`https://api.keepa.com/product?key=${KEEPA_API_KEY}&domain=1&asin=${asin}&stats=180`);
  
  const data = await response.json();
  return data.products[0].csv;
}
```

**Pricing**: €15/month for 1M requests  
**Website**: https://keepa.com/

#### Option B: CamelCamelCamel API
```javascript
// No official API, but can scrape their charts
async function getCamelHistory(asin) {
  const url = `https://camelcamelcamel.com/product/${asin}`;
  // Scrape price history chart data
}
```

**Pros**: Free (if scraping allowed)  
**Cons**: Unofficial, may break

#### Option C: Build Your Own Database
```javascript
// Use Firebase or Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function savePriceHistory(productId, price) {
  await supabase
    .from('price_history')
    .insert({ product_id: productId, price, timestamp: new Date() });
}

async function getPriceHistory(productId) {
  const { data } = await supabase
    .from('price_history')
    .select('*')
    .eq('product_id', productId)
    .order('timestamp', { ascending: false });
  
  return data;
}
```

**Pros**: Full control, scalable  
**Cons**: Requires backend setup

---

## 4. Review Analysis API

### Current: Pattern matching
Location: `utils/review-analyzer.js`

### Recommended Solutions

#### Option A: Fakespot API
```javascript
const FAKESPOT_API_KEY = 'YOUR-API-KEY';

async function analyzeReviews(productUrl) {
  const response = await fetch('https://api.fakespot.com/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': FAKESPOT_API_KEY
    },
    body: JSON.stringify({ url: productUrl })
  });
  
  return await response.json();
}
```

**Note**: Fakespot doesn't have public API yet

#### Option B: ReviewMeta API
```javascript
// Similar to Fakespot, no public API
// Would need to scrape their analysis
```

#### Option C: Custom NLP with Hugging Face
```javascript
const HF_API_KEY = 'YOUR-API-KEY';

async function analyzeSentiment(reviewText) {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english',
    {
      headers: { Authorization: `Bearer ${HF_API_KEY}` },
      method: 'POST',
      body: JSON.stringify({ inputs: reviewText })
    }
  );
  
  return await response.json();
}
```

**Pros**: Free tier available, powerful  
**Cons**: Requires ML knowledge

---

## 5. AI Recommendation API

### Current: Rule-based logic
Location: `content/content.js` (activateRecommendation)

### Recommended Solutions

#### Option A: OpenAI GPT API
```javascript
const OPENAI_API_KEY = 'YOUR-API-KEY';

async function getRecommendation(productData, emotion) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Should I buy this product? 
          Name: ${productData.name}
          Price: $${productData.price}
          Rating: ${productData.rating}/5
          Reviews: ${productData.reviewCount}
          My emotion: ${emotion}
          
          Respond with BUY, WAIT, or AVOID and explain why.`
      }]
    })
  });
  
  const data = await response.json();
  return parseRecommendation(data.choices[0].message.content);
}
```

**Pricing**: $0.002 per 1K tokens  
**Website**: https://openai.com/api/

#### Option B: Google Gemini API
```javascript
const GEMINI_API_KEY = 'YOUR-API-KEY';

async function getRecommendation(productData, emotion) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Analyze this product and recommend BUY/WAIT/AVOID...`
        }]
      }]
    })
  });
  
  return await response.json();
}
```

**Pros**: Free tier available  
**Website**: https://ai.google.dev/

---

## Implementation Priority

### Phase 1: Essential APIs
1. **Price Comparison** - Most valuable feature
2. **Price History** - Core functionality
3. **Review Analysis** - High impact

### Phase 2: Enhanced Features
4. **AI Recommendations** - Nice to have
5. **Emotion Detection** - Differentiator

---

## Cost Estimation

### Monthly Costs (1000 active users)

| API | Usage | Cost |
|-----|-------|------|
| Rainforest (Price Comparison) | 10K requests | $50 |
| Keepa (Price History) | Included | $15 |
| Hugging Face (Review Analysis) | Free tier | $0 |
| OpenAI (Recommendations) | 100K tokens | $0.20 |
| **Total** | | **~$65/month** |

### Revenue Model
- Freemium: $4.99/month premium
- Need 15 paying users to break even
- Target: 5% conversion = 50 users = $250/month

---

## Security Best Practices

### API Key Management
```javascript
// DON'T: Store in code
const API_KEY = 'sk-1234567890';

// DO: Use environment variables
const API_KEY = process.env.API_KEY;

// DO: Use backend proxy
async function callAPI(data) {
  // Call your backend, which has the API key
  const response = await fetch('https://your-backend.com/api/proxy', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}
```

### Rate Limiting
```javascript
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }
  
  async throttle() {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const waitTime = this.timeWindow - (now - this.requests[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.requests.push(now);
  }
}

const limiter = new RateLimiter(10, 60000); // 10 requests per minute
```

---

## Testing APIs

### Use Postman or curl
```bash
# Test Rainforest API
curl "https://api.rainforestapi.com/request?api_key=YOUR_KEY&type=search&amazon_domain=amazon.com&search_term=laptop"

# Test OpenAI API
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_KEY" \
  -d '{"model": "gpt-3.5-turbo", "messages": [{"role": "user", "content": "Hello"}]}'
```

---

## Next Steps

1. Choose APIs based on budget
2. Sign up for API keys
3. Create backend proxy (recommended)
4. Implement one API at a time
5. Test thoroughly
6. Monitor usage and costs
7. Optimize for performance

---

**Need help? Check API documentation or contact support!**
