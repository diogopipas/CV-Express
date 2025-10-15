import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

interface SearchBarProps {
  onSearch: (keyword: string, location: string, sources: string[]) => void;
  isLoading?: boolean;
}

const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [sources, setSources] = useState<string[]>(['LinkedIn', 'Indeed', 'Glassdoor']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword && location && sources.length > 0) {
      onSearch(keyword, location, sources);
    }
  };

  const toggleSource = (source: string) => {
    setSources(prev =>
      prev.includes(source)
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Job title, keywords..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Location (city, state, country)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={isLoading || !keyword || !location || sources.length === 0}>
          <Search className="mr-2 h-4 w-4" />
          {isLoading ? 'Scraping...' : 'Search'}
        </Button>
      </div>

      <div className="flex items-center gap-6">
        <span className="text-sm text-muted-foreground">Sources:</span>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="linkedin"
            checked={sources.includes('LinkedIn')}
            onCheckedChange={() => toggleSource('LinkedIn')}
          />
          <Label htmlFor="linkedin" className="cursor-pointer">LinkedIn</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="indeed"
            checked={sources.includes('Indeed')}
            onCheckedChange={() => toggleSource('Indeed')}
          />
          <Label htmlFor="indeed" className="cursor-pointer">Indeed</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="glassdoor"
            checked={sources.includes('Glassdoor')}
            onCheckedChange={() => toggleSource('Glassdoor')}
          />
          <Label htmlFor="glassdoor" className="cursor-pointer">Glassdoor</Label>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;

