import styles from './ProblemTable.module.css';
import { Tag } from './Tag';
import { type Problem } from '../types';

interface ProblemTableProps {
  problems: Problem[];
  onEdit?: (problem: Problem) => void;
  onDelete?: (id: number) => void;
  onShowNotes?: (problem: Problem) => void;
  isAdmin?: boolean;
}

export function ProblemTable({ problems, onEdit, onDelete, onShowNotes, isAdmin }: ProblemTableProps) {
  return (
    <div className={styles['table-wrapper']}>
      <table className={styles['problems-table']}>
        <thead>
          <tr>
            <th className={styles['col-platform']}>Platform</th>
            <th className={styles['col-title']}>Title</th>
            <th className={styles['col-tags']}>Tags</th>
            <th className={styles['col-difficulty']}>Difficulty</th>
            {isAdmin && (
              <th className={styles['col-actions']} style={{ width: '80px', textAlign: 'center' }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {problems.map((problem, index) => (
            <tr key={problem.id} className={styles['problem-row']}>
              <td className={styles['col-platform']}>
                <div className={styles['platform-badge']}>
                  <img 
                    src={`/icons/${problem.platform.toLowerCase()}.png`} 
                    alt={`${problem.platform} logo`} 
                    className={styles['platform-icon']}
                    style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.src = '/icons/default.png';
                      e.currentTarget.onerror = null; // Prevents infinite loops if the fallback image is also missing
                    }}
                  />
                  <span className={styles['platform-name']}>{problem.platform}</span>
                </div>
              </td>
              <td className={styles['col-title']}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a href={problem.link} target="_blank" rel="noopener noreferrer" className={styles['problem-title']}>
                    {problem.title}
                  </a>
                  {(problem.notes || isAdmin) && (
                    <button 
                      id={index === 0 ? "tour-notes-btn" : undefined}
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowNotes?.(problem);
                      }}
                      className={`${styles['note-trigger-btn']} ${problem.notes ? styles['has-notes'] : ''}`}
                      title={problem.notes ? "View Notes" : "Add Notes"}
                    >
                      📝
                    </button>
                  )}
                </div>
              </td>
              <td className={styles['col-tags']}>
                <div className={styles['tags-container']}>
                  {problem.tags.map((tag, idx) => (
                    <Tag key={idx} text={tag} />
                  ))}
                  {problem.isNew && (
                    <span className={styles['badge-new']}>NEWLY ADDED</span>
                  )}
                </div>
              </td>
              <td className={styles['col-difficulty']}>
                <span className={`${styles.difficulty} ${styles[problem.difficulty.toLowerCase()] || ''}`}>
                  {problem.difficulty}
                </span>
              </td>
              {isAdmin && (
                <td className={styles['col-actions']}>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <button 
                      onClick={() => onEdit?.(problem)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
                      title="Edit problem"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => onDelete?.(problem.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '4px' }}
                      title="Delete problem"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
