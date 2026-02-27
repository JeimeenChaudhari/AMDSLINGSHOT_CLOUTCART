// Training Scheduler
// Runs in background service worker to schedule periodic model retraining

// Schedule periodic training checks
chrome.alarms.create('emotionModelTraining', { 
  periodInMinutes: 10 // Check every 10 minutes
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'emotionModelTraining') {
    checkAndScheduleTraining();
  }
});

async function checkAndScheduleTraining() {
  try {
    // Get training stats
    const result = await chrome.storage.local.get(['trainingStats', 'lastTrainingCheck']);
    
    const now = Date.now();
    const lastCheck = result.lastTrainingCheck || 0;
    
    // Don't check too frequently
    if (now - lastCheck < 5 * 60 * 1000) { // 5 minutes
      return;
    }
    
    await chrome.storage.local.set({ lastTrainingCheck: now });
    
    // Check if we have enough new samples
    const stats = result.trainingStats;
    
    if (stats && stats.totalSamples > 0) {
      console.log('[TrainingScheduler] Training data available:', stats.totalSamples, 'samples');
      
      // Notify active tabs to retrain if needed
      const tabs = await chrome.tabs.query({ active: true });
      
      for (const tab of tabs) {
        if (tab.url && isShoppingSite(tab.url)) {
          try {
            await chrome.tabs.sendMessage(tab.id, { 
              action: 'scheduleTraining',
              stats: stats
            });
          } catch (error) {
            // Tab might not have content script loaded
            console.log('[TrainingScheduler] Could not notify tab:', tab.id);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('[TrainingScheduler] Error checking training:', error);
  }
}

function isShoppingSite(url) {
  const shoppingSites = [
    'amazon.com', 'amazon.in', 'flipkart.com', 'ebay.com', 'walmart.com',
    'target.com', 'meesho.com', 'snapdeal.com', 'myntra.com', 'ajio.com',
    'tatacliq.com', 'nykaa.com', 'croma.com', 'reliancedigital.in'
  ];
  
  return shoppingSites.some(site => url.includes(site));
}

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[TrainingScheduler] Initialized');
  checkAndScheduleTraining();
});

// Check when browser starts
chrome.runtime.onStartup.addListener(() => {
  console.log('[TrainingScheduler] Browser started, checking training');
  checkAndScheduleTraining();
});
