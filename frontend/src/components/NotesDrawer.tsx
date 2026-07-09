import React, { useState, useEffect, useRef } from 'react';
import { Pencil, X, BookOpen } from 'lucide-react';
import { type Problem } from '../types';
import { Button } from './ui/button';

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
      return '';
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
      html = html.replace(/`([^`]+)`/g, '<code class="bg-muted text-xs font-mono px-1.5 py-0.5 rounded border border-border/50">$1</code>');
      // Bold (restricted to same line)
      html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>');
      // Italics (restricted to same line)
      html = html.replace(/\*([^*\n]+)\*/g, '<em class="italic text-foreground/90">$1</em>');
      // Links
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline underline-offset-2">$1</a>');
      return html;
    };

    const closeList = () => {
      if (inList) {
        blocks.push(`<ul class="list-disc pl-5 mb-4 flex flex-col gap-1.5 text-sm">${listItems.join('')}</ul>`);
        inList = false;
        listItems = [];
      }
    };

    const closeParagraph = () => {
      if (currentParagraph.length > 0) {
        blocks.push(`<p class="mb-4 text-sm leading-relaxed">${currentParagraph.join('<br />')}</p>`);
        currentParagraph = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (inCodeBlock) {
        if (line.trim() === '```') {
          blocks.push(`<pre class="bg-muted/50 border border-border/80 rounded-lg p-3 overflow-x-auto mb-4 font-mono text-xs text-foreground"><code>${codeLines.join('\n')}</code></pre>`);
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
        blocks.push('<hr class="border-t border-border my-4" />');
        continue;
      }

      // Headings
      if (/^#+\s+/.test(line)) {
        closeList();
        closeParagraph();
        const level = line.match(/^(#+)/)?.[1].length || 1;
        const headingText = line.replace(/^#+\s+/, '');
        const hTag = level === 1 ? 'h3' : level === 2 ? 'h4' : 'h5';
        const classes = level === 1 
          ? 'text-lg font-bold text-foreground mt-5 mb-2.5 font-space-grotesk' 
          : level === 2 
            ? 'text-base font-bold text-foreground mt-4 mb-2 font-space-grotesk' 
            : 'text-sm font-semibold text-foreground mt-3.5 mb-1.5';
        blocks.push(`<${hTag} class="${classes}">${parseInline(headingText)}</${hTag}>`);
        continue;
      }

      // List items
      if (/^\s*[-*]\s+/.test(line)) {
        closeParagraph();
        inList = true;
        const itemText = line.replace(/^\s*[-*]\s+/, '');
        listItems.push(`<li class="leading-relaxed">${parseInline(itemText)}</li>`);
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
      blocks.push(`<pre class="bg-muted/50 border border-border/80 rounded-lg p-3 overflow-x-auto mb-4 font-mono text-xs text-foreground"><code>${codeLines.join('\n')}</code></pre>`);
    }

    return blocks.join('\n');
  };

  const difficultyStyles: Record<string, string> = {
    easy: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20',
    medium: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20',
    high: 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20',
  };
  const diffKey = problem.difficulty.toLowerCase();
  const diffClass = difficultyStyles[diffKey] || difficultyStyles.easy;

  const htmlPreviewContent = renderMarkdown(noteText);
  const isNotesEmpty = !noteText.trim();

  return (
    <>
      {/* Overlay Backdrop */}
      <div 
        className={`fixed inset-0 bg-neutral-950/40 backdrop-blur-xs z-[99] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      />

      {/* Drawer Container */}
      <div 
        ref={drawerRef} 
        className={`fixed top-0 right-0 w-full h-full bg-card border-l border-border shadow-2xl flex flex-col z-[100] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isEditing ? 'max-w-[960px]' : 'max-w-[480px]'
        } font-geist text-foreground`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-start gap-4 shrink-0">
          <div className="flex flex-col gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground font-space-grotesk">
              <img 
                src={`/icons/${problem.platform.toLowerCase()}.png`} 
                alt={problem.platform}
                className="w-4 h-4 object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/icons/default.png';
                }}
              />
              {problem.platform}
            </span>
            <h2 className="text-lg font-bold tracking-tight text-foreground font-space-grotesk leading-snug">
              <a href={problem.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">
                {problem.title}
              </a>
            </h2>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase self-start ${diffClass}`}>
              {problem.difficulty}
            </span>
          </div>
          <Button 
            onClick={onClose} 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center p-0 rounded-lg hover:bg-muted/50 transition-colors border-0" 
            aria-label="Close notes"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 min-h-0">
          {isAdmin && !isNotesEmpty && (
            <div className="flex justify-between items-center pb-3 border-b border-dashed border-border/80 shrink-0">
              {!isEditing ? (
                <Button 
                  onClick={() => {
                    setIsEditing(true);
                    setActiveTab('write');
                  }} 
                  variant="secondary"
                  className="rounded-full gap-2 px-4 py-1.5 h-8 font-semibold text-xs cursor-pointer shadow-xs animate-in fade-in duration-200"
                >
                  <Pencil className="h-3 w-3" /> Edit Notes
                </Button>
              ) : (
                /* Mobile Tab Selector (Hidden on desktop splitscreen) */
                <div className="flex md:hidden bg-muted/40 p-0.5 rounded-full border border-border">
                  <button 
                    onClick={() => setActiveTab('write')} 
                    className={`px-4 py-1 text-xs font-semibold rounded-full transition-all border-0 bg-transparent cursor-pointer ${
                      activeTab === 'write' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Write
                  </button>
                  <button 
                    onClick={() => setActiveTab('preview')} 
                    className={`px-4 py-1 text-xs font-semibold rounded-full transition-all border-0 bg-transparent cursor-pointer ${
                      activeTab === 'preview' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Preview
                  </button>
                </div>
              )}

              {isSaving && <span className="text-xs text-muted-foreground/60 italic animate-pulse">Saving changes...</span>}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-h-0">
            {isNotesEmpty && !isEditing ? (
              /* Beautiful Empty State */
              <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/80 rounded-xl bg-muted/5 my-auto shrink-0 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground font-space-grotesk">No revision notes yet</h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-[280px] leading-relaxed">
                  Record complexity observations, hints, corner cases, and editorials to review CP patterns.
                </p>
                {isAdmin && (
                  <Button 
                    onClick={() => {
                      setIsEditing(true);
                      setActiveTab('write');
                    }}
                    variant="secondary"
                    className="mt-4 h-8 px-4 font-semibold text-xs rounded-full gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Pencil className="h-3 w-3" /> Write Notes
                  </Button>
                )}
              </div>
            ) : isEditing ? (
              /* Edit Mode: Responsive Split Screen */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Left Panel: Markdown Textarea Editor */}
                <div className={`flex-col gap-2 min-h-0 ${activeTab === 'write' ? 'flex' : 'hidden md:flex'}`}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground select-none shrink-0 mb-1">
                    Markdown Notes
                  </div>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="flex-1 w-full min-h-[250px] bg-muted/20 border border-input focus:border-primary focus:ring-1 focus:ring-ring rounded-lg p-3 text-sm outline-none text-foreground placeholder:text-muted-foreground/50 resize-none leading-relaxed transition-all font-mono"
                    placeholder="Add notes, corner cases, code snippets, or editorials for this problem. Markdown is supported..."
                  />
                  <div className="text-[11px] text-muted-foreground/60 flex gap-1 items-center shrink-0 mt-1 select-none">
                    <span>💡 <strong>Markdown:</strong> **bold**, `code`, # Heading, - List, [Link](url)</span>
                  </div>
                </div>

                {/* Right Panel: Live HTML Preview */}
                <div className={`flex-col gap-2 min-h-0 md:border-l md:border-border/60 md:pl-6 ${activeTab === 'preview' ? 'flex' : 'hidden md:flex'}`}>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground select-none shrink-0 mb-1">
                    Live Preview
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-[250px] bg-muted/5 border border-dashed border-border/80 rounded-lg p-4">
                    {htmlPreviewContent ? (
                      <div 
                        className="markdown-preview text-foreground leading-relaxed select-text"
                        dangerouslySetInnerHTML={{ __html: htmlPreviewContent }}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground/40 italic">Preview will appear as you type...</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Normal Reading/Preview Mode */
              <div 
                className="markdown-preview text-foreground overflow-y-auto leading-relaxed select-text pr-1"
                dangerouslySetInnerHTML={{ __html: htmlPreviewContent }}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="p-6 border-t border-border flex justify-end gap-3 shrink-0 bg-card/50">
            <Button 
              onClick={handleCancel} 
              variant="outline" 
              className="rounded-full cursor-pointer h-9 px-5 py-1.5 text-xs font-semibold"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="rounded-full cursor-pointer h-9 px-5 py-1.5 text-xs font-semibold"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Notes'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
export default NotesDrawer;
