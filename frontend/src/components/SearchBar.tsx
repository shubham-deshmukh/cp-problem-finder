import './SearchBar.css';

interface SearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function SearchBar({ searchValue, onSearchChange }: SearchBarProps) {
  return (
    <div className="search-container">
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search by title or tag..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {/* <span className="search-suggestion">
          {searchValue ? '' : 'dynamic programming, recursion, graphs...'}
        </span> */}
        {searchValue && (
          <button 
            className="clear-button"
            onClick={() => onSearchChange('')}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
