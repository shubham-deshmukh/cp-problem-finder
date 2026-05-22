import './Header.css';

interface HeaderProps {
  onThemeToggle?: () => void;
}

export function Header({ onThemeToggle }: HeaderProps) {
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
            className="icon-button theme-button sun-button" 
            onClick={onThemeToggle}
            title="Light theme"
          >
            ☀️
          </button>
          <button 
            className="icon-button theme-button moon-button" 
            onClick={onThemeToggle}
            title="Dark theme"
          >
            🌙
          </button>
        </div>

        <button className="icon-button profile-button" title="Profile">
          <div className="profile-avatar">U</div>
        </button>
      </div>
    </header>
  );
}
