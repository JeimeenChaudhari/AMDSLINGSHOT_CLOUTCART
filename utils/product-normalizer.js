// Product Title Normalizer
// Cleans and normalizes product titles for better search results

class ProductNormalizer {
  constructor() {
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during'
    ]);

    this.removePatterns = [
      /\([^)]*\)/g,                    // Remove content in parentheses
      /\[[^\]]*\]/g,                   // Remove content in brackets
      /\{[^}]*\}/g,                    // Remove content in braces
      /\d+\s*(gb|tb|mb|kg|g|ml|l)\b/gi, // Remove storage/weight specs
      /pack\s+of\s+\d+/gi,             // Remove "pack of X"
      /set\s+of\s+\d+/gi,              // Remove "set of X"
      /\d+\s*pieces?/gi,               // Remove "X pieces"
      /\bsize\s*:?\s*\w+/gi,           // Remove size specifications
      /\bcolor\s*:?\s*\w+/gi,          // Remove color specifications
      /\bcolour\s*:?\s*\w+/gi,         // Remove colour specifications
      /\|/g,                           // Remove pipe separators
      /-{2,}/g,                        // Remove multiple dashes
      /_{2,}/g,                        // Remove multiple underscores
      /\s{2,}/g                        // Remove multiple spaces
    ];

    this.marketingPhrases = [
      'best seller', 'top rated', 'amazon choice', 'limited edition',
      'exclusive', 'premium quality', 'original', 'genuine', 'authentic',
      'certified', 'warranty', 'free shipping', 'fast delivery',
      'same day delivery', 'next day delivery', 'brand new', 'latest',
      'new arrival', 'hot deal', 'special offer', 'discount', 'sale'
    ];
  }

  // Main normalization function
  normalize(title) {
    if (!title) return '';

    let normalized = title;

    // Convert to lowercase for processing
    normalized = normalized.toLowerCase();

    // Remove marketing phrases
    for (const phrase of this.marketingPhrases) {
      // Escape special regex characters in the phrase
      const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
      normalized = normalized.replace(regex, '');
    }

    // Apply removal patterns
    for (const pattern of this.removePatterns) {
      normalized = normalized.replace(pattern, ' ');
    }

    // Remove special characters but keep alphanumeric and spaces
    normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');

    // Remove stop words
    const words = normalized.split(/\s+/).filter(word => {
      return word.length > 2 && !this.stopWords.has(word);
    });

    // Limit to first 8 meaningful words
    const limitedWords = words.slice(0, 8);

    // Join and clean up
    normalized = limitedWords.join(' ').trim();

    return normalized;
  }

  // Generate search query variations
  generateSearchQueries(title) {
    const normalized = this.normalize(title);
    const words = normalized.split(/\s+/);

    const queries = [];

    // Full normalized query
    queries.push(normalized);

    // First 5 words (core product info)
    if (words.length > 5) {
      queries.push(words.slice(0, 5).join(' '));
    }

    // First 3 words (brand + product type)
    if (words.length > 3) {
      queries.push(words.slice(0, 3).join(' '));
    }

    // Remove duplicates
    return [...new Set(queries)];
  }

  // Extract brand name (usually first word)
  extractBrand(title) {
    const words = title.trim().split(/\s+/);
    return words[0] || '';
  }

  // Extract product type (usually second/third word)
  extractProductType(title) {
    const normalized = this.normalize(title);
    const words = normalized.split(/\s+/);
    
    // Common product type keywords
    const productTypes = [
      'phone', 'laptop', 'tablet', 'watch', 'headphone', 'earphone',
      'speaker', 'camera', 'tv', 'monitor', 'keyboard', 'mouse',
      'charger', 'cable', 'case', 'cover', 'bag', 'shoe', 'shirt',
      't-shirt', 'jeans', 'dress', 'book', 'toy', 'game'
    ];

    for (const word of words) {
      if (productTypes.includes(word)) {
        return word;
      }
    }

    return words[1] || '';
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductNormalizer;
}
