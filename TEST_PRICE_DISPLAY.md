# Testing Price Display Fix

## Changes Made

### 1. Enhanced API Response Handling (`utils/comparison.js`)
- Added support for multiple API response field names (price, price_value, amount, current_price)
- Better merchant name extraction (merchant, store, retailer, seller)
- Improved URL extraction (url, link, product_url)
- More robust site matching logic
- Extensive console logging for debugging

### 2. Improved UI Rendering (`content/content.js`)
- Added type checking for price display
- Better handling of numeric vs string prices
- Added console logging for rendered products
- More robust savings calculation

### 3. Better Error Handling
- Logs all API responses
- Handles missing or malformed data gracefully
- Falls back to search links if API data is incomplete

## How to Test

### Step 1: Reload Extension
1. Go to `chrome://extensions/`
2. Find "Emotion-Adaptive Shopping Assistant"
3. Click the reload button (circular arrow icon)

### Step 2: Open Browser Console
1. Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Go to the "Console" tab
3. Keep it open to see debug logs

### Step 3: Visit a Product Page
1. Go to Amazon India: https://www.amazon.in/
2. Search for any product (e.g., "iPhone 17 Pro Max")
3. Click on a product to view its details page

### Step 4: Check the Console Logs
Look for these log messages:
```
PricesAPI: Searching for: [product name]
PricesAPI: Search response: [data]
PricesAPI: Found product ID: [id]
PricesAPI: Offers data: [offers]
Processing offer: [offer details]
Extracted - Merchant: [name] Price: [price] URL: [url]
Added product: [site name] [price]
PricesAPI: Total processed products: [count]
Price comparison data received: [data]
Rendering product: [product details]
```

### Step 5: Check the UI
The price comparison widget should now show:
- ✅ Current site with price (e.g., "Amazon India ₹1,49,900")
- ✅ Other sites with real prices (if available from API)
- ✅ "Save ₹X" badges for cheaper options
- ✅ Green highlighting for products with prices
- ✅ "✅ Real-time prices powered by PricesAPI.io" message

## What to Look For

### Success Indicators
- Console shows "PricesAPI: Total processed products: X" where X > 0
- Prices are displayed in the UI (₹XX,XXX format)
- "has-price" class is added to items with prices
- Green price text is visible

### If Prices Still Don't Show
Check console for:
1. **API Error**: "PricesAPI: Request failed: [status]"
   - Solution: Check API key and rate limits
   
2. **No Products Found**: "PricesAPI: No products found in search response"
   - Solution: Try a different product or check API response format
   
3. **No Offers**: "PricesAPI: No offers found in response"
   - Solution: API might not have data for this product
   
4. **Price Extraction Failed**: "Extracted - Merchant: X Price: null"
   - Solution: API response format might be different

## Debugging Commands

Run these in the browser console while on a product page:

```javascript
// Check if PriceComparison class is loaded
typeof PriceComparison

// Manually test price extraction
const pc = new PriceComparison();
const productName = document.querySelector('#productTitle')?.textContent.trim();
const currentPrice = parseFloat(document.querySelector('.a-price-whole')?.textContent.replace(/[^0-9]/g, ''));
console.log('Product:', productName, 'Price:', currentPrice);

// Test API call manually
pc.comparePrice(productName, currentPrice, window.location.hostname).then(data => {
  console.log('Comparison result:', data);
});
```

## Expected API Response Format

The code now handles these formats:

### Format 1: Standard
```json
{
  "products": [{
    "id": "12345",
    "offers": [{
      "merchant": "Amazon",
      "price": 149900,
      "url": "https://amazon.in/...",
      "currency": "INR"
    }]
  }]
}
```

### Format 2: Alternative
```json
{
  "data": [{
    "product_id": "12345",
    "results": [{
      "store": "Flipkart",
      "price_value": 149900,
      "link": "https://flipkart.com/...",
      "currency": "₹"
    }]
  }]
}
```

## Next Steps

If prices still don't show after these changes:
1. Share the console logs (especially the "PricesAPI: Offers data:" log)
2. Check the actual API response format at https://pricesapi.io/docs
3. We may need to adjust the field names based on actual API response

## API Usage Note

Each product page view uses 1-2 API calls:
1. Search call: `/search?q=product_name`
2. Offers call: `/products/{id}/offers`

With 1000 calls/month, you can view ~500 products.
