
import React, { useState } from 'react';
import { AnalysisResult as AnalysisResultType } from './types';
import { fetchAndParseUrl, analyzeWebpageContent } from './services/geminiService';
import { URLInputForm } from './components/URLInputForm';
import { AnalysisResult } from './components/AnalysisResult';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { SparklesIcon } from './components/icons/SparklesIcon';

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("Please enter a valid URL.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const { textContent, existingLinks } = await fetchAndParseUrl(url);
      const result = await analyzeWebpageContent(textContent, existingLinks);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const WelcomeMessage: React.FC = () => (
    <div className="text-center max-w-2xl mx-auto p-8 bg-gray-800/30 rounded-xl border border-gray-700 backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-gray-200 mb-2">Welcome to the AI Webpage Analyzer</h2>
      <p className="text-gray-400">
        Paste a URL above to get an instant, AI-powered content and SEO analysis. The tool will provide the page's core intent, suggest internal links, find relevant stats, and generate a ready-to-use AI summary.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-dots-pattern bg-gray-900 font-sans p-4 sm:p-8">
      <style>{`
        .bg-dots-pattern {
          background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0);
          background-size: 2rem 2rem;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
      <div className="container mx-auto flex flex-col items-center gap-8">
        <header className="text-center">
          <div className="flex justify-center items-center gap-3 mb-2">
            <SparklesIcon className="w-10 h-10 text-indigo-400" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              AI Webpage Analyzer
            </h1>
          </div>
          <p className="text-lg text-gray-400">Get instant content insights with Gemini</p>
        </header>

        <URLInputForm 
          url={url} 
          setUrl={setUrl} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />

        <main className="w-full mt-4">
          {isLoading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {analysis && <AnalysisResult data={analysis} />}
          {!isLoading && !error && !analysis && <WelcomeMessage />}
        </main>
      </div>
    </div>
  );
};

export default App;