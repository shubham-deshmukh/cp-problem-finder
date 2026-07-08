import React, { useState, useEffect, useRef } from 'react';
import styles from './NotesDrawer.module.css';
import { type Problem } from '../types';

interface NotesDrawerProps {
  isOpen: boolean;
  problem: Problem | null;
  onClose: () => void;
  isAdmin: boolean;
  isSaving?: boolean;
  onSave?: (id: number, notes: string) => void;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  isOpen,
  problem,
  onClose,
  isAdmin,
  isSaving = false,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState<'preview' | 'write'>('preview');
  const drawerRef = useRef<HTMLDivElement>(null);

  // Sync state with selected problem
  useEffect(() => {
    if (problem) {
      setNoteText(problem.notes || '');
      // If there are no notes and user is admin, open in edit mode automatically
      if (!problem.notes && isAdmin) {
        setIsEditing(true);
        setActiveTab('write');
      } else {
        setIsEditing(false);
        setActiveTab('preview');
      }
    }
  }, [problem, isOpen, isAdmin]);

  // Handle clicking outside the drawer to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!problem) return null;

  const handleSave = () => {
    if (onSave) {
      onSave(problem.id, noteText);
    }
    setIsEditing(false);
    setActiveTab('preview');
  };

  const handleCancel = () => {
    setNoteText(problem.notes || '');
    setIsEditing(false);
    setActiveTab('preview');
  };

  // Simple, robust markdown parser to avoid external dependency issues
  const renderMarkdown = (md: string) => {
    if (!md.trim()) {
      return `<p class="${styles['no-notes']}">No notes or hints have been added to this problem yet.</p>`;
    }

    const lines = md.split(/\r?\n/);
    const blocks: string[] = [];
    
    let inCodeBlock = false;
    let codeLines: string[] = [];
    
    let inList = false;
    let listItems: string[] = [];
    
    let currentParagraph: string[] = [];

    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    };

    const parseInline = (text: string) => {
      let html = escapeHtml(text);
      // Inline code
      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
      // Bold (restricted to same line)
      html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
      // Italics (restricted to same line)
      html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
      // Links
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      return html;
    };

    const closeList = () => {
      if (inList) {
        blocks.push(`<ul>${listItems.join('')}</ul>`);
        inList = false;
        listItems = [];
      }
    };

    const closeParagraph = () => {
      if (currentParagraph.length > 0) {
        blocks.push(`<p>${currentParagraph.join('<br />')}</p>`);
        currentParagraph = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (inCodeBlock) {
        if (line.trim() === '```') {
          blocks.push(`<pre><code>${codeLines.join('\n')}</code></pre>`);
          inCodeBlock = false;
          codeLines = [];
        } else {
          codeLines.push(escapeHtml(line));
        }
        continue;
      }

      // Code block start
      if (line.trim().startsWith('```')) {
        closeList();
        closeParagraph();
        inCodeBlock = true;
        continue;
      }

      // Horizontal Rule
      if (/^\s*---+\s*$/.test(line)) {
        closeList();
        closeParagraph();
        blocks.push('<hr />');
        continue;
      }

      // Headings
      if (/^#+\s+/.test(line)) {
        closeList();
        closeParagraph();
        const level = line.match(/^(#+)/)?.[1].length || 1;
        const headingText = line.replace(/^#+\s+/, '');
        const hTag = level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5';
        blocks.push(`<${hTag}>${parseInline(headingText)}</${hTag}>`);
        continue;
      }

      // List items
      if (/^\s*[-*]\s+/.test(line)) {
        closeParagraph();
        inList = true;
        const itemText = line.replace(/^\s*[-*]\s+/, '');
        listItems.push(`<li>${parseInline(itemText)}</li>`);
        continue;
      }

      // Empty line (paragraph break)
      if (line.trim() === '') {
        closeList();
        closeParagraph();
        continue;
      }

      // Regular paragraph text line
      closeList();
      currentParagraph.push(parseInline(line));
    }

    // Close any remaining blocks
    closeList();
    closeParagraph();
    if (inCodeBlock && codeLines.length > 0) {
      blocks.push(`<pre><code>${codeLines.join('\n')}</code></pre>`);
    }

    return blocks.join('\n');
  };

  return (
    <div className={`${styles['drawer-overlay']} ${isOpen ? styles['open'] : ''}`}>
      <div 
        ref={drawerRef} 
        className={`${styles['drawer-content']} ${isOpen ? styles['open'] : ''}`}
      >
        <div className={styles['drawer-header']}>
          <div className={styles['header-title-area']}>
            <span className={styles['platform-badge']}>
              <img 
                src={`/icons/${problem.platform.toLowerCase()}.png`} 
                alt={problem.platform}
                className={styles['platform-icon']}
                onError={(e) => {
                  e.currentTarget.src = '/icons/default.png';
                }}
              />
              {problem.platform}
            </span>
            <h2 className={styles['problem-title']}>
              <a href={problem.link} target="_blank" rel="noopener noreferrer">
                {problem.title}
              </a>
            </h2>
            <span className={`${styles['difficulty-badge']} ${styles[problem.difficulty.toLowerCase()]}`}>
              {problem.difficulty}
            </span>
          </div>
          <button onClick={onClose} className={styles['close-btn']} aria-label="Close notes">
            &times;
          </button>
        </div>

        <div className={styles['drawer-body']}>
          {isAdmin && (
            <div className={styles['admin-toolbar']}>
              {!isEditing ? (
                <button 
                  onClick={() => {
                    setIsEditing(true);
                    setActiveTab('write');
                  }} 
                  className={styles['btn-edit']}
                >
                  ✏️ Edit Notes
                </button>
              ) : (
                <div className={styles['tab-group']}>
                  <button 
                    onClick={() => setActiveTab('write')} 
                    className={`${styles['tab-btn']} ${activeTab === 'write' ? styles['tab-active'] : ''}`}
                  >
                    Write
                  </button>
                  <button 
                    onClick={() => setActiveTab('preview')} 
                    className={`${styles['tab-btn']} ${activeTab === 'preview' ? styles['tab-active'] : ''}`}
                  >
                    Preview
                  </button>
                </div>
              )}

              {isSaving && <span className={styles['saving-indicator']}>Saving changes...</span>}
            </div>
          )}

          <div className={styles['note-content-container']}>
            {isEditing && activeTab === 'write' ? (
              <div className={styles['editor-wrapper']}>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className={styles['note-textarea']}
                  placeholder="Add notes, corner cases, code snippets, or editorials for this problem. Markdown is supported..."
                />
                <div className={styles['editor-cheatsheet']}>
                  <span>💡 <strong>Markdown hints:</strong> **bold**, `code`, # Heading, - List, [Link](url)</span>
                </div>
              </div>
            ) : (
              <div 
                className={styles['markdown-preview']}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(noteText) }}
              />
            )}
          </div>
        </div>

        {isEditing && (
          <div className={styles['drawer-footer']}>
            <button onClick={handleCancel} className={styles['btn-cancel']} disabled={isSaving}>
              Cancel
            </button>
            <button onClick={handleSave} className={styles['btn-save']} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
