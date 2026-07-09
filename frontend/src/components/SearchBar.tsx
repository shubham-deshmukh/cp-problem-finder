import React from 'react';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';

interface SearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchValue, onSearchChange }) => {
  return (
    <div className="w-full font-geist">
      <div
        id="tour-search-bar"
        className="relative flex items-center bg-card border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-ring rounded-xl px-4 py-2.5 gap-3 max-w-xl mx-auto w-full transition-all duration-200 shadow-xs"
      >
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground/75"
          placeholder="Search by title or tag..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchValue && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground p-0 cursor-pointer flex items-center justify-center shrink-0 border-0"
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
export default SearchBar;
