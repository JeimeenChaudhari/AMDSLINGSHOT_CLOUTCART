// Graph-Based Duplicate Detector
// Implements similarity networks and community detection

class DuplicateDetector {
  constructor() {
    this.similarityThreshold = 0.7;
  }

  /**
   * Detect duplicate and near-duplicate reviews
   */
  async detect(reviews) {
    const texts = reviews.map(r => this.extractText(r));
    
    let exactDuplicates = 0;
    let nearDuplicates = 0;
    const seen = new Set();
    const similarities = [];
    
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const similarity = this.calculateSimilarity(texts[i], texts[j]);
        similarities.push(similarity);
        
        if (similarity === 1.0) {
          exactDuplicates++;
        } else if (similarity >= this.similarityThreshold) {
          nearDuplicates++;
        }
      }
    }
    
    const averageSimilarity = similarities.length > 0
      ? similarities.reduce((a, b) => a + b, 0) / similarities.length
      : 0;
    
    const duplicationRatio = (exactDuplicates + nearDuplicates) / Math.max(reviews.length, 1);
    
    return {
      exactDuplicates,
      nearDuplicates,
      duplicationRatio,
      averageSimilarity
    };
  }

  extractText(review) {
    if (typeof review === 'string') return review;
    return review.text || review.textContent || '';
  }

  /**
   * Calculate text similarity using Jaccard index
   */
  calculateSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Build similarity graph
   */
  async buildSimilarityGraph(reviews) {
    const nodes = reviews.length;
    const edges = [];
    const adjacencyMatrix = Array(nodes).fill(null).map(() => Array(nodes).fill(0));
    
    const texts = reviews.map(r => this.extractText(r));
    
    for (let i = 0; i < texts.length; i++) {
      for (let j = i + 1; j < texts.length; j++) {
        const similarity = this.calculateSimilarity(texts[i], texts[j]);
        
        if (similarity >= this.similarityThreshold) {
          edges.push({ from: i, to: j, weight: similarity });
          adjacencyMatrix[i][j] = similarity;
          adjacencyMatrix[j][i] = similarity;
        }
      }
    }
    
    return {
      nodes,
      edges: edges.length,
      adjacencyMatrix,
      edgeList: edges
    };
  }

  /**
   * Detect communities in review network
   */
  async detectCommunities(reviews) {
    const graph = await this.buildSimilarityGraph(reviews);
    
    // Simple community detection using connected components
    const visited = new Array(graph.nodes).fill(false);
    const communities = [];
    
    for (let i = 0; i < graph.nodes; i++) {
      if (!visited[i]) {
        const community = this.dfs(i, graph.adjacencyMatrix, visited);
        if (community.length > 1) {
          communities.push(community);
        }
      }
    }
    
    return communities;
  }

  dfs(node, adjacencyMatrix, visited) {
    const stack = [node];
    const community = [];
    
    while (stack.length > 0) {
      const current = stack.pop();
      
      if (visited[current]) continue;
      
      visited[current] = true;
      community.push(current);
      
      for (let i = 0; i < adjacencyMatrix[current].length; i++) {
        if (adjacencyMatrix[current][i] > 0 && !visited[i]) {
          stack.push(i);
        }
      }
    }
    
    return community;
  }

  /**
   * Detect template-based spam
   */
  async detectTemplates(reviews) {
    const texts = reviews.map(r => this.extractText(r));
    
    // Extract common phrases (3-grams)
    const phraseCount = new Map();
    
    texts.forEach(text => {
      const words = text.toLowerCase().split(/\s+/);
      for (let i = 0; i < words.length - 2; i++) {
        const phrase = `${words[i]} ${words[i+1]} ${words[i+2]}`;
        phraseCount.set(phrase, (phraseCount.get(phrase) || 0) + 1);
      }
    });
    
    // Find templates (phrases appearing in >30% of reviews)
    const threshold = texts.length * 0.3;
    const templates = [];
    
    phraseCount.forEach((count, phrase) => {
      if (count >= threshold) {
        templates.push({ phrase, count });
      }
    });
    
    const templateSpamRatio = templates.length > 0 ? templates.length / texts.length : 0;
    
    return {
      templatesDetected: templates.length,
      templates,
      templateSpamRatio
    };
  }

  /**
   * Calculate n-gram similarity
   */
  async calculateNGramSimilarity(text1, text2, n = 3) {
    const ngrams1 = this.extractNGrams(text1, n);
    const ngrams2 = this.extractNGrams(text2, n);
    
    const set1 = new Set(ngrams1);
    const set2 = new Set(ngrams2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  extractNGrams(text, n) {
    const words = text.toLowerCase().split(/\s+/);
    const ngrams = [];
    
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(' '));
    }
    
    return ngrams;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DuplicateDetector;
}
