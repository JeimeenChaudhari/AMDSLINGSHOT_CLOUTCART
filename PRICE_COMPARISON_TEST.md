# Price Comparison Feature - Testing Guide

## Quick Test Steps

### 1. Load the Extension
1. Open Chrome/Edge browser
2. Go to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

### 2. Test on Amazon
1. Go to https://www.amazon.com/
2. Search for any product (e.g., "iPhone 15 Pro")
3. Click on a product
4. Wait for the extension to load
5. Look for the "🔍 Find This Product on Other Websites" section

### 3. Verify Features

#### ✅ Should See:
- Product name displayed (truncated if long)
- "Current Site" section showing Amazon with "You're Here" badge
- "🇺🇸 US Shopping Sites" section with 8 sites:
  - Walmart, eBay, Target, Best Buy, Newegg, AliExpress, Etsy
- "🇮🇳 Indian Shopping Sites" section with 12 sites:
  - Flipkart, Amazon India, Myntra, Ajio, Snapdeal, Meesho, Tata CLiQ, Nykaa, FirstCry, Pepperfry, Croma, Reliance Digital
- "🌍 International Sites" section with other Amazon regions
- Each site has an icon and "Search →" button
- Helpful tip at the bottom

#### ✅ Click Test:
1. Click on "Walmart" link
2. Should open Walmart.com in new tab
3. Should show search results for the product
4. URL should be: `https://www.walmart.com/search?q=PRODUCT_NAME`

#### ✅ Repeat for Other Sites:
- Click "Flipkart" → Opens Flipkart search
- Click "eBay" → Opens eBay search
- Click "Target" → Opens Target search
- All links should work and redirect to actual product searches

### 4. Test on Indian Sites

#### Test on Flipkart:
1. Go to https://www.flipkart.com/
2. Search for "Samsung Galaxy S24"
3. Click on a product
4. Verify comparison widget appears
5. "Current Site" should show Flipkart
6. Click on "Amazon India" to verify redirect

#### Test on Amazon India:
1. Go to https://www.amazon.in/
2. Search for any product
3. Verify all Indian sites are listed
4. Test clicking on Myntra, Ajio, etc.

### 5. Test on Other Sites

#### Walmart:
1. Go to https://www.walmart.com/
2. Find any product
3. Verify comparison widget shows
4. Current site should be Walmart

#### eBay:
1. Go to https://www.ebay.com/
2. Find any product
3. Verify comparison widget
4. Test redirects

### 6. Visual Verification

#### Layout Check:
- [ ] Widget has green border
- [ ] Sites are organized in grid layout
- [ ] Icons are visible (emojis)
- [ ] Hover effect works (border turns green, slight lift)
- [ ] Responsive on mobile (if testing on mobile)

#### Styling Check:
- [ ] Current site has teal background
- [ ] Other sites have white background
- [ ] "Search →" buttons are visible
- [ ] Section headers are clear
- [ ] Tip box at bottom is visible

### 7. Console Check

Open browser console (F12) and verify:
- No JavaScript errors
- Should see: "User clicked to compare on: [SITE_NAME]" when clicking links
- No 404 or network errors

### 8. Edge Cases

#### Test with Long Product Names:
1. Find product with very long name
2. Verify name is truncated with "..." in widget
3. Full name should still be in search URL

#### Test with Special Characters:
1. Find product with special characters (e.g., "Men's Watch")
2. Verify URL encoding works correctly
3. Search should work on target site

#### Test with No Product Name:
1. Go to homepage of shopping site
2. Extension should not show comparison widget
3. Check console for: "Could not extract product name for comparison"

### 9. Performance Check

- [ ] Widget loads within 1-2 seconds
- [ ] No lag when clicking links
- [ ] Page doesn't slow down
- [ ] Extension doesn't interfere with site functionality

### 10. Cross-Browser Testing

Test on:
- [ ] Chrome (latest version)
- [ ] Edge (latest version)
- [ ] Brave (if available)

## Expected Results

### ✅ Success Criteria:
1. Comparison widget appears on product pages
2. All 25+ sites are listed and organized by region
3. Each link opens correct search on target website
4. Product name is properly encoded in URLs
5. Current site is correctly identified
6. No JavaScript errors in console
7. Smooth user experience with hover effects
8. Mobile responsive (if testing on mobile)

### ❌ Known Limitations:
1. Prices are NOT automatically fetched (by design)
2. Users must manually check prices on each site
3. Some sites may have different product availability
4. Search results may vary by region/country

## Troubleshooting

### Widget Not Appearing:
- Check if product name can be extracted
- Open console and look for errors
- Verify extension is enabled
- Try refreshing the page

### Links Not Working:
- Check if URL is properly formed in console
- Verify site's search URL format hasn't changed
- Test with simple product name first

### Styling Issues:
- Clear browser cache
- Reload extension
- Check if content.css is loaded

## Next Steps for Real Price Fetching

To get actual prices automatically, see `PRICE_API_INTEGRATION.md` for:
- API provider options
- Implementation guide
- Cost estimates
- Code examples

## Report Issues

If you find any bugs:
1. Note the website URL
2. Note the product name
3. Copy console errors
4. Take screenshot of issue
5. Document steps to reproduce
