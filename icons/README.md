# Extension Icons

## Current Status
The `icon.svg` file contains the extension logo design.

## Converting SVG to PNG

### Option 1: Online Converter (Easiest)
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Convert to PNG
4. Download and create 3 sizes:
   - Resize to 16x16 → Save as `icon16.png`
   - Resize to 48x48 → Save as `icon48.png`
   - Resize to 128x128 → Save as `icon128.png`

### Option 2: Using Inkscape (Free Software)
1. Download Inkscape: https://inkscape.org/
2. Open `icon.svg`
3. File → Export PNG Image
4. Set width/height to 16, 48, and 128
5. Export each size

### Option 3: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# Then run:
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### Option 4: Using Node.js (If you have it)
```bash
npm install -g sharp-cli
sharp -i icon.svg -o icon16.png resize 16 16
sharp -i icon.svg -o icon48.png resize 48 48
sharp -i icon.svg -o icon128.png resize 128 128
```

## Design Elements

The icon includes:
- **Purple gradient background** (#667eea to #764ba2) - Brand colors
- **Shopping bag** - Represents shopping
- **Smiley face** - Represents emotion detection
- **Gold sparkle** - Represents AI intelligence

## Temporary Solution

If you need to test immediately without icons:
1. The extension will work with default Chrome icon
2. Or use any 128x128 PNG image temporarily
3. Just name it `icon128.png` and copy to `icon16.png` and `icon48.png`

## Custom Design

Want to create your own icon?
- Use Canva: https://www.canva.com
- Use Figma: https://www.figma.com
- Use any image editor
- Keep it simple and recognizable at small sizes
- Use brand colors: #667eea and #764ba2

## Icon Requirements

- **Format**: PNG (transparent background recommended)
- **Sizes**: 16x16, 48x48, 128x128 pixels
- **Color**: Full color (not grayscale)
- **Style**: Simple, recognizable at small sizes
- **File size**: <50KB each

---

**Once you have the PNG files, place them in this folder!**
