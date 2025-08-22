
import React from 'react';
import { AnalyzeIcon } from './icons/AnalyzeIcon';

interface URLInputFormProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const URLInputForm: React.FC<URLInputFormProps> = ({ url, setUrl, onSubmit, isLoading }) => {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center bg-gray-800/50 border border-gray-700 rounded-full shadow-lg backdrop-blur-sm overflow-hidden">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/page-to-analyze"
          className="w-full bg-transparent text-gray-200 placeholder-gray-500 py-3 px-6 focus:outline-none"
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 text-white font-semibold rounded-full px-6 py-2.5 m-1.5 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
        >
          <AnalyzeIcon className="w-5 h-5" />
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </form>
  );
};
