# Safari Extension Setup Guide

This guide explains how to build and run the CV-Express browser extension on Safari.

## Prerequisites

- macOS 10.14 (Mojave) or later
- Safari 14 or later
- Xcode 12 or later (free download from Mac App Store)
- Node.js 16+ and npm

## Quick Start

### 1. Build the Extension

```bash
# From the extension directory
cd CV-Express/extension

# Run the Safari build script
./build-safari.sh
```

Or manually:

```bash
npm install
npm run build:safari
```

This will create a `dist-safari` folder with the Safari-compatible extension.

### 2. Convert to Safari Web Extension

Safari requires extensions to be converted to a native format using Xcode's command-line tool:

```bash
xcrun safari-web-extension-converter dist-safari \
  --app-name "CV-Express" \
  --bundle-identifier "com.cvexpress.extension" \
  --macos-only
```

**What this does:**
- Creates an Xcode project for Safari
- Wraps your web extension in a native macOS app
- Generates necessary Swift/Objective-C wrapper code

### 3. Open in Xcode

```bash
open CV-Express/CV-Express.xcodeproj
```

### 4. Configure Signing (Optional for Development)

If you see signing errors in Xcode:

1. Select the project in the navigator (top item)
2. Select the "CV-Express" target
3. Go to "Signing & Capabilities" tab
4. Check "Automatically manage signing"
5. Select your Apple ID team (or create a free Apple ID)

### 5. Build and Run

1. In Xcode, press `Cmd+R` or click the Play button
2. This will:
   - Build the extension
   - Launch Safari with the extension loaded
   - Open Safari's Extensions preferences

### 6. Enable the Extension

In the Extensions preferences window that opens:

1. Find "CV-Express Job Application Assistant"
2. Check the box to enable it
3. Grant any requested permissions
4. Click "Always Allow" for the websites you want to use it on

## Development Workflow

### Making Changes

1. Edit your source files in the `extension` directory
2. Rebuild for Safari:
   ```bash
   npm run build:safari
   ```
3. In Xcode, stop the app (Cmd+.) and run again (Cmd+R)
4. Safari will reload with your changes

### Watch Mode (Recommended)

Open two terminal windows:

**Terminal 1** - Watch and rebuild on changes:
```bash
npm run dev:safari
```

**Terminal 2** or Xcode - Run the extension:
```bash
# In Xcode, press Cmd+R
```

Whenever you make changes, the extension will rebuild automatically. Just restart in Xcode to see the changes.

## Differences from Chrome

The extension is now cross-browser compatible, but there are some Safari-specific considerations:

### API Compatibility

- ✅ **storage API**: Fully compatible
- ✅ **tabs API**: Fully compatible
- ✅ **runtime messaging**: Fully compatible
- ⚠️ **contextMenus**: Limited support (wrapped in try-catch)
- ⚠️ **scripting API**: Some limitations in Safari 14-15

### Manifest V3

Safari 14+ supports Manifest V3, which the extension uses. Key features:

- Service workers instead of background pages
- Declarative permissions
- Modern Promise-based APIs (via webextension-polyfill)

### Browser API vs Chrome API

The extension now uses the `browser` namespace (via `webextension-polyfill`) instead of `chrome`, making it compatible with both browsers.

## Testing on Different Safari Versions

### Safari 14-15 (older)
- Basic extension functionality works
- Some newer Manifest V3 features may be limited

### Safari 16+ (recommended)
- Full Manifest V3 support
- Better service worker support
- Improved performance

## Distribution

### For App Store Distribution

To distribute on the Mac App Store:

1. Complete the Xcode project setup
2. Add proper app icons and metadata
3. Create a distribution provisioning profile
4. Archive and submit to App Store Connect

See [Apple's Safari Web Extensions documentation](https://developer.apple.com/documentation/safariservices/safari_web_extensions) for details.

### For Private Distribution

You can:
1. Export the built app from Xcode
2. Notarize it with Apple
3. Distribute the .app file directly

## Troubleshooting

### Xcode Conversion Errors

If you see errors like "A required plugin failed to load" or "xcodebuild -runFirstLaunch":

**Solution 1: Initialize Xcode**
```bash
sudo xcodebuild -runFirstLaunch
```
Enter your Mac password when prompted. This initializes Xcode and fixes plugin errors.

**Solution 2: Open Xcode First**
```bash
open /Applications/Xcode.app
```
Let Xcode complete its first-time setup, accept any agreements, then try the conversion again.

**Solution 3: Install/Update Command Line Tools**
```bash
xcode-select --install
```

**Solution 4: Reset Xcode Path**
```bash
sudo xcode-select --reset
sudo xcode-select --switch /Applications/Xcode.app
```

**Solution 5: Reinstall Xcode**
If all else fails, reinstall Xcode from the Mac App Store.

### Extension not appearing in Safari

1. **Check Safari version**: Requires Safari 14+
   ```bash
   /Applications/Safari.app/Contents/MacOS/Safari --version
   ```

2. **Enable Developer menu**: Safari → Preferences → Advanced → Show Develop menu
3. **Check for errors**: Develop → Show Extension Builder

### "Unsigned" or signing errors

For development:
- You can use a free Apple ID
- Xcode will handle code signing automatically
- No paid developer account needed for local testing

### Extension loads but doesn't work

1. Check the Console in Safari's Developer Tools (Develop → Show JavaScript Console)
2. Look for errors in the Extension Builder (Develop → Show Extension Builder)
3. Verify permissions are granted

### Build errors

```bash
# Clean and rebuild
rm -rf dist-safari node_modules
npm install
npm run build:safari
```

## File Structure

After conversion, your project structure will be:

```
CV-Express/
├── CV-Express Extension/
│   └── Resources/
│       └── [Your extension files from dist-safari]
├── CV-Express.xcodeproj
└── CV-Express/
    └── [Native macOS app wrapper]
```

## Resources

- [Apple Safari Web Extensions](https://developer.apple.com/documentation/safariservices/safari_web_extensions)
- [Converting a Web Extension](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)
- [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [webextension-polyfill](https://github.com/mozilla/webextension-polyfill)

## Support

For issues specific to Safari:
- Check Safari's Extension Builder console
- Review Safari Web Extensions documentation
- Test in latest Safari version

For extension functionality issues:
- Check the main extension documentation
- Test in Chrome to isolate Safari-specific issues

