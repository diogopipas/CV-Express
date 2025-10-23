import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Globe } from 'lucide-react';
import { jobService } from '../services/api';

interface FilterPanelProps {
  onFilterChange: (filters: { source?: string; sortBy?: string; country?: string }) => void;
  showCountryFilter?: boolean;
}

const FilterPanel = ({ onFilterChange, showCountryFilter = false }: FilterPanelProps) => {
  const [countries, setCountries] = useState<Array<{ country: string; count: number }>>([]);
  const [userCountry, setUserCountry] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    if (showCountryFilter) {
      loadCountries();
      detectUserLocation();
    }
  }, [showCountryFilter]);

  const loadCountries = async () => {
    try {
      const response = await jobService.getCountries();
      setCountries(response.data);
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const detectUserLocation = async () => {
    try {
      const response = await jobService.detectLocation();
      const detectedCountry = response.data.country;
      
      // If detection returned 'all' or failed, don't set a default country filter
      if (detectedCountry === 'all' || !detectedCountry) {
        setUserCountry('all');
        setSelectedCountry('all');
        onFilterChange({ country: 'all' });
      } else {
        setUserCountry(detectedCountry);
        setSelectedCountry(detectedCountry);
        // Notify parent of initial country filter
        onFilterChange({ country: detectedCountry });
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      setUserCountry('all');
      setSelectedCountry('all');
      onFilterChange({ country: 'all' });
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    onFilterChange({ country: value });
  };

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <h3 className="font-semibold text-sm">Filters & Sort</h3>
      
      {showCountryFilter && (
        <div className="space-y-2">
          <Label htmlFor="country-filter" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Country
          </Label>
          {loadingLocation ? (
            <div className="text-xs text-muted-foreground">Detecting location...</div>
          ) : (
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger id="country-filter">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {userCountry && userCountry !== 'all' && (
                  <SelectItem value={userCountry}>
                    {userCountry} (Your Location)
                  </SelectItem>
                )}
                {countries
                  .filter(c => c.country !== userCountry)
                  .map((c) => (
                    <SelectItem key={c.country} value={c.country}>
                      {c.country} ({c.count})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="sort-filter">Sort by</Label>
        <Select defaultValue="scrapedDate" onValueChange={(value) => onFilterChange({ sortBy: value })}>
          <SelectTrigger id="sort-filter">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scrapedDate">Most recent</SelectItem>
            <SelectItem value="title">Title (A-Z)</SelectItem>
            <SelectItem value="company">Company (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterPanel;

