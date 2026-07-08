import { useState } from 'react';
import styles from './DemoTour.module.css';

export interface TourProgress {
  search: boolean;
  theme: boolean;
  add: boolean;
  notes: boolean;
}

interface DemoTourProps {
  progress: TourProgress;
}

export function DemoTour({ progress }: DemoTourProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return sessionStorage.getItem('demo_tour_collapsed') === 'true';
  });
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('demo_tour_dismissed') === 'true';
  });

  // Persist collapse state
  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    sessionStorage.setItem('demo_tour_collapsed', String(nextState));
  };

  // Persist dismiss state
  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('demo_tour_dismissed', 'true');
  };

  // Pulse element locator logic
  const handleLocate = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = document.getElementById(elementId);
    if (element) {
      // Clear any existing class first
      element.classList.remove('tour-pulse');
      // Trigger browser reflow to reset CSS animation
      void element.offsetWidth;
      // Add animation class
      element.classList.add('tour-pulse');
      
      // Scroll into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Remove after 3 seconds
      setTimeout(() => {
        element.classList.remove('tour-pulse');
      }, 3000);
    }
  };

  if (isDismissed) return null;

  const totalSteps = 4;
  const completedCount = [
    progress.search,
    progress.theme,
    progress.add,
    progress.notes
  ].filter(Boolean).length;
  const progressPercent = (completedCount / totalSteps) * 100;
  const isAllCompleted = completedCount === totalSteps;

  if (isCollapsed) {
    return (
      <div className={styles['tour-collapsed-pill']} onClick={toggleCollapse}>
        <div className={styles['collapsed-info']}>
          <span className={styles.sparkle}>⚡</span>
          <span>Demo Workspace Guide ({completedCount}/{totalSteps} completed)</span>
        </div>
        <span className={styles['collapsed-expand-text']}>Expand Guide ▾</span>
      </div>
    );
  }

  return (
    <div className={styles['tour-card']}>
      <div className={styles['tour-header']}>
        <h2 className={styles['tour-title']}>
          <span>⚡</span> Demo Workspace Guide
        </h2>
        <button className={styles['tour-toggle-btn']} onClick={toggleCollapse}>
          Collapse Guide ▴
        </button>
      </div>

      <p className={styles['tour-description']}>
        Welcome to the isolated guest sandbox! Try performing the actions below to see how 
        <strong> CP Problem Finder</strong> helps you organize and query Data Structures & Algorithms patterns.
      </p>

      <div className={styles.checklist}>
        {/* Step 1: Search */}
        <div className={`${styles['task-item']} ${progress.search ? styles.completed : ''}`}>
          <div className={styles['task-header']}>
            <span className={styles['status-icon']}>{progress.search ? '✅' : '⚪'}</span>
            <div>
              <h3 className={styles['task-title']}>1. Fuzzy Search</h3>
              <p className={styles['task-desc']}>Type an algorithm or keyword (e.g., "graph", "binary") in the search bar.</p>
            </div>
          </div>
          {!progress.search && (
            <button className={styles['locate-btn']} onClick={(e) => handleLocate(e, 'tour-search-bar')}>
              🔍 Where is this?
            </button>
          )}
        </div>

        {/* Step 2: Theme */}
        <div className={`${styles['task-item']} ${progress.theme ? styles.completed : ''}`}>
          <div className={styles['task-header']}>
            <span className={styles['status-icon']}>{progress.theme ? '✅' : '⚪'}</span>
            <div>
              <h3 className={styles['task-title']}>2. Toggle Theme</h3>
              <p className={styles['task-desc']}>Toggle between Light and Dark mode using the sun/moon button.</p>
            </div>
          </div>
          {!progress.theme && (
            <button className={styles['locate-btn']} onClick={(e) => handleLocate(e, 'tour-theme-btn')}>
              ☀️ Where is this?
            </button>
          )}
        </div>

        {/* Step 3: Add Problem */}
        <div className={`${styles['task-item']} ${progress.add ? styles.completed : ''}`}>
          <div className={styles['task-header']}>
            <span className={styles['status-icon']}>{progress.add ? '✅' : '⚪'}</span>
            <div>
              <h3 className={styles['task-title']}>3. Add Problem</h3>
              <p className={styles['task-desc']}>Click the floating button in the bottom corner and submit a problem URL.</p>
            </div>
          </div>
          {!progress.add && (
            <button className={styles['locate-btn']} onClick={(e) => handleLocate(e, 'tour-add-btn')}>
              ➕ Where is this?
            </button>
          )}
        </div>

        {/* Step 4: Write Notes */}
        <div className={`${styles['task-item']} ${progress.notes ? styles.completed : ''}`}>
          <div className={styles['task-header']}>
            <span className={styles['status-icon']}>{progress.notes ? '✅' : '⚪'}</span>
            <div>
              <h3 className={styles['task-title']}>4. Write Revision Notes</h3>
              <p className={styles['task-desc']}>Click the 📝 icon on any problem, write notes, and save changes.</p>
            </div>
          </div>
          {!progress.notes && (
            <button className={styles['locate-btn']} onClick={(e) => handleLocate(e, 'tour-notes-btn')}>
              📝 Where is this?
            </button>
          )}
        </div>
      </div>

      <div className={styles['progress-container']}>
        <span className={styles['progress-label']}>Completion Progress: {completedCount}/{totalSteps}</span>
        <div className={styles['progress-bar-wrapper']}>
          <div 
            className={styles['progress-bar-fill']} 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {isAllCompleted && (
        <div className={styles.celebration}>
          <div className={styles['celebration-content']}>
            <h4 className={styles['celebration-title']}>🎉 Tour Complete!</h4>
            <p className={styles['celebration-desc']}>
              You've successfully explored the core features of the CP Problem Finder sandbox.
              Feel free to keep testing, or log in with Google to start cataloging your real DSA library!
            </p>
          </div>
          <button className={styles['dismiss-btn']} onClick={handleDismiss}>
            Dismiss Guide
          </button>
        </div>
      )}
    </div>
  );
}
