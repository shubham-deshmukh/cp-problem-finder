// Types for the application
export interface Problem {
  id: number;
  platform: string;
  platformIcon: string;
  title: string;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'High';
  link: string;
  isNew?: boolean;
}

export interface ProblemData {
  link: string;
  platform: string;
  difficulty: DifficultyLevel;
  tags: string[];
}

export type TagType = 'dynamic programming' | 'strings' | 'greedy' | 'recursion' | 'graphs';

export type DifficultyLevel = 'Easy' | 'Medium' | 'High';
