import React from 'react';
import { Button } from './ui/button';

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full p-6 md:p-8 flex flex-col gap-6 m-auto animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 text-foreground">
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-muted/40 border border-border rounded-full flex items-center justify-center mb-1 shadow-sm">
            <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-space-grotesk text-foreground">
            Welcome to CP Problem Finder
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg leading-relaxed">
            Organize competitive programming patterns, track solved problems, and instantly search similar problems using tag-based filtering.
          </p>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 text-center">
          Choose how you'd like to explore:
        </p>

        {/* Choice Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
          {/* Card 1: Personal Account */}
          <div className="bg-muted/10 border border-border/50 rounded-xl p-5 flex flex-col gap-4 transition-all duration-200 hover:bg-muted/20 hover:border-border hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">👤</span>
              <h3 className="text-sm md:text-base font-semibold text-foreground">
                Personal Account (Google Sign-In)
              </h3>
            </div>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-xs md:text-sm text-muted-foreground leading-normal">
              <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
                Read-only access to the public problem directory
              </li>
              <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
                Search, browse, and filter problems
              </li>
              <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
                Personalized dashboard & patterns <span className="text-[10px] bg-muted/50 text-muted-foreground px-1.5 py-0.5 rounded ml-1 font-medium">Coming Soon</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Demo Sandbox */}
          <div className="bg-muted/10 border border-border/50 rounded-xl p-5 flex flex-col gap-4 transition-all duration-200 hover:bg-muted/20 hover:border-border hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🚀</span>
              <h3 className="text-sm md:text-base font-semibold text-foreground">
                Demo Workspace (Guest Mode)
              </h3>
            </div>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-xs md:text-sm text-muted-foreground leading-normal">
              <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
                Full Admin privileges (Add, Edit, and Delete problems)
              </li>
              <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
                Dynamic, session-isolated database sandbox
              </li>
              <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-primary before:font-bold">
                Safe sandbox (changes reset instantly on logout or after 15 mins)
              </li>
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mt-2">
          <Button onClick={onClose} size="lg" className="px-8 min-w-[140px] font-semibold font-space-grotesk cursor-pointer">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};
