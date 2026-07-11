import React from 'react';

interface TagProps {
  text: string;
}

export const Tag: React.FC<TagProps> = ({ text }) => {
  const normalizedText = text.toLowerCase();
  
  // Dynamic color array utilizing 10 highly distinct, high-contrast colors spanning the full spectrum
  const colors = [
    'bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/30',
    'bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30',
    'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30',
    'bg-lime-500/15 text-lime-700 dark:text-lime-300 border border-lime-500/30',
    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
    'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30',
    'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30',
    'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30',
    'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-500/30',
    'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30',
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
