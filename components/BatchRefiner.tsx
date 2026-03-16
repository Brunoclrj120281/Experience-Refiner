
import React, { useState, useRef } from 'react';
import { refineProductText } from '../services/geminiService';
import { BatchItem } from '../types';

export const BatchRefiner: React.FC = () => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      let parsedItems: BatchItem[] = [];

      // Improved parser for CSV/JSON
      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
             parsedItems = json.map((item: any, idx) => ({
                id: item.id || `item-${idx + 1}`,
                originalText: typeof item === 'string' ? item : (item.description || item.text || item.content || JSON.stringify(item)),
                status: 'pending'
             }));
          }
        } catch (err) { console.error("JSON parse error", err); }
      } else if (file.name.endsWith('.csv')) {
         const lines = text.split('\n');
         const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
         // Try to find a column named 'description', 'text', 'content', 'original'
         let textColIdx = headers.findIndex(h => h.includes('desc') || h.includes('text') || h.includes('content') || h.includes('orig'));
         if (textColIdx === -1) textColIdx = 0; // Default to first col

         parsedItems = lines.slice(1)
            .filter(l => l.trim().length > 10)
            .map((l, idx) => {
               const cols = l.split(',');
               return {
                  id: `csv-${idx + 1}`,
                  originalText: cols[textColIdx]?.replace(/^"|"$/g, '').trim() || l.trim(),
                  status: 'pending'
               };
            });
      } else {
         // Generic text split
         const lines = text.split(/\n\s*\n/);
         parsedItems = lines
            .filter(l => l.trim().length > 20)
            .map((l, idx) => ({
                id: `txt-${idx + 1}`,
                originalText: l.trim(),
                status: 'pending'
            }));
      }

      setItems(parsedItems.slice(0, 10)); // Limit for safety
    };
    reader.readAsText(file);
  };

  const processBatch = async () => {
    setIsProcessing(true);
    const newItems = [...items];

    for (let i = 0; i < newItems.length; i++) {
      if (newItems[i].status === 'completed') continue;
      
      newItems[i].status = 'processing';
      setItems([...newItems]);

      try {
        const result = await refineProductText(newItems[i].originalText);
        newItems[i].result = result;
        newItems[i].status = 'completed';
      } catch (err) {
        newItems[i].status = 'error';
        newItems[i].errorMsg = "Failed to refine.";
      }
      setItems([...newItems]);
    }
    setIsProcessing(false);
  };

  const downloadResults = () => {
    const completed = items.filter(i => i.status === 'completed' && i.result);
    if (completed.length === 0) return;

    const headers = ['id', 'original_text', 'refined_title', 'refined_description', 'seo_keywords', 'alerts', 'target_audience'];
    const rows = completed.map(item => [
      item.id,
      `"${item.originalText.replace(/"/g, '""')}"`,
      // Fix: map optimizedTitle to headline
      `"${item.result!.headline.replace(/"/g, '""')}"`,
      // Fix: map rewrittenDescription to openingParagraph
      `"${item.result!.openingParagraph.replace(/"/g, '""')}"`,
      `"${item.result!.seoKeywords.join(', ').replace(/"/g, '""')}"`,
      // Fix: map operationalAlerts to importantInfo
      `"${(item.result!.importantInfo || '').replace(/"/g, '""')}"`,
      // Fix: map targetAudience to idealFor
      `"${(item.result!.idealFor || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "ifriend_refined_experiences.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
        <div className="max-w-md mx-auto">
           <div className="mx-auto h-12 w-12 text-indigo-500 mb-4">
             <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
           </div>
           <h3 className="text-lg font-medium text-slate-900">Upload Product Batch</h3>
           <p className="text-sm text-slate-500 mt-1 mb-6">Supports .txt, .json, .csv (v2 Auto-detection)</p>
           
           <input 
             type="file" 
             accept=".txt,.json,.csv" 
             onChange={handleFileUpload}
             ref={fileInputRef}
             className="hidden"
           />
           
           <div className="flex flex-wrap gap-4 justify-center">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition font-medium text-sm"
                >
                    Select File
                </button>
                {items.length > 0 && !isProcessing && items.some(i => i.status !== 'completed') && (
                    <button 
                        onClick={processBatch}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow-sm"
                    >
                        Start V2 Refinement
                    </button>
                )}
                {items.some(i => i.status === 'completed') && (
                  <button 
                      onClick={downloadResults}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm shadow-sm flex items-center gap-2"
                  >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Export CSV
                  </button>
                )}
           </div>
        </div>
      </div>

      {/* List Results */}
      {items.length > 0 && (
        <div className="space-y-4">
            {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <span className="font-medium text-sm text-slate-700">ID: {item.id}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium
                            ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 
                              item.status === 'processing' ? 'bg-blue-100 text-blue-700' : 
                              item.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                            {item.status.toUpperCase()}
                        </span>
                    </div>
                    
                    <div className="p-4">
                        {item.status === 'completed' && item.result ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Original</h4>
                                    <p className="text-xs text-slate-500 line-clamp-4">{item.originalText}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">V2 Refined</h4>
                                    {/* Fix: optimizedTitle to headline */}
                                    <p className="text-sm font-semibold text-slate-800 mb-1">{item.result.headline}</p>
                                    <div className="flex gap-2 mb-2">
                                      {/* Fix: missingInfo to hasMissingOperationalInfo */}
                                      {item.result.hasMissingOperationalInfo && (
                                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Partial Info</span>
                                      )}
                                      {/* Fix: targetAudience to idealFor */}
                                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase">{item.result.idealFor}</span>
                                    </div>
                                    {/* Fix: rewrittenDescription to openingParagraph */}
                                    <p className="text-xs text-slate-600 line-clamp-3">{item.result.openingParagraph}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 truncate">{item.originalText}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
