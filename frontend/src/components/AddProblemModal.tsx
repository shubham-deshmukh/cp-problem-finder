import React, { useState, useEffect } from 'react';
import styles from './AddProblemModal.module.css';
import { type ProblemData, type DifficultyLevel } from '../types';

interface AddProblemModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (problem: ProblemData) => void;
}

const AddProblemModal: React.FC<AddProblemModalProps> = ({ isOpen, isLoading = false, onClose, onSubmit }) => {
  const [link, setLink] = useState('');
  const [platform, setPlatform] = useState('Leetcode');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Easy');
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isFetchingTags, setIsFetchingTags] = useState(false);

  // Reset fields when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setLink('');
      setPlatform('Leetcode');
      setDifficulty('Easy');
      setTags([]);

      const fetchTags = async () => {
        setIsFetchingTags(true);
        try {
          // Note: Update this URL to match your actual backend API endpoint for tags
          const response = await fetch('http://127.0.0.1:8000/tags');
          if (!response.ok) throw new Error('Failed to fetch tags');
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
      tags
    };
    
    onSubmit(newProblem);
  };

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2>Add New Problem</h2>
          <button type="button" className={styles['close-button']} onClick={onClose} disabled={isLoading}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="link">Problem Link</label>
            <input 
              type="url" 
              id="link" 
              className={styles['form-control']} 
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. https://leetcode.com/problems/two-sum/"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="platform">Platform</label>
            <select id="platform" className={styles['form-control']} value={platform} onChange={(e) => setPlatform(e.target.value)} disabled={isLoading}>
              <option value="Leetcode">Leetcode</option>
              <option value="Codeforces">Codeforces</option>
              <option value="CSES">CSES</option>
              <option value="Atcoder">Atcoder</option>
              <option value="Codechef">Codechef</option>
            </select>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" className={styles['form-control']} value={difficulty} onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)} disabled={isLoading}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className={styles['form-group']}>
          <label htmlFor="tags">Tags</label>
          <div 
            className={styles['form-control']} 
            style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '38px', padding: '6px 12px', alignItems: 'center', height: 'auto' }}
          >
            {tags.map(tag => (
              <span key={tag} style={{ background: 'rgba(150, 150, 150, 0.2)', color: 'inherit', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} style={{ border: 'none', background: 'transparent', color: 'inherit', opacity: 0.7, cursor: 'pointer', padding: '0', fontSize: '1.1rem', lineHeight: '1', display: 'flex' }}>
                  &times;
                </button>
              </span>
            ))}
            <select 
              onChange={handleAddTag} 
              value="" 
              style={{ border: 'none', outline: 'none', background: 'transparent', color: 'inherit', flexGrow: 1, minWidth: '150px', padding: '0', fontSize: 'inherit' }}
              disabled={isLoading || isFetchingTags}
            >
              <option value="" disabled style={{ background: 'var(--bg, #1e1e1e)' }}>{isFetchingTags ? 'Loading tags...' : 'Select a tag...'}</option>
              {availableTags.filter(t => !tags.includes(t)).map(t => (
                <option key={t} value={t} style={{ background: 'var(--bg, #1e1e1e)' }}>{t}</option>
              ))}
            </select>
          </div>
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className={styles['btn-cancel']} onClick={onClose} disabled={isLoading}>Cancel</button>
            <button type="submit" className={styles['btn-submit']} disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze & Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProblemModal;