// Pipeline Validator
// Validates data pipeline health and logs diagnostics

class PipelineValidator {
  constructor() {
    this.results = {
      productDetector: false,
      scraperFactory: false,
      scrapers: {},
      overall: false
    };
  }

  // Run all validation checks
  async validate() {
    console.log('🔍 Pipeline Validator Starting...\n');
    
    this.validateProductDetector();
    this.validateScraperFactory();
    this.validateScrapers();
    
    this.results.overall = this.results.productDetector && 
                           this.results.scraperFactory && 
                           Object.values(this.results.scrapers).some(v => v);
    
    this.printReport();
    
    return this.results;
  }

  // Validate product detector
  validateProductDetector() {
    try {
      if (typeof ProductDetector === 'undefined') {
        console.error('❌ ProductDetector class not loaded');
        this.results.productDetector = false;
        return;
      }

      const detector = new ProductDetector();
      const product = detector.detectProductPage();
      
      if (product && product.title && product.price) {
        console.log('✅ ProductDetector: Working');
        console.log(`   Title: ${product.title.substring(0, 50)}...`);
        console.log(`   Price: ₹${product.price}`);
        this.results.productDetector = true;
      } else {
        console.warn('⚠️ ProductDetector: Not on product page or extraction failed');
        this.results.productDetector = false;
      }
    } catch (error) {
      console.error('❌ ProductDetector: Error -', error.message);
      this.results.productDetector = false;
    }
  }

  // Validate scraper factory
  validateScraperFactory() {
    try {
      if (typeof ScraperFactory === 'undefined') {
        console.error('❌ ScraperFactory class not loaded');
        this.results.scraperFactory = false;
        return;
      }

      const factory = new ScraperFactory();
      const sites = factory.getSupportedSites();
      
      if (sites && sites.length > 0) {
        console.log('✅ ScraperFactory: Working');
        console.log(`   Supported sites: ${sites.join(', ')}`);
        this.results.scraperFactory = true;
      } else {
        console.error('❌ ScraperFactory: No scrapers registered');
        this.results.scraperFactory = false;
      }
    } catch (error) {
      console.error('❌ ScraperFactory: Error -', error.message);
      this.results.scraperFactory = false;
    }
  }

  // Validate individual scrapers
  validateScrapers() {
    if (!this.results.scraperFactory) {
      console.warn('⚠️ Skipping scraper validation (factory not working)');
      return;
    }

    const factory = new ScraperFactory();
    const sitesToTest = ['flipkart', 'ebay', 'walmart'];

    sitesToTest.forEach(site => {
      try {
        const scraper = factory.getScraper(site);
        if (scraper) {
          console.log(`✅ ${site} scraper: Loaded`);
          this.results.scrapers[site] = true;
        } else {
          console.error(`❌ ${site} scraper: Not found`);
          this.results.scrapers[site] = false;
        }
      } catch (error) {
        console.error(`❌ ${site} scraper: Error -`, error.message);
        this.results.scrapers[site] = false;
      }
    });
  }

  // Print validation report
  printReport() {
    console.log('\n📊 VALIDATION REPORT');
    console.log('='.repeat(50));
    
    console.log(`Product Detector: ${this.results.productDetector ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Scraper Factory:  ${this.results.scraperFactory ? '✅ PASS' : '❌ FAIL'}`);
    
    console.log('\nScrapers:');
    for (const [site, status] of Object.entries(this.results.scrapers)) {
      console.log(`  ${site}: ${status ? '✅ PASS' : '❌ FAIL'}`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`Overall Status: ${this.results.overall ? '✅ PIPELINE HEALTHY' : '❌ PIPELINE BROKEN'}`);
    
    if (!this.results.overall) {
      console.log('\n⚠️ ACTION REQUIRED:');
      if (!this.results.productDetector) {
        console.log('  1. Check if you\'re on a product page');
        console.log('  2. Verify product-detector.js selectors');
      }
      if (!this.results.scraperFactory) {
        console.log('  1. Check manifest.json script loading');
        console.log('  2. Verify scraper-factory.js is loaded');
      }
      if (Object.values(this.results.scrapers).every(v => !v)) {
        console.log('  1. Check scraper files are loaded');
        console.log('  2. Verify base-scraper.js loads first');
      }
    } else {
      console.log('\n✅ Pipeline is healthy! Ready for price comparison.');
    }
    
    console.log('='.repeat(50) + '\n');
  }

  // Quick health check (minimal output)
  static quickCheck() {
    const checks = {
      ProductDetector: typeof ProductDetector !== 'undefined',
      ScraperFactory: typeof ScraperFactory !== 'undefined',
      PriceComparisonEngine: typeof PriceComparisonEngine !== 'undefined'
    };

    const allPass = Object.values(checks).every(v => v);
    
    if (allPass) {
      console.log('✅ Pipeline components loaded');
    } else {
      console.error('❌ Missing components:', 
        Object.entries(checks)
          .filter(([_, v]) => !v)
          .map(([k, _]) => k)
          .join(', ')
      );
    }

    return allPass;
  }
}

// Auto-run quick check on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      PipelineValidator.quickCheck();
    }, 1000);
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PipelineValidator;
}

// Make available globally for console testing
if (typeof window !== 'undefined') {
  window.PipelineValidator = PipelineValidator;
  window.validatePipeline = () => new PipelineValidator().validate();
}
