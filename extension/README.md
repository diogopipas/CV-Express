# CV-Express Browser Extension

Auto-fill job applications with your CV-Express profile data across multiple browsers.

## 🌐 Browser Support

- ✅ **Chrome** (Version 88+)
- ✅ **Safari** (Version 14+, macOS only)
- 🔄 **Edge** (Chromium-based - same as Chrome)
- 🔄 **Firefox** (Coming soon)

## Features

- 🚀 **Auto-fill** job application forms with one click
- 🎯 **ATS Detection** - Automatically detects major Applicant Tracking Systems:
  - Workday
  - Greenhouse
  - Lever
  - iCIMS
  - Jobvite
  - Workable
  - SmartRecruiters
  - Breezy HR
- 💾 **Secure Storage** - Your data is stored locally and encrypted
- 📋 **Resume Management** - Automatically syncs with your CV-Express account
- 📊 **Application Tracking** - Records every application you submit
- 🔄 **Real-time Sync** - Always uses your latest resume and profile data

## Installation

### Chrome / Edge

1. **Build the extension:**
   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist` folder

3. **Grant permissions** when prompted

### Safari (macOS)

See [SAFARI_SETUP.md](./SAFARI_SETUP.md) for detailed Safari installation instructions.

**Quick start:**
```bash
./build-safari.sh
```

Then follow the on-screen instructions to convert and load in Safari.

## Development

### Prerequisites

- Node.js 16+
- npm or yarn
- For Safari: Xcode 12+

### Setup

```bash
# Install dependencies
npm install

# Build for Chrome/Edge
npm run build

# Build for Safari
npm run build:safari

# Build for all browsers
npm run build:all

# Development mode (auto-rebuild on changes)
npm run dev          # Chrome/Edge
npm run dev:safari   # Safari
```

### Project Structure

```
extension/
├── background/           # Background service worker
│   ├── service-worker.ts
│   └── api-client.ts
├── content/             # Content scripts
│   ├── content-script.ts
│   ├── form-detector.ts
│   ├── form-filler.ts
│   ├── ats-adapters/    # ATS-specific form adapters
│   └── content-styles.css
├── popup/               # Extension popup UI
│   ├── popup.tsx
│   ├── popup.html
│   └── popup.css
├── options/             # Settings page
│   ├── options.tsx
│   └── options.html
├── utils/               # Shared utilities
│   ├── auth.ts
│   ├── storage.ts
│   └── types.ts
├── public/              # Icons and static assets
├── manifest.json        # Chrome manifest
├── manifest.safari.json # Safari manifest
└── webpack.config.js    # Build configuration
```

### Build System

The extension uses Webpack to bundle TypeScript and React code:

- **TypeScript** for type safety
- **React** for UI components
- **webextension-polyfill** for cross-browser compatibility

### Cross-Browser Compatibility

The extension uses `webextension-polyfill` to ensure compatibility across browsers:

```typescript
import browser from 'webextension-polyfill';

// Works in Chrome, Safari, Firefox, Edge
const data = await browser.storage.local.get('key');
await browser.tabs.create({ url: '...' });
```

## Usage

### First Time Setup

1. **Install the extension** (see Installation above)
2. **Click the extension icon** in your browser toolbar
3. **Login** with your CV-Express credentials
4. **Upload a resume** on the CV-Express web app if you haven't already

### Auto-Filling Applications

1. **Navigate** to a job application page
2. **Look for the floating "Auto-Fill" button** (appears automatically on supported sites)
3. **Click the button** to auto-fill the form with your information
4. **Review** the filled data and make any adjustments
5. **Submit** the application

The extension will automatically track your application in CV-Express.

### Supported Websites

The extension works on job application pages from:
- greenhouse.io
- myworkdayjobs.com
- lever.co
- icims.com
- jobvite.com
- workable.com
- smartrecruiters.com
- breezy.hr

## Architecture

### Message Passing

The extension uses a message-passing architecture:

```
Popup/Options ←→ Background Service Worker ←→ Content Script
                        ↕
                    CV-Express API
```

### Data Flow

1. **Authentication**: User logs in via popup → Token stored locally
2. **Data Sync**: Background worker fetches latest resume/profile
3. **Form Detection**: Content script detects ATS forms
4. **Auto-Fill**: User clicks button → Content script fills form
5. **Tracking**: Application data sent to CV-Express API

### Security

- **Local Storage**: All data encrypted in browser storage
- **HTTPS Only**: All API calls use HTTPS
- **Token-based Auth**: JWT tokens with expiration
- **No Plaintext Passwords**: Passwords never stored in extension

## API Integration

The extension communicates with the CV-Express backend:

```typescript
// Authentication
POST /api/auth/login
GET  /api/auth/me

// Resumes
GET  /api/resumes/latest
GET  /api/resumes/:id/download

// Applications
POST /api/applications

// Extension-specific
GET  /api/extension/user-data
POST /api/extension/track
```

## Permissions

The extension requires the following permissions:

- **storage**: Store authentication tokens and cached data
- **tabs**: Open CV-Express web app in new tabs
- **activeTab**: Access current tab for form detection
- **scripting**: Inject content scripts for auto-fill
- **Host permissions**: Access to job application websites

## Testing

### Manual Testing

1. Build the extension
2. Load in browser
3. Test on supported job sites:
   - Create test applications
   - Verify form detection
   - Verify auto-fill accuracy
   - Check application tracking

### Supported Test Sites

- [Greenhouse Demo](https://boards.greenhouse.io/)
- [Lever Demo](https://jobs.lever.co/)
- [Workday Test](https://www.myworkdayjobs.com/)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in both Chrome and Safari
5. Submit a pull request

## Troubleshooting

### Extension not loading

- **Chrome**: Check `chrome://extensions/` for errors
- **Safari**: Check Extension Builder (Develop → Show Extension Builder)

### Form detection not working

- Ensure you're on a supported ATS website
- Check browser console for errors
- Refresh the page

### Auto-fill not working

- Verify you're logged in (click extension icon)
- Ensure you have a resume uploaded
- Check if form fields match your data

### Safari-specific issues

See [SAFARI_SETUP.md](./SAFARI_SETUP.md) for Safari-specific troubleshooting.

## License

Copyright © 2025 CV-Express. All rights reserved.

## Support

For issues and questions:
- Check the [documentation](./SAFARI_SETUP.md)
- Open an issue on GitHub
- Contact support@cvexpress.com

