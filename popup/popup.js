// Popup controller - Enhanced UI with improved UX

// Load saved settings
chrome.storage.sync.get([
  'extensionEnabled',
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
  // Set extension toggle state (default to true if not set)
  const extensionEnabled = data.extensionEnabled !== false;
  document.getElementById('extensionToggle').checked = extensionEnabled;
  document.getElementById('toggleStatus').textContent = extensionEnabled ? 'ON' : 'OFF';
  
  // Update UI based on extension state
  updateExtensionUI(extensionEnabled);
  
  document.getElementById('keyboardMode').checked = data.keyboardMode || false;
  document.getElementById('focusModeToggle').checked = data.focusMode !== false;
  document.getElementById('priceHistoryToggle').checked = data.priceHistory !== false;
  document.getElementById('comparisonToggle').checked = data.comparison !== false;
  document.getElementById('recommendationToggle').checked = data.recommendation !== false;
  document.getElementById('reviewCheckerToggle').checked = data.reviewChecker !== false;
  
  // Update stats
  document.getElementById('moneySaved').textContent = `₹${data.moneySaved || 0}`;
  document.getElementById('productsAnalyzed').textContent = data.productsAnalyzed || 0;
  
  // Check if camera permission was previously granted
  if (data.cameraPermissionGranted && !data.keyboardMode) {
    // Show camera enabled state
    const notice = document.getElementById('cameraNotice');
    notice.innerHTML = `
      <div class="notice-icon">✅</div>
      <div class="notice-content">
        <h3>Camera Access Granted</h3>
        <p>Emotion detection is active. Visit any shopping site to see it in action!</p>
        <p class="notice-subtext" style="margin-top: 8px; font-size: 12px; opacity: 0.8;">Camera will automatically activate on product pages.</p>
      </div>
    `;
    
    const card = document.getElementById('emotionCard');
    card.style.background = 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
    card.style.borderColor = '#81c784';
  }
  
  // Show training stats if keyboard mode is enabled
  if (data.keyboardMode) {
    document.getElementById('trainingStats').classList.add('active');
    updateTrainingStats();
  }
});

// Extension toggle handler
document.getElementById('extensionToggle').addEventListener('change', async (e) => {
  const extensionEnabled = e.target.checked;
  
  // Update status text
  document.getElementById('toggleStatus').textContent = extensionEnabled ? 'ON' : 'OFF';
  
  // Save state
  await chrome.storage.sync.set({ extensionEnabled });
  
  // Update UI
  updateExtensionUI(extensionEnabled);
  
  // Notify all tabs about the change
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { 
        action: 'extensionToggled',
        enabled: extensionEnabled 
      }).catch(() => {
        // Ignore errors for tabs without content script
      });
    });
  });
  
  // Show feedback
  showToggleFeedback(extensionEnabled);
});

// Update UI based on extension state
function updateExtensionUI(enabled) {
  const container = document.querySelector('.container');
  const sections = document.querySelectorAll('.emotion-section, .features-section, .stats-section');
  
  if (enabled) {
    container.style.opacity = '1';
    sections.forEach(section => {
      section.style.pointerEvents = 'auto';
      section.style.opacity = '1';
    });
  } else {
    sections.forEach(section => {
      section.style.pointerEvents = 'none';
      section.style.opacity = '0.5';
    });
  }
}

// Show toggle feedback
function showToggleFeedback(enabled) {
  const toggleLabel = document.querySelector('.toggle-label');
  const originalHTML = toggleLabel.innerHTML;
  
  toggleLabel.innerHTML = `
    <span class="toggle-status" style="font-size: 14px;">
      ${enabled ? '✓ Activated' : '✗ Deactivated'}
    </span>
  `;
  
  setTimeout(() => {
    toggleLabel.innerHTML = originalHTML;
    document.getElementById('toggleStatus').textContent = enabled ? 'ON' : 'OFF';
  }, 1500);
}

// Camera request button
document.getElementById('requestCameraBtn').addEventListener('click', async () => {
  console.log('Camera button clicked');
  
  // Enable emotion detection and camera mode
  await chrome.storage.sync.set({ 
    emotionEnabled: true,
    keyboardMode: false 
  });
  
  // Small delay to ensure storage propagates
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Notify content script to show camera section
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'showCamera' 
      }, (response) => {
        // Handle any errors
        if (chrome.runtime.lastError) {
          console.log('Content script not ready:', chrome.runtime.lastError.message);
        }
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
    emotionEnabled: keyboardMode,
    cameraPermissionGranted: keyboardMode ? false : undefined // Clear camera permission when switching to keyboard mode
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
    
    // Check if camera permission was previously granted
    chrome.storage.sync.get(['cameraPermissionGranted'], (data) => {
      const notice = document.getElementById('cameraNotice');
      
      if (data.cameraPermissionGranted) {
        // Show camera enabled state
        notice.innerHTML = `
          <div class="notice-icon">✅</div>
          <div class="notice-content">
            <h3>Camera Access Granted</h3>
            <p>Emotion detection is active. Visit any shopping site to see it in action!</p>
            <p class="notice-subtext" style="margin-top: 8px; font-size: 12px; opacity: 0.8;">Camera will automatically activate on product pages.</p>
          </div>
        `;
        
        const card = document.getElementById('emotionCard');
        card.style.background = 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)';
        card.style.borderColor = '#81c784';
      } else {
        // Reset to default camera notice
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
          
          // Small delay to ensure storage propagates
          await new Promise(resolve => setTimeout(resolve, 100));
          
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, { action: 'showCamera' }, (response) => {
                if (chrome.runtime.lastError) {
                  console.log('Content script not ready:', chrome.runtime.lastError.message);
                }
              });
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
    });
  }
  
  // Only reload page if switching TO keyboard mode, not away from it
  if (keyboardMode) {
    notifyContentScript();
  } else {
    // For camera mode, just update the content script without reloading
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: 'updateSettings',
          settings: { keyboardMode: false, emotionEnabled: false }
        });
      }
    });
  }
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
