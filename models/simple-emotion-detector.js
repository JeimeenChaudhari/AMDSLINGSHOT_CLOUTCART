// Simple Local Emotion Detector - No CDN Required
// Uses basic computer vision techniques without external dependencies

class SimpleEmotionDetector {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.previousFrame = null;
    this.motionHistory = [];
    this.brightnessHistory = [];
  }

  async detectEmotion(video) {
    if (!video || video.paused || video.ended || video.readyState < 2) {
      return null;
    }

    try {
      // Set canvas size to match video
      this.canvas.width = video.videoWidth || 320;
      this.canvas.height = video.videoHeight || 240;

      // Draw current frame
      this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      
      // Analyze frame
      const features = this.extractFeatures(imageData);
      
      // Detect emotion based on features
      const emotion = this.classifyEmotion(features);
      
      return emotion;
      
    } catch (error) {
      console.error('[SimpleDetector] Error:', error);
      return null;
    }
  }

  extractFeatures(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Calculate average brightness
    let totalBrightness = 0;
    let faceRegionBrightness = 0;
    let edgeCount = 0;
    
    // Focus on center region (likely face area)
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const regionSize = Math.min(width, height) / 3;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Calculate brightness
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;
        
        // Check if in face region
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < regionSize) {
          faceRegionBrightness += brightness;
        }
        
        // Simple edge detection (for facial features)
        if (x < width - 1 && y < height - 1) {
          const nextI = ((y + 1) * width + x) * 4;
          const diff = Math.abs(brightness - (data[nextI] + data[nextI + 1] + data[nextI + 2]) / 3);
          if (diff > 30) edgeCount++;
        }
      }
    }
    
    const avgBrightness = totalBrightness / (width * height);
    const faceAvgBrightness = faceRegionBrightness / (Math.PI * regionSize * regionSize);
    
    // Calculate motion (if we have previous frame)
    let motion = 0;
    if (this.previousFrame) {
      const prevData = this.previousFrame.data;
      for (let i = 0; i < data.length; i += 4) {
        const diff = Math.abs(data[i] - prevData[i]) + 
                     Math.abs(data[i + 1] - prevData[i + 1]) + 
                     Math.abs(data[i + 2] - prevData[i + 2]);
        motion += diff;
      }
      motion = motion / (width * height * 3);
    }
    
    // Store current frame for next comparison
    this.previousFrame = this.ctx.getImageData(0, 0, width, height);
    
    // Store history
    this.motionHistory.push(motion);
    this.brightnessHistory.push(avgBrightness);
    
    // Keep only last 10 frames
    if (this.motionHistory.length > 10) {
      this.motionHistory.shift();
      this.brightnessHistory.shift();
    }
    
    // Calculate trends
    const avgMotion = this.motionHistory.reduce((a, b) => a + b, 0) / this.motionHistory.length;
    const brightnessVariance = this.calculateVariance(this.brightnessHistory);
    
    return {
      brightness: avgBrightness,
      faceBrightness: faceAvgBrightness,
      motion: motion,
      avgMotion: avgMotion,
      edgeCount: edgeCount,
      brightnessVariance: brightnessVariance
    };
  }

  calculateVariance(arr) {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    return variance;
  }

  classifyEmotion(features) {
    // Simple rule-based classification
    // This is a basic heuristic approach - not as accurate as ML but works offline
    
    const { brightness, faceBrightness, motion, avgMotion, edgeCount, brightnessVariance } = features;
    
    // Normalize edge count
    const normalizedEdges = edgeCount / 1000;
    
    // Happy: Higher brightness in face region, moderate motion
    if (faceBrightness > brightness * 1.1 && avgMotion > 2 && avgMotion < 8) {
      return {
        emotion: 'Happy',
        confidence: Math.min(0.75 + (faceBrightness / brightness - 1) * 0.2, 0.95)
      };
    }
    
    // Sad: Lower brightness, less motion, fewer edges
    if (faceBrightness < brightness * 0.95 && avgMotion < 3 && normalizedEdges < 5) {
      return {
        emotion: 'Sad',
        confidence: Math.min(0.65 + (1 - faceBrightness / brightness) * 0.25, 0.90)
      };
    }
    
    // Surprised: High motion, high edge count (wide eyes/mouth)
    if (avgMotion > 8 && normalizedEdges > 7) {
      return {
        emotion: 'Surprised',
        confidence: Math.min(0.70 + (avgMotion / 15) * 0.2, 0.90)
      };
    }
    
    // Angry: High edge count, moderate motion, brightness variance
    if (normalizedEdges > 6 && avgMotion > 3 && brightnessVariance > 100) {
      return {
        emotion: 'Angry',
        confidence: Math.min(0.65 + (normalizedEdges / 10) * 0.2, 0.85)
      };
    }
    
    // Anxious: High motion, high brightness variance
    if (avgMotion > 5 && brightnessVariance > 150) {
      return {
        emotion: 'Anxious',
        confidence: Math.min(0.60 + (brightnessVariance / 300) * 0.25, 0.85)
      };
    }
    
    // Neutral: Default
    return {
      emotion: 'Neutral',
      confidence: 0.70
    };
  }

  reset() {
    this.previousFrame = null;
    this.motionHistory = [];
    this.brightnessHistory = [];
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SimpleEmotionDetector;
}
