import styles from './Tag.module.css';

interface TagProps {
  text: string;
}

export function Tag({ text }: TagProps) {
  const tagColorMap: Record<string, string> = {
    'dynamic programming': styles['tag-blue'],
    'strings': styles['tag-green'],
    'greedy': styles['tag-yellow'],
    'recursion': styles['tag-purple'],
    'graphs': styles['tag-green'],
  };

  const colorClass = tagColorMap[text.toLowerCase()] || styles['tag-blue'];

  return (
    <span className={`${styles.tag} ${colorClass}`}>
      {text}
    </span>
  );
}
