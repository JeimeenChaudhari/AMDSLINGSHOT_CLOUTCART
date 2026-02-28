# Smart Price Comparison Engine - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CHROME EXTENSION                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    CONTENT SCRIPT                           │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │         SmartPriceComparison (Integration)           │  │ │
│  │  │                                                       │  │ │
│  │  │  • Entry point for UI                                │  │ │
│  │  │  • Formats results                                   │  │ │
│  │  │  • Handles errors                                    │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                           ↓                                 │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │       PriceComparisonEngine (Orchestrator)           │  │ │
│  │  │                                                       │  │ │
│  │  │  • Main comparison logic                             │  │ │
│  │  │  • Coordinates all modules                           │  │ │
│  │  │  • Implements caching                                │  │ │
│  │  │  • Analyzes results                                  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │         ↓              ↓              ↓              ↓       │ │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐│ │
│  │  │ Product  │   │ Product  │   │  Search  │   │ Scraper  ││ │
│  │  │ Detector │   │Normalizer│   │   URL    │   │ Factory  ││ │
│  │  │          │   │          │   │Generator │   │          ││ │
│  │  └──────────┘   └──────────┘   └──────────┘   └──────────┘│ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                ↕                                  │
│                    chrome.runtime.sendMessage                     │
│                                ↕                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  BACKGROUND SERVICE WORKER                   │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │              PriceFetcher                             │  │ │
│  │  │                                                       │  │ │
│  │  │  • Fetches HTML from ecommerce sites                 │  │ │
│  │  │  • Implements retry logic                            │  │ │
│  │  │  • Manages request cache                             │  │ │
│  │  │  • Handles concurrent requests                       │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                ↓                                  │
└────────────────────────────────┼──────────────────────────────────┘
                                 ↓
                    ┌────────────────────────┐
                    │   EXTERNAL WEBSITES    │
                    │                        │
                    │  • Flipkart            │
                    │  • eBay                │
                    │  • Walmart             │
                    │  • Target              │
                    │  • Meesho              │
                    │  • Snapdeal            │
                    └────────────────────────┘
```

## Data Flow

```
1. USER VISITS AMAZON PRODUCT PAGE
   ↓
2. ProductDetector.detectProductPage()
   → Extracts: { site, title, price, asin, url, image }
   ↓
3. ProductNormalizer.normalize(title)
   → Cleans: "Apple iPhone 15 Pro (256GB)" → "apple iphone pro"
   ↓
4. SearchURLGenerator.generateAllURLs(query)
   → Creates: {
       flipkart: "https://flipkart.com/search?q=...",
       ebay: "https://ebay.com/sch/i.html?_nkw=...",
       walmart: "https://walmart.com/search?q=..."
     }
   ↓
5. PriceComparisonEngine.fetchPages(urls)
   → Sends message to background script
   ↓
6. PriceFetcher.fetchMultiple(urls)
   → Fetches HTML from each site (parallel)
   → Returns: { flipkart: {html}, ebay: {html}, walmart: {html} }
   ↓
7. ScraperFactory.getScraper(site)
   → Creates appropriate scraper instance
   ↓
8. Scraper.scrape(html)
   → Extracts: { site, title, price, link, available }
   ↓
9. PriceComparisonEngine.analyzeComparison()
   → Compares prices
   → Finds best price
   → Calculates savings
   ↓
10. SmartPriceComparison.formatResult()
    → Formats for UI display
    ↓
11. DISPLAY RESULTS TO USER
```

## Module Dependencies

```
SmartPriceComparison
  └── PriceComparisonEngine
       ├── ProductDetector
       ├── ProductNormalizer
       ├── SearchURLGenerator
       └── ScraperFactory
            ├── BaseScraper
            ├── FlipkartScraper
            ├── EbayScraper
            └── WalmartScraper

Background Script
  └── PriceFetcher
```

## Component Responsibilities

### Content Script Layer

#### SmartPriceComparison
- **Purpose**: Integration and UI formatting
- **Input**: Product name, price, site
- **Output**: Formatted comparison results
- **Dependencies**: PriceComparisonEngine

#### PriceComparisonEngine
- **Purpose**: Main orchestration
- **Input**: None (auto-detects)
- **Output**: Comparison analysis
- **Dependencies**: All utility modules

#### ProductDetector
- **Purpose**: Detect and extract product info
- **Input**: Current page DOM
- **Output**: Product object
- **Dependencies**: None

#### ProductNormalizer
- **Purpose**: Clean and normalize titles
- **Input**: Raw product title
- **Output**: Clean search query
- **Dependencies**: None

#### SearchURLGenerator
- **Purpose**: Generate search URLs
- **Input**: Search query
- **Output**: URL map
- **Dependencies**: None

#### ScraperFactory
- **Purpose**: Create scraper instances
- **Input**: Site name
- **Output**: Scraper instance
- **Dependencies**: All scraper classes

#### BaseScraper
- **Purpose**: Common scraping utilities
- **Input**: HTML string
- **Output**: Product data
- **Dependencies**: None

#### Site-Specific Scrapers
- **Purpose**: Extract data from specific sites
- **Input**: HTML string
- **Output**: Product object
- **Dependencies**: BaseScraper

### Background Script Layer

#### PriceFetcher
- **Purpose**: Fetch HTML from external sites
- **Input**: URLs array
- **Output**: HTML map
- **Dependencies**: None

## Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│                    CACHE LAYERS                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. PriceComparisonEngine Cache                         │
│     • Key: site_asin or site_title                      │
│     • TTL: 10 minutes                                   │
│     • Stores: Complete comparison results               │
│                                                          │
│  2. PriceFetcher Cache                                  │
│     • Key: URL (without query params)                   │
│     • TTL: 5 minutes                                    │
│     • Stores: Raw HTML responses                        │
│                                                          │
│  3. Request Deduplication                               │
│     • Key: URL                                          │
│     • TTL: Request duration                             │
│     • Stores: In-flight promises                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
Try: Smart Engine
  ├── Success → Return results
  └── Failure
       ├── Log error
       └── Return empty results

Try: Fetch HTML
  ├── Success → Parse with scraper
  └── Failure
       ├── Retry (up to 2 times)
       ├── Exponential backoff
       └── Return null result

Try: Parse HTML
  ├── Success → Validate result
  └── Failure
       ├── Log error
       └── Return null result
```

## Performance Characteristics

```
┌──────────────────────────────────────────────────────┐
│                  OPERATION TIMES                      │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Product Detection:        < 10ms                    │
│  Title Normalization:      < 5ms                     │
│  URL Generation:           < 1ms                     │
│  HTML Fetch (per site):    2-8 seconds               │
│  HTML Parsing:             < 50ms                    │
│  Price Comparison:         < 10ms                    │
│  Result Formatting:        < 5ms                     │
│                                                       │
│  TOTAL (3 sites):          5-15 seconds              │
│                                                       │
└──────────────────────────────────────────────────────┘
```

## Scalability

```
Current: 3 active scrapers (Flipkart, eBay, Walmart)
Ready: 3 configured (Target, Meesho, Snapdeal)

Adding New Site:
  1. Create scraper class (30 min)
  2. Register in factory (2 min)
  3. Add URL config (2 min)
  4. Update manifest (1 min)
  5. Test (10 min)
  ────────────────────────────
  Total: ~45 minutes per site
```

## Security Model

```
┌─────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. Extension Permissions                           │
│     • host_permissions: https://*/*                 │
│     • Allows fetching from any HTTPS site           │
│                                                      │
│  2. Background Script Isolation                     │
│     • Fetching happens in service worker            │
│     • No direct DOM access                          │
│                                                      │
│  3. Content Script Sandbox                          │
│     • Limited to page context                       │
│     • No eval() or unsafe operations                │
│                                                      │
│  4. HTML Parsing                                    │
│     • Uses DOMParser (safe)                         │
│     • No innerHTML injection                        │
│                                                      │
│  5. Timeout Protection                              │
│     • 8-10 second timeout per request               │
│     • Prevents hanging                              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Extension Lifecycle

```
INSTALL
  ↓
Initialize Settings
  ↓
Load Content Scripts on Shopping Sites
  ↓
┌─────────────────────────────────────┐
│  USER NAVIGATES TO PRODUCT PAGE     │
└─────────────────────────────────────┘
  ↓
Detect Product
  ↓
Trigger Comparison (if enabled)
  ↓
Fetch & Parse
  ↓
Display Results
  ↓
Cache Results (10 min)
  ↓
┌─────────────────────────────────────┐
│  USER NAVIGATES AWAY                │
└─────────────────────────────────────┘
  ↓
Cleanup (automatic)
  ↓
Ready for Next Page
```

## Message Passing

```
Content Script                Background Script
     │                              │
     │  fetchMultiplePages          │
     ├─────────────────────────────>│
     │                              │
     │                         Fetch URLs
     │                              │
     │  { success, results }        │
     │<─────────────────────────────┤
     │                              │
     │  clearPriceCache             │
     ├─────────────────────────────>│
     │                              │
     │                         Clear Cache
     │                              │
     │  { success: true }           │
     │<─────────────────────────────┤
     │                              │
```

## File Structure

```
extension/
├── manifest.json
├── background/
│   ├── background.js
│   ├── price-fetcher.js
│   └── training-scheduler.js
├── content/
│   ├── content.js
│   └── content.css
├── utils/
│   ├── product-detector.js
│   ├── product-normalizer.js
│   ├── search-url-generator.js
│   ├── price-comparison-engine.js
│   ├── comparison-smart.js
│   ├── comparison.js (legacy)
│   └── site-scrapers/
│       ├── base-scraper.js
│       ├── flipkart-scraper.js
│       ├── ebay-scraper.js
│       ├── walmart-scraper.js
│       └── scraper-factory.js
└── docs/
    ├── SMART_PRICE_COMPARISON_GUIDE.md
    ├── IMPLEMENTATION_SUMMARY.md
    ├── QUICK_INTEGRATION_GUIDE.md
    └── ARCHITECTURE_DIAGRAM.md (this file)
```

This architecture provides a scalable, maintainable, and performant solution for browser-based price comparison without external APIs.
