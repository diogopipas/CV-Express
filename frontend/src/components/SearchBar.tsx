import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SearchBarProps {
  onSearch: (keyword: string, location: string, sources: ('LinkedIn' | 'Indeed' | 'Glassdoor')[]) => void;
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

// Location hierarchy
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
    'England': ['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool'],
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

  // Sources
  const [sources, setSources] = useState<('LinkedIn' | 'Indeed' | 'Glassdoor')[]>(['LinkedIn', 'Indeed', 'Glassdoor']);

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
    } else if (selectedJobOption) {
      keyword = selectedJobOption;
    } else if (selectedCategory) {
      keyword = selectedCategory;
    }

    // Build location string
    let location = '';
    if (useCustomLocation) {
      location = customLocation;
    } else {
      const parts = [selectedCity, selectedState, selectedCountry].filter(Boolean);
      location = parts.join(', ');
    }

    if (keyword && location && sources.length > 0) {
      onSearch(keyword, location, sources);
    }
  };

  const toggleSource = (source: 'LinkedIn' | 'Indeed' | 'Glassdoor') => {
    setSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  const getJobOptions = () => {
    if (!selectedCategory || !JOB_CATEGORIES[selectedCategory as keyof typeof JOB_CATEGORIES]) {
      return [];
    }
    const category = JOB_CATEGORIES[selectedCategory as keyof typeof JOB_CATEGORIES];
    return [...category.titles, ...category.specializations];
  };

  const getStates = () => {
    if (!selectedCountry || !LOCATIONS[selectedCountry as keyof typeof LOCATIONS]) {
      return [];
    }
    return Object.keys(LOCATIONS[selectedCountry as keyof typeof LOCATIONS]);
  };

  const getCities = () => {
    if (!selectedCountry || !selectedState) {
      return [];
    }
    const country = LOCATIONS[selectedCountry as keyof typeof LOCATIONS];
    return country[selectedState as keyof typeof country] || [];
  };

  const isFormValid = () => {
    const hasKeyword = useCustomKeywords ? customKeywords.trim() !== '' : selectedCategory !== '';
    const hasLocation = useCustomLocation ? customLocation.trim() !== '' : selectedCountry !== '';
    return hasKeyword && hasLocation && sources.length > 0;
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
              {selectedCategory && selectedCategory !== 'custom' && (
                <Select value={selectedJobOption} onValueChange={setSelectedJobOption}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specific role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All in {selectedCategory}</SelectItem>
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
              {selectedCountry && selectedCountry !== 'custom' && (
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
              {selectedState && (
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city (optional)..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All in {selectedState}</SelectItem>
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

      {/* Source Checkboxes */}
      <div className="flex items-center gap-6 pt-1">
        <span className="text-sm text-muted-foreground">Sources:</span>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="linkedin"
            checked={sources.includes('LinkedIn')}
            onCheckedChange={() => toggleSource('LinkedIn')}
          />
          <Label htmlFor="linkedin" className="cursor-pointer text-sm">LinkedIn</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="indeed"
            checked={sources.includes('Indeed')}
            onCheckedChange={() => toggleSource('Indeed')}
          />
          <Label htmlFor="indeed" className="cursor-pointer text-sm">Indeed</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="glassdoor"
            checked={sources.includes('Glassdoor')}
            onCheckedChange={() => toggleSource('Glassdoor')}
          />
          <Label htmlFor="glassdoor" className="cursor-pointer text-sm">Glassdoor</Label>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;

