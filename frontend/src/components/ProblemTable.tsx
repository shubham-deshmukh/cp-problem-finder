import './ProblemTable.css';
import { Tag } from './Tag';
import { type Problem } from '../types';

interface ProblemTableProps {
  problems: Problem[];
  onEdit?: (problem: Problem) => void;
}

export function ProblemTable({ problems, onEdit }: ProblemTableProps) {
  return (
    <div className="table-wrapper">
      <table className="problems-table">
        <thead>
          <tr>
            <th className="col-platform">Platform</th>
            <th className="col-title">Title</th>
            <th className="col-tags">Tags</th>
            <th className="col-difficulty">Difficulty</th>
            <th className="col-actions" style={{ width: '60px', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem) => (
            <tr key={problem.id} className="problem-row">
              <td className="col-platform">
                <div className="platform-badge">
                  <img 
                    src={`/icons/${problem.platform.toLowerCase()}.png`} 
                    alt={`${problem.platform} logo`} 
                    className="platform-icon"
                    style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.src = '/icons/default.png';
                      e.currentTarget.onerror = null; // Prevents infinite loops if the fallback image is also missing
                    }}
                  />
                  <span className="platform-name">{problem.platform}</span>
                </div>
              </td>
              <td className="col-title">
                <a href={problem.link} target="_blank" rel="noopener noreferrer" className="problem-title">
                  {problem.title}
                </a>
              </td>
              <td className="col-tags">
                <div className="tags-container">
                  {problem.tags.map((tag, idx) => (
                    <Tag key={idx} text={tag} />
                  ))}
                  {problem.isNew && (
                    <span className="badge-new">NEWLY ADDED</span>
                  )}
                </div>
              </td>
              <td className="col-difficulty">
                <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                  {problem.difficulty}
                </span>
              </td>
              <td className="col-actions" style={{ textAlign: 'center' }}>
                <button 
                  onClick={() => onEdit?.(problem)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
                  title="Edit problem"
                >
                  ✏️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
