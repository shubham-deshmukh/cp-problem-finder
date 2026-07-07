import styles from './WelcomeModal.module.css';

interface WelcomeModalProps {
  onClose: () => void;
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  return (
    <div className={styles['overlay-container']}>
      <div className={styles['modal-card']}>
        {/* Header */}
        <div className={styles['modal-header']}>
          <div className={styles['logo-container']}>
            <span className={styles['logo-emoji']}>🚀</span>
          </div>
          <h2 className={styles['modal-title']}>Welcome to CP Problem Finder</h2>
          <p className={styles['modal-description']}>
            Organize competitive programming patterns, track solved problems, and instantly search similar problems using tag-based filtering.
          </p>
        </div>

        <p className={styles['modal-instruction']}>Choose how you'd like to explore:</p>

        {/* Choice Container */}
        <div className={styles['choice-container']}>
          {/* Card 1: Personal Account */}
          <div className={styles['choice-card']}>
            <div className={styles['card-header']}>
              <span className={styles['card-emoji']}>👤</span>
              <h3 className={styles['card-title']}>Personal Account (Google Sign-In)</h3>
            </div>
            <ul className={styles['bullet-list']}>
              <li>Read-only access to the public problem directory</li>
              <li>Search, browse, and filter problems</li>
              <li>
                Personalized dashboard & patterns <span className={styles['coming-soon']}>(Coming Soon)</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Demo Sandbox */}
          <div className={styles['choice-card']}>
            <div className={styles['card-header']}>
              <span className={styles['card-emoji']}>🚀</span>
              <h3 className={styles['card-title']}>Demo Workspace (Guest Mode)</h3>
            </div>
            <ul className={styles['bullet-list']}>
              <li>Full Admin privileges (Add, Edit, and Delete problems)</li>
              <li>Dynamic, session-isolated database sandbox</li>
              <li>Safe sandbox (changes reset instantly on logout or after 15 mins)</li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className={styles['action-container']}>
          <button className={styles['continue-btn']} onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
