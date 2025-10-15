import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

interface FilterPanelProps {
  onFilterChange: (filters: { source?: string; sortBy?: string }) => void;
}

const FilterPanel = ({ onFilterChange }: FilterPanelProps) => {
  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <h3 className="font-semibold text-sm">Filters</h3>
      
      <div className="space-y-2">
        <Label htmlFor="source-filter">Source</Label>
        <Select onValueChange={(value) => onFilterChange({ source: value === 'all' ? undefined : value })}>
          <SelectTrigger id="source-filter">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
            <SelectItem value="Indeed">Indeed</SelectItem>
            <SelectItem value="Glassdoor">Glassdoor</SelectItem>
          </SelectContent>
        </Select>
      </div>

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

