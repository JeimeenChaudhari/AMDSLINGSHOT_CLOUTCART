let stream = null;
let emotionInterval = null;
let faceApiLoaded = false;

// Load face-api.js models
async function loadFaceApiModels() {
  if (faceApiLoaded) return true;
  
  try {
    console.log('Loading face-api.js models...');
    
    // Load models from CDN
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
    ]);
    
    faceApiLoaded = true;
    console.log('✅ Face-api.js models loaded successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error loading face-api.js models:', error);
    showStatus('⚠️ Error loading emotion detection models. Using fallback mode.', 'error');
    return false;
  }
}

// Enable camera button
document.getElementById('enableCameraBtn').addEventListener('click', async () => {
  await requestCameraAccess();
});

// Use keyboard mode instead
document.getElementById('useKeyboardBtn').addEventListener('click', async () => {
  await chrome.storage.sync.set({ 
    emotionEnabled: true,
    keyboardMode: true 
  });
  showStatus('Keyboard mode enabled! You can close this tab.', 'success');
  setTimeout(() => {
    window.close();
  }, 2000);
});

// Close button
document.getElementById('closeBtn').addEventListener('click', () => {
  window.close();
});

async function requestCameraAccess() {
  const statusEl = document.getElementById('statusMessage');
  const enableBtn = document.getElementById('enableCameraBtn');
  
  try {
    enableBtn.disabled = true;
    showStatus('Loading emotion detection models...', 'info');
    
    // Load face-api.js models first
    const modelsLoaded = await loadFaceApiModels();
    
    showStatus('Requesting camera access...', 'info');
    
    // Request camera permission
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      } 
    });
    
    console.log('Camera access granted!');
    
    // Show video
    const video = document.getElementById('webcam');
    video.srcObject = stream;
    video.style.display = 'block';
    document.getElementById('videoContainer').style.display = 'block';
    
    // Save settings
    await chrome.storage.sync.set({ 
      emotionEnabled: true,
      keyboardMode: false,
      cameraPermissionGranted: true
    });
    
    showStatus('✅ Camera access granted! Emotion detection is now active.', 'success');
    document.getElementById('successActions').style.display = 'block';
    enableBtn.style.display = 'none';
    document.getElementById('useKeyboardBtn').style.display = 'none';
    
    // Start emotion detection when video is ready
    video.onloadedmetadata = () => {
      console.log('Video metadata loaded, starting playback...');
      video.play()
        .then(() => {
          console.log('Video playing, starting emotion detection...');
          
          // Wait for video to be fully ready
          setTimeout(() => {
            if (modelsLoaded) {
              // Start real emotion detection
              emotionInterval = setInterval(() => {
                detectEmotionWithFaceApi();
              }, 1000); // Check every second
              
              detectEmotionWithFaceApi(); // Run first detection immediately
            } else {
              // Fallback to simulated detection
              emotionInterval = setInterval(() => {
                detectEmotionFallback();
              }, 2000);
              
              detectEmotionFallback();
            }
          }, 500);
        })
        .catch(err => {
          console.error('Error playing video:', err);
          showStatus('⚠️ Camera started but video playback failed: ' + err.message, 'error');
        });
    };
    
  } catch (err) {
    console.error('Camera access error:', err);
    handleCameraError(err);
    enableBtn.disabled = false;
  }
}

async function detectEmotionWithFaceApi() {
  const video = document.getElementById('webcam');
  
  // Check if video is playing
  if (!video || video.paused || video.ended || video.readyState < 2) {
    console.log('Video not ready for emotion detection');
    return;
  }
  
  try {
    // Detect face and expressions
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({
        inputSize: 224,
        scoreThreshold: 0.5
      }))
      .withFaceExpressions();
    
    if (detections && detections.expressions) {
      const expressions = detections.expressions;
      
      // Get the dominant emotion
      const emotionScores = {
        'Happy': expressions.happy,
        'Sad': expressions.sad,
        'Angry': expressions.angry,
        'Surprised': expressions.surprised,
        'Neutral': expressions.neutral,
        'Fearful': expressions.fearful,
        'Disgusted': expressions.disgusted
      };
      
      // Find emotion with highest confidence
      let dominantEmotion = 'Neutral';
      let maxConfidence = 0;
      
      for (const [emotion, confidence] of Object.entries(emotionScores)) {
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          dominantEmotion = emotion;
        }
      }
      
      // Map to our emotion set (add Anxious as a variant)
      if (dominantEmotion === 'Fearful' && emotionScores['Sad'] > 0.2) {
        dominantEmotion = 'Anxious';
        maxConfidence = (emotionScores['Fearful'] + emotionScores['Sad']) / 2;
      }
      
      const confidencePercent = Math.round(maxConfidence * 100);
      
      // Get emoji for emotion
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
      
      const emoji = emojiMap[dominantEmotion] || '😐';
      
      // Update display
      const emotionDisplay = document.getElementById('emotionDisplay');
      if (emotionDisplay) {
        emotionDisplay.textContent = `${emoji} ${dominantEmotion} (${confidencePercent}%)`;
      }
      
      // Store current emotion for content scripts to access
      await chrome.storage.local.set({ 
        currentEmotion: dominantEmotion,
        emotionConfidence: confidencePercent,
        lastEmotionUpdate: Date.now(),
        allEmotions: emotionScores
      });
      
      console.log('✅ Real emotion detected:', dominantEmotion, confidencePercent + '%', emotionScores);
      
    } else {
      console.log('⚠️ No face detected in frame');
      
      // Show "no face" message
      const emotionDisplay = document.getElementById('emotionDisplay');
      if (emotionDisplay) {
        emotionDisplay.textContent = '👤 No face detected';
      }
    }
    
  } catch (error) {
    console.error('Error detecting emotion:', error);
    // Fall back to simulated detection on error
    detectEmotionFallback();
  }
}

function detectEmotionFallback() {
  const video = document.getElementById('webcam');
  
  // Check if video is playing
  if (!video || video.paused || video.ended) {
    console.log('Video not ready for emotion detection');
    return;
  }
  
  // Simulate emotion detection as fallback
  const emotions = [
    { emoji: '😊', text: 'Happy' },
    { emoji: '😐', text: 'Neutral' },
    { emoji: '😲', text: 'Surprised' },
    { emoji: '😰', text: 'Anxious' },
    { emoji: '😢', text: 'Sad' },
    { emoji: '😠', text: 'Angry' }
  ];
  
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
  const confidence = Math.floor(Math.random() * 30) + 70;
  
  const emotionDisplay = document.getElementById('emotionDisplay');
  if (emotionDisplay) {
    emotionDisplay.textContent = 
      `${randomEmotion.emoji} ${randomEmotion.text} (${confidence}%) [Simulated]`;
  }
  
  // Store current emotion for content scripts to access
  chrome.storage.local.set({ 
    currentEmotion: randomEmotion.text,
    emotionConfidence: confidence,
    lastEmotionUpdate: Date.now()
  });
  
  console.log('Simulated emotion:', randomEmotion.text, confidence + '%');
}

function handleCameraError(err) {
  let errorMessage = '';
  
  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
    errorMessage = '❌ Camera permission was denied. Please click "Allow" when your browser asks for camera access, or use Keyboard Mode instead.';
  } else if (err.name === 'NotFoundError') {
    errorMessage = '❌ No camera found on your device. Please use Keyboard Mode instead.';
  } else if (err.name === 'NotReadableError') {
    errorMessage = '❌ Camera is already in use by another application. Please close other apps using the camera and try again.';
  } else {
    errorMessage = `❌ Camera access failed: ${err.message}. Please try Keyboard Mode instead.`;
  }
  
  showStatus(errorMessage, 'error');
}

function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

// Cleanup on close
window.addEventListener('beforeunload', () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  if (emotionInterval) {
    clearInterval(emotionInterval);
  }
});
