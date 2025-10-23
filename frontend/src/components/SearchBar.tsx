import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SearchBarProps {
  onSearch: (keyword: string, location: string) => void;
  isLoading?: boolean;
}

// Job categories and their sub-options
const JOB_CATEGORIES = {
  'Technology': {
    titles: ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist', 'Data Engineer', 'Machine Learning Engineer', 'Product Manager', 'UI/UX Designer', 'QA Engineer', 'Security Engineer'],
    specializations: ['Web Development', 'Mobile Development', 'Cloud Computing', 'Data Science', 'Artificial Intelligence', 'Cybersecurity', 'Database Administration']
  },
  'Healthcare': {
    titles: ['Registered Nurse', 'Physician', 'Medical Assistant', 'Physical Therapist', 'Pharmacist', 'Healthcare Administrator', 'Medical Technologist', 'Paramedic'],
    specializations: ['Emergency Medicine', 'Pediatrics', 'Surgery', 'Mental Health', 'Public Health', 'Clinical Research']
  },
  'Finance': {
    titles: ['Financial Analyst', 'Accountant', 'Investment Banker', 'Financial Advisor', 'Auditor', 'Tax Specialist', 'Controller', 'Compliance Officer'],
    specializations: ['Corporate Finance', 'Investment Banking', 'Risk Management', 'Financial Planning', 'Accounting', 'Portfolio Management']
  },
  'Marketing': {
    titles: ['Marketing Manager', 'Digital Marketing Specialist', 'Content Strategist', 'SEO Specialist', 'Social Media Manager', 'Brand Manager', 'Marketing Analyst', 'Product Marketing Manager'],
    specializations: ['Digital Marketing', 'Content Marketing', 'Social Media', 'SEO/SEM', 'Email Marketing', 'Brand Strategy', 'Market Research']
  },
  'Sales': {
    titles: ['Sales Representative', 'Account Executive', 'Sales Manager', 'Business Development Manager', 'Sales Engineer', 'Account Manager', 'Inside Sales Representative'],
    specializations: ['B2B Sales', 'B2C Sales', 'Enterprise Sales', 'Retail Sales', 'Technical Sales', 'Business Development']
  },
  'Education': {
    titles: ['Teacher', 'Professor', 'Instructional Designer', 'School Administrator', 'Curriculum Developer', 'Education Consultant', 'Tutor', 'Librarian'],
    specializations: ['Elementary Education', 'Secondary Education', 'Higher Education', 'Special Education', 'Online Learning', 'Educational Technology']
  },
  'Engineering': {
    titles: ['Mechanical Engineer', 'Electrical Engineer', 'Civil Engineer', 'Chemical Engineer', 'Aerospace Engineer', 'Industrial Engineer', 'Environmental Engineer'],
    specializations: ['Mechanical Design', 'Electrical Systems', 'Structural Engineering', 'Process Engineering', 'Manufacturing', 'Quality Assurance']
  },
  'Design': {
    titles: ['Graphic Designer', 'UX Designer', 'UI Designer', 'Product Designer', 'Web Designer', 'Creative Director', 'Art Director', 'Motion Designer'],
    specializations: ['User Experience', 'User Interface', 'Visual Design', 'Interaction Design', 'Branding', 'Illustration', 'Animation']
  }
};

// Location hierarchy - Expanded globally
const LOCATIONS = {
  'United States': {
    'California': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
    'Texas': ['Houston', 'Austin', 'Dallas', 'San Antonio', 'Fort Worth'],
    'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
    'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Rockford', 'Joliet'],
    'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue'],
    'Massachusetts': ['Boston', 'Cambridge', 'Worcester', 'Springfield', 'Lowell']
  },
  'United Kingdom': {
    'England': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Bristol'],
    'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'],
    'Wales': ['Cardiff', 'Swansea', 'Newport', 'Wrexham'],
    'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Newry']
  },
  'Canada': {
    'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'London'],
    'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau'],
    'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby'],
    'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge']
  },
  'Australia': {
    'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast'],
    'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo'],
    'Queensland': ['Brisbane', 'Gold Coast', 'Townsville', 'Cairns'],
    'Western Australia': ['Perth', 'Fremantle', 'Mandurah', 'Bunbury']
  },
  'Germany': {
    'Bavaria': ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg'],
    'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg'],
    'Baden-Württemberg': ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg'],
    'Berlin': ['Berlin'],
    'Hamburg': ['Hamburg'],
    'Hesse': ['Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt']
  },
  'France': {
    'Île-de-France': ['Paris', 'Versailles', 'Boulogne-Billancourt'],
    'Provence-Alpes-Côte d\'Azur': ['Marseille', 'Nice', 'Toulon', 'Cannes'],
    'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble', 'Saint-Étienne', 'Annecy'],
    'Nouvelle-Aquitaine': ['Bordeaux', 'Limoges', 'Poitiers', 'La Rochelle'],
    'Occitanie': ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan']
  },
  'Spain': {
    'Madrid': ['Madrid', 'Móstoles', 'Alcalá de Henares'],
    'Catalonia': ['Barcelona', 'Hospitalet', 'Terrassa', 'Sabadell'],
    'Andalusia': ['Seville', 'Málaga', 'Córdoba', 'Granada'],
    'Valencia': ['Valencia', 'Alicante', 'Elche', 'Castellón'],
    'Basque Country': ['Bilbao', 'Vitoria', 'San Sebastián']
  },
  'Italy': {
    'Lazio': ['Rome', 'Latina', 'Viterbo'],
    'Lombardy': ['Milan', 'Brescia', 'Bergamo', 'Monza'],
    'Campania': ['Naples', 'Salerno', 'Caserta'],
    'Sicily': ['Palermo', 'Catania', 'Messina', 'Syracuse'],
    'Tuscany': ['Florence', 'Pisa', 'Livorno', 'Arezzo']
  },
  'Netherlands': {
    'North Holland': ['Amsterdam', 'Haarlem', 'Zaanstad'],
    'South Holland': ['Rotterdam', 'The Hague', 'Leiden', 'Delft'],
    'Utrecht': ['Utrecht', 'Amersfoort', 'Nieuwegein'],
    'North Brabant': ['Eindhoven', 'Tilburg', 'Breda', 's-Hertogenbosch']
  },
  'Sweden': {
    'Stockholm': ['Stockholm', 'Solna', 'Sundbyberg'],
    'Västra Götaland': ['Gothenburg', 'Borås', 'Mölndal'],
    'Skåne': ['Malmö', 'Helsingborg', 'Lund', 'Kristianstad'],
    'Uppsala': ['Uppsala', 'Enköping']
  },
  'Norway': {
    'Oslo': ['Oslo'],
    'Vestland': ['Bergen', 'Stavanger'],
    'Trøndelag': ['Trondheim'],
    'Rogaland': ['Stavanger', 'Sandnes']
  },
  'Denmark': {
    'Capital Region': ['Copenhagen', 'Frederiksberg'],
    'Central Jutland': ['Aarhus', 'Randers', 'Horsens'],
    'Southern Denmark': ['Odense', 'Esbjerg', 'Kolding'],
    'North Jutland': ['Aalborg']
  },
  'Finland': {
    'Uusimaa': ['Helsinki', 'Espoo', 'Vantaa'],
    'Pirkanmaa': ['Tampere', 'Nokia'],
    'Southwest Finland': ['Turku', 'Kaarina'],
    'North Ostrobothnia': ['Oulu', 'Raahe']
  },
  'Poland': {
    'Masovian': ['Warsaw', 'Radom', 'Płock'],
    'Lesser Poland': ['Kraków', 'Tarnów', 'Nowy Sącz'],
    'Greater Poland': ['Poznań', 'Kalisz', 'Konin'],
    'Silesian': ['Katowice', 'Częstochowa', 'Sosnowiec', 'Gliwice']
  },
  'Portugal': {
    'Lisbon': ['Lisbon', 'Amadora', 'Cascais'],
    'Porto': ['Porto', 'Vila Nova de Gaia', 'Matosinhos'],
    'Braga': ['Braga', 'Guimarães'],
    'Setúbal': ['Setúbal', 'Almada']
  },
  'Belgium': {
    'Brussels': ['Brussels'],
    'Flanders': ['Antwerp', 'Ghent', 'Bruges', 'Leuven'],
    'Wallonia': ['Charleroi', 'Liège', 'Namur', 'Mons']
  },
  'Austria': {
    'Vienna': ['Vienna'],
    'Styria': ['Graz', 'Leoben'],
    'Tyrol': ['Innsbruck'],
    'Upper Austria': ['Linz', 'Wels'],
    'Salzburg': ['Salzburg']
  },
  'Switzerland': {
    'Zürich': ['Zürich', 'Winterthur'],
    'Bern': ['Bern', 'Thun'],
    'Geneva': ['Geneva'],
    'Basel-Stadt': ['Basel'],
    'Vaud': ['Lausanne', 'Montreux']
  },
  'Ireland': {
    'Leinster': ['Dublin', 'Drogheda', 'Dundalk'],
    'Munster': ['Cork', 'Limerick', 'Waterford', 'Killarney'],
    'Connacht': ['Galway', 'Sligo'],
    'Ulster': ['Letterkenny', 'Monaghan']
  },
  'Brazil': {
    'São Paulo': ['São Paulo', 'Campinas', 'Santos', 'São José dos Campos'],
    'Rio de Janeiro': ['Rio de Janeiro', 'Niterói', 'Duque de Caxias'],
    'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Contagem'],
    'Bahia': ['Salvador', 'Feira de Santana'],
    'Paraná': ['Curitiba', 'Londrina', 'Maringá']
  },
  'Mexico': {
    'Mexico City': ['Mexico City'],
    'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque'],
    'Nuevo León': ['Monterrey', 'San Nicolás de los Garza'],
    'Puebla': ['Puebla', 'Tehuacán'],
    'Guanajuato': ['León', 'Irapuato', 'Celaya']
  },
  'India': {
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
    'Karnataka': ['Bangalore', 'Mysore', 'Hubli'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Delhi': ['Delhi', 'New Delhi'],
    'West Bengal': ['Kolkata', 'Howrah'],
    'Telangana': ['Hyderabad', 'Warangal']
  },
  'China': {
    'Beijing': ['Beijing'],
    'Shanghai': ['Shanghai'],
    'Guangdong': ['Guangzhou', 'Shenzhen', 'Dongguan', 'Foshan'],
    'Zhejiang': ['Hangzhou', 'Ningbo', 'Wenzhou'],
    'Jiangsu': ['Nanjing', 'Suzhou', 'Wuxi']
  },
  'Japan': {
    'Tokyo': ['Tokyo', 'Yokohama', 'Kawasaki'],
    'Osaka': ['Osaka', 'Sakai', 'Higashiosaka'],
    'Aichi': ['Nagoya', 'Toyota', 'Okazaki'],
    'Hokkaido': ['Sapporo'],
    'Fukuoka': ['Fukuoka', 'Kitakyushu']
  },
  'South Korea': {
    'Seoul': ['Seoul', 'Incheon'],
    'Gyeonggi': ['Suwon', 'Yongin', 'Goyang'],
    'Busan': ['Busan'],
    'Daegu': ['Daegu'],
    'Daejeon': ['Daejeon']
  },
  'Singapore': {
    'Singapore': ['Singapore']
  },
  'New Zealand': {
    'Auckland': ['Auckland', 'Manukau'],
    'Wellington': ['Wellington', 'Lower Hutt'],
    'Canterbury': ['Christchurch'],
    'Waikato': ['Hamilton']
  },
  'South Africa': {
    'Gauteng': ['Johannesburg', 'Pretoria', 'Soweto'],
    'Western Cape': ['Cape Town', 'Stellenbosch'],
    'KwaZulu-Natal': ['Durban', 'Pietermaritzburg'],
    'Eastern Cape': ['Port Elizabeth', 'East London']
  },
  'Israel': {
    'Central': ['Tel Aviv', 'Petah Tikva', 'Holon'],
    'Jerusalem': ['Jerusalem'],
    'Haifa': ['Haifa'],
    'Southern': ['Beersheba', 'Ashdod', 'Ashkelon']
  },
  'United Arab Emirates': {
    'Dubai': ['Dubai'],
    'Abu Dhabi': ['Abu Dhabi'],
    'Sharjah': ['Sharjah'],
    'Ajman': ['Ajman']
  },
  'Saudi Arabia': {
    'Riyadh': ['Riyadh'],
    'Makkah': ['Jeddah', 'Mecca'],
    'Eastern Province': ['Dammam', 'Khobar', 'Dhahran']
  },
  'Russia': {
    'Moscow': ['Moscow'],
    'Saint Petersburg': ['Saint Petersburg'],
    'Novosibirsk': ['Novosibirsk'],
    'Yekaterinburg': ['Yekaterinburg'],
    'Kazan': ['Kazan']
  },
  'Turkey': {
    'Istanbul': ['Istanbul'],
    'Ankara': ['Ankara'],
    'Izmir': ['Izmir'],
    'Bursa': ['Bursa'],
    'Antalya': ['Antalya']
  },
  'Argentina': {
    'Buenos Aires': ['Buenos Aires', 'La Plata', 'Mar del Plata'],
    'Córdoba': ['Córdoba'],
    'Santa Fe': ['Rosario', 'Santa Fe'],
    'Mendoza': ['Mendoza']
  },
  'Chile': {
    'Santiago': ['Santiago', 'Puente Alto', 'San Bernardo'],
    'Valparaíso': ['Valparaíso', 'Viña del Mar'],
    'Biobío': ['Concepción', 'Talcahuano']
  },
  'Colombia': {
    'Bogotá': ['Bogotá'],
    'Antioquia': ['Medellín', 'Bello'],
    'Valle del Cauca': ['Cali', 'Palmira'],
    'Atlántico': ['Barranquilla']
  },
  'Remote': {
    'Anywhere': ['Remote', 'Work from home']
  }
};

const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  // Job field state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedJobOption, setSelectedJobOption] = useState('');
  const [customKeywords, setCustomKeywords] = useState('');
  const [useCustomKeywords, setUseCustomKeywords] = useState(false);

  // Location state
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [useCustomLocation, setUseCustomLocation] = useState(false);

  // Reset sub-selections when parent changes
  useEffect(() => {
    setSelectedJobOption('');
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedState('');
    setSelectedCity('');
  }, [selectedCountry]);

  useEffect(() => {
    setSelectedCity('');
  }, [selectedState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build keyword string
    let keyword = '';
    if (useCustomKeywords) {
      keyword = customKeywords;
    } else if (selectedJobOption && selectedJobOption !== 'all') {
      keyword = selectedJobOption;
    } else if (selectedCategory && selectedCategory !== 'custom') {
      keyword = selectedCategory;
    }

    // Build location string (optional now - if not provided, searches globally)
    let location = '';
    if (useCustomLocation) {
      location = customLocation;
    } else {
      const parts = [
        selectedCity && selectedCity !== 'all' ? selectedCity : '',
        selectedState && selectedState !== 'all' ? selectedState : '',
        selectedCountry && selectedCountry !== 'custom' ? selectedCountry : ''
      ].filter(Boolean);
      location = parts.join(', ');
    }

    // Only keyword is required now, location is optional for global search
    if (keyword) {
      onSearch(keyword, location || 'global');
    }
  };

  const getJobOptions = () => {
    if (!selectedCategory) {
      return [];
    }
    try {
      const category = JOB_CATEGORIES[selectedCategory as keyof typeof JOB_CATEGORIES];
      if (!category || typeof category !== 'object') {
        return [];
      }
      return [...category.titles, ...category.specializations];
    } catch (error) {
      console.error('Error getting job options:', error);
      return [];
    }
  };

  const getStates = () => {
    if (!selectedCountry) {
      return [];
    }
    try {
      const country = LOCATIONS[selectedCountry as keyof typeof LOCATIONS];
      if (!country || typeof country !== 'object') {
        return [];
      }
      return Object.keys(country);
    } catch (error) {
      console.error('Error getting states:', error);
      return [];
    }
  };

  const getCities = () => {
    if (!selectedCountry || !selectedState) {
      return [];
    }
    try {
      const country = LOCATIONS[selectedCountry as keyof typeof LOCATIONS];
      if (!country || typeof country !== 'object') {
        return [];
      }
      const cities = country[selectedState as keyof typeof country];
      return Array.isArray(cities) ? cities : [];
    } catch (error) {
      console.error('Error getting cities:', error);
      return [];
    }
  };

  const isFormValid = () => {
    // Only keyword is required now, location is optional for global search
    const hasKeyword = useCustomKeywords ? customKeywords.trim() !== '' : selectedCategory !== '';
    return hasKeyword;
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Job Field Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Job Field</Label>
          {!useCustomKeywords ? (
            <div className="space-y-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a field..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(JOB_CATEGORIES).map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Keywords...</SelectItem>
                </SelectContent>
              </Select>
              {selectedCategory && selectedCategory !== 'custom' && getJobOptions().length > 0 && (
                <Select value={selectedJobOption} onValueChange={setSelectedJobOption}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specific role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All in {selectedCategory}</SelectItem>
                    {getJobOptions().map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedCategory === 'custom' && (
                <div>
                  <Input
                    type="text"
                    placeholder="Enter custom keywords..."
                    value={customKeywords}
                    onChange={(e) => {
                      setCustomKeywords(e.target.value);
                      setUseCustomKeywords(true);
                    }}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter custom keywords..."
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                className="w-full"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setUseCustomKeywords(false);
                  setCustomKeywords('');
                }}
                className="text-xs"
              >
                Use Categories
              </Button>
            </div>
          )}
        </div>

        {/* Location Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Location</Label>
          {!useCustomLocation ? (
            <div className="space-y-2">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(LOCATIONS).map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Location...</SelectItem>
                </SelectContent>
              </Select>
              {selectedCountry && selectedCountry !== 'custom' && getStates().length > 0 && (
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state/region..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getStates().map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedState && getCities().length > 0 && (
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city (optional)..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All in {selectedState}</SelectItem>
                    {getCities().map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedCountry === 'custom' && (
                <div>
                  <Input
                    type="text"
                    placeholder="Enter custom location..."
                    value={customLocation}
                    onChange={(e) => {
                      setCustomLocation(e.target.value);
                      setUseCustomLocation(true);
                    }}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter custom location..."
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                className="w-full"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setUseCustomLocation(false);
                  setCustomLocation('');
                }}
                className="text-xs"
              >
                Use Locations
              </Button>
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button type="submit" disabled={isLoading || !isFormValid()} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            {isLoading ? 'Scraping...' : 'Search'}
          </Button>
        </div>
      </div>

    </form>
  );
};

export default SearchBar;

