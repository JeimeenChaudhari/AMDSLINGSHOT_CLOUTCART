// Popup controller - Camera access moved to dedicated page

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
  'productsAnalyzed',
  'cameraPermissionGranted'
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
  
  // Show camera notice if emotion is enabled but not in keyboard mode
  if (data.emotionEnabled && !data.keyboardMode && !data.cameraPermissionGranted) {
    document.getElementById('cameraNotice').style.display = 'block';
  }
  
  updateEmotionStatus();
});

// Emotion toggle
document.getElementById('emotionToggle').addEventListener('change', async (e) => {
  const enabled = e.target.checked;
  
  if (enabled) {
    const keyboardMode = document.getElementById('keyboardMode').checked;
    if (!keyboardMode) {
      // Show camera notice with button to open permission page
      document.getElementById('cameraNotice').style.display = 'block';
    } else {
      await chrome.storage.sync.set({ emotionEnabled: enabled });
      updateEmotionStatus();
    }
  } else {
    document.getElementById('cameraNotice').style.display = 'none';
    await chrome.storage.sync.set({ emotionEnabled: false });
    updateEmotionStatus();
  }
  
  notifyContentScript();
});

// Camera request button
document.getElementById('requestCameraBtn').addEventListener('click', async () => {
  console.log('Camera button clicked');
  
  // Enable emotion detection and camera mode
  await chrome.storage.sync.set({ 
    emotionEnabled: true,
    keyboardMode: false 
  });
  
  // Notify content script to show camera section
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'showCamera' 
      });
    }
  });
  
  // Update UI
  document.getElementById('emotionToggle').checked = true;
  document.getElementById('keyboardMode').checked = false;
  document.getElementById('cameraNotice').style.display = 'none';
  updateEmotionStatus();
  
  // Show success message
  const notice = document.getElementById('cameraNotice');
  notice.style.display = 'block';
  notice.style.background = '#e8f5e9';
  notice.style.color = '#388e3c';
  notice.innerHTML = '<p style="margin: 0;">✅ Camera mode enabled! Check the shopping page for the camera panel.</p>';
  
  setTimeout(() => {
    notice.style.display = 'none';
  }, 3000);
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
    document.getElementById('cameraNotice').style.display = 'none';
    if (document.getElementById('emotionToggle').checked) {
      await chrome.storage.sync.set({ emotionEnabled: true });
    }
    
    // Show training stats
    document.getElementById('trainingStats').style.display = 'block';
    updateTrainingStats();
  } else {
    document.getElementById('trainingStats').style.display = 'none';
    if (document.getElementById('emotionToggle').checked) {
      document.getElementById('cameraNotice').style.display = 'block';
    }
  }
  
  updateEmotionStatus();
  notifyContentScript();
});

// Update training stats
async function updateTrainingStats() {
  try {
    const result = await chrome.storage.local.get(['trainingStats']);
    
    if (result.trainingStats) {
      const stats = result.trainingStats;
      document.getElementById('trainingSamples').textContent = stats.totalSamples || 0;
      document.getElementById('modelAccuracy').textContent = stats.avgConfidence || 0;
      document.getElementById('trainingCount').textContent = stats.lastTrainingSampleCount || 0;
    }
  } catch (error) {
    console.error('Error loading training stats:', error);
  }
}

// Update stats periodically when keyboard mode is active
setInterval(() => {
  if (document.getElementById('keyboardMode').checked) {
    updateTrainingStats();
  }
}, 5000);

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

function updateEmotionStatus() {
  const enabled = document.getElementById('emotionToggle').checked;
  const keyboardMode = document.getElementById('keyboardMode').checked;
  const status = document.getElementById('emotionStatus');
  
  if (enabled) {
    status.textContent = keyboardMode ? 'Keyboard Mode' : 'Camera Mode';
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
