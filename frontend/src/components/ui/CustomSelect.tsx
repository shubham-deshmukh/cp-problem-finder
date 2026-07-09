import React, { useState, useEffect, useRef } from 'react';

interface CustomSelectProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = 'Select option...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-card px-3 py-1 text-sm shadow-xs transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground text-left cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none border-border"
      >
        <span className="truncate text-foreground/90">
          {value || placeholder}
        </span>
        <span className="text-muted-foreground text-[10px] select-none ml-2 shrink-0">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-lg shadow-lg z-50 py-1 overflow-y-auto max-h-[220px] animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer border-0 bg-transparent hover:bg-muted/60 flex items-center justify-between ${
                value === option 
                  ? 'text-primary font-semibold bg-primary/5' 
                  : 'text-foreground'
              }`}
            >
              <span className="truncate">{option}</span>
              {value === option && (
                <span className="text-primary text-[10px] shrink-0 font-bold">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default CustomSelect;
