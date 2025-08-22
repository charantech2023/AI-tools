
import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
    <div className="w-12 h-12 border-4 border-t-indigo-500 border-gray-600 rounded-full animate-spin"></div>
    <p className="text-gray-400 font-medium text-lg">AI is analyzing the webpage...</p>
    <p className="text-gray-500 text-sm">This may take a moment.</p>
  </div>
);
