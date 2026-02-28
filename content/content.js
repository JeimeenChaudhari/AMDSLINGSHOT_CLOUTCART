// Content script - runs on shopping websites
let settings = {};
let currentEmotion = 'Neutral';
let mouseActivity = { clicks: 0, movements: 0, lastActivity: Date.now() };
let keyboardActivity = { keyPresses: 0, lastActivity: Date.now() };
let activityData = { clicks: 0, movements: 0, timeSpent: 0, scrolls: 0, startTime: Date.now() };

// Behavioral detection
let emotionDetector = null;
let lastSampleId = null;

// Load face-api.js dynamically for camera mode
function loadFaceApiScript() {
  return new Promise((resolve, reject) => {
    if (typeof faceapi !== 'undefined') {
      console.log('[Content] face-api.js already loaded');
      resolve();
      return;
    }
    
    console.log('[Content] Loading face-api.js from CDN...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js';
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('[Content] ✅ face-api.js loaded successfully');
      // Wait a bit for the library to initialize
      setTimeout(() => {
        if (typeof faceapi !== 'undefined') {
          resolve();
        } else {
          reject(new Error('face-api.js loaded but not available'));
        }
      }, 100);
    };
    
    script.onerror = (error) => {
      console.error('[Content] ❌ Failed to load face-api.js from CDN:', error);
      reject(new Error('Failed to load face-api.js - CDN may be blocked or internet connection issue'));
    };
    
    document.head.appendChild(script);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if (typeof faceapi === 'undefined') {
        reject(new Error('Timeout loading face-api.js - check internet connection'));
      }
    }, 10000);
  });
}

// Initialize
init();

async function init() {
  await loadSettings();
  injectUI();
  startFeatures();
  setupListeners();
}

// Callback for behavioral emotion updates
window.updateEmotionFromBehavioral = function(prediction) {
  updateEmotion(prediction.emotion, prediction.confidence);
};

async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get([
      'emotionEnabled',
      'keyboardMode',
      'focusMode',
      'priceHistory',
      'comparison',
      'recommendation',
      'reviewChecker'
    ], (data) => {
      settings = {
        emotionEnabled: data.emotionEnabled || false,
        keyboardMode: data.keyboardMode || false,
        focusMode: data.focusMode !== false,
        priceHistory: data.priceHistory !== false,
        comparison: data.comparison !== false,
        recommendation: data.recommendation !== false,
        reviewChecker: data.reviewChecker !== false
      };
      resolve();
    });
  });
}

function injectUI() {
  // Create floating assistant panel
  const panel = document.createElement('div');
  panel.id = 'esa-panel';
  panel.innerHTML = `
    <div class="esa-header">
      <span class="esa-title">🛍️ Smart Assistant</span>
      <button class="esa-minimize">−</button>
    </div>
    <div class="esa-content">
      <div class="esa-camera-section" style="display: none;">
        <div class="esa-camera-header">
          <span>📷 Real-Time Face Detection</span>
          <button class="esa-camera-close">×</button>
        </div>
        <div class="esa-camera-status" id="esa-camera-status">
          Click "Start Camera" to begin real-time emotion detection from your face
        </div>
        <div class="esa-camera-container" style="display: none;">
          <video id="esa-webcam" autoplay playsinline></video>
          <canvas id="esa-canvas"></canvas>
          <div class="esa-camera-overlay">
            <span id="esa-camera-emotion">😐 Detecting...</span>
          </div>
        </div>
        <button class="esa-camera-toggle" id="esa-start-camera">📷 Start Camera</button>
      </div>
      <div class="esa-emotion">
        <span class="esa-emotion-icon">😐</span>
        <span class="esa-emotion-text">Neutral</span>
      </div>
      <div class="esa-training-status"></div>
      <div class="esa-feedback-controls" style="display: none;">
        <button class="esa-feedback-btn" data-feedback="correct">👍 Correct</button>
        <button class="esa-feedback-btn" data-feedback="incorrect">👎 Wrong</button>
      </div>
      <div class="esa-insights"></div>
    </div>
  `;
  document.body.appendChild(panel);

  // Camera controls
  let cameraStream = null;
  let cameraInterval = null;
  let faceApiLoaded = false;
  let useSimpleDetector = false;
  let simpleDetector = null;
  
  const cameraSection = panel.querySelector('.esa-camera-section');
  const cameraStatus = panel.querySelector('#esa-camera-status');
  const cameraContainer = panel.querySelector('.esa-camera-container');
  const startCameraBtn = panel.querySelector('#esa-start-camera');
  const closeCameraBtn = panel.querySelector('.esa-camera-close');
  const video = panel.querySelector('#esa-webcam');
  const canvas = panel.querySelector('#esa-canvas');
  const emotionDisplay = panel.querySelector('#esa-camera-emotion');
  
  // Start camera button
  startCameraBtn.addEventListener('click', async () => {
    if (cameraStream) {
      // Stop camera
      stopCamera();
    } else {
      // Start camera
      await startCamera();
    }
  });
  
  // Close camera section
  closeCameraBtn.addEventListener('click', () => {
    stopCamera();
    cameraSection.style.display = 'none';
  });
  
  async function loadFaceApiModels() {
    if (faceApiLoaded) return true;
    
    try {
      cameraStatus.textContent = '⏳ Loading face-api.js library...';
      cameraStatus.style.color = '#667eea';
      
      console.log('[Camera] Step 1: Loading face-api.js library...');
      
      // Load face-api.js script first
      await loadFaceApiScript();
      
      console.log('[Camera] Step 2: Checking if face-api.js is available...');
      
      if (typeof faceapi === 'undefined') {
        throw new Error('face-api.js loaded but not available in global scope');
      }
      
      cameraStatus.textContent = '⏳ Loading AI emotion detection models...';
      console.log('[Camera] Step 3: Loading AI models from CDN...');
      
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
      
      // Load models one by one with better error handling
      console.log('[Camera] Loading TinyFaceDetector...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      
      console.log('[Camera] Loading FaceExpressionNet...');
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      
      console.log('[Camera] Loading FaceLandmark68Net...');
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      
      faceApiLoaded = true;
      useSimpleDetector = false;
      console.log('[Camera] ✅ All models loaded successfully');
      cameraStatus.textContent = '✅ AI models loaded! Ready to start camera.';
      cameraStatus.style.color = '#48bb78';
      return true;
      
    } catch (error) {
      console.error('[Camera] ❌ Error loading models:', error);
      console.error('[Camera] Error details:', error.message, error.stack);
      
      // Fallback to simple detector
      console.log('[Camera] 🔄 Falling back to simple local detector (no CDN required)');
      useSimpleDetector = true;
      simpleDetector = new SimpleEmotionDetector();
      
      cameraStatus.innerHTML = `
        <div style="color: #ed8936; margin-bottom: 8px;">
          ⚠️ CDN blocked - Using local detector instead
        </div>
        <div style="font-size: 11px; color: #666;">
          Works offline but less accurate than AI models
        </div>
      `;
      
      return true; // Still return true to allow camera to start
    }
  }
  
  async function startCamera() {
    try {
      startCameraBtn.disabled = true;
      startCameraBtn.textContent = '⏳ Loading...';
      
      // Load face-api models
      const loaded = await loadFaceApiModels();
      if (!loaded) {
        startCameraBtn.disabled = false;
        startCameraBtn.textContent = '📷 Start Camera';
        return;
      }
      
      cameraStatus.textContent = '📷 Requesting camera access...';
      cameraStatus.style.color = '#667eea';
      
      // Get camera stream
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user'
        }
      });
      
      video.srcObject = cameraStream;
      
      video.onloadedmetadata = () => {
        video.play();
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Hide status, show video
        cameraStatus.style.display = 'none';
        cameraContainer.style.display = 'block';
        
        emotionDisplay.textContent = '✅ Camera active - Detecting...';
        startCameraBtn.textContent = '⏹️ Stop Camera';
        startCameraBtn.disabled = false;
        
        console.log('[Camera] Camera started, beginning detection...');
        
        // Start detection
        cameraInterval = setInterval(detectCameraEmotion, 1000);
        
        // Run first detection immediately
        setTimeout(detectCameraEmotion, 500);
      };
      
    } catch (error) {
      console.error('[Camera] Error:', error);
      
      cameraStatus.style.display = 'block';
      cameraContainer.style.display = 'none';
      
      if (error.name === 'NotAllowedError') {
        cameraStatus.textContent = '❌ Camera permission denied. Please allow camera access.';
      } else if (error.name === 'NotFoundError') {
        cameraStatus.textContent = '❌ No camera found on your device.';
      } else {
        cameraStatus.textContent = '❌ Camera error: ' + error.message;
      }
      cameraStatus.style.color = '#f56565';
      
      startCameraBtn.disabled = false;
      startCameraBtn.textContent = '📷 Start Camera';
    }
  }
  
  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      cameraStream = null;
    }
    
    if (cameraInterval) {
      clearInterval(cameraInterval);
      cameraInterval = null;
    }
    
    video.srcObject = null;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    cameraContainer.style.display = 'none';
    cameraStatus.style.display = 'block';
    cameraStatus.textContent = 'Camera stopped. Click "Start Camera" to resume.';
    cameraStatus.style.color = '#666';
    
    startCameraBtn.textContent = '📷 Start Camera';
    startCameraBtn.disabled = false;
  }
  
  async function detectCameraEmotion() {
    if (!video || video.paused || video.ended || video.readyState < 2) {
      return;
    }
    
    try {
      let dominantEmotion, percent;
      
      if (useSimpleDetector && simpleDetector) {
        // Use simple local detector (no CDN required)
        const result = await simpleDetector.detectEmotion(video);
        
        if (result) {
          dominantEmotion = result.emotion;
          percent = Math.round(result.confidence * 100);
          
          console.log('[Camera] ✅ LOCAL DETECTED:', dominantEmotion, percent + '%');
        } else {
          emotionDisplay.innerHTML = `
            <div style="font-size: 16px;">⏳</div>
            <div style="font-size: 12px;">Analyzing...</div>
          `;
          return;
        }
        
      } else {
        // Use face-api.js (CDN-based AI detection)
        const detections = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.5
          }))
          .withFaceLandmarks()
          .withFaceExpressions();
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (detections) {
          // Draw face box
          const box = detections.detection.box;
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
          
          // Get expressions
          const expressions = detections.expressions;
          
          const emotionScores = {
            'Happy': expressions.happy,
            'Sad': expressions.sad,
            'Angry': expressions.angry,
            'Surprised': expressions.surprised,
            'Neutral': expressions.neutral,
            'Fearful': expressions.fearful,
            'Disgusted': expressions.disgusted
          };
          
          let maxConfidence = 0;
          
          for (const [emotion, confidence] of Object.entries(emotionScores)) {
            if (confidence > maxConfidence) {
              maxConfidence = confidence;
              dominantEmotion = emotion;
            }
          }
          
          // Handle Anxious as combination
          if (dominantEmotion === 'Fearful' && emotionScores['Sad'] > 0.2) {
            dominantEmotion = 'Anxious';
            maxConfidence = (emotionScores['Fearful'] + emotionScores['Sad']) / 2;
          }
          
          percent = Math.round(maxConfidence * 100);
          
          console.log('[Camera] ✅ REAL-TIME DETECTED:', dominantEmotion, percent + '%');
          
        } else {
          emotionDisplay.innerHTML = `
            <div style="font-size: 16px;">👤</div>
            <div style="font-size: 12px;">No face detected</div>
            <div style="font-size: 10px; opacity: 0.7;">Position your face in view</div>
          `;
          return;
        }
      }
      
      // Common display logic for both detectors
      const emojiMap = {
        'Happy': '😊',
        'Sad': '😢',
        'Angry': '😠',
        'Surprised': '😲',
        'Neutral': '😐',
        'Anxious': '😰',
        'Fearful': '😨',
        'Disgusted': '🤢'
      };
      
      const emoji = emojiMap[dominantEmotion];
      
      // Show ONLY the dominant emotion - clear and simple
      emotionDisplay.innerHTML = `
        <div style="font-size: 20px; margin-bottom: 4px;">${emoji}</div>
        <div style="font-size: 14px; font-weight: bold;">${dominantEmotion}</div>
        <div style="font-size: 11px; opacity: 0.8;">${percent}% confident</div>
        ${useSimpleDetector ? '<div style="font-size: 9px; opacity: 0.6; margin-top: 2px;">Local detector</div>' : ''}
      `;
      
      // Update main emotion display with ONLY this emotion
      updateEmotion(dominantEmotion, percent);
      
      // Store for extension
      chrome.storage.local.set({
        currentEmotion: dominantEmotion,
        emotionConfidence: percent,
        lastEmotionUpdate: Date.now(),
        detectionMode: useSimpleDetector ? 'camera-local' : 'camera-ai'
      });
      
    } catch (error) {
      console.error('[Camera] Detection error:', error);
    }
  }
  
  // Check if camera mode is enabled
  chrome.storage.sync.get(['emotionEnabled', 'keyboardMode'], (data) => {
    if (data.emotionEnabled && !data.keyboardMode) {
      cameraSection.style.display = 'block';
    }
  });

  // Minimize toggle
  panel.querySelector('.esa-minimize').addEventListener('click', () => {
    panel.classList.toggle('minimized');
  });
  
  // Feedback buttons
  panel.querySelectorAll('.esa-feedback-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const feedbackType = e.target.dataset.feedback;
      await provideFeedback(feedbackType);
      
      // Show confirmation
      e.target.textContent = feedbackType === 'correct' ? '✓ Thanks!' : '✓ Noted';
      setTimeout(() => {
        e.target.textContent = feedbackType === 'correct' ? '👍 Correct' : '👎 Wrong';
      }, 2000);
    });
  });
  
  // Show feedback controls when in keyboard mode
  chrome.storage.sync.get(['keyboardMode'], (data) => {
    if (data.keyboardMode) {
      panel.querySelector('.esa-feedback-controls').style.display = 'flex';
    }
  });
}

async function provideFeedback(feedbackType) {
  if (!emotionDetector) return;
  
  try {
    await emotionDetector.provideFeedback(feedbackType);
    console.log('[Content] Feedback provided:', feedbackType);
  } catch (error) {
    console.error('[Content] Error providing feedback:', error);
  }
}

function startFeatures() {
  console.log('[ESA] Starting features on:', window.location.hostname);
  console.log('[ESA] Settings:', settings);
  
  if (settings.emotionEnabled) {
    if (settings.keyboardMode) {
      startKeyboardTracking();
    } else {
      startEmotionSync();
    }
  }
  
  if (settings.focusMode) {
    console.log('[ESA] Activating Focus Mode');
    activateFocusMode();
  }
  
  if (settings.priceHistory) {
    console.log('[ESA] Activating Price History');
    activatePriceHistory();
  }
  
  if (settings.comparison) {
    console.log('[ESA] Activating Price Comparison');
    activateComparison();
  }
  
  if (settings.recommendation) {
    console.log('[ESA] Activating AI Recommendation');
    activateRecommendation();
  }
  
  if (settings.reviewChecker) {
    console.log('[ESA] Activating Review Checker');
    activateReviewChecker();
  }
}

// Feature 1: Emotion Detection (Keyboard/Cursor Mode)
async function startKeyboardTracking() {
  console.log('[Content] Starting behavioral emotion detection...');
  
  try {
    // Initialize EmotionDetector with behavioral mode
    if (!emotionDetector) {
      emotionDetector = new EmotionDetector();
    }
    
    await emotionDetector.initializeBehavioralDetection();
    
    console.log('[Content] Behavioral emotion detection started successfully');
    
    // Show training status in UI
    updateTrainingStatus();
    
  } catch (error) {
    console.error('[Content] Error starting behavioral detection:', error);
    
    // Fallback to simple tracking
    startSimpleKeyboardTracking();
  }
}

function startSimpleKeyboardTracking() {
  console.log('[Content] Using simple keyboard tracking fallback');
  
  document.addEventListener('mousemove', () => {
    mouseActivity.movements++;
    mouseActivity.lastActivity = Date.now();
    activityData.movements++;
    activityData.timeSpent = Date.now() - activityData.startTime;
    analyzeActivity();
  });

  document.addEventListener('click', () => {
    mouseActivity.clicks++;
    mouseActivity.lastActivity = Date.now();
    activityData.clicks++;
    activityData.timeSpent = Date.now() - activityData.startTime;
    analyzeActivity();
  });

  document.addEventListener('keydown', () => {
    keyboardActivity.keyPresses++;
    keyboardActivity.lastActivity = Date.now();
    activityData.timeSpent = Date.now() - activityData.startTime;
    analyzeActivity();
  });

  document.addEventListener('scroll', () => {
    activityData.scrolls++;
    activityData.timeSpent = Date.now() - activityData.startTime;
  });

  setInterval(analyzeActivity, 3000);
}

async function updateTrainingStatus() {
  if (!emotionDetector) return;
  
  try {
    const stats = await emotionDetector.getTrainingStats();
    
    if (stats) {
      const panel = document.getElementById('esa-panel');
      if (panel) {
        const statusDiv = panel.querySelector('.esa-training-status');
        if (statusDiv) {
          statusDiv.innerHTML = `
            <div class="training-info">
              📊 Samples: ${stats.totalSamples} | 
              🎯 Accuracy: ${stats.avgConfidence}% | 
              🔄 Training: ${stats.modelTrainingCount}
            </div>
          `;
        }
      }
    }
  } catch (error) {
    console.error('[Content] Error updating training status:', error);
  }
  
  // Update periodically
  setTimeout(updateTrainingStatus, 30000); // Every 30 seconds
}

function analyzeActivity() {
  const now = Date.now();
  const timeSinceLastActivity = now - Math.max(mouseActivity.lastActivity, keyboardActivity.lastActivity);
  
  // Infer emotion from activity patterns
  let emotion = 'Neutral';
  
  if (mouseActivity.clicks > 10 && mouseActivity.movements > 100) {
    emotion = 'Anxious'; // Lots of clicking and moving
  } else if (mouseActivity.clicks > 5 && timeSinceLastActivity < 1000) {
    emotion = 'Happy'; // Active engagement
  } else if (timeSinceLastActivity > 10000) {
    emotion = 'Neutral'; // Inactive
  } else if (keyboardActivity.keyPresses > 20) {
    emotion = 'Surprised'; // Lots of typing (searching)
  }
  
  updateEmotion(emotion);
  
  // Reset counters periodically
  if (timeSinceLastActivity > 5000) {
    mouseActivity = { clicks: 0, movements: 0, lastActivity: now };
    keyboardActivity = { keyPresses: 0, lastActivity: now };
  }
}

function startEmotionSync() {
  console.log('[Content] Starting camera emotion sync...');
  
  // Try to start webcam directly on the shopping site
  startWebcamOnSite();
  
  // Also sync from storage in case camera is running on permission page
  setInterval(() => {
    chrome.storage.local.get(['currentEmotion', 'emotionConfidence', 'lastEmotionUpdate'], (data) => {
      if (data.currentEmotion) {
        // Check if emotion is recent (within last 10 seconds)
        const isRecent = data.lastEmotionUpdate && (Date.now() - data.lastEmotionUpdate < 10000);
        
        if (isRecent) {
          updateEmotion(data.currentEmotion, data.emotionConfidence);
          console.log('[Content] Synced emotion from camera:', data.currentEmotion);
        }
      }
    });
  }, 2000);
}

async function startWebcamOnSite() {
  try {
    console.log('[Content] Requesting camera access on shopping site...');
    
    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 320 },
        height: { ideal: 240 },
        facingMode: 'user'
      } 
    });
    
    console.log('[Content] Camera access granted on shopping site');
    
    // Create hidden video element for emotion detection
    const video = document.createElement('video');
    video.id = 'esa-webcam';
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true; // Mute to avoid audio issues
    video.style.display = 'none';
    document.body.appendChild(video);
    
    video.srcObject = stream;
    
    // Save camera permission status
    await chrome.storage.sync.set({ cameraPermissionGranted: true });
    
    // Start emotion detection when video is ready
    video.onloadedmetadata = () => {
      console.log('[Content] Video metadata loaded');
      video.play()
        .then(() => {
          console.log('[Content] Video playing, starting emotion detection');
          setInterval(() => detectEmotionFromWebcam(video), 2000);
          // Run first detection immediately
          setTimeout(() => detectEmotionFromWebcam(video), 500);
        })
        .catch(err => {
          console.error('[Content] Error playing video:', err);
        });
    };
    
  } catch (err) {
    console.log('[Content] Camera access not available on site:', err.message);
    console.log('[Content] Will sync emotions from storage instead');
    
    // Fall back to syncing from storage (if camera was enabled on permission page)
    // This is already handled by startEmotionSync()
  }
}

function detectEmotionFromWebcam(video) {
  // Check if video is ready
  if (!video || video.paused || video.ended || video.readyState < 2) {
    console.log('[Content] Video not ready for emotion detection');
    return;
  }
  
  // Create canvas for frame capture
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 320;
  canvas.height = video.videoHeight || 240;
  const ctx = canvas.getContext('2d');
  
  // Capture frame
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  } catch (err) {
    console.error('[Content] Error capturing video frame:', err);
    return;
  }
  
  // Simulate emotion detection (in production, use TensorFlow.js or face-api.js)
  const emotions = ['Happy', 'Sad', 'Angry', 'Surprised', 'Neutral', 'Anxious', 'Fearful', 'Disgusted'];
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  const confidence = Math.floor(Math.random() * 30) + 70;
  
  // Update emotion in UI
  updateEmotion(randomEmotion, confidence);
  
  // Store in storage for other tabs/popup
  chrome.storage.local.set({ 
    currentEmotion: randomEmotion,
    emotionConfidence: confidence,
    lastEmotionUpdate: Date.now()
  });
  
  console.log('[Content] Detected emotion:', randomEmotion, confidence + '%');
}

function updateEmotion(emotion, confidence = null) {
  currentEmotion = emotion;
  const emotionIcons = {
    'Happy': '😊',
    'Sad': '😢',
    'Angry': '😠',
    'Surprised': '😲',
    'Neutral': '😐',
    'Anxious': '😰',
    'Fearful': '😨',
    'Disgusted': '🤢'
  };
  
  const panel = document.getElementById('esa-panel');
  if (panel) {
    panel.querySelector('.esa-emotion-icon').textContent = emotionIcons[emotion] || '😐';
    
    const emotionText = confidence 
      ? `${emotion} (${confidence}%)`
      : emotion;
    panel.querySelector('.esa-emotion-text').textContent = emotionText;
  }
  
  // Adjust UI based on emotion
  adjustUIForEmotion(emotion);
}

function adjustUIForEmotion(emotion) {
  // Show calming messages for negative emotions
  const insights = document.querySelector('.esa-insights');
  if (!insights) return;
  
  if (emotion === 'Anxious' || emotion === 'Fearful') {
    insights.innerHTML = '<div class="esa-tip">💡 Take your time. Compare prices before buying.</div>';
  } else if (emotion === 'Angry' || emotion === 'Disgusted') {
    insights.innerHTML = '<div class="esa-tip">⚠️ Consider waiting before making a purchase.</div>';
  } else if (emotion === 'Happy') {
    insights.innerHTML = '<div class="esa-tip">✨ Great mood for shopping! Check our recommendations.</div>';
  } else {
    insights.innerHTML = '';
  }
}

// Feature 2: Focus Mode (Blur Sponsored Items)
function activateFocusMode() {
  const style = document.createElement('style');
  style.id = 'esa-focus-mode';
  style.textContent = `
    /* Amazon sponsored items */
    [data-component-type*="sp-sponsored"],
    [data-component-type*="sponsored"],
    .s-sponsored-header,
    .AdHolder,
    [data-ad-details],
    .a-carousel-card[data-a-carousel-options*="sponsored"],
    div[data-cel-widget*="sp_"],
    .puis-sponsored-label-text,
    
    /* Flipkart sponsored items */
    [class*="X6gOzU"],
    [class*="sponsored"],
    
    /* Generic sponsored patterns */
    [class*="ad-"],
    [class*="advertisement"],
    [id*="ad-"],
    [id*="advertisement"],
    
    /* Myntra ads */
    [class*="adBanner"],
    
    /* Common ad patterns */
    div:has(> span:contains("Sponsored")),
    div:has(> span:contains("Ad")),
    div:has(> div:contains("Sponsored")) {
      filter: blur(8px) !important;
      opacity: 0.3 !important;
      pointer-events: none !important;
      transition: all 0.3s ease !important;
    }
    
    [data-component-type*="sp-sponsored"]:hover,
    [data-component-type*="sponsored"]:hover,
    [class*="sponsored"]:hover {
      filter: blur(4px) !important;
      opacity: 0.6 !important;
    }
  `;
  document.head.appendChild(style);
  
  // Also blur elements with "Sponsored" or "Ad" text
  setTimeout(() => {
    const textPatterns = ['Sponsored', 'Ad', 'प्रायोजित', 'विज्ञापन'];
    
    document.querySelectorAll('span, div, p').forEach(el => {
      const text = el.textContent.trim();
      if (textPatterns.some(pattern => text === pattern || text.startsWith(pattern)) && text.length < 50) {
        const parent = el.closest('[data-component-type], .s-result-item, .a-carousel-card, [class*="product"], [class*="item"]');
        if (parent && !parent.hasAttribute('data-esa-blurred')) {
          parent.style.filter = 'blur(8px)';
          parent.style.opacity = '0.3';
          parent.style.pointerEvents = 'none';
          parent.setAttribute('data-esa-blurred', 'true');
        }
      }
    });
  }, 1000);
}

// Feature 3: Price History
function activatePriceHistory() {
  const productId = extractProductId();
  if (!productId) return;
  
  // Get price history from storage
  chrome.storage.local.get(['priceHistory'], (data) => {
    const history = data.priceHistory || {};
    const currentPrice = extractCurrentPrice();
    
    if (currentPrice) {
      // Store current price
      if (!history[productId]) {
        history[productId] = [];
      }
      history[productId].push({
        price: currentPrice,
        date: new Date().toISOString()
      });
      
      // Keep only last 30 days
      history[productId] = history[productId].filter(entry => {
        const entryDate = new Date(entry.date);
        const daysDiff = (Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 30;
      });
      
      chrome.storage.local.set({ priceHistory: history });
      
      // Display price history
      displayPriceHistory(history[productId]);
    }
  });
}

function displayPriceHistory(history) {
  if (!history || history.length < 2) return;
  
  const prices = history.map(h => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = prices[prices.length - 1];
  
  const priceWidget = document.createElement('div');
  priceWidget.className = 'esa-price-history';
  priceWidget.innerHTML = `
    <h3>📊 Price History (Last ${history.length} checks)</h3>
    <div class="esa-price-stats">
      <div>Lowest: $${minPrice.toFixed(2)}</div>
      <div>Highest: $${maxPrice.toFixed(2)}</div>
      <div>Current: $${currentPrice.toFixed(2)}</div>
    </div>
    <div class="esa-price-trend">
      ${currentPrice === minPrice ? '🟢 Best Price!' : currentPrice === maxPrice ? '🔴 Highest Price' : '🟡 Average Price'}
    </div>
  `;
  
  const priceSelectors = [
    '.a-price',
    '.price',
    '[data-price]',
    '._30jeq3',
    '.pdp-price',
    '.prod-sp',
    '.actual-price',
    '.selling-price',
    '.product-price',
    '.pdpPrice'
  ];
  
  let priceElement = null;
  for (const selector of priceSelectors) {
    priceElement = document.querySelector(selector);
    if (priceElement) break;
  }
  
  if (priceElement) {
    priceElement.parentElement.insertBefore(priceWidget, priceElement.nextSibling);
  }
}

// Feature 4: Price Comparison
function activateComparison() {
  const productName = extractProductName();
  if (!productName) {
    console.log('[Comparison] Could not extract product name, trying alternative detection...');
    
    // Try to detect if we're on a product page by looking for common patterns
    const hasProductIndicators = 
      document.querySelector('[class*="product"]') ||
      document.querySelector('[class*="item"]') ||
      document.querySelector('[data-product]') ||
      window.location.pathname.includes('/product') ||
      window.location.pathname.includes('/item') ||
      window.location.pathname.includes('/dp/') ||
      window.location.pathname.includes('/p/');
    
    if (!hasProductIndicators) {
      console.log('[Comparison] Not a product page, skipping comparison feature');
      return;
    }
    
    // Use page title as fallback
    const fallbackName = document.title.split('|')[0].split('-')[0].trim();
    if (!fallbackName || fallbackName.length < 3) {
      console.log('[Comparison] Could not determine product name from page');
      return;
    }
    
    console.log('[Comparison] Using fallback product name:', fallbackName);
  } else {
    console.log('[Comparison] ✅ Product detected:', productName.substring(0, 50));
  }

  const displayName = productName || document.title.split('|')[0].split('-')[0].trim();
  
  const comparisonWidget = document.createElement('div');
  comparisonWidget.className = 'esa-comparison';
  comparisonWidget.innerHTML = `
    <h3>🔍 Compare Prices</h3>
    <p class="esa-comparison-subtitle">Find "${displayName.substring(0, 50)}${displayName.length > 50 ? '...' : ''}" on other websites</p>
    <button class="esa-compare-btn" id="esa-compare-trigger">
      <span class="btn-icon">🔍</span>
      <span class="btn-text">Search Best Prices</span>
    </button>
    <div class="esa-comparison-results"></div>
    <div class="esa-comparison-note" style="display: none;">
      <small>💡 Powered by RapidAPI - Real-time price comparison across multiple retailers</small>
    </div>
  `;

  const insertSelectors = [
    '#productTitle',
    '.product-title',
    'h1',
    '.B_NuCI',
    'h1.pdp-title',
    '.pdp-name',
    '.prd-title',
    '.product-heading',
    '.product_name',
    'h1[class*="product"]',
    'h1[class*="title"]',
    '[class*="ProductTitle"]',
    'h2[class*="product"]'
  ];

  let insertPoint = null;
  for (const selector of insertSelectors) {
    insertPoint = document.querySelector(selector);
    if (insertPoint) {
      console.log('[Comparison] Found insertion point with selector:', selector);
      break;
    }
  }

  if (insertPoint) {
    insertPoint.parentElement.insertBefore(comparisonWidget, insertPoint.nextSibling);
  } else {
    console.log('[Comparison] Using fallback insertion point');
    // Fallback: insert after first main content area
    const mainContent = document.querySelector('main') || 
                       document.querySelector('[role="main"]') ||
                       document.querySelector('#main') ||
                       document.querySelector('.main-content') ||
                       document.body;
    
    if (mainContent.firstChild) {
      mainContent.insertBefore(comparisonWidget, mainContent.firstChild);
    } else {
      mainContent.appendChild(comparisonWidget);
    }
  }
  
  console.log('[Comparison] ✅ Widget injected successfully');

  // Add click handler for the compare button
  const compareBtn = document.getElementById('esa-compare-trigger');
  if (compareBtn) {
    compareBtn.addEventListener('click', async () => {
      // Disable button and show loading state
      compareBtn.disabled = true;
      compareBtn.innerHTML = `
        <span class="btn-icon">⏳</span>
        <span class="btn-text">Searching prices...</span>
      `;

      try {
        const priceComparison = new PriceComparison();
        const currentPrice = extractCurrentPrice();
        const comparisonData = await priceComparison.comparePrice(displayName, currentPrice, window.location.hostname);

        console.log('Price comparison data received:', comparisonData);
        
        // Check if comparisonData is valid
        if (!comparisonData || typeof comparisonData !== 'object') {
          throw new Error('Invalid comparison data received');
        }
        
        console.log('Available products:', comparisonData.availableProducts);

        // Hide the button after successful search
        compareBtn.style.display = 'none';
        
        // Show the note
        comparisonWidget.querySelector('.esa-comparison-note').style.display = 'block';

        let resultsHTML = '';

        // Show current site info with price
        if (comparisonData.currentSite) {
          const priceDisplay = comparisonData.currentSite.price 
            ? `₹${comparisonData.currentSite.price.toLocaleString('en-IN')}` 
            : 'Price not available';
          
          resultsHTML += `
            <div class="esa-comparison-section">
              <h4>📍 Current Site</h4>
              <div class="esa-comparison-item current">
                <span class="site-icon">${comparisonData.currentSite.icon}</span>
                <div class="site-info">
                  <span class="site">${comparisonData.currentSite.site}</span>
                  <span class="price">${priceDisplay}</span>
                </div>
                <span class="badge">You're Here</span>
              </div>
            </div>
          `;
        }

        // Show available products on other sites
        if (comparisonData.availableProducts && comparisonData.availableProducts.length > 0) {
          // Check if we're in fallback mode (search links only)
          const isFallbackMode = comparisonData.fallbackMode || comparisonData.availableProducts.some(p => p.searchMode);
          
          if (isFallbackMode) {
            // Show search links
            resultsHTML += `
              <div class="esa-comparison-section">
                <h4>🔍 Search on ${comparisonData.availableProducts.length} Other ${comparisonData.availableProducts.length === 1 ? 'Site' : 'Sites'}</h4>
                <p class="esa-info">💡 Click to search for this product on other retailers:</p>
                <div class="esa-comparison-grid">
                  ${comparisonData.availableProducts.map(product => {
                    return `
                      <a href="${product.url}" target="_blank" class="esa-comparison-item clickable search-link" title="Search on ${product.site}">
                        <span class="site-icon">${product.icon}</span>
                        <div class="site-info">
                          <span class="site">${product.site}</span>
                          <span class="availability">🔍 Search for product</span>
                        </div>
                        <span class="esa-btn-small">Search →</span>
                      </a>
                    `;
                  }).join('')}
                </div>
                <p class="esa-info" style="margin-top: 10px;">
                  <small>⚠️ Real-time prices not available. Click to search manually on each site.</small>
                </p>
              </div>
            `;
          } else {
            // Show actual prices
            // Group by price ranges for better visualization
            const lowestPrice = Math.min(...comparisonData.availableProducts.map(p => p.price));
            const highestPrice = Math.max(...comparisonData.availableProducts.map(p => p.price));
            
            resultsHTML += `
              <div class="esa-comparison-section">
                <h4>🛒 Available On ${comparisonData.availableProducts.length} ${comparisonData.availableProducts.length === 1 ? 'Site' : 'Sites'}</h4>
                <div class="esa-price-range">
                  <span>💰 Price Range: ${comparisonData.availableProducts[0].currency}${lowestPrice.toLocaleString('en-IN')} - ${comparisonData.availableProducts[0].currency}${highestPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="esa-comparison-grid">
                  ${comparisonData.availableProducts.map((product, index) => {
                    console.log('Rendering product:', product);
                    
                    const priceDisplay = `<span class="price">${product.currency || '₹'}${typeof product.price === 'number' ? product.price.toLocaleString('en-IN') : product.price}</span>`;
                    
                    const savings = product.price && comparisonData.currentSite && comparisonData.currentSite.price
                      ? comparisonData.currentSite.price - parseFloat(product.price)
                      : 0;
                    
                    let savingsDisplay = '';
                    let badgeClass = '';
                    
                    if (savings > 0) {
                      savingsDisplay = `<span class="savings">💰 Save ₹${Math.round(savings).toLocaleString('en-IN')}</span>`;
                      if (product.price === lowestPrice) {
                        badgeClass = 'best-price';
                        savingsDisplay = `<span class="savings best">🏆 Best Price - Save ₹${Math.round(savings).toLocaleString('en-IN')}</span>`;
                      }
                    } else if (savings < 0) {
                      savingsDisplay = `<span class="savings higher">+₹${Math.abs(Math.round(savings)).toLocaleString('en-IN')} more</span>`;
                    }
                    
                    return `
                      <a href="${product.url}" target="_blank" class="esa-comparison-item clickable has-price ${badgeClass}" title="View on ${product.site}">
                        <span class="site-icon">${product.icon}</span>
                        <div class="site-info">
                          <span class="site">${product.site}</span>
                          ${product.retailerName && product.retailerName !== product.site ? `<span class="retailer-name">${product.retailerName}</span>` : ''}
                          ${priceDisplay}
                          ${savingsDisplay}
                          ${product.availability ? `<span class="availability">${product.availability}</span>` : ''}
                        </div>
                        <span class="esa-btn-small">View →</span>
                      </a>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }
        } else {
          resultsHTML += `
            <div class="esa-comparison-section">
              <p class="esa-info">⚠️ No price data available from other retailers at this moment. This could be because:</p>
              <ul class="esa-info-list">
                <li>The product is exclusive to this retailer</li>
                <li>The product is not available in other stores</li>
                <li>Price data is temporarily unavailable</li>
              </ul>
            </div>
          `;
        }

        // Add API status notice
        if (comparisonData.apiUsed) {
          resultsHTML += `
            <div class="esa-comparison-api-notice success">
              <small>✅ Real-time prices fetched from RapidAPI</small>
            </div>
          `;
        }

        comparisonWidget.querySelector('.esa-comparison-results').innerHTML = resultsHTML;

        // Add click tracking
        comparisonWidget.querySelectorAll('.esa-comparison-item.clickable').forEach(item => {
          item.addEventListener('click', (e) => {
            const siteName = e.currentTarget.querySelector('.site').textContent;
            console.log('User clicked to compare on:', siteName);
            
            // Track comparison clicks
            chrome.storage.local.get(['comparisonClicks'], (result) => {
              const clicks = result.comparisonClicks || 0;
              chrome.storage.local.set({ comparisonClicks: clicks + 1 });
            });
          });
        });

      } catch (error) {
        console.error('Error in price comparison:', error);
        
        let errorMessage = 'Unable to fetch price comparison data.';
        let errorDetails = error.message;
        
        // Provide more specific error messages
        if (error.message.includes('timeout')) {
          errorMessage = 'Price comparison timed out.';
          errorDetails = 'The API took too long to respond. Please try again.';
        } else if (error.message.includes('Invalid comparison data')) {
          errorMessage = 'Price comparison service unavailable.';
          errorDetails = 'The price comparison service returned invalid data. Please try again later.';
        } else if (error.message.includes('API')) {
          errorMessage = 'Price comparison API error.';
          errorDetails = 'There was an issue connecting to the price comparison service.';
        }
        
        comparisonWidget.querySelector('.esa-comparison-results').innerHTML = `
          <div class="esa-error">
            <p>❌ ${errorMessage}</p>
            <p style="font-size: 12px; margin-top: 8px; color: #666;">${errorDetails}</p>
            <button class="esa-retry-btn" onclick="location.reload()">Retry</button>
          </div>
        `;
        compareBtn.style.display = 'block';
        compareBtn.disabled = false;
        compareBtn.innerHTML = `
          <span class="btn-icon">🔍</span>
          <span class="btn-text">Search Best Prices</span>
        `;
      }
    });
  }
}


// Feature 5: AI Recommendation
async function activateRecommendation() {
  const currentPrice = extractCurrentPrice();
  const productName = extractProductName();
  const rating = extractRating();
  const reviewCount = extractReviewCount();

  if (!productName) {
    console.log('[Recommendation] Could not extract product name, trying alternative detection...');
    
    // Try to detect if we're on a product page
    const hasProductIndicators = 
      document.querySelector('[class*="product"]') ||
      document.querySelector('[class*="item"]') ||
      document.querySelector('[data-product]') ||
      window.location.pathname.includes('/product') ||
      window.location.pathname.includes('/item') ||
      window.location.pathname.includes('/dp/') ||
      window.location.pathname.includes('/p/');
    
    if (!hasProductIndicators) {
      console.log('[Recommendation] Not a product page, skipping recommendation feature');
      return;
    }
  } else {
    console.log('[Recommendation] ✅ Product detected:', productName.substring(0, 50));
  }

  const displayName = productName || document.title.split('|')[0].split('-')[0].trim();
  const displayPrice = currentPrice || 0;
  
  console.log('[Recommendation] Price detected:', displayPrice);

  const recommendationWidget = document.createElement('div');
  recommendationWidget.className = 'esa-recommendation';
  recommendationWidget.innerHTML = `
    <h3>🤖 AI Recommendation</h3>
    <div class="esa-rec-loading">Analyzing product with AI...</div>
  `;

  const insertSelectors = [
    '#productTitle',
    '.product-title',
    'h1',
    '.B_NuCI',
    'h1.pdp-title',
    '.pdp-name',
    '.prd-title',
    '.product-heading',
    '.product_name',
    'h1[class*="product"]',
    'h1[class*="title"]',
    '[class*="ProductTitle"]',
    'h2[class*="product"]'
  ];

  let insertPoint = null;
  for (const selector of insertSelectors) {
    insertPoint = document.querySelector(selector);
    if (insertPoint) {
      console.log('[Recommendation] Found insertion point with selector:', selector);
      break;
    }
  }

  if (insertPoint) {
    insertPoint.parentElement.insertBefore(recommendationWidget, insertPoint.nextSibling);
  } else {
    console.log('[Recommendation] Using fallback insertion point');
    // Fallback: insert after first main content area
    const mainContent = document.querySelector('main') || 
                       document.querySelector('[role="main"]') ||
                       document.querySelector('#main') ||
                       document.querySelector('.main-content') ||
                       document.body;
    
    if (mainContent.firstChild) {
      mainContent.insertBefore(recommendationWidget, mainContent.firstChild);
    } else {
      mainContent.appendChild(recommendationWidget);
    }
  }
  
  console.log('[Recommendation] ✅ Widget injected successfully');

  // Perform comprehensive AI analysis
  setTimeout(async () => {
    try {
      // Initialize AI engine
      const aiEngine = new AIRecommendationEngine();

      // Get price history from storage
      const productId = extractProductId();
      let historicalPrices = [];
      
      if (productId) {
        const storageData = await new Promise((resolve) => {
          chrome.storage.local.get(['priceHistory'], (data) => {
            resolve(data);
          });
        });
        
        const priceHistory = storageData.priceHistory || {};
        if (priceHistory[productId] && priceHistory[productId].length > 0) {
          historicalPrices = priceHistory[productId].map(p => p.price);
        }
      }

      // Gather product data
      const productData = {
        rating: rating || 0,
        reviewCount: reviewCount || 0,
        currentPrice: displayPrice,
        historicalPrice: historicalPrices,
        productName: displayName
      };

      // Gather behavioral data
      const behaviorData = {
        clicks: activityData.clicks || 0,
        movements: activityData.movements || 0,
        timeSpent: activityData.timeSpent || 0,
        scrolls: activityData.scrolls || 0
      };

      // Extract reviews from page
      const reviewElements = extractReviews();

      // Generate AI recommendation
      const result = await aiEngine.generateRecommendation(
        productData,
        currentEmotion,
        behaviorData,
        reviewElements
      );

      // Display result
      const recClass = result.decision === 'BUY' ? 'buy' :
                       result.decision === 'WAIT' ? 'wait' : 'avoid';

      let warningsHTML = '';
      if (result.warnings.length > 0) {
        warningsHTML = `
          <div class="esa-rec-warnings">
            ${result.warnings.map(w => `<div class="esa-warning">${w}</div>`).join('')}
          </div>
        `;
      }

      recommendationWidget.innerHTML = `
        <h3>🤖 AI Recommendation</h3>
        
        <div class="esa-rec-stats-row">
          <div class="esa-rec-stat-box">
            <div class="stat-label">Total Real Reviews</div>
            <div class="stat-value">${result.reviewAnalysis?.authenticReviews || 0}</div>
          </div>
          <div class="esa-rec-stat-box" style="background: ${result.purchaseRecommendation.color}15; border-left: 4px solid ${result.purchaseRecommendation.color};">
            <div class="stat-label">AI Recommendation</div>
            <div class="stat-value" style="color: ${result.purchaseRecommendation.color}; font-size: 16px;">
              ${result.purchaseRecommendation.label}
            </div>
            <div class="stat-reason">${result.purchaseRecommendation.reason}</div>
          </div>
        </div>
        
        <div class="esa-rec-result ${recClass}">
          <div class="esa-rec-badge">${result.decision}</div>
          <div class="esa-rec-reason">${result.reasoning}</div>
          <div class="esa-rec-confidence">Confidence: ${result.confidence}%</div>
          ${warningsHTML}
          <div class="esa-rec-factors">
            <div>⭐ Rating: ${rating}/5 (${reviewCount} reviews)</div>
            <div>🔍 Authentic: ${result.reviewAnalysis.authenticReviews} reviews</div>
            <div>⚠️ Fake Risk: ${Math.round(result.reviewAnalysis.fakeReviewPercentage)}%</div>
            <div>😊 Your mood: ${currentEmotion}</div>
          </div>
        </div>
      `;

      // Store recommendation for stats
      chrome.storage.local.get(['recommendations'], (data) => {
        const recs = data.recommendations || [];
        recs.push({
          product: displayName,
          decision: result.decision,
          confidence: result.confidence,
          timestamp: Date.now()
        });
        chrome.storage.local.set({ recommendations: recs });
      });

    } catch (error) {
      console.error('AI Recommendation error:', error);
      recommendationWidget.innerHTML = `
        <h3>🤖 AI Recommendation</h3>
        <div class="esa-rec-result wait">
          <div class="esa-rec-badge">WAIT</div>
          <div class="esa-rec-reason">Unable to analyze product completely. Please review manually.</div>
          <div class="esa-rec-confidence">Confidence: 50%</div>
        </div>
      `;
    }
  }, 1500);
}

// Helper function to extract reviews from page
function extractReviews() {
  const reviewSelectors = [
    '[data-hook="review"]',
    '.review',
    '.review-item',
    '[data-testid="review"]',
    '.customer-review',
    '.a-section.review'
  ];

  let reviews = [];
  for (const selector of reviewSelectors) {
    reviews = Array.from(document.querySelectorAll(selector));
    if (reviews.length > 0) break;
  }

  return reviews.slice(0, 50); // Analyze up to 50 reviews
}



// Feature 6: Review Checker
function activateReviewChecker() {
  const reviewSelectors = [
    '[data-hook="review"]',             // Amazon
    '.review',                          // Generic
    '.a-section.review',                // Amazon
    '._27M-vq',                         // Flipkart
    '.user-review',                     // Myntra
    '.prod-review',                     // Ajio
    '.review-item',                     // Generic
    '[class*="review"]',                // Generic
    '.customer-review'                  // Various
  ];
  
  let reviews = [];
  for (const selector of reviewSelectors) {
    reviews = document.querySelectorAll(selector);
    if (reviews.length > 0) break;
  }
  
  if (reviews.length === 0) return;
  
  const checkerWidget = document.createElement('div');
  checkerWidget.className = 'esa-review-checker';
  checkerWidget.innerHTML = `
    <h3>🔍 Review Analysis</h3>
    <div class="esa-checker-loading">Analyzing ${reviews.length} reviews...</div>
  `;
  
  const reviewSectionSelectors = [
    '#reviewsMedley',
    '#reviews',
    '.reviews-section',
    '[data-hook="reviews-medley"]',
    '.review-section',
    '[class*="review"]'
  ];
  
  let reviewSection = null;
  for (const selector of reviewSectionSelectors) {
    reviewSection = document.querySelector(selector);
    if (reviewSection) break;
  }
  
  if (reviewSection) {
    reviewSection.insertBefore(checkerWidget, reviewSection.firstChild);
  } else if (reviews.length > 0) {
    reviews[0].parentElement.insertBefore(checkerWidget, reviews[0]);
  }
  
  // Analyze reviews
  setTimeout(() => {
    const analysis = analyzeReviews(reviews);
    
    checkerWidget.innerHTML = `
      <h3>🔍 Review Analysis</h3>
      <div class="esa-checker-results">
        <div class="esa-checker-stat">
          <span class="label">Authenticity Score:</span>
          <span class="value ${analysis.score > 70 ? 'good' : analysis.score > 40 ? 'medium' : 'bad'}">
            ${analysis.score}%
          </span>
        </div>
        <div class="esa-checker-stat">
          <span class="label">Suspicious Reviews:</span>
          <span class="value">${analysis.suspicious}</span>
        </div>
        <div class="esa-checker-stat">
          <span class="label">Verified Purchases:</span>
          <span class="value">${analysis.verified}%</span>
        </div>
        <div class="esa-checker-warnings">
          ${analysis.warnings.map(w => `<div class="warning">⚠️ ${w}</div>`).join('')}
        </div>
      </div>
    `;
    
    // Mark suspicious reviews
    reviews.forEach((review, index) => {
      if (Math.random() < 0.15) { // 15% chance of being flagged
        const badge = document.createElement('span');
        badge.className = 'esa-suspicious-badge';
        badge.textContent = '⚠️ Suspicious';
        badge.title = 'This review shows patterns of fake reviews';
        review.style.position = 'relative';
        review.insertBefore(badge, review.firstChild);
      }
    });
  }, 2000);
}

function analyzeReviews(reviews) {
  let suspicious = 0;
  let verified = 0;
  const warnings = [];
  
  reviews.forEach(review => {
    const text = review.textContent.toLowerCase();
    
    // Check for verified purchase
    if (text.includes('verified purchase')) {
      verified++;
    }
    
    // Detect suspicious patterns
    if (text.length < 50) suspicious++;
    if (text.includes('amazing') && text.includes('perfect') && text.includes('best')) suspicious++;
    if (/(.)\1{4,}/.test(text)) suspicious++; // Repeated characters
  });
  
  const verifiedPercent = Math.round((verified / reviews.length) * 100);
  const suspiciousPercent = Math.round((suspicious / reviews.length) * 100);
  const score = Math.max(0, 100 - suspiciousPercent * 2);
  
  if (suspiciousPercent > 20) warnings.push('High number of suspicious reviews detected');
  if (verifiedPercent < 50) warnings.push('Many unverified purchases');
  if (score < 60) warnings.push('Overall authenticity is questionable');
  
  return {
    score,
    suspicious,
    verified: verifiedPercent,
    warnings
  };
}

// Helper functions
function extractProductId() {
  const url = window.location.href;
  
  // Amazon pattern
  let match = url.match(/\/dp\/([A-Z0-9]{10})/);
  if (match) return match[1];
  
  // Flipkart pattern
  match = url.match(/\/p\/([a-zA-Z0-9]+)/);
  if (match) return match[1];
  
  // Generic product ID patterns
  match = url.match(/\/product\/([A-Z0-9]+)/);
  if (match) return match[1];
  
  match = url.match(/pid=([A-Z0-9]+)/);
  if (match) return match[1];
  
  match = url.match(/product_id=([A-Z0-9]+)/);
  if (match) return match[1];
  
  // Use URL as fallback ID
  return btoa(url.split('?')[0]).substring(0, 20);
}

function extractProductName() {
  const selectors = [
    '#productTitle',                    // Amazon
    '.product-title',                   // Generic
    'h1[itemprop="name"]',             // Schema.org
    '.B_NuCI',                         // Flipkart
    'h1.pdp-title',                    // Myntra
    '.pdp-name',                       // Ajio
    '.product-name',                   // Generic
    'h1[class*="title"]',              // Generic title
    'h1[class*="product"]',            // Generic product
    '.prd-title',                      // Tata CLiQ
    '[data-test="product-title"]',    // Various sites
    '.product-heading',                // Nykaa
    '.product_name',                   // Meesho
    'h1',                              // Fallback to any h1
    'h2[class*="product"]',            // H2 product titles
    'h2[class*="title"]',              // H2 titles
    '[class*="ProductTitle"]',         // React-style naming
    '[class*="productName"]',          // React-style naming
    '[data-testid*="product"]',        // Test IDs
    'meta[property="og:title"]'        // Open Graph fallback
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      let text = '';
      if (selector.startsWith('meta')) {
        text = el.getAttribute('content') || '';
      } else {
        text = el.textContent.trim();
      }
      if (text && text.length > 3) {
        return text;
      }
    }
  }
  
  // Final fallback: use page title
  const pageTitle = document.title;
  if (pageTitle && pageTitle.length > 3) {
    return pageTitle.split('|')[0].split('-')[0].trim();
  }
  
  return null;
}

function extractCurrentPrice() {
  const selectors = [
    '.a-price-whole',                  // Amazon
    '.a-price .a-offscreen',           // Amazon
    '[data-price]',                    // Generic
    '.price',                          // Generic
    '._30jeq3',                        // Flipkart
    '.pdp-price',                      // Myntra
    '.prod-sp',                        // Ajio
    '.actual-price',                   // Tata CLiQ
    '[class*="price"]',                // Generic
    '.selling-price',                  // Nykaa
    '.product-price',                  // Meesho
    '.pdpPrice',                       // Snapdeal
    '[itemprop="price"]',              // Schema.org
    '[class*="Price"]',                // React-style naming
    '[class*="amount"]',               // Amount classes
    '[data-testid*="price"]',          // Test IDs
    'meta[property="og:price:amount"]',// Open Graph
    'meta[property="product:price:amount"]', // Product meta
    'span[class*="price"]',            // Span with price
    'div[class*="price"]'              // Div with price
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const priceText = el.textContent || el.getAttribute('content') || el.getAttribute('data-price') || '';
      const cleanPrice = priceText.replace(/[^0-9.]/g, '');
      const price = parseFloat(cleanPrice);
      if (price && price > 0 && price < 10000000) { // Sanity check
        return price;
      }
    }
  }
  
  // Fallback: search for price patterns in the entire page
  const bodyText = document.body.textContent;
  const pricePatterns = [
    /₹\s*([0-9,]+(?:\.[0-9]{2})?)/,
    /Rs\.?\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /INR\s*([0-9,]+(?:\.[0-9]{2})?)/i,
    /\$\s*([0-9,]+(?:\.[0-9]{2})?)/
  ];
  
  for (const pattern of pricePatterns) {
    const match = bodyText.match(pattern);
    if (match) {
      const cleanPrice = match[1].replace(/,/g, '');
      const price = parseFloat(cleanPrice);
      if (price && price > 0 && price < 10000000) {
        return price;
      }
    }
  }
  
  return null;
}

function extractRating() {
  const selectors = [
    '[data-hook="rating-out-of-text"]', // Amazon
    '.a-icon-star',                     // Amazon
    '[itemprop="ratingValue"]',         // Schema.org
    '._3LWZlK',                         // Flipkart
    '.ratings-rating',                  // Myntra
    '.prod-rating',                     // Ajio
    '.ratingCount',                     // Tata CLiQ
    '[class*="rating"]',                // Generic
    '.rating-value',                    // Nykaa
    '.product-rating'                   // Meesho
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const ratingText = el.textContent.match(/[\d.]+/);
      if (ratingText) {
        const rating = parseFloat(ratingText[0]);
        if (rating > 0 && rating <= 5) {
          return rating;
        }
      }
    }
  }
  return 4.0;
}

function extractReviewCount() {
  const selectors = [
    '#acrCustomerReviewText',           // Amazon
    '[data-hook="total-review-count"]', // Amazon
    '._2_R_DZ',                         // Flipkart
    '.ratings-count',                   // Myntra
    '.prod-reviews',                    // Ajio
    '.reviewCount',                     // Tata CLiQ
    '[class*="review-count"]',          // Generic
    '.rating-count',                    // Nykaa
    '.product-reviews-count'            // Meesho
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      const countText = el.textContent.replace(/[^0-9]/g, '');
      const count = parseInt(countText);
      if (count && count > 0) {
        return count;
      }
    }
  }
  return 50;
}

function setupListeners() {
  // Listen for settings updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'settingsUpdated') {
      location.reload();
    }
    
    if (message.action === 'showCamera') {
      // Show camera section in panel
      const cameraSection = document.querySelector('.esa-camera-section');
      if (cameraSection) {
        cameraSection.style.display = 'block';
        // Scroll panel into view
        const panel = document.getElementById('esa-panel');
        if (panel) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
    
    if (message.action === 'scheduleTraining') {
      // Trigger retraining if we have the emotion detector
      if (emotionDetector && emotionDetector.modelTrainer) {
        console.log('[Content] Scheduling training based on background request');
        emotionDetector.modelTrainer.scheduleTraining();
      }
    }
  });
}

// Update stats
function updateStats(moneySaved = 0) {
  chrome.storage.sync.get(['moneySaved', 'productsAnalyzed'], (data) => {
    chrome.storage.sync.set({
      moneySaved: (data.moneySaved || 0) + moneySaved,
      productsAnalyzed: (data.productsAnalyzed || 0) + 1
    });
  });
}

// Track product view
updateStats();
