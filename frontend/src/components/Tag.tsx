import './Tag.css';

interface TagProps {
  text: string;
}

export function Tag({ text }: TagProps) {
  const tagColorMap: Record<string, string> = {
    'dynamic programming': 'tag-blue',
    'strings': 'tag-green',
    'greedy': 'tag-yellow',
    'recursion': 'tag-purple',
    'graphs': 'tag-green',
  };

  const colorClass = tagColorMap[text.toLowerCase()] || 'tag-blue';

  return (
    <span className={`tag ${colorClass}`}>
      {text}
    </span>
  );
}
