import React from 'react';

interface TagProps {
  text: string;
}

export const Tag: React.FC<TagProps> = ({ text }) => {
  const normalizedText = text.toLowerCase();
  
  // Dynamic color array avoiding colors used for difficulty (emerald/green, amber/orange/yellow, rose/red)
  const colors = [
    'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20',
    'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
    'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
    'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/20',
    'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20',
    'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
    'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20',
  ];

  // Helper to generate a stable hash from a string
  const getHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const colorClass = colors[getHash(normalizedText) % colors.length];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${colorClass}`}>
      {text}
    </span>
  );
};
export default Tag;
