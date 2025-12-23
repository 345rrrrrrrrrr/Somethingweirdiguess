
import React, { useEffect, useState } from 'react';
import { getHistory, clearHistory } from '../services/dbService';
import { HistoryItem } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleClear = async () => {
    if (confirm("Are you sure you want to clear your local history?")) {
      await clearHistory();
      setHistory([]);
    }
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
        <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-slate-300 font-semibold">No Local History</h3>
        <p className="text-slate-500 text-sm">Your private queries will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold">Local Private History</h2>
        <Button variant="ghost" onClick={handleClear} className="text-red-400 hover:text-red-300">
          Clear History
        </Button>
      </div>
      <div className="grid gap-3">
        {history.map((item) => (
          <Card key={item.id} className="bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    item.type === 'email' ? 'bg-blue-900/50 text-blue-400' : 'bg-purple-900/50 text-purple-400'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="font-medium text-slate-100 mb-1">{item.query}</p>
                <p className="text-sm text-slate-400 italic">Result: {item.resultSummary}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
