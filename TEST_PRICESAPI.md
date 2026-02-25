# Testing PricesAPI Integration

## Quick Test Steps

### 1. Reload Extension
1. Open Chrome and go to `chrome://extensions/`
2. Find "Emotion-Adaptive Shopping Assistant"
3. Click the reload button (circular arrow icon)

### 2. Test on Amazon India
1. Go to: https://www.amazon.in/
2. Search for any product (e.g., "iPhone 17 Pro" or "Samsung TV")
3. Click on a product to view its details page
4. Wait 2-3 seconds for the extension to load

### 3. What You Should See

#### Price Comparison Widget
Look for a green box below the product title with:
- **Header**: "🔍 Compare Prices"
- **Current Site Section**: Shows Amazon India with the current price
- **Available On Section**: Shows other retailers

#### With API Working (Best Case)
- Other retailers show with actual prices (e.g., "₹129,999")
- Green highlighting on products with prices
- "Save ₹X" badges showing savings
- Direct product links (not search pages)
- Success message: "✅ Real-time prices powered by PricesAPI.io"

#### Without API Data (Fallback)
- Other retailers show "Click to check price"
- Links go to search pages
- Info message: "ℹ️ Showing search links..."

### 4. Test on Flipkart
1. Go to: https://www.flipkart.com/
2. Search for a product
3. View product details
4. Should see similar price comparison widget

### 5. Click Testing
1. Click on any retailer in the comparison widget
2. Should open in new tab
3. If API has data: Goes directly to product page
4. If fallback: Goes to search results page

## Expected Behavior

### Electronics Products
Should show these retailers:
- Amazon India
- Flipkart
- Croma
- Reliance Digital
- Best Buy (if US)
- Walmart (if US)

### Fashion Products
Should show these retailers:
- Amazon India
- Flipkart
- Myntra
- Walmart (if US)

### General Products
Should show these retailers:
- Amazon India
- Flipkart
- Walmart
- eBay
- Snapdeal

## Checking API Status

### Browser Console
1. Right-click on page → Inspect
2. Go to Console tab
3. Look for messages:
   - ✅ Good: No errors
   - ⚠️ Warning: "API search failed, falling back to search URLs"
   - ❌ Error: Check error message for details

### Network Tab
1. Open DevTools → Network tab
2. Filter by "pricesapi"
3. Should see requests to `api.pricesapi.io`
4. Check response status:
   - 200: Success
   - 429: Rate limit exceeded
   - 401: Invalid API key
   - 500: Server error

## Common Issues & Solutions

### Issue 1: Widget Not Showing
**Possible Causes:**
- Extension not loaded
- Not on a product page
- Product name extraction failed

**Solution:**
- Reload extension
- Make sure you're on a product details page (not search results)
- Check console for errors

### Issue 2: "Unable to load comparison sites"
**Possible Causes:**
- JavaScript error
- comparison.js not loaded

**Solution:**
- Check manifest.json has comparison.js in content_scripts
- Reload extension
- Check console for errors

### Issue 3: No Prices Showing (Only Search Links)
**Possible Causes:**
- API doesn't have data for this product
- API rate limit exceeded
- Network error

**Solution:**
- This is normal fallback behavior
- Try a different product (popular items more likely to have data)
- Check API usage at pricesapi.io dashboard
- Wait 1 minute if rate limited

### Issue 4: Wrong Prices
**Possible Causes:**
- API data might be cached/outdated
- Currency conversion issues

**Solution:**
- PricesAPI updates hourly
- Prices should be reasonably accurate
- Report to PricesAPI if consistently wrong

## API Call Verification

### Manual API Test
Test the API directly in browser console:

```javascript
fetch('https://api.pricesapi.io/api/v1/search?q=iPhone&api_key=pricesapi_njBc2fq9ye8Ia7LR1vebV38Q3URPWFEt')
  .then(r => r.json())
  .then(d => console.log(d));
```

Expected response:
```json
{
  "products": [
    {
      "id": "...",
      "name": "iPhone ...",
      ...
    }
  ]
}
```

## Performance Testing

### Load Time
- Widget should appear within 2-3 seconds
- API calls should complete within 1-2 seconds
- Fallback should be instant if API fails

### API Calls
- Should make 1-2 API calls per product view:
  1. Search for product
  2. Fetch offers (if product found)

### Rate Limits
- Free plan: 10 requests/minute
- Test by viewing 5 products quickly
- Should not hit limit in normal usage

## Success Criteria

✅ Widget appears on product pages
✅ Current site shows with price
✅ Other retailers are listed
✅ Prices show when available (API working)
✅ Search links work (fallback)
✅ Savings badges appear when applicable
✅ Links open in new tabs
✅ No console errors
✅ API success message shows when API used

## Test Products

### Good Test Products (Likely to have API data)
- iPhone 17 Pro
- Samsung Galaxy S24
- Sony WH-1000XM5 Headphones
- Apple MacBook Air
- Samsung 55" TV

### Products to Avoid for Testing
- Very new products (just released)
- Niche/obscure items
- Local/regional products
- Custom/handmade items

## Reporting Issues

If you find issues, note:
1. Product URL
2. Console errors (screenshot)
3. Network tab (screenshot of API calls)
4. Expected vs actual behavior
5. Browser version

## Next Steps After Testing

If everything works:
1. ✅ Test on multiple products
2. ✅ Test on different websites (Amazon, Flipkart)
3. ✅ Monitor API usage
4. ✅ Consider adding caching to reduce API calls
5. ✅ Add more retailers if needed

If issues found:
1. Check console for errors
2. Verify API key is valid
3. Test API directly (manual test above)
4. Check network connectivity
5. Review code changes
