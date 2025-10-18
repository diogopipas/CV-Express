# Supported Countries & Cities - Adzuna Job Search

The Adzuna scraper now supports **24 countries** with automatic country detection based on your location input.

## 🌍 How It Works

When you search for jobs, the scraper automatically detects the country from your location input (city name or country name) and searches the appropriate Adzuna API endpoint for that region.

## 📍 Supported Countries

### 🇵🇹 Portugal (Code: `pt`)
**Recognized Keywords:**
- Country: `portugal`
- Cities: `lisbon`, `lisboa`, `porto`, `braga`, `coimbra`, `faro`, `aveiro`

**Example Searches:**
- "Software Engineer in Lisbon"
- "Marketing Manager in Porto"
- "Data Analyst in Portugal"

---

### 🇪🇸 Spain (Code: `es`)
**Recognized Keywords:**
- Country: `spain`, `españa`
- Cities: `madrid`, `barcelona`, `valencia`, `seville`, `sevilla`, `bilbao`, `malaga`

**Example Searches:**
- "Developer in Barcelona"
- "Sales Manager in Madrid"

---

### 🇧🇷 Brazil (Code: `br`)
**Recognized Keywords:**
- Country: `brazil`, `brasil`
- Cities: `são paulo`, `sao paulo`, `rio de janeiro`, `brasília`, `brasilia`, `belo horizonte`, `curitiba`

**Example Searches:**
- "Desenvolvedor em São Paulo"
- "Gerente in Rio de Janeiro"

---

### 🇬🇧 United Kingdom (Code: `gb`)
**Recognized Keywords:**
- Country: `uk`, `united kingdom`
- Cities: `london`, `manchester`, `birmingham`, `edinburgh`, `glasgow`, `liverpool`, `bristol`

**Example Searches:**
- "Software Engineer in London"
- "Product Manager in Manchester"

---

### 🇩🇪 Germany (Code: `de`)
**Recognized Keywords:**
- Country: `germany`, `deutschland`
- Cities: `berlin`, `munich`, `münchen`, `hamburg`, `cologne`, `köln`, `frankfurt`

**Example Searches:**
- "Software Developer in Berlin"
- "Project Manager in Munich"

---

### 🇫🇷 France (Code: `fr`)
**Recognized Keywords:**
- Country: `france`
- Cities: `paris`, `lyon`, `marseille`, `toulouse`, `nice`, `nantes`, `strasbourg`

**Example Searches:**
- "Développeur in Paris"
- "Chef de projet in Lyon"

---

### 🇮🇹 Italy (Code: `it`)
**Recognized Keywords:**
- Country: `italy`, `italia`
- Cities: `rome`, `roma`, `milan`, `milano`, `naples`, `napoli`, `turin`, `torino`, `florence`, `firenze`

**Example Searches:**
- "Software Engineer in Milan"
- "Marketing Manager in Rome"

---

### 🇳🇱 Netherlands (Code: `nl`)
**Recognized Keywords:**
- Country: `netherlands`, `holland`
- Cities: `amsterdam`, `rotterdam`, `the hague`, `utrecht`, `eindhoven`

**Example Searches:**
- "Developer in Amsterdam"
- "Data Scientist in Rotterdam"

---

### 🇵🇱 Poland (Code: `pl`)
**Recognized Keywords:**
- Country: `poland`, `polska`
- Cities: `warsaw`, `warszawa`, `krakow`, `kraków`, `wroclaw`, `wrocław`, `gdansk`

**Example Searches:**
- "Software Developer in Warsaw"
- "Business Analyst in Krakow"

---

### 🇦🇹 Austria (Code: `at`)
**Recognized Keywords:**
- Country: `austria`, `österreich`
- Cities: `vienna`, `wien`, `salzburg`, `graz`, `innsbruck`

**Example Searches:**
- "Engineer in Vienna"
- "Manager in Salzburg"

---

### 🇧🇪 Belgium (Code: `be`)
**Recognized Keywords:**
- Country: `belgium`, `belgique`, `belgië`
- Cities: `brussels`, `bruxelles`, `antwerp`, `antwerpen`, `ghent`, `bruges`

**Example Searches:**
- "Developer in Brussels"
- "Consultant in Antwerp"

---

### 🇨🇭 Switzerland (Code: `ch`)
**Recognized Keywords:**
- Country: `switzerland`, `schweiz`, `suisse`
- Cities: `zurich`, `zürich`, `geneva`, `genève`, `basel`, `bern`

**Example Searches:**
- "Software Engineer in Zurich"
- "Financial Analyst in Geneva"

---

### 🇨🇦 Canada (Code: `ca`)
**Recognized Keywords:**
- Country: `canada`
- Cities: `toronto`, `vancouver`, `montreal`, `montréal`, `calgary`, `ottawa`, `edmonton`

**Example Searches:**
- "Software Developer in Toronto"
- "Product Manager in Vancouver"

---

### 🇦🇺 Australia (Code: `au`)
**Recognized Keywords:**
- Country: `australia`
- Cities: `sydney`, `melbourne`, `brisbane`, `perth`, `adelaide`, `canberra`

**Example Searches:**
- "Engineer in Sydney"
- "Manager in Melbourne"

---

### 🇳🇿 New Zealand (Code: `nz`)
**Recognized Keywords:**
- Country: `new zealand`
- Cities: `auckland`, `wellington`, `christchurch`, `hamilton`, `dunedin`

**Example Searches:**
- "Software Developer in Auckland"
- "Business Analyst in Wellington"

---

### 🇮🇳 India (Code: `in`)
**Recognized Keywords:**
- Country: `india`
- Cities: `bangalore`, `bengaluru`, `mumbai`, `delhi`, `hyderabad`, `chennai`, `pune`, `kolkata`

**Example Searches:**
- "Software Engineer in Bangalore"
- "Data Scientist in Mumbai"

---

### 🇸🇬 Singapore (Code: `sg`)
**Recognized Keywords:**
- Country/City: `singapore`

**Example Searches:**
- "Software Engineer in Singapore"
- "Product Manager Singapore"

---

### 🇿🇦 South Africa (Code: `za`)
**Recognized Keywords:**
- Country: `south africa`
- Cities: `johannesburg`, `cape town`, `durban`, `pretoria`, `port elizabeth`

**Example Searches:**
- "Developer in Cape Town"
- "Manager in Johannesburg"

---

### 🇲🇽 Mexico (Code: `mx`)
**Recognized Keywords:**
- Country: `mexico`, `méxico`
- Cities: `mexico city`, `guadalajara`, `monterrey`, `puebla`

**Example Searches:**
- "Ingeniero de Software in Mexico City"
- "Desarrollador in Guadalajara"

---

### 🇷🇺 Russia (Code: `ru`)
**Recognized Keywords:**
- Country: `russia`, `москва`
- Cities: `moscow`, `st petersburg`, `saint petersburg`, `novosibirsk`

**Example Searches:**
- "Software Engineer in Moscow"
- "Developer in St Petersburg"

---

### 🇺🇸 United States (Code: `us`)
**Recognized Keywords:**
- Country: `usa`, `united states`, `america`
- Cities: `new york`, `los angeles`, `chicago`, `houston`, `phoenix`, `philadelphia`, `san antonio`, `san diego`, `dallas`, `san jose`, `austin`, `jacksonville`, `san francisco`, `seattle`, `denver`, `washington`, `boston`, `atlanta`, `miami`, `detroit`, `portland`

**Example Searches:**
- "Software Engineer in New York"
- "Product Manager in San Francisco"

---

## 🔄 How Location Detection Works

1. **City First:** If you enter a recognized city name, that city's country is automatically detected
2. **Country Name:** If you enter a country name, that country code is used
3. **Local Language:** Native language city names are supported (e.g., "München" for Munich, "Lisboa" for Lisbon)
4. **Default Fallback:** If no match is found, defaults to United States (US)

## 💡 Tips for Best Results

### ✅ Good Location Inputs:
- "Lisbon" → Searches Portugal
- "Porto, Portugal" → Searches Portugal
- "Barcelona" → Searches Spain
- "Berlin" → Searches Germany
- "Remote" → Defaults to US (can find remote jobs)

### ⚠️ Less Specific Inputs:
- "Europe" → Defaults to US
- "Remote Worldwide" → Defaults to US
- "Any" → Defaults to US

### 🎯 Pro Tips:
1. **Be specific with city names** for best results
2. **Use major cities** listed above for guaranteed recognition
3. **Include country name** if the city isn't well-known (e.g., "Braga, Portugal")
4. **Try different variations** - both English and local language names work

## 🌐 Adzuna API Coverage

Not all countries may have the same number of job listings. Coverage varies by region:

- **High Coverage:** 🇬🇧 UK, 🇺🇸 US, 🇨🇦 Canada, 🇦🇺 Australia, 🇩🇪 Germany
- **Good Coverage:** 🇵🇹 Portugal, 🇪🇸 Spain, 🇫🇷 France, 🇮🇹 Italy, 🇳🇱 Netherlands, 🇮🇳 India
- **Growing Coverage:** Other countries

## 🔧 Adding More Countries

If your country isn't listed or you need additional cities recognized:

1. Open `backend/src/services/scrapers/adzunaScraper.ts`
2. Find the `getCountryCode` function
3. Add your country/cities following the existing pattern
4. Use the correct [Adzuna country code](https://developer.adzuna.com/docs/all_countries)
5. Rebuild: `npm run build` in backend folder
6. Restart the backend server

## 📚 Related Documentation

- [ADZUNA_SETUP_GUIDE.md](./ADZUNA_SETUP_GUIDE.md) - How to set up Adzuna API
- [ADZUNA_IMPLEMENTATION_SUMMARY.md](./ADZUNA_IMPLEMENTATION_SUMMARY.md) - Technical details
- [SCRAPER_CONFIGURATION.md](./SCRAPER_CONFIGURATION.md) - Scraper configuration options

---

**Happy Job Hunting! 🎯**

