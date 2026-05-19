import './FAB.css';

interface FABProps {
  onClick?: () => void;
}

export function FAB({ onClick }: FABProps) {
  return (
    <button className="fab" onClick={onClick} title="Add problem">
      +
    </button>
  );
}
