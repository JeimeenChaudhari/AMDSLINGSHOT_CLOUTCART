// Popup controller
let stream = null;
let emotionInterval = null;

// Load saved settings
chrome.storage.sync.get([
  'emotionEnabled',
  'keyboardMode',
  'focusMode',
  'priceHistory',
  'comparison',
  'recommendation',
  'reviewChecker',
  'moneySaved',
  'productsAnalyzed'
], (data) => {
  document.getElementById('emotionToggle').checked = data.emotionEnabled || false;
  document.getElementById('keyboardMode').checked = data.keyboardMode || false;
  document.getElementById('focusModeToggle').checked = data.focusMode !== false;
  document.getElementById('priceHistoryToggle').checked = data.priceHistory !== false;
  document.getElementById('comparisonToggle').checked = data.comparison !== false;
  document.getElementById('recommendationToggle').checked = data.recommendation !== false;
  document.getElementById('reviewCheckerToggle').checked = data.reviewChecker !== false;
  
  document.getElementById('moneySaved').textContent = `$${data.moneySaved || 0}`;
  document.getElementById('productsAnalyzed').textContent = data.productsAnalyzed || 0;
  
  if (data.emotionEnabled && !data.keyboardMode) {
    startWebcam();
  }
  updateEmotionStatus();
});

// Emotion toggle
document.getElementById('emotionToggle').addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  
  if (enabled) {
    const keyboardMode = document.getElementById('keyboardMode').checked;
    if (!keyboardMode) {
      // Show camera notice with button
      document.getElementById('cameraNotice').style.display = 'block';
    } else {
      await chrome.storage.sync.set({ emotionEnabled: enabled });
    }
  } else {
    stopWebcam();
    document.getElementById('cameraNotice').style.display = 'none';
    await chrome.storage.sync.set({ emotionEnabled: false });
  }
  
  updateEmotionStatus();
  notifyContentScript();
});

// Camera request button
document.getElementById('requestCameraBtn').addEventListener('click', async () => {
  console.log('Camera button clicked');
  await startWebcam();
  if (stream) {
    await chrome.storage.sync.set({ emotionEnabled: true });
  }
});

// Show camera notice when hovering over emotion toggle
document.getElementById('emotionToggle').parentElement.addEventListener('mouseenter', () => {
  const emotionEnabled = document.getElementById('emotionToggle').checked;
  const keyboardMode = document.getElementById('keyboardMode').checked;
  if (!emotionEnabled && !keyboardMode) {
    document.getElementById('cameraNotice').style.display = 'block';
  }
});

document.getElementById('emotionToggle').parentElement.addEventListener('mouseleave', () => {
  const emotionEnabled = document.getElementById('emotionToggle').checked;
  if (!emotionEnabled) {
    setTimeout(() => {
      document.getElementById('cameraNotice').style.display = 'none';
    }, 2000);
  }
});

// Keyboard mode toggle
document.getElementById('keyboardMode').addEventListener('change', async (e) => {
  const keyboardMode = e.target.checked;
  await chrome.storage.sync.set({ keyboardMode });
  
  if (keyboardMode) {
    stopWebcam();
    document.getElementById('cameraNotice').style.display = 'none';
  } else if (document.getElementById('emotionToggle').checked) {
    document.getElementById('cameraNotice').style.display = 'block';
    await startWebcam();
  }
  notifyContentScript();
});

// Feature toggles
const features = ['focusMode', 'priceHistory', 'comparison', 'recommendation', 'reviewChecker'];
features.forEach(feature => {
  document.getElementById(`${feature}Toggle`).addEventListener('change', async (e) => {
    await chrome.storage.sync.set({ [feature]: e.target.checked });
    notifyContentScript();
  });
});

// Reset button
document.getElementById('resetBtn').addEventListener('click', async () => {
  await chrome.storage.sync.clear();
  location.reload();
});

async function startWebcam() {
  try {
    // Check if getUserMedia is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showCameraNotSupportedMessage();
      return;
    }
    
    // Request camera access - this will trigger the browser's permission prompt
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      } 
    });
    
    console.log('Camera access granted');
    
    const video = document.getElementById('webcam');
    if (!video) {
      throw new Error('Video element not found');
    }
    
    video.srcObject = stream;
    document.getElementById('emotionDisplay').classList.remove('hidden');
    document.getElementById('cameraNotice').style.display = 'none';
    
    // Start emotion detection after video is ready
    video.onloadedmetadata = () => {
      video.play().then(() => {
        emotionInterval = setInterval(() => detectEmotion(), 1000);
      }).catch(err => {
        console.warn('Video playback error:', err.message);
        handleCameraError(err);
      });
    };
    
    // Also handle if metadata is already loaded
    if (video.readyState >= 2) {
      video.play().then(() => {
        emotionInterval = setInterval(() => detectEmotion(), 1000);
      }).catch(err => {
        console.warn('Video playback error:', err.message);
        handleCameraError(err);
      });
    }
    
  } catch (err) {
    // Handle camera errors silently in console, show user-friendly message
    handleCameraError(err);
  }
}

function showCameraNotSupportedMessage() {
  const message = 'Camera access is not supported in extension popups.\n\nPlease enable "Keyboard Mode" instead, which detects emotions from your browsing behavior without requiring camera access.';
  alert(message);
  document.getElementById('emotionToggle').checked = false;
  chrome.storage.sync.set({ emotionEnabled: false });
  document.getElementById('cameraNotice').style.display = 'none';
}

async function handleCameraError(err) {
  let errorMessage = '';
  
  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
    errorMessage = 'Camera permission was denied or dismissed.\n\nPlease enable "Keyboard Mode" instead, which detects emotions from your browsing behavior without requiring camera access.';
  } else if (err.name === 'NotFoundError') {
    errorMessage = 'No camera found on your device.\n\nPlease enable "Keyboard Mode" to use emotion detection without a camera.';
  } else if (err.name === 'NotReadableError') {
    errorMessage = 'Camera is already in use by another application.\n\nPlease close other apps using the camera, or enable "Keyboard Mode" instead.';
  } else if (err.name === 'NotSupportedError') {
    errorMessage = 'Camera access is not supported in this context.\n\nPlease enable "Keyboard Mode" instead.';
  } else {
    // Generic error - likely security restriction in extension popup
    errorMessage = 'Camera access is not available in extension popups.\n\nPlease enable "Keyboard Mode" instead, which detects emotions from your browsing behavior without requiring camera access.';
  }
  
  alert(errorMessage);
  
  // Disable emotion detection if camera fails
  document.getElementById('emotionToggle').checked = false;
  await chrome.storage.sync.set({ emotionEnabled: false });
  document.getElementById('cameraNotice').style.display = 'none';
}



function stopWebcam() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  if (emotionInterval) {
    clearInterval(emotionInterval);
    emotionInterval = null;
  }
  document.getElementById('emotionDisplay').classList.add('hidden');
}

function detectEmotion() {
  const video = document.getElementById('webcam');
  const canvas = document.getElementById('emotionCanvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  
  // Simulate emotion detection (in production, use TensorFlow.js or face-api.js)
  const emotions = ['Happy', 'Sad', 'Angry', 'Surprised', 'Neutral', 'Anxious', 'Fearful', 'Disgusted'];
  const emotionIcons = ['😊', '😢', '😠', '😲', '😐', '😰', '😨', '🤢'];
  const randomIndex = Math.floor(Math.random() * emotions.length);
  const confidence = Math.floor(Math.random() * 30) + 70;
  
  document.querySelector('.emotion-icon').textContent = emotionIcons[randomIndex];
  document.querySelector('.emotion-text').textContent = emotions[randomIndex];
  document.querySelector('.emotion-confidence').textContent = `Confidence: ${confidence}%`;
  
  // Store current emotion
  chrome.storage.local.set({ 
    currentEmotion: emotions[randomIndex],
    emotionConfidence: confidence
  });
}

function updateEmotionStatus() {
  const enabled = document.getElementById('emotionToggle').checked;
  const keyboardMode = document.getElementById('keyboardMode').checked;
  const status = document.getElementById('emotionStatus');
  
  if (enabled) {
    status.textContent = keyboardMode ? 'Keyboard Mode' : 'Webcam Active';
    status.style.color = '#4caf50';
  } else {
    status.textContent = 'Disabled';
    status.style.color = '#999';
  }
}

function notifyContentScript() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'settingsUpdated' });
    }
  });
}

// Cleanup on close
window.addEventListener('beforeunload', () => {
  stopWebcam();
});
