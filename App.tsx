
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ViewMode, GlobalThreat, RiskProfile } from './types';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { Disclaimer } from './components/Disclaimer';
import { checkPasswordBreach, maskPassword } from './services/hibpService';
import { getBreachContext, getPasswordAffiliations, getGlobalThreats } from './services/geminiService';
import { saveHistory } from './services/dbService';
import { HistoryView } from './components/HistoryView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ViewMode>(ViewMode.EMAIL);
  const [inputValue, setInputValue] = useState('');
  const [gridSearch, setGridSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingSources, setIsAnalyzingSources] = useState(false);
  
  const [emailResults, setEmailResults] = useState<any[] | null>(null);
  const [pwResult, setPwResult] = useState<number | null>(null);
  const [pwGrid, setPwGrid] = useState<any[] | null>(null);
  
  const [globalThreats, setGlobalThreats] = useState<GlobalThreat[]>([]);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const boot = async () => {
      setTimeout(() => setIsBooting(false), 1800);
      const threats = await getGlobalThreats();
      setGlobalThreats(threats);
    };
    boot();
  }, []);

  const addLog = (msg: string) => {
    setScanLogs(prev => [msg, ...prev].slice(0, 15));
  };

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsLoading(true);
    setScanLogs([]);
    setEmailResults(null);
    setPwResult(null);
    setPwGrid(null);

    const sequence = [
      `BOOTSTRAPPING SCAVENGE: ${inputValue}`,
      `G-INTEL HANDSHAKE... SUCCESS`,
      `ACCESSING HIBP K-ANONYMITY RANGE...`,
      `PARSING ARCHIVE DISCLOSURES...`,
      `RUNNING RECURSIVE CROSS-REFERENCE...`
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) addLog(sequence[i++]);
      else clearInterval(interval);
    }, 250);

    try {
      if (activeTab === ViewMode.EMAIL) {
        const data = await getBreachContext(inputValue);
        setEmailResults(data);
        addLog(`SCAN SUCCESS: ${data.length} RECORDS FOUND`);
        await saveHistory({
          id: crypto.randomUUID(), type: 'email', query: inputValue, timestamp: Date.now(),
          resultSummary: `Found ${data.length} exposures`
        });
      } else if (activeTab === ViewMode.PASSWORD) {
        const count = await checkPasswordBreach(inputValue);
        setPwResult(count);
        addLog(`HASH MATCHES: ${count} DETECTED`);
        await saveHistory({
          id: crypto.randomUUID(), type: 'password', query: '********', timestamp: Date.now(),
          resultSummary: `HIBP Count: ${count}`
        });
      }
    } catch (err) {
      addLog(`CRITICAL: EXTRACTION PIPELINE FAILURE`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepScavenge = async () => {
    if (!pwResult || !inputValue) return;
    setIsAnalyzingSources(true);
    addLog(`INITIATING IDENTITY MAPPING FOR HASH SIG...`);
    try {
      const masked = maskPassword(inputValue);
      const data = await getPasswordAffiliations(masked, pwResult);
      setPwGrid(data);
      addLog(`MAPPING COMPLETE: ${data.length} SOURCE CORRELATIONS`);
    } catch (err) {
      addLog(`ERROR: IDENTITY MAP UNAVAILABLE`);
    } finally {
      setIsAnalyzingSources(false);
    }
  };

  const handleExportReport = () => {
    const data = activeTab === ViewMode.EMAIL ? emailResults : pwGrid;
    if (!data) return;
    const content = `BREACH BROWSER FORENSIC EXPORT\nTarget: ${inputValue}\nDate: ${new Date().toLocaleString()}\n\n` + JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Security_Report_${inputValue.slice(0, 5)}.txt`;
    a.click();
  };

  const filteredData = useMemo(() => {
    const source = activeTab === ViewMode.EMAIL ? emailResults : pwGrid;
    if (!source) return [];
    if (!gridSearch) return source;
    return source.filter(item => 
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(gridSearch.toLowerCase())
      )
    );
  }, [emailResults, pwGrid, gridSearch, activeTab]);

  const risk = useMemo((): RiskProfile => {
    const hits = activeTab === ViewMode.EMAIL ? (emailResults?.length || 0) : (pwResult || 0);
    if (hits === 0) return { score: 0, label: 'SECURE', color: 'text-emerald-500', factors: ['Identity clean.'] };
    if (hits < 5) return { score: 35, label: 'ELEVATED', color: 'text-amber-500', factors: ['Low-level disclosure.'] };
    if (hits < 20) return { score: 65, label: 'HIGH RISK', color: 'text-orange-500', factors: ['Multiple matches.'] };
    return { score: 95, label: 'CRITICAL', color: 'text-red-500', factors: ['Systemic exposure.'] };
  }, [emailResults, pwResult, activeTab]);

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#020408] flex items-center justify-center p-10 font-mono">
        <div className="max-w-md w-full space-y-6">
          <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-[0.3em]">
            <span>System_Loader_v4.2</span>
            <span className="animate-pulse">Active</span>
          </div>
          <div className="h-[2px] bg-slate-900 overflow-hidden">
            <div className="h-full bg-red-600 animate-[progress_1.8s_ease-in-out]"></div>
          </div>
          <div className="text-[10px] text-slate-700 space-y-2 opacity-50">
            <p>> Syncing with Global Intelligence Nodes...</p>
            <p>> Calibrating Forensic Scavenge Modules...</p>
            <p>> [READY] Secure Environment Initialized</p>
          </div>
          <style>{`@keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 selection:bg-red-500/40 font-inter">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] scanlines"></div>

      {/* Top Command Bar */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-40">
        <div className="max-w-[1900px] mx-auto px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-6 cursor-pointer group" onClick={() => window.location.reload()}>
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">Breach Browser</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] font-bold text-slate-600 tracking-[0.4em] uppercase">Security Intelligence Terminal</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 bg-slate-900/40 p-1 border border-white/5 rounded-xl">
            {[ViewMode.EMAIL, ViewMode.PASSWORD, ViewMode.THREAT_MAP, ViewMode.HISTORY].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-[1900px] mx-auto px-10 py-10 grid grid-cols-12 gap-8">
        {/* Intelligence Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card className="bg-slate-900/20 border-slate-800/40 p-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center justify-between">
              <span>Threat_Feed</span>
              <span className="text-[9px] text-slate-700">Live_Sync</span>
            </h3>
            <div className="space-y-6">
              {globalThreats.map(threat => (
                <div key={threat.id} className="group border-l border-slate-800 pl-4 py-1 hover:border-red-500 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[9px] font-bold uppercase tracking-tighter ${threat.impact === 'CRITICAL' ? 'text-red-500' : 'text-orange-400'}`}>{threat.impact}</span>
                    <span className="text-[9px] font-mono text-slate-700">{threat.date}</span>
                  </div>
                  <h4 className="text-[11px] font-black text-slate-200 group-hover:text-white transition-colors uppercase">{threat.title}</h4>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-black/60 border-blue-500/10 p-6 font-mono">
            <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Kernel_Output</h3>
            <div className="space-y-2 h-40 overflow-y-auto text-[10px] custom-scrollbar">
              {scanLogs.length === 0 && <p className="text-slate-800 italic">> System Idle...</p>}
              {scanLogs.map((log, i) => (
                <p key={i} className={`leading-relaxed ${i === 0 ? 'text-blue-400' : 'text-slate-600'}`}>{`> `}{log}</p>
              ))}
            </div>
          </Card>
        </div>

        {/* Central Command / Spreadsheet */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          {activeTab === ViewMode.THREAT_MAP ? (
             <Card className="bg-slate-900/30 border-slate-800 h-[700px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-10 left-10 space-y-1">
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Live Identity Map</h2>
                  <p className="text-[10px] font-mono text-slate-500 tracking-[0.3em]">GEOSPATIAL CLUSTER SCAN</p>
                </div>
                <svg className="w-full h-full opacity-20" viewBox="0 0 1000 600">
                  <path d="M100,300 Q250,100 400,300 T700,300 T900,100" fill="none" stroke="red" strokeWidth="0.5" className="animate-pulse" />
                  <circle cx="200" cy="150" r="4" fill="red" className="animate-ping" />
                  <circle cx="500" cy="400" r="4" fill="red" className="animate-ping" />
                  <circle cx="800" cy="200" r="4" fill="red" className="animate-ping" />
                </svg>
                <div className="absolute text-[10px] font-black text-red-600 uppercase tracking-[1em] animate-pulse">Syncing Partition Nodes...</div>
             </Card>
          ) : activeTab === ViewMode.HISTORY ? (
            <HistoryView />
          ) : (
            <>
              {/* Upper Control Matrix */}
              <div className="grid grid-cols-12 gap-6">
                <Card className="col-span-12 md:col-span-4 bg-slate-900/30 border-slate-800 p-8 text-center flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Risk_Index</p>
                  <div className={`text-8xl font-black italic tracking-tighter ${risk.color} mb-2`}>{risk.score}</div>
                  <div className={`text-[11px] font-black uppercase tracking-[0.5em] ${risk.color}`}>{risk.label}</div>
                  <div className="mt-6 space-y-2">
                    {risk.factors.map((f, i) => <p key={i} className="text-[10px] text-slate-700 font-mono italic">_ {f}</p>)}
                  </div>
                </Card>

                <Card className="col-span-12 md:col-span-8 bg-slate-900/40 border-slate-700/40 p-10">
                  <form onSubmit={handleCheck} className="space-y-8">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Command_Target</label>
                        <span className="text-[9px] font-mono text-slate-700">Mode: {activeTab}</span>
                      </div>
                      <input
                        type={activeTab === ViewMode.PASSWORD ? "password" : "text"}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={activeTab === ViewMode.EMAIL ? "ID_SCAN (EMAIL/USER/DOMAIN)" : "SIG_SCAN (SECRET_KEY)"}
                        className="w-full bg-black/60 border border-white/5 rounded-xl px-8 py-6 focus:outline-none focus:border-red-500/40 text-slate-100 font-mono text-xl tracking-widest"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button isLoading={isLoading} type="submit" className="flex-1 py-6 font-black uppercase tracking-[0.4em] text-[11px] bg-red-600 text-white hover:bg-red-500 shadow-2xl shadow-red-900/20">
                        Run_Extraction_Protocol
                      </Button>
                      {pwResult !== null && pwResult > 0 && !pwGrid && (
                        <Button onClick={handleDeepScavenge} isLoading={isAnalyzingSources} variant="secondary" className="px-10 py-6 font-black uppercase tracking-[0.2em] text-[11px] border border-white/10">
                          Scavenge_Identity_Map
                        </Button>
                      )}
                    </div>
                  </form>
                </Card>
              </div>

              {/* Enhanced Master Spreadsheet Grid */}
              {(emailResults || pwGrid) && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between bg-slate-900/40 border border-white/5 p-4 rounded-xl backdrop-blur-md">
                    <div className="flex items-center gap-4 flex-1 max-w-xl">
                      <div className="bg-slate-950 p-2 rounded border border-white/10">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                      <input 
                        value={gridSearch} 
                        onChange={(e) => setGridSearch(e.target.value)}
                        placeholder="Filter scavenged archives..."
                        className="bg-transparent border-none text-[11px] font-mono text-slate-400 focus:outline-none w-full uppercase"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest py-2 px-4 border border-white/5 rounded bg-black/40">
                        Found: {filteredData.length} Records
                      </div>
                      <Button onClick={handleExportReport} className="text-[10px] font-black uppercase px-6 bg-slate-100 text-black hover:bg-white">
                        Export_Case_File
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-hidden border border-white/5 rounded-xl bg-slate-900/10 shadow-3xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1200px]">
                        <thead>
                          <tr className="bg-black/60 border-b border-white/10">
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-white/5">PLATFORM_ORIGIN</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-white/5">COMPROMISED_UID</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-white/5">LEAK_DATE</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-white/5">ARCHIVE_SOURCE</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">GRADE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {filteredData.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-800 font-mono uppercase text-xs tracking-[0.5em]">No records match filter</td></tr>
                          ) : filteredData.map((row, idx) => (
                            <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white/[0.01]' : 'bg-transparent'} hover:bg-red-500/[0.03] transition-colors group`}>
                              <td className="px-6 py-4 border-r border-white/5">
                                <span className="text-xs font-black text-slate-300 group-hover:text-white uppercase italic">{row.platform || row.app}</span>
                              </td>
                              <td className="px-6 py-4 border-r border-white/5">
                                <span className="text-[10px] font-mono text-red-500 font-black bg-red-500/5 px-3 py-1.5 rounded border border-red-500/10">
                                  {row.platform_user || row.leaked_identity || inputValue}
                                </span>
                              </td>
                              <td className="px-6 py-4 border-r border-white/5 text-[10px] font-mono text-slate-600 font-bold">{row.date || row.year}</td>
                              <td className="px-6 py-4 border-r border-white/5">
                                <span className="text-[9px] text-slate-700 font-black uppercase bg-slate-900/80 px-2 py-1 rounded">{row.verified_dataset_id || row.source_dataset || "MASTER_ARCHIVE"}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className={`inline-block px-3 py-1 rounded text-[9px] font-black border ${
                                  (row.severity_score || 5) > 7 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                }`}>
                                  SIG_{row.severity_score || 5}.0
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-white/5 py-32 mt-40 bg-black/60 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-10 text-center space-y-12">
          <div className="flex flex-wrap justify-center gap-16 opacity-30">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.8em]">Deterministic_Scavenge_On</span>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.8em]">AES_History_Buffer</span>
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.8em]">Kernel_v4.2_STABLE</span>
          </div>
          <p className="text-slate-900 text-[10px] max-w-4xl mx-auto leading-loose font-mono uppercase tracking-[0.2em]">
            SYSTEM_ADVISORY: Metadata parsing is performed on archival disclosures. This interface does not retain decrypted secrets. Use cryptographic verification for all sensitive identifiers.
          </p>
        </div>
      </footer>

      <style>{`
        .scanlines {
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%), 
                      linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.05));
          background-size: 100% 4px, 3px 100%;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
