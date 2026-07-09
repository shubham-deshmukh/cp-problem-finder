import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from './ui/button';
import { UserDropdown } from './UserDropdown';

interface HeaderProps {
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onThemeToggle, isDarkMode }) => {
  return (
    <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border bg-card px-4 md:px-6 shadow-xs font-geist">
      <div className="flex items-center">
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="flex items-center justify-center w-8 h-8 bg-linear-to-br from-[#ffa116] via-[#ff9345] to-[#ff3d00] rounded-lg text-white font-bold text-sm font-space-grotesk shadow-xs">
            CP
          </div>
          <span className="font-bold text-sm sm:text-base tracking-tight font-space-grotesk text-foreground">
            CP Problem Finder
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <Button
            id="tour-theme-btn"
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
            onClick={onThemeToggle}
            title={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <UserDropdown />
      </div>
    </header>
  );
};
export default Header;
