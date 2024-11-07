import React from 'react';
import { X } from 'lucide-react';
import { CANCER_TYPES, ARTICLE_TYPES, Filters } from '../types';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function FilterPanel({ isOpen, onClose, filters, onFiltersChange }: FilterPanelProps) {
  if (!isOpen) return null;

  const handleCancerTypeToggle = (type: string) => {
    const newTypes = filters.cancerTypes.includes(type)
      ? filters.cancerTypes.filter(t => t !== type)
      : [...filters.cancerTypes, type];
    onFiltersChange({ ...filters, cancerTypes: newTypes });
  };

  const handleArticleTypeToggle = (type: string) => {
    const newTypes = filters.articleTypes.includes(type)
      ? filters.articleTypes.filter(t => t !== type)
      : [...filters.articleTypes, type];
    onFiltersChange({ ...filters, articleTypes: newTypes });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Cancer Types</h3>
              <div className="space-y-2">
                {CANCER_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.cancerTypes.includes(type)}
                      onChange={() => handleCancerTypeToggle(type)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Article Types</h3>
              <div className="space-y-2">
                {ARTICLE_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.articleTypes.includes(type)}
                      onChange={() => handleArticleTypeToggle(type)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => onFiltersChange({ cancerTypes: [], articleTypes: [] })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear all
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}