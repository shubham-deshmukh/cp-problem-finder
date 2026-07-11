import React from 'react';
import { FileText, Pencil, Trash2, Search } from 'lucide-react';
import { Tag } from './Tag';
import { type Problem } from '../types';
import { Button } from './ui/button';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ProblemTableProps {
  problems: Problem[];
  onEdit?: (problem: Problem) => void;
  onDelete?: (id: number) => void;
  onShowNotes?: (problem: Problem) => void;
  isAdmin?: boolean;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({
  problems,
  onEdit,
  onDelete,
  onShowNotes,
  isAdmin,
}) => {
  
  if (problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-xl bg-card my-4 font-geist text-foreground animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3 select-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground font-space-grotesk">No matching problems</h3>
        <p className="text-xs text-muted-foreground mt-1.5 max-w-[280px] leading-relaxed select-none">
          Try adjusting your search terms or checking for typos.
        </p>
      </div>
    );
  }

  const difficultyStyles: Record<string, string> = {
    easy: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20',
    medium: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20',
    hard: 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20',
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-xs font-geist">
      <table className="w-full border-collapse text-left text-sm text-foreground">
        <thead>
          <tr className="bg-muted/30 border-b border-border/80">
            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-[15%]">Platform</th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-[35%]">Title</th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-[35%]">Tags</th>
            <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-[15%]">Difficulty</th>
            {isAdmin && (
              <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 w-[80px]">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {problems.map((problem, index) => {
            const diffKey = problem.difficulty.toLowerCase();
            const diffClass = difficultyStyles[diffKey] || difficultyStyles.easy;

            return (
              <tr key={problem.id} className="group border-b border-border last:border-0 hover:bg-[#d5e6f7] dark:hover:bg-[#151515] transition-colors">
                <td className="px-4 py-4 align-middle">
                  <div className="flex items-center gap-2">
                    <img 
                      src={`/icons/${problem.platform.toLowerCase()}.png`} 
                      alt={`${problem.platform} logo`} 
                      className="w-5 h-5 rounded-md object-contain shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = '/icons/default.png';
                        e.currentTarget.onerror = null;
                      }}
                    />
                    <span className="font-semibold text-foreground/85 dark:text-muted-foreground group-hover:text-foreground dark:group-hover:text-primary text-xs sm:text-sm hidden sm:inline transition-colors">
                      {problem.platform}
                    </span>
                  </div>
                </td>
                
                <td className="px-4 py-4 align-middle">
                  <div className="flex items-center gap-2">
                    <a 
                      href={problem.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-foreground/85 dark:text-muted-foreground group-hover:text-foreground dark:group-hover:text-primary transition-colors font-medium text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs"
                    >
                      {problem.title}
                    </a>
                    {(problem.notes || isAdmin) && (
                      <Button 
                        id={index === 0 ? "tour-notes-btn" : undefined}
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowNotes?.(problem);
                        }}
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 rounded-md cursor-pointer flex items-center justify-center p-0 transition-all ${
                          problem.notes 
                            ? 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/15 hover:bg-amber-500/20' 
                            : 'text-muted-foreground/45 hover:text-foreground hover:bg-muted/50'
                        }`}
                        title={problem.notes ? "View Notes" : "Add Notes"}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4 align-middle">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {problem.tags.length <= 3 ? (
                      problem.tags.map((tag, idx) => (
                        <Tag key={idx} text={tag} />
                      ))
                    ) : (
                      <>
                        {/* First 3 tags always visible (matching reference repo) */}
                        {problem.tags.slice(0, 3).map((tag, idx) => (
                          <Tag key={idx} text={tag} />
                        ))}
                        
                        {/* Radix UI Tooltip Portal to prevent cutoffs */}
                        <Tooltip.Provider delayDuration={150}>
                          <Tooltip.Root>
                            <Tooltip.Trigger asChild>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs border border-border select-none cursor-help font-semibold hover:text-foreground transition-colors">
                                +{problem.tags.length - 3}
                              </span>
                            </Tooltip.Trigger>
                            <Tooltip.Portal>
                              <Tooltip.Content 
                                className="bg-card border border-border rounded-lg shadow-xl px-3 py-2 z-50 max-w-xs animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1.5"
                                side="top"
                                align="center"
                                sideOffset={6}
                              >
                                <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground select-none border-b border-border pb-1">
                                  More tags
                                </span>
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {problem.tags.slice(3).map((tag, idx) => (
                                    <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-foreground text-[10px] font-semibold border border-border/40 whitespace-nowrap">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <Tooltip.Arrow className="fill-card stroke-border stroke-[1px] -mt-[0.5px]" width={11} height={5} />
                              </Tooltip.Content>
                            </Tooltip.Portal>
                          </Tooltip.Root>
                        </Tooltip.Provider>
                      </>
                    )}
                    {problem.isNew && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-500/20 dark:bg-emerald-500/25 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
                        New
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4 align-middle">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${diffClass}`}>
                    {problem.difficulty}
                  </span>
                </td>

                {isAdmin && (
                  <td className="px-4 py-4 align-middle text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer rounded-lg border-0"
                        onClick={() => onEdit?.(problem)}
                        title="Edit problem"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer rounded-lg border-0"
                        onClick={() => onDelete?.(problem.id)}
                        title="Delete problem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default ProblemTable;
