import React, { useState } from 'react';
import { SingleRefiner } from './components/SingleRefiner';
import { BatchRefiner } from './components/BatchRefiner';
import { Mode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>(Mode.SINGLE);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 rotate-3 group hover:rotate-0 transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <span className="block text-lg font-black tracking-tighter text-slate-900 leading-none">iFRIEND</span>
                <span className="block text-[10px] font-black tracking-[0.3em] text-indigo-600 leading-none uppercase mt-1">Experience Refiner</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="hidden lg:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Marketplace Standard v1.0</span>
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Intro */}
        <div className="mb-16 text-center lg:text-left">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight sm:text-6xl leading-[1.1]">
            Experience Content <br/>
            <span className="text-indigo-600">Redefined.</span>
          </h1>
          <p className="mt-6 text-slate-500 max-w-2xl text-xl font-medium leading-relaxed">
            Transforme descrições brutas em textos profissionais de alta conversão. Padrão marketplace iFriend com integridade factual absoluta.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center lg:justify-start mb-12">
          <div className="bg-slate-100 p-2 rounded-3xl flex gap-1 border border-slate-200">
            <button
              onClick={() => setMode(Mode.SINGLE)}
              className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                mode === Mode.SINGLE 
                  ? 'bg-white text-indigo-600 shadow-xl scale-105' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Single Experience
            </button>
            <button
              onClick={() => setMode(Mode.BATCH)}
              className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                mode === Mode.BATCH 
                  ? 'bg-white text-indigo-600 shadow-xl scale-105' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Batch Process
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="animate-fade-in min-h-[700px]">
          {mode === Mode.SINGLE ? <SingleRefiner /> : <BatchRefiner />}
        </div>

      </main>
      
      {/* Footer */}
      <footer className="mt-32 py-16 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mb-8">
            iFriend Agentic Content Refinement Protocol
          </p>
          <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black text-slate-300 uppercase tracking-widest">
             <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>Zero Inventions</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>SEO Optimized</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>iFriend Clinical Quality</span>
             </div>
          </div>
          <p className="mt-12 text-slate-300 text-[10px] font-bold">
            &copy; {new Date().getFullYear()} iFriend Experience Refiner. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
