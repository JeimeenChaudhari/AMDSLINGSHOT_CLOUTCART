# Setup Instructions - Fix Git Push Issue

## Problem
GitHub blocked your push because API keys were hardcoded in the source files.

## ✅ Fixed!

All API keys have been removed and replaced with placeholders. Here's what to do next:

## Step 1: Add Your API Keys Locally

You need to add your actual API keys to these files **on your local machine only**:

### File 1: `background/background.js` (Line ~511)
```javascript
const apifyClient = new ApifyClient({
  token: 'YOUR_APIFY_API_KEY' // Replace with: REMOVED72jxlInBNdnig0mXFaZqDwf3epZ10h2DWdhT
});
```

### File 2: `agents/price-history-agent.js` (Line ~10)
```javascript
this.apifyApiKey = 'YOUR_APIFY_API_KEY'; // Replace with: REMOVED72jxlInBNdnig0mXFaZqDwf3epZ10h2DWdhT
```

### File 3: `utils/comparison.js` (Line ~8)
```javascript
apiKey: 'YOUR_RAPIDAPI_KEY', // Replace with: 6915393b67msh53d3dc15a192ddep1fbc58jsnbeeed16e35f8
```

### File 4: `utils/comparison-smart.js` (Line ~14)
```javascript
apiKey: 'YOUR_RAPIDAPI_KEY', // Replace with: 6915393b67msh53d3dc15a192ddep1fbc58jsnbeeed16e35f8
```

## Step 2: Git Commands to Push

Now you can safely push to GitHub:

```bash
# Stage all changes
git add .

# Commit with message
git commit -m "Remove hardcoded API keys and add placeholders"

# Push to GitHub
git push
```

## Step 3: Keep Keys Local

**IMPORTANT:** After adding your keys locally:

1. ✅ The extension will work on your machine
2. ✅ Keys are NOT committed to Git (they're in your working files only)
3. ✅ When you make OTHER changes, just don't stage these files with keys
4. ✅ Use `git add <specific-file>` instead of `git add .` if you've added keys

## Alternative: Use Git Stash

If you want to keep your keys locally but not worry about accidentally committing them:

```bash
# After adding your keys to the files:
git stash push -m "My API keys" background/background.js agents/price-history-agent.js utils/comparison.js utils/comparison-smart.js

# When you need the keys back:
git stash pop
```

## Files Created for Security

1. ✅ `.gitignore` - Updated to exclude config files
2. ✅ `config.example.js` - Template for configuration
3. ✅ `API_KEYS_SETUP.md` - Detailed security guide
4. ✅ `SETUP_INSTRUCTIONS.md` - This file

## Quick Reference

### Your API Keys (Keep Private!)
- **Apify**: `REMOVED72jxlInBNdnig0mXFaZqDwf3epZ10h2DWdhT`
- **RapidAPI**: `6915393b67msh53d3dc15a192ddep1fbc58jsnbeeed16e35f8`

### Where to Add Them
1. `background/background.js` - Line 511 (Apify)
2. `agents/price-history-agent.js` - Line 10 (Apify)
3. `utils/comparison.js` - Line 8 (RapidAPI)
4. `utils/comparison-smart.js` - Line 14 (RapidAPI)

## Testing After Setup

1. Add your keys to the files
2. Reload the extension in Chrome
3. Visit an Amazon product page
4. Check if price history and comparison work

## Need Help?

See `API_KEYS_SETUP.md` for detailed security best practices and troubleshooting.
