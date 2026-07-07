import { useState } from 'react';
import styles from './Login.module.css';
import { WelcomeModal } from './WelcomeModal';

export function LoginPage() {
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
      // Redirect directly to the FastAPI backend to start the OAuth flow
      // Ensure this URL matches your actual FastAPI server address
      
      // Use window.top to break out of iframes (like those from URL cloaking services),
      // as OAuth providers like Google will block rendering inside an iframe.
      if (window.top) {
        window.top.location.href = `${import.meta.env.VITE_API_URL}/auth/login`;
      } else {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`;
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Fallback in case accessing window.top is strictly blocked
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/login`;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      if (window.top) {
        window.top.location.href = `${import.meta.env.VITE_API_URL}/auth/guest`;
      } else {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/guest`;
      }
    } catch (error) {
      console.error('Guest login failed:', error);
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/guest`;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['login-container']}>
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      <div className={styles['login-background']}>
        {/* Decorative code snippets */}
        <div className={`${styles['code-snippet']} ${styles['code-snippet-1']}`}>&lt;/&gt;</div>
        <div className={`${styles['code-snippet']} ${styles['code-snippet-2']}`}>{'{ }'}</div>
        <div className={`${styles['code-snippet']} ${styles['code-snippet-3']}`}>C++</div>
        <div className={`${styles['code-snippet']} ${styles['code-snippet-4']}`}>&lt;/7</div>
      </div>

      <div className={styles['login-card']}>
        {/* Logo and Title */}
        <div className={styles['login-header']}>
          <div className={styles['logo-icon']}>CP</div>
          <h1 className={styles['login-title']}>
            Welcome to <span className={styles['brand-text']}>CP Problem Finder</span>
          </h1>
          <p className={styles['login-subtitle']}>
            Search, explore and master Data Structures & Algorithms
          </p>
        </div>

        {/* Google Login Button */}
        <button
          className={styles['google-login-btn']}
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
        <div className={styles.divider}>
          <span>or</span>
        </div>

        {/* Guest Login Container (Replacing Security Message) */}
        <div className={styles['guest-login-container']}>
          <button
            className={styles['guest-login-btn']}
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Continue as guest
          </button>
          <p className={styles['guest-subtitle']}>
            Want to explore all features? Try the Demo Workspace.
          </p>
        </div>

        {/* Features Section */}
        <div className={styles['features-section']}>
          <div className={styles.feature}>
            <div className={`${styles['feature-icon']} ${styles['feature-icon-1']}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3 3 0 0 1 0-3.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3 3 0 0 0 0-3.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z"/>
              </svg>
            </div>
            <div className={styles['feature-content']}>
              <h3 className={styles['feature-title']}>Find Problems by Pattern</h3>
              <p className={styles['feature-desc']}>Search across tags, techniques, and difficulty levels.</p>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={`${styles['feature-icon']} ${styles['feature-icon-2']}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <div className={styles['feature-content']}>
              <h3 className={styles['feature-title']}>Structured Revision Notes</h3>
              <p className={styles['feature-desc']}>Maintain observations, mistakes, and related problems.</p>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={`${styles['feature-icon']} ${styles['feature-icon-3']}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"/>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
              </svg>
            </div>
            <div className={styles['feature-content']}>
              <h3 className={styles['feature-title']}>Demo Workspace</h3>
              <p className={styles['feature-desc']}>Experience full CRUD functionality without affecting real-time data.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles['login-footer']}>
          <p>
            By continuing, you agree to our{' '}
            <a href="#" className={styles['footer-link']}>Terms of Service</a> and{' '}
            <a href="#" className={styles['footer-link']}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
