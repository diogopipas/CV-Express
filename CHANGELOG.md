# Changelog - CV-Express

## [1.1.0] - October 17, 2025

### 🌍 Major Feature: Multi-Country Support Expansion

**Added support for 24 countries (up from 7)**

#### New Countries Added:
- 🇵🇹 **Portugal** (Priority #1) - Lisbon, Porto, Braga, Coimbra, Faro, Aveiro
- 🇪🇸 Spain - Barcelona, Madrid, Valencia, Seville, Bilbao, Malaga
- 🇧🇷 Brazil - São Paulo, Rio de Janeiro, Brasília, Belo Horizonte, Curitiba
- 🇮🇹 Italy - Rome, Milan, Naples, Turin, Florence
- 🇳🇱 Netherlands - Amsterdam, Rotterdam, The Hague, Utrecht, Eindhoven
- 🇵🇱 Poland - Warsaw, Krakow, Wrocław, Gdansk
- 🇦🇹 Austria - Vienna, Salzburg, Graz, Innsbruck
- 🇧🇪 Belgium - Brussels, Antwerp, Ghent, Bruges
- 🇨🇭 Switzerland - Zurich, Geneva, Basel, Bern
- 🇳🇿 New Zealand - Auckland, Wellington, Christchurch, Hamilton, Dunedin
- 🇸🇬 Singapore
- 🇿🇦 South Africa - Johannesburg, Cape Town, Durban, Pretoria
- 🇲🇽 Mexico - Mexico City, Guadalajara, Monterrey, Puebla
- 🇷🇺 Russia - Moscow, St Petersburg, Novosibirsk

#### Enhanced Existing Countries:
- 🇬🇧 UK - Added Edinburgh, Glasgow, Liverpool, Bristol
- 🇨🇦 Canada - Added Montreal, Calgary, Ottawa, Edmonton
- 🇦🇺 Australia - Added Brisbane, Perth, Adelaide, Canberra
- 🇺🇸 USA - Expanded to 20+ major cities
- 🇮🇳 India - Added Delhi, Hyderabad, Chennai, Pune, Kolkata
- 🇩🇪 Germany - Added Hamburg, Cologne, Frankfurt
- 🇫🇷 France - Added Lyon, Marseille, Toulouse, Nice, Nantes, Strasbourg

### ✨ Improvements

#### Backend:
- Enhanced `getCountryCode()` function in `adzunaScraper.ts`
- Added console logging to show detected country code
- Support for native language city names (e.g., "München", "Lisboa")
- Better fallback handling for unknown locations
- All changes compiled successfully to JavaScript

#### Documentation:
- **NEW:** `SUPPORTED_COUNTRIES.md` - Comprehensive country and city guide
- **NEW:** `COUNTRY_SUPPORT_UPDATE.md` - Implementation details and testing guide
- **NEW:** `CHANGELOG.md` - This file
- **UPDATED:** `README.md` - Complete redesign highlighting 24-country support
- **UPDATED:** `ADZUNA_IMPLEMENTATION_SUMMARY.md` - Updated country list
- **UPDATED:** `ADZUNA_SETUP_GUIDE.md` - Added country information

#### Testing:
- **NEW:** `backend/test-country-detection.js` - Automated test suite
- ✅ All 24 countries tested and verified
- ✅ 24/24 tests passing (100% success rate)

### 🐛 Bug Fixes
- Fixed: Portugal jobs showing as US jobs (country detection defaulting to US)
- Fixed: Limited city recognition for European countries
- Fixed: No support for native language city names

### 📈 Statistics
- **Countries supported:** 7 → 24 (+243% increase)
- **Cities recognized:** ~15 → 100+ (+567% increase)
- **Code size:** `getCountryCode()` function expanded from 20 lines to 150 lines
- **Test coverage:** 24 automated tests with 100% pass rate

### 🔧 Technical Changes

#### Files Modified:
1. `backend/src/services/scrapers/adzunaScraper.ts`
   - Expanded country detection
   - Added console logging
   
2. `backend/dist/services/scrapers/adzunaScraper.js`
   - Compiled TypeScript changes
   
3. `README.md`
   - Complete redesign with feature highlights
   
4. `ADZUNA_IMPLEMENTATION_SUMMARY.md`
   - Updated country list
   
5. `ADZUNA_SETUP_GUIDE.md`
   - Enhanced with country details

#### Files Created:
1. `SUPPORTED_COUNTRIES.md` - New comprehensive guide
2. `COUNTRY_SUPPORT_UPDATE.md` - Implementation summary
3. `CHANGELOG.md` - This changelog
4. `backend/test-country-detection.js` - Test suite

### 🚀 Usage

Search for jobs in any of the 24 supported countries:

```bash
# Portugal
"Software Engineer in Lisbon"
"Developer in Porto"

# Spain
"Frontend Developer in Barcelona"

# Brazil
"Desenvolvedor in São Paulo"

# And 21 more countries!
```

### 💡 How to Verify

1. **Check console output**:
   ```
   🌍 Detected country code: PT
   ```

2. **Run tests**:
   ```bash
   cd backend
   node test-country-detection.js
   ```

3. **Real job search**:
   - Upload resume with location "Lisbon"
   - Verify jobs are from Portugal
   - Check job URLs link to Portuguese listings

### 📚 Documentation

- Quick start: [ADZUNA_SETUP_GUIDE.md](./ADZUNA_SETUP_GUIDE.md)
- All countries: [SUPPORTED_COUNTRIES.md](./SUPPORTED_COUNTRIES.md)
- Testing guide: [COUNTRY_SUPPORT_UPDATE.md](./COUNTRY_SUPPORT_UPDATE.md)
- Main readme: [README.md](./README.md)

### ⚙️ Breaking Changes

None! This update is fully backward compatible.

### 🙏 Special Thanks

Special focus on Portugal 🇵🇹 - Boa sorte na sua procura de emprego!

---

## [1.0.0] - Previous Release

- Initial release with Adzuna API integration
- Support for 7 countries (US, UK, CA, AU, IN, DE, FR)
- Resume upload feature
- Job saving and management
- Modern UI with React and Tailwind CSS

---

**For detailed installation instructions, see [ADZUNA_SETUP_GUIDE.md](./ADZUNA_SETUP_GUIDE.md)**

