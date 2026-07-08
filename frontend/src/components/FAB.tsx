import styles from './FAB.module.css';

interface FABProps {
  onClick?: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <button id="tour-add-btn" className={styles.fab} onClick={onClick} title="Add problem">
      +
    </button>
  );
}
