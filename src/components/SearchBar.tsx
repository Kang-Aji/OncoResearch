import React, { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, History, X } from 'lucide-react';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onFilterClick: () => void;
  activeFiltersCount: number;
}

export function SearchBar({
  query,
  onQueryChange,
  onFilterClick,
  activeFiltersCount
}: SearchBarProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim() && !searchHistory.includes(searchQuery)) {
      const newHistory = [searchQuery, ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
    onQueryChange(searchQuery);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <div className="relative flex gap-3 w-full max-w-3xl mx-auto" ref={searchRef}>
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={() => setShowHistory(true)}
          placeholder="Search oncology articles..."
          className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-transparent focus:border-primary focus:ring-0 outline-none text-lg shadow-sm"
        />
        
        {/* Search History Dropdown */}
        {showHistory && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
            <div className="p-2 flex justify-between items-center border-b">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Searches
              </span>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear All
              </button>
            </div>
            <ul>
              {searchHistory.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSearch(item)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <History className="w-4 h-4 text-gray-400" />
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button
        onClick={onFilterClick}
        className="px-6 py-3 bg-primary hover:bg-primary-light text-white rounded-lg flex items-center gap-2 relative transition-colors shadow-sm"
      >
        <SlidersHorizontal className="w-5 h-5" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold">
            {activeFiltersCount}
          </span>
        )}
      </button>
    </div>
  );
}