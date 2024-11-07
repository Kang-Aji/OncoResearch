import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="mt-2 text-sm text-gray-600">Loading articles...</p>
    </div>
  );
}