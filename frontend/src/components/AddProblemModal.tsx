import React, { useState, useEffect } from 'react';
import { type ProblemData, type DifficultyLevel } from '../types';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AddProblemModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (problem: ProblemData) => void;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export const AddProblemModal: React.FC<AddProblemModalProps> = ({
  isOpen,
  isLoading = false,
  onClose,
  onSubmit,
}) => {
  const [link, setLink] = useState('');
  const [platform, setPlatform] = useState('Leetcode');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Easy');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isFetchingTags, setIsFetchingTags] = useState(false);

  // Reset fields when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setLink('');
      setPlatform('Leetcode');
      setDifficulty('Easy');
      setTags([]);
      setNotes('');

      const fetchTags = async () => {
        setIsFetchingTags(true);
        try {
          const response = await fetch(`${API_URL}/tags`, {
            credentials: 'include'
          });
          if (!response.ok) {
            if (response.status === 401) {
              useAuthStore.getState().handleSessionExpired();
            }
            throw new Error('Failed to fetch tags');
          }
          const data = await response.json();
          setAvailableTags(data || []);
        } catch (error) {
          console.error('Error fetching tags:', error);
          setAvailableTags([]);
        } finally {
          setIsFetchingTags(false);
        }
      };

      fetchTags();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTag = e.target.value;
    if (selectedTag && !tags.includes(selectedTag)) {
      setTags([...tags, selectedTag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProblem: ProblemData = {
      link,
      platform,
      difficulty,
      tags,
      notes
    };
    
    onSubmit(newProblem);
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 flex flex-col m-auto animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 text-foreground font-geist" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold tracking-tight font-space-grotesk text-foreground">
            Add New Problem
          </h2>
          <button 
            type="button" 
            className="text-2xl text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none transition-colors border-0 bg-transparent disabled:opacity-50" 
            onClick={onClose} 
            disabled={isLoading}
          >
            &times;
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="link" className="text-sm font-semibold text-foreground">
              Problem Link
            </label>
            <Input 
              type="url" 
              id="link" 
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. https://leetcode.com/problems/two-sum/"
              required
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="platform" className="text-sm font-semibold text-foreground">
              Platform
            </label>
            <select 
              id="platform" 
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none focus-visible:ring-ring text-foreground disabled:opacity-60 disabled:cursor-not-allowed" 
              value={platform} 
              onChange={(e) => setPlatform(e.target.value)} 
              disabled={isLoading}
            >
              <option value="Leetcode">Leetcode</option>
              <option value="Codeforces">Codeforces</option>
              <option value="CSES">CSES</option>
              <option value="Atcoder">Atcoder</option>
              <option value="Codechef">Codechef</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="difficulty" className="text-sm font-semibold text-foreground">
              Difficulty
            </label>
            <select 
              id="difficulty" 
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none focus-visible:ring-ring text-foreground disabled:opacity-60 disabled:cursor-not-allowed" 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)} 
              disabled={isLoading}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="tags" className="text-sm font-semibold text-foreground">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 min-h-[38px] p-1.5 border border-input rounded-md bg-transparent items-center text-sm text-foreground">
              {tags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted text-foreground text-xs border border-border"
                >
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)} 
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors border-0 bg-transparent flex items-center justify-center p-0 font-semibold"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <select 
                onChange={handleAddTag} 
                value="" 
                className="flex-1 border-0 outline-none bg-transparent text-sm min-w-[130px] text-muted-foreground focus:ring-0 cursor-pointer disabled:opacity-60"
                disabled={isLoading || isFetchingTags}
              >
                <option value="" disabled className="bg-card text-muted-foreground">
                  {isFetchingTags ? 'Loading tags...' : 'Select a tag...'}
                </option>
                {availableTags.filter(t => !tags.includes(t)).map(t => (
                  <option key={t} value={t} className="bg-card text-foreground">{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-sm font-semibold text-foreground">
              Notes / Hints (Markdown supported)
            </label>
            <textarea 
              id="notes" 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:outline-none focus-visible:ring-ring text-foreground disabled:opacity-60 disabled:cursor-not-allowed resize-y" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="e.g. Think dynamic programming, count subproblems carefully." 
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="cursor-pointer min-w-[130px]"
            >
              {isLoading ? 'Analyzing...' : 'Analyze & Add'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddProblemModal;