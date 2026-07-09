import React from 'react';

interface TagProps {
  text: string;
}

export const Tag: React.FC<TagProps> = ({ text }) => {
  const normalizedText = text.toLowerCase();
  
  const tagColorMap: Record<string, string> = {
    'dynamic programming': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    'strings': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    'greedy': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    'recursion': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    'graphs': 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
  };

  const colorClass = tagColorMap[normalizedText] || 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${colorClass}`}>
      {text}
    </span>
  );
};
export default Tag;
