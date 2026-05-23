import { useState } from 'react';
import styles from './Login.module.css';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect directly to the FastAPI backend to start the OAuth flow
      // Ensure this URL matches your actual FastAPI server address
      window.location.href = 'http://127.0.0.1:8000/auth/login';
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['login-container']}>
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

        {/* Security Message */}
        <div className={styles['security-message']}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="currentColor"/>
          </svg>
          Secure authentication by Google
        </div>

        {/* Features Section */}
        <div className={styles['features-section']}>
          <div className={styles.feature}>
            <div className={`${styles['feature-icon']} ${styles['feature-icon-1']}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div className={styles['feature-content']}>
              <h3 className={styles['feature-title']}>Fast & Easy Access</h3>
              <p className={styles['feature-desc']}>One click sign-in to continue</p>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={`${styles['feature-icon']} ${styles['feature-icon-2']}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 11h-4v-2h4V6h2v4h4v2h-4v4h-2v-4z"/>
              </svg>
            </div>
            <div className={styles['feature-content']}>
              <h3 className={styles['feature-title']}>Secure & Private</h3>
              <p className={styles['feature-desc']}>We never store your password</p>
            </div>
          </div>

          <div className={styles.feature}>
            <div className={`${styles['feature-icon']} ${styles['feature-icon-3']}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className={styles['feature-content']}>
              <h3 className={styles['feature-title']}>Personalized Experience</h3>
              <p className={styles['feature-desc']}>Sync your progress across devices</p>
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
