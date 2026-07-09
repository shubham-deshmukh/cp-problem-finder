import React, { useState } from 'react';
import { WelcomeModal } from './WelcomeModal';
import { Button } from './ui/button';

export const LoginPage: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    return !localStorage.getItem('seen_welcome_guide');
  });

  const handleCloseWelcome = () => {
    localStorage.setItem('seen_welcome_guide', 'true');
    setShowWelcome(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      if (window.top) {
        window.top.location.href = `${API_URL}/auth/login`;
      } else {
        window.location.href = `${API_URL}/auth/login`;
      }
    } catch (error) {
      console.error('Login failed:', error);
      window.location.href = `${API_URL}/auth/login`;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      if (window.top) {
        window.top.location.href = `${API_URL}/auth/guest`;
      } else {
        window.location.href = `${API_URL}/auth/guest`;
      }
    } catch (error) {
      console.error('Guest login failed:', error);
      window.location.href = `${API_URL}/auth/guest`;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center relative overflow-hidden font-geist px-4 py-8">
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      
      {/* Background Decorative Snippets */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
        <div className="absolute top-[10%] left-[5%] text-4xl font-bold font-mono text-primary opacity-30">&lt;/&gt;</div>
        <div className="absolute bottom-[20%] left-[10%] text-3xl font-bold font-mono text-primary opacity-20">{"{ }"}</div>
        <div className="absolute top-[30%] right-[8%] text-5xl font-bold font-mono text-primary opacity-25">C++</div>
        <div className="absolute bottom-[15%] right-[5%] text-4xl font-bold font-mono text-primary opacity-20">&lt;/&gt;</div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 bg-card/65 backdrop-blur-md border border-border/80 rounded-2xl p-6 sm:p-8 md:p-12 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-500 text-foreground">
        
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-br from-[#ffa116] via-[#ff9345] to-[#ff3d00] rounded-xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg shadow-orange-500/20 dark:shadow-orange-950/20 font-space-grotesk">
            CP
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-space-grotesk text-foreground">
            Welcome to <span className="bg-linear-to-b from-[#ffa116] via-[#ff9345] to-[#ff3d00] bg-clip-text text-transparent">CP Problem Finder</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Search, explore and master Data Structures & Algorithms
          </p>
        </div>

        {/* Google Login Button */}
        <button
          className="w-full h-11 flex items-center justify-center gap-3 px-4 bg-white hover:bg-neutral-50 active:scale-[0.98] text-neutral-900 border border-neutral-200 rounded-lg text-sm font-semibold cursor-pointer shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {isLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5 text-muted-foreground/60 text-xs font-semibold uppercase tracking-wider before:content-[''] before:flex-1 before:h-[1px] before:bg-border/60 after:content-[''] after:flex-1 after:h-[1px] after:bg-border/60">
          <span>or</span>
        </div>

        {/* Guest Login Container */}
        <div className="flex flex-col gap-2 mb-6">
          <Button
            variant="outline"
            className="w-full h-11 flex items-center justify-center gap-3 px-4 font-semibold text-sm cursor-pointer hover:bg-muted/50 border-border/80"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted-foreground">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Continue as guest
          </Button>
          <p className="text-xs text-muted-foreground/80 text-center">
            Want to explore all features? Try the Demo Workspace.
          </p>
        </div>

        {/* Features Section */}
        <div className="bg-muted/30 border border-border/50 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-purple-500/10 border border-purple-500/25 shadow-xs text-purple-500 dark:text-purple-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Find Problems by Pattern</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Search across tags, techniques, and difficulty levels.</p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/10 border border-blue-500/25 shadow-xs text-blue-500 dark:text-blue-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Structured Revision Notes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Maintain observations, mistakes, and related problems.</p>
            </div>
          </div>

          <div className="flex gap-3.5 items-start">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-orange-500/10 border border-orange-500/25 shadow-xs text-orange-500 dark:text-orange-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground">Demo Workspace</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Experience full CRUD functionality without affecting real-time data.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-muted-foreground/80 mt-6 leading-relaxed">
          <p>
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2">Terms of Service</a> and{' '}
            <a href="#" className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
