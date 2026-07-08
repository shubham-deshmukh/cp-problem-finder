import styles from './Header.module.css';
import { UserDropdown } from './UserDropdown';

interface HeaderProps {
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export function Header({ onThemeToggle, isDarkMode }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles['header-left']}>
        <div className={styles.logo}>
          <div className={styles['logo-icon']}>CP</div>
          <span className={styles['logo-text']}>CP Problem Finder</span>
        </div>
      </div>

      <div className={styles['header-right']}>
        <div className={styles['theme-toggle']}>
          <button 
            id="tour-theme-btn"
            className={`${styles['icon-button']} ${styles['theme-button']} ${isDarkMode ? styles['sun-button'] : styles['moon-button']}`} 
            onClick={onThemeToggle}
            title={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <UserDropdown />
      </div>
    </header>
  );
}
