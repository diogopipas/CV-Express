// Utility to extract country from location strings

// Map of countries and their common identifiers
const COUNTRY_MAPPINGS: { [key: string]: string[] } = {
  'United States': [
    'usa', 'united states', 'america', 'us', 'u.s.', 'u.s.a.',
    // US states
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
    'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
    'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
    'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire',
    'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio',
    'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
    'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia',
    'wisconsin', 'wyoming',
    // US cities
    'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san antonio',
    'san diego', 'dallas', 'san jose', 'austin', 'jacksonville', 'fort worth', 'columbus',
    'charlotte', 'san francisco', 'indianapolis', 'seattle', 'denver', 'boston', 'washington',
    'nashville', 'baltimore', 'oklahoma city', 'portland', 'las vegas', 'detroit', 'memphis',
    'louisville', 'milwaukee', 'albuquerque', 'tucson', 'fresno', 'mesa', 'sacramento',
    'atlanta', 'kansas city', 'colorado springs', 'miami', 'raleigh', 'omaha', 'long beach',
    'virginia beach', 'oakland'
  ],
  'United Kingdom': [
    'uk', 'u.k.', 'united kingdom', 'great britain', 'britain', 'england', 'scotland',
    'wales', 'northern ireland', 'london', 'manchester', 'birmingham', 'leeds', 'glasgow',
    'liverpool', 'newcastle', 'sheffield', 'bristol', 'edinburgh', 'cardiff', 'belfast',
    'leicester', 'nottingham', 'coventry', 'kingston upon hull', 'bradford', 'stoke-on-trent',
    'wolverhampton', 'derby', 'southampton', 'portsmouth', 'brighton', 'plymouth', 'reading',
    'aberdeen', 'cambridge', 'oxford', 'york', 'bath'
  ],
  'Canada': [
    'canada', 'canadian', 'toronto', 'montreal', 'vancouver', 'calgary', 'edmonton',
    'ottawa', 'winnipeg', 'quebec', 'hamilton', 'kitchener', 'london', 'victoria',
    'halifax', 'oshawa', 'windsor', 'saskatoon', 'regina', 'ontario', 'british columbia',
    'alberta', 'quebec', 'manitoba', 'saskatchewan', 'nova scotia', 'new brunswick',
    'newfoundland', 'prince edward island'
  ],
  'Australia': [
    'australia', 'australian', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide',
    'gold coast', 'canberra', 'newcastle', 'wollongong', 'geelong', 'hobart', 'townsville',
    'cairns', 'darwin', 'new south wales', 'victoria', 'queensland', 'western australia',
    'south australia', 'tasmania', 'northern territory', 'nsw', 'vic', 'qld', 'wa', 'sa'
  ],
  'Germany': [
    'germany', 'deutschland', 'german', 'berlin', 'hamburg', 'munich', 'münchen',
    'cologne', 'köln', 'frankfurt', 'stuttgart', 'düsseldorf', 'dortmund', 'essen',
    'leipzig', 'bremen', 'dresden', 'hanover', 'hannover', 'nuremberg', 'nürnberg',
    'duisburg', 'bochum', 'wuppertal', 'bonn', 'bielefeld', 'mannheim', 'karlsruhe'
  ],
  'France': [
    'france', 'french', 'paris', 'marseille', 'lyon', 'toulouse', 'nice', 'nantes',
    'strasbourg', 'montpellier', 'bordeaux', 'lille', 'rennes', 'reims', 'le havre',
    'saint-étienne', 'toulon', 'grenoble', 'dijon', 'angers', 'nîmes', 'villeurbanne',
    'saint-denis', 'le mans', 'aix-en-provence', 'brest', 'clermont-ferrand', 'tours',
    'amiens', 'limoges', 'annecy', 'perpignan', 'boulogne-billancourt'
  ],
  'Spain': [
    'spain', 'españa', 'spanish', 'madrid', 'barcelona', 'valencia', 'seville', 'sevilla',
    'zaragoza', 'málaga', 'malaga', 'murcia', 'palma', 'las palmas', 'bilbao', 'alicante',
    'córdoba', 'cordoba', 'valladolid', 'vigo', 'gijón', 'gijon', 'hospitalet', 'vitoria',
    'granada', 'elche', 'oviedo', 'badalona', 'cartagena', 'terrassa', 'jerez', 'sabadell',
    'móstoles', 'santa cruz', 'pamplona', 'almería', 'almeria', 'fuenlabrada', 'leganés'
  ],
  'Italy': [
    'italy', 'italia', 'italian', 'rome', 'roma', 'milan', 'milano', 'naples', 'napoli',
    'turin', 'torino', 'palermo', 'genoa', 'genova', 'bologna', 'florence', 'firenze',
    'bari', 'catania', 'venice', 'venezia', 'verona', 'messina', 'padua', 'padova',
    'trieste', 'brescia', 'prato', 'taranto', 'parma', 'reggio calabria', 'modena',
    'reggio emilia', 'perugia', 'ravenna', 'livorno', 'cagliari', 'foggia', 'rimini',
    'salerno', 'ferrara', 'sassari', 'latina', 'giugliano', 'monza', 'syracuse'
  ],
  'Netherlands': [
    'netherlands', 'holland', 'dutch', 'amsterdam', 'rotterdam', 'the hague', 'utrecht',
    'eindhoven', 'tilburg', 'groningen', 'almere', 'breda', 'nijmegen', 'enschede',
    'haarlem', 'arnhem', 'zaanstad', 'amersfoort', 'apeldoorn', 's-hertogenbosch',
    'hoofddorp', 'maastricht', 'leiden', 'dordrecht', 'zoetermeer', 'zwolle', 'deventer',
    'delft', 'alkmaar', 'heerlen', 'venlo', 'leeuwarden'
  ],
  'Sweden': [
    'sweden', 'swedish', 'stockholm', 'gothenburg', 'göteborg', 'malmö', 'malmo',
    'uppsala', 'västerås', 'vasteras', 'örebro', 'orebro', 'linköping', 'linkoping',
    'helsingborg', 'jönköping', 'jonkoping', 'norrköping', 'norrkoping', 'lund', 'umeå',
    'umea', 'gävle', 'gavle', 'borås', 'boras', 'eskilstuna', 'södertälje', 'sodertalje'
  ],
  'Norway': [
    'norway', 'norwegian', 'oslo', 'bergen', 'trondheim', 'stavanger', 'drammen',
    'fredrikstad', 'kristiansand', 'sandnes', 'tromsø', 'tromso', 'sarpsborg', 'skien',
    'ålesund', 'alesund', 'sandefjord', 'haugesund', 'tønsberg', 'tonsberg', 'moss',
    'porsgrunn', 'bodø', 'bodo', 'arendal', 'hamar', 'ytrebygda', 'larvik', 'halden'
  ],
  'Denmark': [
    'denmark', 'danish', 'copenhagen', 'københavn', 'aarhus', 'århus', 'odense',
    'aalborg', 'ålborg', 'esbjerg', 'randers', 'kolding', 'horsens', 'vejle',
    'roskilde', 'herning', 'hørsholm', 'horsholm', 'silkeborg', 'næstved', 'frederiksberg',
    'viborg', 'køge', 'koge', 'holstebro', 'taastrup', 'slagelse', 'hillerød', 'hillerod'
  ],
  'Finland': [
    'finland', 'finnish', 'helsinki', 'espoo', 'tampere', 'vantaa', 'oulu', 'turku',
    'jyväskylä', 'jyvaskyla', 'lahti', 'kuopio', 'pori', 'joensuu', 'lappeenranta',
    'hämeenlinna', 'hameenlinna', 'vaasa', 'seinäjoki', 'seinajoki', 'rovaniemi',
    'mikkeli', 'kotka', 'salo', 'kouvola', 'porvoo', 'järvenpää', 'jarvenpaa', 'rauma'
  ],
  'Poland': [
    'poland', 'polska', 'polish', 'warsaw', 'warszawa', 'kraków', 'krakow', 'cracow',
    'łódź', 'lodz', 'wrocław', 'wroclaw', 'poznań', 'poznan', 'gdańsk', 'gdansk',
    'szczecin', 'bydgoszcz', 'lublin', 'białystok', 'bialystok', 'katowice', 'gdynia',
    'częstochowa', 'czestochowa', 'radom', 'sosnowiec', 'toruń', 'torun', 'kielce',
    'gliwice', 'zabrze', 'bytom', 'olsztyn', 'bielsko-biała', 'bielsko-biala', 'rzeszów'
  ],
  'Portugal': [
    'portugal', 'portuguese', 'lisbon', 'lisboa', 'porto', 'oporto', 'braga', 'coimbra',
    'funchal', 'setúbal', 'setubal', 'almada', 'agualva-cacém', 'agualva-cacem',
    'queluz', 'rio tinto', 'évora', 'evora', 'aveiro', 'faro', 'portimão', 'portimao',
    'viseu', 'leiria', 'guimarães', 'guimaraes', 'cascais', 'vila nova de gaia',
    'amadora', 'odivelas', 'matosinhos', 'gondomar'
  ],
  'Belgium': [
    'belgium', 'belgique', 'belgië', 'belgian', 'brussels', 'bruxelles', 'brussel',
    'antwerp', 'antwerpen', 'ghent', 'gent', 'charleroi', 'liège', 'liege', 'bruges',
    'brugge', 'namur', 'namen', 'leuven', 'louvain', 'mons', 'aalst', 'mechelen',
    'malines', 'la louvière', 'kortrijk', 'courtrai', 'hasselt', 'oostende', 'ostend',
    'tournai', 'doornik', 'genk', 'seraing', 'roeselare', 'mouscron', 'verviers', 'beveren'
  ],
  'Austria': [
    'austria', 'österreich', 'austrian', 'vienna', 'wien', 'graz', 'linz', 'salzburg',
    'innsbruck', 'klagenfurt', 'villach', 'wels', 'sankt pölten', 'sankt polten',
    'dornbirn', 'steyr', 'wiener neustadt', 'feldkirch', 'bregenz', 'leonding',
    'klosterneuburg', 'baden', 'wolfsberg', 'leoben', 'krems', 'traun', 'amstetten'
  ],
  'Switzerland': [
    'switzerland', 'schweiz', 'suisse', 'svizzera', 'swiss', 'zurich', 'zürich',
    'geneva', 'genève', 'genf', 'basel', 'bern', 'lausanne', 'winterthur', 'lucerne',
    'luzern', 'st. gallen', 'lugano', 'biel', 'bienne', 'thun', 'köniz', 'la chaux-de-fonds',
    'fribourg', 'schaffhausen', 'chur', 'vernier', 'neuchâtel', 'uster', 'sion', 'emmen'
  ],
  'Ireland': [
    'ireland', 'irish', 'éire', 'dublin', 'cork', 'limerick', 'galway', 'waterford',
    'drogheda', 'dundalk', 'swords', 'bray', 'navan', 'ennis', 'tralee', 'kilkenny',
    'carlow', 'naas', 'athlone', 'sligo', 'newbridge', 'mullingar', 'wexford', 'letterkenny',
    'celbridge', 'clonmel', 'greystones', 'leixlip', 'balbriggan', 'wicklow', 'arklow'
  ],
  'Brazil': [
    'brazil', 'brasil', 'brazilian', 'são paulo', 'sao paulo', 'rio de janeiro',
    'brasília', 'brasilia', 'salvador', 'fortaleza', 'belo horizonte', 'manaus',
    'curitiba', 'recife', 'porto alegre', 'belém', 'belem', 'goiânia', 'goiania',
    'guarulhos', 'campinas', 'são luís', 'sao luis', 'são gonçalo', 'maceió', 'maceio',
    'duque de caxias', 'natal', 'campo grande', 'teresina', 'são bernardo', 'nova iguaçu'
  ],
  'Mexico': [
    'mexico', 'méxico', 'mexican', 'mexico city', 'ciudad de méxico', 'guadalajara',
    'monterrey', 'puebla', 'toluca', 'tijuana', 'león', 'leon', 'juárez', 'juarez',
    'torreón', 'torreon', 'querétaro', 'queretaro', 'san luis potosí', 'san luis potosi',
    'mérida', 'merida', 'mexicali', 'aguascalientes', 'cuernavaca', 'acapulco',
    'saltillo', 'chihuahua', 'cancún', 'cancun', 'morelia', 'hermosillo', 'culiacán'
  ],
  'India': [
    'india', 'indian', 'mumbai', 'bombay', 'delhi', 'bangalore', 'bengaluru', 'hyderabad',
    'ahmedabad', 'chennai', 'madras', 'kolkata', 'calcutta', 'surat', 'pune', 'jaipur',
    'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri',
    'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad',
    'meerut', 'rajkot', 'kalyan', 'vasai-virar', 'varanasi', 'srinagar', 'aurangabad',
    'dhanbad', 'amritsar', 'navi mumbai', 'allahabad', 'ranchi', 'howrah', 'coimbatore'
  ],
  'China': [
    'china', 'chinese', 'beijing', 'shanghai', 'guangzhou', 'shenzhen', 'chengdu',
    'tianjin', 'wuhan', 'dongguan', 'chongqing', "xi'an", 'xian', 'hangzhou', 'foshan',
    'shenyang', 'nanjing', 'harbin', "qingdao", 'dalian', 'zhengzhou', 'shantou',
    'jinan', 'changchun', 'kunming', 'changsha', 'taiyuan', 'xiamen', 'hefei', 'shijiazhuang',
    'ürümqi', 'urumqi', 'fuzhou', 'wuxi', 'zhongshan', 'wenzhou', 'nanning', 'suzhou'
  ],
  'Japan': [
    'japan', 'japanese', 'tokyo', 'yokohama', 'osaka', 'nagoya', 'sapporo', 'fukuoka',
    'kobe', 'kyoto', 'kawasaki', 'saitama', 'hiroshima', 'sendai', 'kitakyushu',
    'chiba', 'sakai', 'niigata', 'hamamatsu', 'kumamoto', 'sagamihara', 'shizuoka',
    'okayama', 'kagoshima', 'hachioji', 'funabashi', 'kawaguchi', 'himeji', 'suita',
    'matsuyama', 'higashiosaka', 'nishinomiya', 'kurashiki', 'ichikawa', 'fukuyama'
  ],
  'South Korea': [
    'south korea', 'korea', 'korean', 'seoul', 'busan', 'incheon', 'daegu', 'daejeon',
    'gwangju', 'suwon', 'ulsan', 'changwon', 'goyang', 'yongin', 'seongnam', 'bucheon',
    'cheongju', 'ansan', 'jeonju', 'anyang', 'pohang', 'gimhae', 'uijeongbu', 'jinju',
    'cheonan', 'iksan', 'pyeongtaek', 'paju', 'gimpo', 'siheung', 'chuncheon', 'asan'
  ],
  'Singapore': [
    'singapore', 'singaporean'
  ],
  'New Zealand': [
    'new zealand', 'nz', 'auckland', 'wellington', 'christchurch', 'hamilton', 'tauranga',
    'napier-hastings', 'dunedin', 'palmerston north', 'nelson', 'rotorua', 'new plymouth',
    'whangarei', 'invercargill', 'whanganui', 'gisborne', 'timaru', 'queenstown'
  ],
  'South Africa': [
    'south africa', 'south african', 'johannesburg', 'cape town', 'durban', 'pretoria',
    'port elizabeth', 'pietermaritzburg', 'benoni', 'tembisa', 'east london', 'vereeniging',
    'bloemfontein', 'boksburg', 'welkom', 'newcastle', 'krugersdorp', 'diepsloot',
    'botshabelo', 'brakpan', 'witbank', 'richards bay', 'vanderbijlpark', 'centurion'
  ],
  'Israel': [
    'israel', 'israeli', 'jerusalem', 'tel aviv', 'haifa', 'rishon lezion', 'petah tikva',
    'ashdod', 'netanya', 'beersheba', 'holon', 'bnei brak', 'ramat gan', 'rehovot',
    'ashkelon', 'bat yam', 'kfar saba', 'herzliya', 'hadera', 'modiin', 'ramla', 'raanana'
  ],
  'United Arab Emirates': [
    'uae', 'united arab emirates', 'dubai', 'abu dhabi', 'sharjah', 'al ain', 'ajman',
    'ras al-khaimah', 'fujairah', 'umm al-quwain', 'khor fakkan', 'dhaid', 'ruwais',
    'liwa oasis', 'dibba al-fujairah', 'jebel ali', 'madinat zayed'
  ],
  'Saudi Arabia': [
    'saudi arabia', 'saudi', 'riyadh', 'jeddah', 'mecca', 'medina', 'dammam', 'khobar',
    'tabuk', 'buraidah', 'khamis mushait', 'hofuf', 'taif', 'jubail', 'najran', 'hail',
    'abha', 'yanbu', 'al kharj', 'qatif', 'al bahah', 'dhahran', 'arar'
  ],
  'Russia': [
    'russia', 'russian', 'moscow', 'москва', 'saint petersburg', 'st petersburg',
    'санкт-петербург', 'novosibirsk', 'новосибирск', 'yekaterinburg', 'екатеринбург',
    'kazan', 'казань', 'nizhny novgorod', 'нижний новгород', 'chelyabinsk', 'челябинск',
    'samara', 'самара', 'omsk', 'омск', 'rostov-on-don', 'ростов-на-дону', 'ufa', 'уфа',
    'krasnoyarsk', 'красноярск', 'perm', 'пермь', 'voronezh', 'воронеж', 'volgograd'
  ],
  'Turkey': [
    'turkey', 'turkish', 'istanbul', 'ankara', 'izmir', 'bursa', 'adana', 'gaziantep',
    'konya', 'antalya', 'kayseri', 'mersin', 'eskişehir', 'eskisehir', 'diyarbakır',
    'diyarbakir', 'samsun', 'denizli', 'şanlıurfa', 'sanliurfa', 'adapazarı', 'adapazari',
    'malatya', 'kahramanmaraş', 'kahramanmaras', 'erzurum', 'van', 'batman', 'elazığ'
  ],
  'Argentina': [
    'argentina', 'argentinian', 'buenos aires', 'córdoba', 'cordoba', 'rosario',
    'mendoza', 'tucumán', 'tucuman', 'la plata', 'mar del plata', 'salta', 'santa fe',
    'san juan', 'resistencia', 'santiago del estero', 'corrientes', 'posadas',
    'san salvador de jujuy', 'bahía blanca', 'bahia blanca', 'paraná', 'parana',
    'neuquén', 'neuquen', 'formosa', 'san luis', 'la rioja', 'río cuarto', 'rio cuarto'
  ],
  'Chile': [
    'chile', 'chilean', 'santiago', 'valparaíso', 'valparaiso', 'concepción', 'concepcion',
    'la serena', 'antofagasta', 'temuco', 'rancagua', 'talca', 'arica', 'chillán', 'chillan',
    'iquique', 'los ángeles', 'los angeles', 'puerto montt', 'coquimbo', 'osorno',
    'valdivia', 'punta arenas', 'copiapó', 'copiapo', 'quillota', 'calama', 'curicó'
  ],
  'Colombia': [
    'colombia', 'colombian', 'bogotá', 'bogota', 'medellín', 'medellin', 'cali',
    'barranquilla', 'cartagena', 'cúcuta', 'cucuta', 'bucaramanga', 'pereira',
    'santa marta', 'ibagué', 'ibague', 'pasto', 'manizales', 'neiva', 'villavicencio',
    'armenia', 'valledupar', 'montería', 'monteria', 'sincelejo', 'popayán', 'popayan'
  ],
  'Remote': ['remote', 'work from home', 'wfh', 'anywhere', 'worldwide']
};

/**
 * Extract country from a location string
 * Returns the standardized country name or 'Unknown' if not found
 */
export const extractCountry = (location: string): string => {
  if (!location) return 'Unknown';
  
  const locationLower = location.toLowerCase().trim();
  
  // Check for remote
  if (COUNTRY_MAPPINGS['Remote'].some(identifier => locationLower.includes(identifier))) {
    return 'Remote';
  }
  
  // Check each country
  for (const [country, identifiers] of Object.entries(COUNTRY_MAPPINGS)) {
    if (country === 'Remote') continue; // Already checked
    
    for (const identifier of identifiers) {
      if (locationLower.includes(identifier)) {
        return country;
      }
    }
  }
  
  return 'Unknown';
};

/**
 * Get list of all supported countries
 */
export const getSupportedCountries = (): string[] => {
  return Object.keys(COUNTRY_MAPPINGS).filter(c => c !== 'Remote').sort();
};

/**
 * Get country code for a country name (for API compatibility)
 */
export const getCountryCode = (country: string): string => {
  const countryCodeMap: { [key: string]: string } = {
    'United States': 'US',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR',
    'Spain': 'ES',
    'Italy': 'IT',
    'Netherlands': 'NL',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Belgium': 'BE',
    'Austria': 'AT',
    'Switzerland': 'CH',
    'Ireland': 'IE',
    'Brazil': 'BR',
    'Mexico': 'MX',
    'India': 'IN',
    'China': 'CN',
    'Japan': 'JP',
    'South Korea': 'KR',
    'Singapore': 'SG',
    'New Zealand': 'NZ',
    'South Africa': 'ZA',
    'Israel': 'IL',
    'United Arab Emirates': 'AE',
    'Saudi Arabia': 'SA',
    'Russia': 'RU',
    'Turkey': 'TR',
    'Argentina': 'AR',
    'Chile': 'CL',
    'Colombia': 'CO',
    'Remote': 'REMOTE'
  };
  
  return countryCodeMap[country] || 'XX';
};

// US States list
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

// Canadian Provinces
const CANADIAN_PROVINCES = [
  'Ontario', 'British Columbia', 'Alberta', 'Quebec', 'Manitoba', 'Saskatchewan',
  'Nova Scotia', 'New Brunswick', 'Newfoundland', 'Prince Edward Island'
];

// Australian States
const AUSTRALIAN_STATES = [
  'New South Wales', 'NSW', 'Victoria', 'VIC', 'Queensland', 'QLD',
  'Western Australia', 'WA', 'South Australia', 'SA', 'Tasmania', 'TAS',
  'Northern Territory', 'NT'
];

// UK Countries/Regions
const UK_REGIONS = [
  'England', 'Scotland', 'Wales', 'Northern Ireland'
];

/**
 * Extract region/state from a location string based on country
 * Returns the region name or undefined if not found
 */
export const extractRegion = (location: string, country: string): string | undefined => {
  if (!location) return undefined;
  
  const locationLower = location.toLowerCase().trim();
  
  // Extract region based on country
  if (country === 'United States') {
    for (const state of US_STATES) {
      if (locationLower.includes(state.toLowerCase())) {
        return state;
      }
    }
  } else if (country === 'Canada') {
    for (const province of CANADIAN_PROVINCES) {
      if (locationLower.includes(province.toLowerCase())) {
        return province;
      }
    }
  } else if (country === 'Australia') {
    for (const state of AUSTRALIAN_STATES) {
      if (locationLower.includes(state.toLowerCase())) {
        // Normalize abbreviated states to full names
        if (state === 'NSW') return 'New South Wales';
        if (state === 'VIC') return 'Victoria';
        if (state === 'QLD') return 'Queensland';
        if (state === 'WA') return 'Western Australia';
        if (state === 'SA') return 'South Australia';
        if (state === 'TAS') return 'Tasmania';
        if (state === 'NT') return 'Northern Territory';
        return state;
      }
    }
  } else if (country === 'United Kingdom') {
    for (const region of UK_REGIONS) {
      if (locationLower.includes(region.toLowerCase())) {
        return region;
      }
    }
  }
  
  return undefined;
};

/**
 * Extract both country and region from a location string
 * Returns an object with country and region (region may be undefined)
 */
export const extractLocationDetails = (location: string): { country: string; region?: string } => {
  const country = extractCountry(location);
  const region = extractRegion(location, country);
  
  return { country, region };
};

