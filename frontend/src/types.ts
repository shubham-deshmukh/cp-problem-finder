// Types for the application
export interface Problem {
  id: number;
  platform: string;
  platformIcon: string;
  title: string;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'High';
  isNew?: boolean;
}

export type TagType = 'dynamic programming' | 'strings' | 'greedy' | 'recursion' | 'graphs';

export type DifficultyLevel = 'Easy' | 'Medium' | 'High';
