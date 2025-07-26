// path: src/modules/help/components/HelpSearch.tsx
import React from 'react';
import { Search, X } from 'lucide-react';

interface HelpSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const HelpSearch: React.FC<HelpSearchProps> = ({
  value,
  onChange,
  placeholder = "Rechercher dans l'aide..."
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
      </div>
      
      <input
        type="text"
        data-testid="help-search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-950 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-colors"
        autoComplete="off"
      />
      
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
          aria-label="Effacer la recherche"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};