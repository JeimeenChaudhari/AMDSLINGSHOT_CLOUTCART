# Quick Start - PricesAPI Integration

## ⚡ 3-Step Testing

### 1️⃣ Reload Extension
```
chrome://extensions/ → Find your extension → Click reload ↻
```

### 2️⃣ Visit Product Page
```
Go to: https://www.amazon.in/
Search: "iPhone 17 Pro" or any product
Click on a product
```

### 3️⃣ Check Results
Look for green box below product title showing:
- ✅ Current site with price
- ✅ Other retailers with prices
- ✅ "Save ₹X" badges
- ✅ Success message at bottom

## 🎯 What You'll See

### With API Working (Best Case)
```
🔍 Compare Prices

📍 Current Site
🛒 Amazon India    ₹129,999    [You're Here]

🛒 Available On
🛍️ Flipkart       ₹127,999    Save ₹2,000    [View →]
📱 Croma          ₹131,999                   [View →]
🔌 Reliance       ₹128,999    Save ₹1,000    [View →]

✅ Real-time prices powered by PricesAPI.io
```

### Without API Data (Fallback)
```
🔍 Compare Prices

📍 Current Site
🛒 Amazon India    ₹129,999    [You're Here]

🛒 Check Prices On
🛍️ Flipkart       Click to check price    [Search →]
📱 Croma          Click to check price    [Search →]
🔌 Reliance       Click to check price    [Search →]

ℹ️ Showing search links...
```

## 🔍 Troubleshooting

### Widget Not Showing?
- Reload extension
- Make sure you're on product details page (not search results)
- Check console for errors (F12)

### No Prices?
- Normal! API might not have data for that product
- Try popular products (iPhone, Samsung, etc.)
- Search links still work as fallback

### "Unable to load comparison sites"?
- Check internet connection
- Reload extension
- Check console for specific error

## 📊 API Info

- **Service**: PricesAPI.io
- **Plan**: Free (1,000 calls/month)
- **Key**: Already configured ✅
- **Status**: Active and working

## 📚 Full Documentation

- `PRICESAPI_INTEGRATION.md` - Complete integration details
- `TEST_PRICESAPI.md` - Detailed testing guide
- `API_INTEGRATION_SUMMARY.md` - What was done

## ✅ Success Checklist

- [ ] Extension reloaded
- [ ] Visited product page
- [ ] Widget appears
- [ ] Prices showing (or search links)
- [ ] Links work when clicked
- [ ] No console errors

## 🎉 Done!

If you see the widget with prices or search links, the integration is working! The extension will automatically use API when available and fall back to search links when needed.

---

**Need Help?** Check `TEST_PRICESAPI.md` for detailed troubleshooting.
