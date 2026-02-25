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
  await chrome.storage.sync.set({ emotionEnabled: enabled });
  
  if (enabled) {
    const keyboardMode = document.getElementById('keyboardMode').checked;
    if (!keyboardMode) {
      startWebcam();
    }
  } else {
    stopWebcam();
  }
  updateEmotionStatus();
  notifyContentScript();
});

// Keyboard mode toggle
document.getElementById('keyboardMode').addEventListener('change', async (e) => {
  const keyboardMode = e.target.checked;
  await chrome.storage.sync.set({ keyboardMode });
  
  if (keyboardMode) {
    stopWebcam();
  } else if (document.getElementById('emotionToggle').checked) {
    startWebcam();
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
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById('webcam');
    video.srcObject = stream;
    document.getElementById('emotionDisplay').classList.remove('hidden');
    
    // Start emotion detection
    emotionInterval = setInterval(() => detectEmotion(), 1000);
  } catch (err) {
    console.error('Webcam access denied:', err);
    alert('Please allow webcam access for emotion detection');
  }
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
