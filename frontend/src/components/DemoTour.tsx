import React, { useState } from 'react';
import { Search, Sparkles, PartyPopper, CheckCircle2, Circle } from 'lucide-react';
import { Button } from './ui/button';

export interface TourProgress {
  search: boolean;
  theme: boolean;
  add: boolean;
  notes: boolean;
}

interface DemoTourProps {
  progress: TourProgress;
}

export const DemoTour: React.FC<DemoTourProps> = ({ progress }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return sessionStorage.getItem('demo_tour_collapsed') === 'true';
  });
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('demo_tour_dismissed') === 'true';
  });
  const [activeSpotlight, setActiveSpotlight] = useState<boolean>(false);

  // Persist collapse state
  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    sessionStorage.setItem('demo_tour_collapsed', String(nextState));
  };

  // Persist dismiss state
  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('demo_tour_dismissed', 'true');
  };

  // Pulse element locator logic
  const handleLocate = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    const element = document.getElementById(elementId);
    if (element) {
      // Trigger background spotlight dim/blur overlay
      setActiveSpotlight(true);

      // Clear any existing class first
      element.classList.remove('tour-pulse');
      // Trigger browser reflow to reset CSS animation
      void element.offsetWidth;
      // Add animation class
      element.classList.add('tour-pulse');
      
      // Scroll into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Remove after 3 seconds
      setTimeout(() => {
        element.classList.remove('tour-pulse');
        setActiveSpotlight(false);
      }, 3000);
    }
  };

  if (isDismissed) return null;

  const totalSteps = 4;
  const completedCount = [
    progress.search,
    progress.theme,
    progress.add,
    progress.notes
  ].filter(Boolean).length;
  const progressPercent = (completedCount / totalSteps) * 100;
  const isAllCompleted = completedCount === totalSteps;

  if (isCollapsed) {
    return (
      <div 
        className="flex items-center justify-between bg-card border border-primary/25 rounded-xl px-5 py-3 mb-6 shadow-xs cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 font-geist text-foreground select-none" 
        onClick={toggleCollapse}
      >
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-foreground font-space-grotesk">
          <Sparkles className="h-4 w-4 text-[#ffa116]" />
          <span>Demo Workspace Guide ({completedCount}/{totalSteps} completed)</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[10px] sm:text-xs font-bold text-primary hover:bg-primary/10 rounded-md py-1 h-auto cursor-pointer border-0"
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse();
          }}
        >
          Expand Guide ▾
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Fullscreen Spotlight Dimmer Background */}
      {activeSpotlight && (
        <div className="fixed inset-0 bg-neutral-950/30 backdrop-blur-[2px] z-40 pointer-events-none animate-in fade-in duration-300" />
      )}

      <div className="relative bg-card border border-border rounded-xl p-5 md:p-6 mb-6 shadow-xs overflow-hidden transition-all duration-300 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-linear-to-r before:from-[#ffa116] before:via-[#ff9345] before:to-[#ff3d00] font-geist text-foreground">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="flex items-center gap-2 text-sm sm:text-base font-bold tracking-tight font-space-grotesk text-foreground">
            <Sparkles className="h-4 w-4 text-[#ffa116]" /> Demo Workspace Guide
          </h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs font-bold text-primary hover:bg-primary/10 rounded-md py-1 h-auto cursor-pointer border-0" 
            onClick={toggleCollapse}
          >
            Collapse Guide ▴
          </Button>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
          Welcome to the isolated guest sandbox! Try performing the actions below to see how 
          <strong> CP Problem Finder</strong> helps you organize and query Data Structures & Algorithms patterns.
        </p>

        {/* Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          
          {/* Step 1: Search */}
          <div className={`bg-muted/10 border rounded-xl p-4 flex flex-col justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 ${
            progress.search ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/60 hover:border-primary/20'
          }`}>
            <div className="flex items-start gap-2.5">
              {progress.search ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-4.5 w-4.5 text-muted-foreground/45 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">1. Fuzzy Search</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Type an algorithm or keyword (e.g., "graph") in the search bar.
                </p>
              </div>
            </div>
            {!progress.search && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] font-bold tracking-wider uppercase cursor-pointer self-start gap-1 rounded-md px-2.5 py-1 border-border/80 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5"
                onClick={(e) => handleLocate(e, 'tour-search-bar')}
              >
                <Search className="h-3 w-3" /> Locate
              </Button>
            )}
          </div>

          {/* Step 2: Theme */}
          <div className={`bg-muted/10 border rounded-xl p-4 flex flex-col justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 ${
            progress.theme ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/60 hover:border-primary/20'
          }`}>
            <div className="flex items-start gap-2.5">
              {progress.theme ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-4.5 w-4.5 text-muted-foreground/45 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">2. Toggle Theme</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Toggle between Light and Dark mode using the sun/moon button.
                </p>
              </div>
            </div>
            {!progress.theme && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] font-bold tracking-wider uppercase cursor-pointer self-start gap-1 rounded-md px-2.5 py-1 border-border/80 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5"
                onClick={(e) => handleLocate(e, 'tour-theme-btn')}
              >
                <Search className="h-3 w-3" /> Locate
              </Button>
            )}
          </div>

          {/* Step 3: Add Problem */}
          <div className={`bg-muted/10 border rounded-xl p-4 flex flex-col justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 ${
            progress.add ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/60 hover:border-primary/20'
          }`}>
            <div className="flex items-start gap-2.5">
              {progress.add ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-4.5 w-4.5 text-muted-foreground/45 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">3. Add Problem</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Click the floating button in the corner and submit a problem URL.
                </p>
              </div>
            </div>
            {!progress.add && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] font-bold tracking-wider uppercase cursor-pointer self-start gap-1 rounded-md px-2.5 py-1 border-border/80 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5"
                onClick={(e) => handleLocate(e, 'tour-add-btn')}
              >
                <Search className="h-3 w-3" /> Locate
              </Button>
            )}
          </div>

          {/* Step 4: Write Notes */}
          <div className={`bg-muted/10 border rounded-xl p-4 flex flex-col justify-between gap-3 transition-all duration-200 hover:-translate-y-0.5 ${
            progress.notes ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border/60 hover:border-primary/20'
          }`}>
            <div className="flex items-start gap-2.5">
              {progress.notes ? (
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-4.5 w-4.5 text-muted-foreground/45 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">4. Write Revision Notes</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Click the document icon on any problem, write notes, and save changes.
                </p>
              </div>
            </div>
            {!progress.notes && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] font-bold tracking-wider uppercase cursor-pointer self-start gap-1 rounded-md px-2.5 py-1 border-border/80 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5"
                onClick={(e) => handleLocate(e, 'tour-notes-btn')}
              >
                <Search className="h-3 w-3" /> Locate
              </Button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border select-none">
          <span className="text-xs font-semibold text-muted-foreground shrink-0">
            Completion Progress: {completedCount}/{totalSteps}
          </span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-[#ffa116] via-[#ff9345] to-[#ff3d00] rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Celebration Panel */}
        {isAllCompleted && (
          <div className="bg-linear-to-br from-[#ffa116]/5 via-[#ff9345]/5 to-transparent border border-[#ff9345]/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex-1">
              <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5 font-space-grotesk">
                <PartyPopper className="h-4 w-4 text-[#ffa116]" /> Tour Complete!
              </h4>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed">
                You've successfully explored the core features of the CP Problem Finder sandbox.
                Feel free to keep testing, or log in with Google to start cataloging your real DSA library!
              </p>
            </div>
            <Button 
              onClick={handleDismiss} 
              size="sm" 
              className="cursor-pointer shrink-0 min-w-[125px] font-semibold text-xs rounded-full"
            >
              Dismiss Guide
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
export default DemoTour;
