import React, { useState } from 'react';
import { refineProductText } from '../services/geminiService';
import { RefinedData } from '../types';
import { ResultCard } from './ResultCard';

export const SingleRefiner: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<RefinedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRefine = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const data = await refineProductText(inputText);
      setResult(data);
    } catch (err) {
      setError('Failed to refine text. Please check your connection or try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Input Column */}
      <div className="flex flex-col h-full">
        <div className="bg-white p-1 rounded-t-xl border-x border-t border-slate-200 flex justify-between items-center px-4 py-3">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Original Product Text
          </h2>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Paste Content</span>
        </div>
        <div className="flex-1 relative">
            <textarea
            className="w-full h-full p-4 resize-none border-x border-b border-slate-200 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 leading-relaxed text-sm font-mono"
            placeholder="Paste your raw tourism product description here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            />
        </div>
        <div className="mt-4">
            <button
                onClick={handleRefine}
                disabled={isProcessing || !inputText.trim()}
                className={`w-full py-3 rounded-lg font-medium shadow-lg transition-all flex items-center justify-center gap-2
                ${isProcessing || !inputText.trim() 
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30 active:scale-[0.99]'}`}
            >
                {isProcessing ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Refining with Gemini 3 Pro...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Refine Experience
                    </>
                )}
            </button>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>
      </div>

      {/* Output Column */}
      <div className="flex flex-col h-full min-h-[500px]">
        {result ? (
          <ResultCard originalText={inputText} data={result} />
        ) : (
          <div className="h-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 p-8 bg-slate-50/50">
            <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">Refined content and audit log will appear here.</p>
            <p className="text-xs text-slate-400 mt-2 text-center max-w-xs">
                Gemini will analyze your text to improve persuasion while maintaining 100% factual integrity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};