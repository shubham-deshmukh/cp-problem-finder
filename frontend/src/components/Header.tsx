import './Header.css';

interface HeaderProps {
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export function Header({ onThemeToggle, isDarkMode }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-icon">CP</div>
          <span className="logo-text">CP Problem Finder</span>
        </div>
      </div>

      <div className="header-right">
        <div className="theme-toggle">
          <button 
            className={`icon-button theme-button ${isDarkMode ? 'sun-button' : 'moon-button'}`} 
            onClick={onThemeToggle}
            title={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <button className="icon-button profile-button" title="Profile">
          <div className="profile-avatar">U</div>
        </button>
      </div>
    </header>
  );
}
