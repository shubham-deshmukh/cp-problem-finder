import React, { useState, useEffect, useRef } from 'react';
import { type ProblemData, type DifficultyLevel } from '../types';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { CustomSelect } from './ui/CustomSelect';

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
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isFetchingTags, setIsFetchingTags] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Reset fields when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setLink('');
      setPlatform('Leetcode');
      setDifficulty('Easy');
      setTags([]);

      // Auto-focus the input
      setTimeout(() => {
        linkInputRef.current?.focus();
      }, 80);

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

  const handleAddTag = (selectedTag: string) => {
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
      notes: '' // Initialize with empty string; user will add revision notes via the drawer
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
              ref={linkInputRef}
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
            <label className="text-sm font-semibold text-foreground">
              Platform
            </label>
            <CustomSelect 
              id="platform"
              value={platform}
              options={['Leetcode', 'Codeforces', 'CSES', 'Atcoder', 'Codechef']}
              onChange={setPlatform}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Difficulty
            </label>
            <CustomSelect 
              id="difficulty"
              value={difficulty}
              options={['Easy', 'Medium', 'High']}
              onChange={(val) => setDifficulty(val as DifficultyLevel)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground">
              Tags
            </label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {tags.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-muted text-foreground text-xs border border-border"
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
              </div>
            )}
            <CustomSelect 
              id="tag-select"
              value=""
              placeholder={isFetchingTags ? 'Loading tags...' : 'Select a tag...'}
              options={availableTags.filter(t => !tags.includes(t))}
              onChange={handleAddTag}
              disabled={isLoading || isFetchingTags}
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