import React, { useState, useEffect } from 'react';
import './AddProblemModal.css';
import { type ProblemData, type DifficultyLevel } from '../types';

interface AddProblemModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (problem: ProblemData) => void;
}

const AddProblemModal: React.FC<AddProblemModalProps> = ({ isOpen, isLoading = false, onClose, onSubmit }) => {
  const [link, setLink] = useState('');
  const [platform, setPlatform] = useState('LeetCode');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Easy');
  const [tags, setTags] = useState('');

  // Reset fields when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setLink('');
      setPlatform('LeetCode');
      setDifficulty('Easy');
      setTags('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProblem: ProblemData = {
      link,
      platform,
      difficulty,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };
    
    onSubmit(newProblem);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Problem</h2>
          <button type="button" className="close-button" onClick={onClose} disabled={isLoading}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="link">Problem Link</label>
            <input 
              type="url" 
              id="link" 
              className="form-control" 
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g. https://leetcode.com/problems/two-sum/"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="platform">Platform</label>
            <select id="platform" className="form-control" value={platform} onChange={(e) => setPlatform(e.target.value)} disabled={isLoading}>
              <option value="LeetCode">LeetCode</option>
              <option value="Codeforces">Codeforces</option>
              <option value="HackerRank">CSES</option>
              <option value="GeeksforGeeks">Atcoder</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" className="form-control" value={difficulty} onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)} disabled={isLoading}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input 
              type="text" 
              id="tags" 
              className="form-control" 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. Arrays, Hash Table"
              disabled={isLoading}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze & Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProblemModal;