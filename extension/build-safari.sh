#!/bin/bash

# Build script for Safari Web Extension
# This script builds the extension for Safari and provides instructions for conversion

set -e

echo "🔨 Building CV-Express extension for Safari..."

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Error: Xcode is not installed or not in PATH"
    echo "   Please install Xcode from the Mac App Store first"
    exit 1
fi

# Check if Xcode command line tools are configured
if ! xcode-select -p &> /dev/null; then
    echo "⚠️  Warning: Xcode command line tools not configured"
    echo "   Run: sudo xcode-select --switch /Applications/Xcode.app"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build for Safari
echo "🚀 Building extension..."
npm run build:safari

echo ""
echo "✅ Build complete! Extension built to: dist-safari/"
echo ""
echo "📱 To use in Safari:"
echo ""
echo "1. Convert to Safari Web Extension using Xcode:"
echo "   xcrun safari-web-extension-converter dist-safari --app-name 'CV-Express' --bundle-identifier 'com.cvexpress.extension' --macos-only"
echo ""
echo "   ⚠️  If you get Xcode errors, run first:"
echo "      sudo xcodebuild -runFirstLaunch"
echo "      (or open Xcode manually to complete setup)"
echo ""
echo "2. This will create an Xcode project. Open it:"
echo "   open CV-Express/CV-Express.xcodeproj"
echo ""
echo "3. In Xcode:"
echo "   - Set your development team (if required)"
echo "   - Build and run the project (Cmd+R)"
echo "   - This will launch Safari with the extension"
echo ""
echo "4. Enable the extension in Safari:"
echo "   - Safari → Preferences → Extensions"
echo "   - Check 'CV-Express Job Application Assistant'"
echo ""
echo "📚 For troubleshooting, see SAFARI_SETUP.md"
echo ""

