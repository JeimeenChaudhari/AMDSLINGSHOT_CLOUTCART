// Emotion ML Model
// Lightweight neural network for emotion classification from behavioral features

class EmotionMLModel {
  constructor() {
    this.inputSize = 40;
    this.hiddenSize1 = 64;
    this.hiddenSize2 = 32;
    this.outputSize = 8;
    
    this.emotions = ['Happy', 'Sad', 'Angry', 'Anxious', 'Neutral', 'Surprised', 'Fearful', 'Disgusted'];
    
    this.weights = null;
    this.isLoaded = false;
    this.trainingCount = 0;
    
    this.learningRate = 0.01;
  }

  async initialize() {
    // Try to load existing model from storage
    const loaded = await this.loadFromStorage();
    
    if (!loaded) {
      // Initialize with random weights
      this.initializeWeights();
      // Pre-train with synthetic data
      await this.preTrainWithSyntheticData();
    }
    
    this.isLoaded = true;
    console.log('[EmotionML] Model initialized, training count:', this.trainingCount);
  }

  initializeWeights() {
    // Xavier initialization
    this.weights = {
      W1: this.randomMatrix(this.inputSize, this.hiddenSize1, this.inputSize),
      b1: this.zeros(this.hiddenSize1),
      W2: this.randomMatrix(this.hiddenSize1, this.hiddenSize2, this.hiddenSize1),
      b2: this.zeros(this.hiddenSize2),
      W3: this.randomMatrix(this.hiddenSize2, this.outputSize, this.hiddenSize2),
      b3: this.zeros(this.outputSize)
    };
  }

  randomMatrix(rows, cols, fanIn) {
    const matrix = [];
    const limit = Math.sqrt(6 / fanIn);
    for (let i = 0; i < rows; i++) {
      matrix[i] = [];
      for (let j = 0; j < cols; j++) {
        matrix[i][j] = (Math.random() * 2 - 1) * limit;
      }
    }
    return matrix;
  }

  zeros(size) {
    return new Array(size).fill(0);
  }

  /**
   * Forward propagation
   * @param {Array} input - Feature vector (40 elements)
   * @returns {Object} - Predictions and activations
   */
  forward(input) {
    if (!this.weights) {
      throw new Error('Model not initialized');
    }
    
    // Layer 1: input -> hidden1
    const z1 = this.matmul(input, this.weights.W1, this.weights.b1);
    const a1 = this.relu(z1);
    
    // Layer 2: hidden1 -> hidden2
    const z2 = this.matmul(a1, this.weights.W2, this.weights.b2);
    const a2 = this.relu(z2);
    
    // Layer 3: hidden2 -> output
    const z3 = this.matmul(a2, this.weights.W3, this.weights.b3);
    const output = this.softmax(z3);
    
    return {
      output,
      activations: { input, a1, a2, z1, z2, z3 }
    };
  }

  /**
   * Predict emotion from features
   * @param {Array} features - Feature vector
   * @returns {Object} - Emotion prediction with confidence
   */
  predict(features) {
    if (!this.isLoaded) {
      throw new Error('Model not loaded');
    }
    
    const result = this.forward(features);
    const probabilities = result.output;
    
    // Find max probability
    let maxProb = 0;
    let maxIndex = 0;
    for (let i = 0; i < probabilities.length; i++) {
      if (probabilities[i] > maxProb) {
        maxProb = probabilities[i];
        maxIndex = i;
      }
    }
    
    return {
      emotion: this.emotions[maxIndex],
      confidence: Math.round(maxProb * 100),
      probabilities: this.emotions.map((emotion, i) => ({
        emotion,
        probability: probabilities[i]
      }))
    };
  }

  /**
   * Train model with single sample (online learning)
   * @param {Array} features - Feature vector
   * @param {String} emotionLabel - True emotion label
   */
  async train(features, emotionLabel) {
    if (!this.weights) {
      await this.initialize();
    }
    
    const emotionIndex = this.emotions.indexOf(emotionLabel);
    if (emotionIndex === -1) {
      console.error('[EmotionML] Invalid emotion label:', emotionLabel);
      return;
    }
    
    // Create one-hot target
    const target = this.zeros(this.outputSize);
    target[emotionIndex] = 1;
    
    // Forward pass
    const { output, activations } = this.forward(features);
    
    // Backward pass
    this.backward(activations, output, target);
    
    this.trainingCount++;
    
    // Save model periodically
    if (this.trainingCount % 10 === 0) {
      await this.saveToStorage();
    }
  }

  backward(activations, output, target) {
    const { input, a1, a2 } = activations;
    
    // Output layer gradient
    const dz3 = output.map((o, i) => o - target[i]);
    
    // Hidden layer 2 gradients
    const dW3 = this.outerProduct(a2, dz3);
    const db3 = dz3;
    const da2 = this.matmulTranspose(dz3, this.weights.W3);
    const dz2 = da2.map((val, i) => val * this.reluDerivative(a2[i]));
    
    // Hidden layer 1 gradients
    const dW2 = this.outerProduct(a1, dz2);
    const db2 = dz2;
    const da1 = this.matmulTranspose(dz2, this.weights.W2);
    const dz1 = da1.map((val, i) => val * this.reluDerivative(a1[i]));
    
    // Input layer gradients
    const dW1 = this.outerProduct(input, dz1);
    const db1 = dz1;
    
    // Update weights
    this.updateWeights(dW1, db1, dW2, db2, dW3, db3);
  }

  updateWeights(dW1, db1, dW2, db2, dW3, db3) {
    // Gradient descent with learning rate
    for (let i = 0; i < this.weights.W1.length; i++) {
      for (let j = 0; j < this.weights.W1[i].length; j++) {
        this.weights.W1[i][j] -= this.learningRate * dW1[i][j];
      }
    }
    for (let i = 0; i < this.weights.b1.length; i++) {
      this.weights.b1[i] -= this.learningRate * db1[i];
    }
    
    for (let i = 0; i < this.weights.W2.length; i++) {
      for (let j = 0; j < this.weights.W2[i].length; j++) {
        this.weights.W2[i][j] -= this.learningRate * dW2[i][j];
      }
    }
    for (let i = 0; i < this.weights.b2.length; i++) {
      this.weights.b2[i] -= this.learningRate * db2[i];
    }
    
    for (let i = 0; i < this.weights.W3.length; i++) {
      for (let j = 0; j < this.weights.W3[i].length; j++) {
        this.weights.W3[i][j] -= this.learningRate * dW3[i][j];
      }
    }
    for (let i = 0; i < this.weights.b3.length; i++) {
      this.weights.b3[i] -= this.learningRate * db3[i];
    }
  }

  // Activation functions
  relu(arr) {
    return arr.map(x => Math.max(0, x));
  }

  reluDerivative(x) {
    return x > 0 ? 1 : 0;
  }

  softmax(arr) {
    const max = Math.max(...arr);
    const exps = arr.map(x => Math.exp(x - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map(x => x / sum);
  }

  // Matrix operations
  matmul(vec, matrix, bias) {
    const result = [];
    for (let j = 0; j < matrix[0].length; j++) {
      let sum = bias[j];
      for (let i = 0; i < vec.length; i++) {
        sum += vec[i] * matrix[i][j];
      }
      result.push(sum);
    }
    return result;
  }

  matmulTranspose(vec, matrix) {
    const result = [];
    for (let i = 0; i < matrix.length; i++) {
      let sum = 0;
      for (let j = 0; j < vec.length; j++) {
        sum += vec[j] * matrix[i][j];
      }
      result.push(sum);
    }
    return result;
  }

  outerProduct(vec1, vec2) {
    const result = [];
    for (let i = 0; i < vec1.length; i++) {
      result[i] = [];
      for (let j = 0; j < vec2.length; j++) {
        result[i][j] = vec1[i] * vec2[j];
      }
    }
    return result;
  }

  // Pre-training with synthetic data
  async preTrainWithSyntheticData() {
    console.log('[EmotionML] Pre-training with synthetic data...');
    
    // Generate synthetic training samples based on behavioral patterns
    const syntheticSamples = this.generateSyntheticSamples(100);
    
    for (const sample of syntheticSamples) {
      await this.train(sample.features, sample.emotion);
    }
    
    console.log('[EmotionML] Pre-training complete');
  }

  generateSyntheticSamples(count) {
    const samples = [];
    
    for (let i = 0; i < count; i++) {
      const emotion = this.emotions[Math.floor(Math.random() * this.emotions.length)];
      const features = this.generateSyntheticFeatures(emotion);
      samples.push({ features, emotion });
    }
    
    return samples;
  }

  generateSyntheticFeatures(emotion) {
    const features = new Array(40).fill(0);
    
    // Generate features based on emotion patterns
    switch (emotion) {
      case 'Happy':
        features[0] = 0.7 + Math.random() * 0.3; // fast typing
        features[10] = 0.8 + Math.random() * 0.2; // high mouse velocity
        features[22] = 0.6 + Math.random() * 0.3; // moderate scrolling
        features[28] = 0.7 + Math.random() * 0.3; // high interaction density
        break;
      case 'Sad':
        features[0] = 0.2 + Math.random() * 0.2; // slow typing
        features[10] = 0.3 + Math.random() * 0.2; // low mouse velocity
        features[22] = 0.2 + Math.random() * 0.2; // slow scrolling
        features[28] = 0.2 + Math.random() * 0.2; // low interaction
        break;
      case 'Angry':
        features[0] = 0.8 + Math.random() * 0.2; // fast erratic typing
        features[2] = 0.3 + Math.random() * 0.3; // high backspace ratio
        features[10] = 0.9 + Math.random() * 0.1; // very high mouse velocity
        features[13] = 0.7 + Math.random() * 0.3; // high click frequency
        break;
      case 'Anxious':
        features[1] = 0.6 + Math.random() * 0.4; // high rhythm variance
        features[11] = 0.7 + Math.random() * 0.3; // high acceleration
        features[13] = 0.8 + Math.random() * 0.2; // very high click frequency
        features[23] = 0.6 + Math.random() * 0.3; // direction changes
        break;
      case 'Neutral':
        features[0] = 0.4 + Math.random() * 0.2; // moderate typing
        features[10] = 0.5 + Math.random() * 0.2; // moderate mouse
        features[22] = 0.4 + Math.random() * 0.2; // moderate scrolling
        features[28] = 0.5 + Math.random() * 0.2; // moderate interaction
        break;
      case 'Surprised':
        features[4] = 0.6 + Math.random() * 0.3; // high pause frequency
        features[13] = 0.3 + Math.random() * 0.2; // low click frequency
        features[22] = 0.7 + Math.random() * 0.3; // fast scrolling
        features[29] = 0.7 + Math.random() * 0.3; // high focus changes
        break;
      case 'Fearful':
        features[1] = 0.7 + Math.random() * 0.3; // high variance
        features[11] = 0.8 + Math.random() * 0.2; // high acceleration
        features[12] = 0.7 + Math.random() * 0.3; // high jitter
        features[23] = 0.8 + Math.random() * 0.2; // many direction changes
        break;
      case 'Disgusted':
        features[0] = 0.3 + Math.random() * 0.2; // slow typing
        features[10] = 0.4 + Math.random() * 0.2; // slow mouse
        features[13] = 0.2 + Math.random() * 0.2; // low clicks
        features[28] = 0.3 + Math.random() * 0.2; // low interaction
        break;
    }
    
    // Add some noise to other features
    for (let i = 0; i < features.length; i++) {
      if (features[i] === 0) {
        features[i] = Math.random() * 0.3;
      }
    }
    
    return features;
  }

  // Storage operations
  async saveToStorage() {
    try {
      const modelData = {
        weights: this.weights,
        trainingCount: this.trainingCount,
        version: 1,
        timestamp: Date.now()
      };
      
      await chrome.storage.local.set({ emotionMLModel: modelData });
      console.log('[EmotionML] Model saved, training count:', this.trainingCount);
    } catch (error) {
      console.error('[EmotionML] Error saving model:', error);
    }
  }

  async loadFromStorage() {
    try {
      const result = await chrome.storage.local.get(['emotionMLModel']);
      
      if (result.emotionMLModel && result.emotionMLModel.weights) {
        this.weights = result.emotionMLModel.weights;
        this.trainingCount = result.emotionMLModel.trainingCount || 0;
        console.log('[EmotionML] Model loaded from storage, training count:', this.trainingCount);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[EmotionML] Error loading model:', error);
      return false;
    }
  }

  async clearModel() {
    await chrome.storage.local.remove(['emotionMLModel']);
    this.weights = null;
    this.trainingCount = 0;
    this.isLoaded = false;
    console.log('[EmotionML] Model cleared');
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EmotionMLModel;
}
