import React, { useState, useEffect } from 'react';
import styles from './AddProblemModal.module.css';
import { type Problem, type DifficultyLevel } from '../types';

interface EditProblemModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  problem: Problem | null;
  onClose: () => void;
  // Using 'any' for data to bypass rigid types since title is added
  onSubmit: (id: number, data: any) => void; 
}

const EditProblemModal: React.FC<EditProblemModalProps> = ({ isOpen, isLoading = false, problem, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [platform, setPlatform] = useState('Leetcode');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Easy');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isFetchingTags, setIsFetchingTags] = useState(false);

  // Populate fields when the modal is opened with a problem
  useEffect(() => {
    if (isOpen && problem) {
      setTitle(problem.title);
      setLink(problem.link);
      setPlatform(problem.platform);
      setDifficulty(problem.difficulty as DifficultyLevel);
      setTags(problem.tags);
      setNotes(problem.notes || '');

      const fetchTags = async () => {
        setIsFetchingTags(true);
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${import.meta.env.VITE_API_URL}/tags`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
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
  }, [isOpen, problem]);

  if (!isOpen || !problem) return null;

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
    onSubmit(problem.id, { title, link, platform, difficulty, tags, notes });
  };

  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
        <div className={styles['modal-header']}>
          <h2>Edit Problem</h2>
          <button type="button" className={styles['close-button']} onClick={onClose} disabled={isLoading}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label htmlFor="edit-title">Title</label>
            <input type="text" id="edit-title" className={styles['form-control']} value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isLoading} />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="edit-link">Problem Link</label>
            <input type="url" id="edit-link" className={styles['form-control']} value={link} readOnly disabled title="Problem link cannot be changed" />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="edit-platform">Platform</label>
            <select id="edit-platform" className={styles['form-control']} value={platform} disabled title="Platform cannot be changed">
              <option value="Leetcode">Leetcode</option>
              <option value="Codeforces">Codeforces</option>
              <option value="CSES">CSES</option>
              <option value="Atcoder">Atcoder</option>
              <option value="Codechef">Codechef</option>
            </select>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="edit-difficulty">Difficulty</label>
            <select id="edit-difficulty" className={styles['form-control']} value={difficulty} onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)} disabled={isLoading}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="edit-tags">Tags</label>
            <div className={styles['form-control']} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '38px', padding: '6px 12px', alignItems: 'center', height: 'auto' }}>
              {tags.map(tag => (
                <span key={tag} style={{ background: 'rgba(150, 150, 150, 0.2)', color: 'inherit', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>{tag}<button type="button" onClick={() => handleRemoveTag(tag)} style={{ border: 'none', background: 'transparent', color: 'inherit', opacity: 0.7, cursor: 'pointer', padding: '0', fontSize: '1.1rem', lineHeight: '1', display: 'flex' }}>&times;</button></span>
              ))}
              <select onChange={handleAddTag} value="" style={{ border: 'none', outline: 'none', background: 'transparent', color: 'inherit', flexGrow: 1, minWidth: '150px', padding: '0', fontSize: 'inherit' }} disabled={isLoading || isFetchingTags}><option value="" disabled style={{ background: 'var(--bg, #1e1e1e)' }}>{isFetchingTags ? 'Loading tags...' : 'Select a tag...'}</option>{availableTags.filter(t => !tags.includes(t)).map(t => (<option key={t} value={t} style={{ background: 'var(--bg, #1e1e1e)' }}>{t}</option>))}</select>
            </div>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="edit-notes">Notes / Hints (Markdown supported)</label>
            <textarea 
              id="edit-notes" 
              className={styles['form-control']} 
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="e.g. Think dynamic programming, count subproblems carefully." 
              disabled={isLoading}
            />
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className={styles['btn-cancel']} onClick={onClose} disabled={isLoading}>Cancel</button>
            <button type="submit" className={styles['btn-submit']} disabled={isLoading}>{isLoading ? 'Updating...' : 'Update Problem'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditProblemModal;