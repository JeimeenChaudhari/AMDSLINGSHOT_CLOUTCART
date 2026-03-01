# API Keys Setup Guide

## ⚠️ Important: Never Commit API Keys to Git!

This guide explains how to securely configure your API keys for the CloutCart extension.

## Quick Setup

### Option 1: Direct Configuration (For Development)

1. **Open the files and replace placeholders:**
   
   In `background/background.js`:
   ```javascript
   const apifyClient = new ApifyClient({
     token: 'YOUR_APIFY_API_KEY' // Replace with your actual key
   });
   ```
   
   In `agents/price-history-agent.js`:
   ```javascript
   this.apifyApiKey = 'YOUR_APIFY_API_KEY'; // Replace with your actual key
   ```

2. **⚠️ NEVER commit these changes to Git!**

### Option 2: Using Config File (Recommended)

1. **Copy the example config:**
   ```bash
   copy config.example.js config.js
   ```

2. **Edit `config.js` with your keys:**
   ```javascript
   const CONFIG = {
     apify: {
       token: 'REMOVEDYOUR_ACTUAL_KEY_HERE'
     },
     rapidapi: {
       key: 'your_rapidapi_key_here',
       host: 'real-time-product-search.p.rapidapi.com'
     }
   };
   ```

3. **The `config.js` file is gitignored** - safe to use!

## Getting API Keys

### Apify API Key

1. Go to [Apify Console](https://console.apify.com/)
2. Sign up or log in
3. Navigate to **Settings** → **Integrations**
4. Copy your API token
5. Paste it in the configuration

**Free Tier Limits:**
- 10 runs per 30 days
- 3 ASINs per run
- 1 year of historical data

### RapidAPI Key

1. Go to [RapidAPI](https://rapidapi.com/)
2. Sign up or log in
3. Subscribe to [Real-Time Product Search API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-product-search)
4. Copy your API key from the dashboard
5. Paste it in the configuration

## Security Best Practices

### ✅ DO:
- Use environment variables or config files
- Add config files to `.gitignore`
- Use different keys for development and production
- Rotate keys regularly
- Use Chrome storage API for production

### ❌ DON'T:
- Commit API keys to Git
- Share keys in public repositories
- Use production keys in development
- Hardcode keys in source files
- Share keys in screenshots or logs

## For Production Deployment

Use Chrome Storage API to store keys securely:

```javascript
// Store API key
chrome.storage.sync.set({ 
  apifyApiKey: 'your_key_here' 
});

// Retrieve API key
chrome.storage.sync.get(['apifyApiKey'], (result) => {
  const apiKey = result.apifyApiKey;
  // Use the key
});
```

## Troubleshooting

### "Push declined due to repository rule violations"

If you accidentally committed API keys:

1. **Remove keys from files:**
   ```bash
   # Replace with placeholders
   git add .
   git commit -m "Remove API keys"
   ```

2. **If keys are in history, use BFG Repo-Cleaner:**
   ```bash
   # Download BFG from https://rtyley.github.io/bfg-repo-cleaner/
   bfg --replace-text passwords.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

3. **Rotate the exposed keys immediately!**

### Extension Not Working

1. Check if API keys are configured
2. Verify keys are valid (test in API console)
3. Check browser console for errors
4. Ensure you haven't exceeded API limits

## Current Configuration Status

- ✅ API keys removed from repository
- ✅ `.gitignore` updated to exclude config files
- ✅ `config.example.js` template provided
- ✅ Placeholders added in source files

## Need Help?

- [Apify Documentation](https://docs.apify.com/)
- [RapidAPI Documentation](https://docs.rapidapi.com/)
- [Chrome Extension Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
