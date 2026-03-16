import React, { useState } from 'react';
import { RefinedData, GroundingResult } from '../types';
import { verifyLocationWithMaps, checkFactsWithSearch } from '../services/geminiService';

interface ResultCardProps {
  originalText: string;
  data: RefinedData;
}

export const ResultCard: React.FC<ResultCardProps> = ({ originalText, data }) => {
  const [activeTab, setActiveTab] = useState<'refined' | 'audit' | 'original'>('refined');
  const [groundingResult, setGroundingResult] = useState<GroundingResult | null>(null);
  const [loadingGrounding, setLoadingGrounding] = useState(false);

  const handleVerifyLocation = async () => {
    setLoadingGrounding(true);
    setGroundingResult(null);
    try {
      const result = await verifyLocationWithMaps(data.headline);
      setGroundingResult({ source: 'maps', data: result.text, uris: result.uris });
    } finally {
      setLoadingGrounding(false);
    }
  };

  const handleFactCheck = async () => {
    setLoadingGrounding(true);
    setGroundingResult(null);
    try {
        const result = await checkFactsWithSearch(data.openingParagraph);
        setGroundingResult({ source: 'search', data: result.text, uris: result.uris });
    } finally {
        setLoadingGrounding(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{data.headline}</h2>
          <p className="text-sm text-indigo-600 font-bold uppercase tracking-widest mt-1">Refined by iFriend AI</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleVerifyLocation}
            disabled={loadingGrounding}
            className="text-[10px] font-bold uppercase tracking-wider px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            Local Check
          </button>
          <button
            onClick={handleFactCheck}
            disabled={loadingGrounding}
            className="text-[10px] font-bold uppercase tracking-wider px-4 py-2 bg-slate-800 text-white rounded-lg shadow-md hover:bg-slate-900 transition disabled:opacity-50"
          >
             Fact Check
          </button>
        </div>
      </div>

      {/* Grounding result pop-over */}
      {groundingResult && (
        <div className="bg-slate-900 text-slate-100 p-6 text-xs animate-slide-down border-b border-white/10">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold uppercase tracking-[0.2em] text-indigo-400">{groundingResult.source} Intelligence</span>
            <button onClick={() => setGroundingResult(null)} className="hover:text-white transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="leading-relaxed opacity-90 text-sm mb-4">{groundingResult.data}</p>
          <div className="flex flex-wrap gap-2">
             {groundingResult.uris?.map((u, i) => (
               <a key={i} href={u.uri} target="_blank" rel="noreferrer" className="bg-white/10 px-3 py-1.5 rounded-md border border-white/5 hover:bg-white/20 transition truncate max-w-[240px]">
                 {u.title}
               </a>
             ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-slate-50 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('refined')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'refined' ? 'bg-white text-indigo-600 border-t-4 border-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
        >
          Refined
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'audit' ? 'bg-white text-indigo-600 border-t-4 border-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
        >
          Audit Log
        </button>
        <button
          onClick={() => setActiveTab('original')}
          className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'original' ? 'bg-white text-indigo-600 border-t-4 border-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
        >
          Original
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-10 overflow-y-auto flex-1 bg-white">
        {activeTab === 'refined' && (
          <div className="space-y-10 max-w-3xl mx-auto">
            
            {/* 1. Headline (Shown in header, but repeated here for flow) */}
            <div className="border-b border-slate-100 pb-6">
               <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Headline</h3>
               <p className="text-2xl font-bold text-slate-800">{data.headline}</p>
            </div>

            {/* 2. Opening Paragraph */}
            <div>
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Abertura</h3>
               <p className="text-lg text-slate-700 leading-relaxed font-medium italic">
                 {data.openingParagraph}
               </p>
            </div>

            {/* 3. O que esperar */}
            <div>
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">O que esperar</h3>
               <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(data.whatToExpect) }} />
            </div>

            {/* 4. Destaques */}
            <div>
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Destaques</h3>
               <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {data.highlights.map((h, i) => (
                   <li key={i} className="flex items-start gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                     <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                     <span className="text-sm font-medium">{h}</span>
                   </li>
                 ))}
               </ul>
            </div>

            {/* 5. Informações Importantes */}
            {data.importantInfo && (
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50">
                 <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-4">Informações Importantes</h3>
                 <div className="prose prose-sm text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMarkdown(data.importantInfo) }} />
              </div>
            )}

            {/* 6. Ideal Para */}
            <div className="flex items-center gap-4 py-6 border-y border-slate-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <div>
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Ideal para</h3>
                 <p className="text-slate-800 font-bold">{data.idealFor}</p>
              </div>
            </div>

            {/* 7. SEO Keywords */}
            <div>
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">SEO Keywords</h3>
               <div className="flex flex-wrap gap-2">
                 {data.seoKeywords.map((kw, i) => (
                   <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition cursor-default">
                     {kw}
                   </span>
                 ))}
               </div>
            </div>

            {/* Missing operational info footer */}
            {data.hasMissingOperationalInfo && (
              <div className="mt-12 pt-8 border-t border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 italic">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Algumas informações operacionais não estavam presentes no texto original.
              </div>
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 border-b border-slate-100 pb-4">Clinical Quality Audit Log</h3>
            {data.auditTrail.map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm transition-hover hover:border-indigo-200">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm font-black text-slate-900">{item.change}</p>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Fact-Checked</span>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{item.reason}</p>
                <div className="text-[11px] bg-white p-4 rounded-xl border border-slate-100 text-indigo-600 font-medium italic shadow-inner">
                  &ldquo;{item.factualConfirmation}&rdquo;
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'original' && (
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 font-mono text-xs text-slate-500 whitespace-pre-wrap leading-loose max-w-3xl mx-auto shadow-inner">
            {originalText}
          </div>
        )}
      </div>
    </div>
  );
};

// Simple helper to visualize markdown basic structure
function formatMarkdown(text: string) {
  if (!text) return '';
  return text
    .replace(/^## (.*$)/gim, '<h4 class="text-sm font-black text-indigo-900 mt-6 mb-3 uppercase tracking-wider">$1</h4>')
    .replace(/^### (.*$)/gim, '<h5 class="text-xs font-bold text-slate-800 mt-4 mb-2 uppercase tracking-wide">$1</h5>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-1">$1</li>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="text-slate-900 font-black">$1</strong>')
    .replace(/\n/g, '<br/>');
}
