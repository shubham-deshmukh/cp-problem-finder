import React from 'react';

interface TagProps {
  text: string;
}

export const Tag: React.FC<TagProps> = ({ text }) => {
  const normalizedText = text.toLowerCase();
  
  // Dynamic color array avoiding colors used for difficulty (emerald/green, amber/orange/yellow, rose/red)
  // Restricted to 5 highly distinct, high-contrast colors (blue, purple, teal, fuchsia, slate)
  const colors = [
    'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30',
    'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30',
    'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30',
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
