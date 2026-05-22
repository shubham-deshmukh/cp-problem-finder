import styles from './SearchBar.module.css';

interface SearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function SearchBar({ searchValue, onSearchChange }: SearchBarProps) {
  return (
    <div className={styles['search-container']}>
      <div className={styles['search-bar']}>
        <span className={styles['search-icon']}>🔍</span>
        <input
          type="text"
          className={styles['search-input']}
          placeholder="Search by title or tag..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {/* <span className="search-suggestion">
          {searchValue ? '' : 'dynamic programming, recursion, graphs...'}
        </span> */}
        {searchValue && (
          <button 
            className={styles['clear-button']}
            onClick={() => onSearchChange('')}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
