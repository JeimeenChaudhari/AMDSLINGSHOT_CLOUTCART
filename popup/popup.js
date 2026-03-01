// Popup controller - Enhanced UI with improved UX

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
  document.getElementById('keyboardMode').checked = data.keyboardMode || false;
  document.getElementById('focusModeToggle').checked = data.focusMode !== false;
  document.getElementById('priceHistoryToggle').checked = data.priceHistory !== false;
  document.getElementById('comparisonToggle').checked = data.comparison !== false;
  document.getElementById('recommendationToggle').checked = data.recommendation !== false;
  document.getElementById('reviewCheckerToggle').checked = data.reviewChecker !== false;
  
  // Update stats
  document.getElementById('moneySaved').textContent = `₹${data.moneySaved || 0}`;
  document.getElementById('productsAnalyzed').textContent = data.productsAnalyzed || 0;
  
  // Show training stats if keyboard mode is enabled
  if (data.keyboardMode) {
    document.getElementById('trainingStats').classList.add('active');
    updateTrainingStats();
  }
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
  document.getElementById('keyboardMode').checked = false;
  document.getElementById('trainingStats').classList.remove('active');
  
  // Show success message
  const notice = document.getElementById('cameraNotice');
  notice.innerHTML = `
    <div class="notice-icon">✅</div>
    <div class="notice-content">
      <h3>Camera Mode Enabled!</h3>
      <p>Check the shopping page for the camera panel. Your browser will request camera permission.</p>
    </div>
  `;
  
  const card = document.getElementById('emotionCard');
  card.style.background = 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
  card.style.borderColor = '#81c784';
  
  setTimeout(() => {
    location.reload();
  }, 2500);
});

// Keyboard mode toggle
document.getElementById('keyboardMode').addEventListener('change', async (e) => {
  const keyboardMode = e.target.checked;
  await chrome.storage.sync.set({ 
    keyboardMode,
    emotionEnabled: keyboardMode 
  });
  
  if (keyboardMode) {
    // Show training stats
    document.getElementById('trainingStats').classList.add('active');
    updateTrainingStats();
    
    // Update camera notice
    const notice = document.getElementById('cameraNotice');
    notice.innerHTML = `
      <div class="notice-icon">⌨️</div>
      <div class="notice-content">
        <h3>Keyboard Mode Active</h3>
        <p>Emotion detection is now analyzing your browsing behavior without camera access.</p>
      </div>
    `;
    
    const card = document.getElementById('emotionCard');
    card.style.background = 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)';
    card.style.borderColor = '#64b5f6';
  } else {
    document.getElementById('trainingStats').classList.remove('active');
    
    // Reset to default camera notice
    const notice = document.getElementById('cameraNotice');
    notice.innerHTML = `
      <div class="notice-icon">📷</div>
      <div class="notice-content">
        <h3>Camera Access Required</h3>
        <p>When you visit a shopping site, your browser will ask for camera permission. Click "Allow" to enable emotion detection.</p>
        <p class="notice-subtext">Or click below to grant permission now:</p>
        <button id="requestCameraBtn" class="btn-primary">
          <span>🎥</span> Enable Camera Now
        </button>
      </div>
    `;
    
    const card = document.getElementById('emotionCard');
    card.style.background = 'linear-gradient(135deg, #fff9e6 0%, #ffe8cc 100%)';
    card.style.borderColor = '#ffd699';
    
    // Re-attach event listener
    document.getElementById('requestCameraBtn').addEventListener('click', async () => {
      await chrome.storage.sync.set({ 
        emotionEnabled: true,
        keyboardMode: false 
      });
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'showCamera' });
        }
      });
      
      document.getElementById('keyboardMode').checked = false;
      document.getElementById('trainingStats').classList.remove('active');
      
      const notice = document.getElementById('cameraNotice');
      notice.innerHTML = `
        <div class="notice-icon">✅</div>
        <div class="notice-content">
          <h3>Camera Mode Enabled!</h3>
          <p>Check the shopping page for the camera panel.</p>
        </div>
      `;
      
      const card = document.getElementById('emotionCard');
      card.style.background = 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
      card.style.borderColor = '#81c784';
      
      setTimeout(() => location.reload(), 2500);
    });
  }
  
  notifyContentScript();
});

// Update training stats
async function updateTrainingStats() {
  try {
    const result = await chrome.storage.local.get(['trainingStats']);
    
    if (result.trainingStats) {
      const stats = result.trainingStats;
      document.getElementById('trainingSamples').textContent = stats.totalSamples || 0;
      document.getElementById('modelAccuracy').textContent = (stats.avgConfidence || 0) + '%';
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
  if (confirm('Are you sure you want to reset all settings?')) {
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
    location.reload();
  }
});

function notifyContentScript() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'settingsUpdated' });
    }
  });
}
