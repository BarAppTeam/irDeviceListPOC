import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        // Prevent slash from typing inside input
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8 group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-400 transition-colors duration-200">
        <Search className="w-5 h-5" />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search devices, keys, or IR codes... (Press '/' to focus)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-16 py-3.5 bg-slate-900/60 backdrop-blur-md border border-slate-800 text-slate-200 placeholder-slate-500 rounded-2xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 shadow-glow-primary transition-all duration-300"
      />
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
        {value ? (
          <button
            onClick={() => onChange('')}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-200"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-800/80 border border-slate-700/50 rounded shadow-sm select-none">
            /
          </kbd>
        )}
      </div>
    </div>
  );
};
