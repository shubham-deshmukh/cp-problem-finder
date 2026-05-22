import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import styles from './UserDropdown.module.css';

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logout = useAuthStore((state) => state.logout);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className={styles['user-dropdown']} ref={dropdownRef}>
      <button 
        className={styles['profile-button']} 
        onClick={() => setIsOpen(!isOpen)}
        title="User menu"
      >
        <div className={styles['profile-avatar']}>U</div>
      </button>

      {isOpen && (
        <div className={styles['dropdown-card']}>
          <div className={styles['user-info']}>
            <div className={styles['user-avatar']}>U</div>
            <div className={styles['user-details']}>
              <div className={styles['user-name']}>User</div>
              <div className={styles['user-email']}>user@example.com</div>
            </div>
          </div>

          <div className={styles['dropdown-divider']}></div>

          <div className={styles['dropdown-menu']}>
            <button className={styles['menu-item']}>
              <span className={styles['menu-icon']}>👤</span>
              <span>Profile</span>
            </button>
            <button className={styles['menu-item']}>
              <span className={styles['menu-icon']}>⚙️</span>
              <span>Preferences</span>
            </button>
            <button 
              className={`${styles['menu-item']} ${styles['sign-out']}`}
              onClick={handleLogout}
            >
              <span className={styles['menu-icon']}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path fill-rule="evenodd" d="M18.586 13h-8.083c-.523 0-.947-.448-.947-1s.424-1 .947-1h8.083l-2.738-2.737a1 1 0 011.415-1.415l4.444 4.445a1 1 0 010 1.414l-4.444 4.445a1 1 0 01-1.415-1.415L18.586 13zM9 5H6a1 1 0 00-1 1v12a1 1 0 001 1h3a1 1 0 110 2H6a3 3 0 01-3-3V6a3 3 0 013-3h3a1 1 0 010 2z" clip-rule="evenodd"></path></svg>
              </span>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
