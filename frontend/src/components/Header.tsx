import styles from './Header.module.css';

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
            className={`${styles['icon-button']} ${styles['theme-button']} ${isDarkMode ? styles['sun-button'] : styles['moon-button']}`} 
            onClick={onThemeToggle}
            title={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <button className={`${styles['icon-button']} ${styles['profile-button']}`} title="Profile">
          <div className={styles['profile-avatar']}>U</div>
        </button>
      </div>
    </header>
  );
}
