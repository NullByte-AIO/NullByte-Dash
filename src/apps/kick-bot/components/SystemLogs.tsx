"use client";
import React, { useEffect, useState, useRef } from "react";
import { GlassCard } from "../../../components/ui/GlassCard";

interface LogEntry {
  timestamp: string;
  level: string;
  category: string;
  message: string;
}

export const SystemLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = ["ALL", "SYSTEM", "ACCOUNTS", "CHAT", "AUTOMATION", "SECURITY"];

  useEffect(() => {
    fetchDates();
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedDate, selectedCategory]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const fetchDates = async () => {
    try {
      const res = await fetch("/api/kick-bot/logs?listDates=true");
      const dates = await res.json();
      setAvailableDates(dates);
    } catch (e) {}
  };

  const fetchLogs = async () => {
    if (!selectedDate) return;
    try {
      const res = await fetch(`/api/kick-bot/logs?date=${selectedDate}&category=${selectedCategory}`);
      const data = await res.json();
      setLogs(data);
    } catch (e) {}
  };

  const handleDownload = () => {
    window.open(`/api/kick-bot/logs?date=${selectedDate}&category=${selectedCategory}&download=true`);
  };

  return (
    <div className="space-y-6">
      {/* TACTICAL CONTROLS */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between px-2">
         <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${selectedCategory === cat ? 'bg-[#05FF00] text-black border-[#05FF00] shadow-[0_0_15px_rgba(5,255,0,0.3)]' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}
              >
                {cat}
              </button>
            ))}
         </div>
         
         <div className="flex items-center gap-3 w-full xl:w-auto">
            <div className="relative flex-1 xl:flex-none">
               <select 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full xl:w-48 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white uppercase outline-none focus:border-[#05FF00] appearance-none cursor-pointer"
               >
                  {!availableDates.includes(new Date().toISOString().split("T")[0]) && (
                    <option value={new Date().toISOString().split("T")[0]}>Today (Live)</option>
                  )}
                  {availableDates.map(date => (
                    <option key={date} value={date}>{date === new Date().toISOString().split("T")[0] ? `${date} (Live)` : date}</option>
                  ))}
               </select>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
               </div>
            </div>
            <button 
              onClick={handleDownload}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[#05FF00] hover:bg-[#05FF00] hover:text-black transition-all"
              title="Download Logs"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            </button>
         </div>
      </div>

      <GlassCard title={`Matrix Stream: ${selectedCategory} [${selectedDate}]`}>
        <div className="flex flex-col h-[700px]">
          <div 
            ref={scrollRef}
            className="flex-1 bg-black/40 rounded-2xl p-8 overflow-y-auto font-mono text-[11px] border border-white/[0.05] shadow-inner custom-scrollbar relative"
          >
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#05FF00]/20 animate-spin" />
                    <span className="text-[10px] font-black text-[#05FF00] uppercase tracking-[0.5em] animate-pulse">Scanning Data Packets...</span>
                 </div>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, i) => {
                  const isError = log.level === "ERROR";
                  const isWarn = log.level === "WARN";
                  const lineNum = (i + 1).toString().padStart(4, '0');
                  
                  return (
                    <div key={i} className="group flex gap-6 hover:bg-white/[0.02] -mx-4 px-4 py-1 rounded-lg transition-colors">
                      <span className="text-gray-300 dark:text-white/10 shrink-0 select-none w-10">{lineNum}</span>
                      <div className="flex gap-3 flex-1">
                        <span className="text-white/20 shrink-0 w-16">{log.timestamp}</span>
                        <span className={`font-black shrink-0 w-20 ${isError ? 'text-red-500' : isWarn ? 'text-orange-500' : 'text-[#05FF00]'}`}>
                          [{log.level}]
                        </span>
                        <span className="text-white/40 shrink-0 w-24">[{log.category}]</span>
                        <span className={`tracking-tight leading-relaxed ${isError ? 'text-red-400' : 'text-gray-300 group-hover:text-white transition-colors'}`}>
                          {log.message}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between items-center px-2">
            <div className="flex items-center gap-4">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-1 h-3.5 bg-[#05FF00]/40 rounded-full" />
                ))}
              </div>
              <div className="flex flex-col">
                 <span className="text-[9px] text-[#05FF00] uppercase tracking-[0.4em] font-black italic">Live Matrix Stream</span>
                 <span className="text-[8px] text-gray-500 uppercase tracking-widest">Protocol V4.2.0_SECURED</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex flex-col items-end">
                  <span className="text-[9px] text-gray-500 uppercase font-bold">Audit Retention</span>
                  <span className="text-[10px] text-[#05FF00] font-mono">07_DAY_AUTO_ROTATION</span>
               </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(5, 255, 0, 0.2);
        }
      `}</style>
    </div>
  );
};
