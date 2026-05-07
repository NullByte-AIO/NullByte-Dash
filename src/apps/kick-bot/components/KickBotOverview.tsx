"use client";
import React, { useEffect, useState, useRef } from "react";
import { GroupIcon, BoxIconLine, ListIcon, BoltIcon } from "@/icons";

export const KickBotOverview = () => {
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, accountsRes, logsRes] = await Promise.all([
          fetch("/api/kick-bot/config"),
          fetch("/api/kick-bot/accounts"),
          fetch("/api/kick-bot/logs")
        ]);
        
        const config = await configRes.json();
        const db = await accountsRes.json();
        const logsData = await logsRes.json();
        
        const accounts = Object.values(db.accounts || {});
        setStats({
          totalAccounts: accounts.length,
          activeAccounts: accounts.filter((a: any) => a.status === "ACTIVE" && a.enabled !== false).length,
          disabledAccounts: accounts.filter((a: any) => a.enabled === false).length,
          autopilotStatus: config.autopilot?.enabled || false,
        });
        
        setLogs(logsData.logs?.slice(-20) || []);
      } catch (e) {}
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatItems = () => {
    if (!stats) return [
      { label: "Total Accounts", value: "...", icon: <GroupIcon className="size-6" />, color: "green", progress: 0 },
      { label: "Active Now", value: "...", icon: <BoltIcon className="size-6" />, color: "cyan", progress: 0 },
      { label: "Bot Status", value: "...", icon: <ListIcon className="size-6" />, color: "gray", progress: 0 },
      { label: "Disabled", value: "...", icon: <BoxIconLine className="size-6" />, color: "red", progress: 0 }
    ];

    return [
      { 
        label: "Total Accounts", 
        value: stats.totalAccounts, 
        icon: <GroupIcon className="size-6" />,
        color: "green",
        progress: 100 
      },
      { 
        label: "Active Now", 
        value: stats.activeAccounts, 
        icon: <BoltIcon className="size-6" />,
        color: "cyan",
        progress: stats.totalAccounts > 0 ? (stats.activeAccounts / stats.totalAccounts) * 100 : 0
      },
      { 
        label: "Bot Status", 
        value: stats.autopilotStatus ? "Autopilot" : "Manual", 
        icon: <ListIcon className="size-6" />,
        color: "gray",
        isStatus: true,
        active: stats.autopilotStatus
      },
      { 
        label: "Disabled", 
        value: stats.disabledAccounts, 
        icon: <BoxIconLine className="size-6" />,
        color: "red",
        isDisabledDisplay: true
      }
    ];
  };

  const getColorClasses = (color: string) => {
    switch(color) {
      case 'green': return { text: 'text-[#05FF00]', bg: 'bg-[#05FF00]/10', border: 'border-[#05FF00]/20', glow: 'shadow-[#05FF00]/20', tint: 'from-[#05FF00]/10', iconBg: 'bg-[#05FF00]/5' };
      case 'cyan': return { text: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', glow: 'shadow-cyan-400/20', tint: 'from-cyan-400/10', iconBg: 'bg-cyan-400/5' };
      case 'red': return { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', glow: 'shadow-red-500/20', tint: 'from-red-500/10', iconBg: 'bg-red-500/5' };
      default: return { text: 'text-gray-400', bg: 'bg-white/5', border: 'border-white/10', glow: 'shadow-white/10', tint: 'from-white/10', iconBg: 'bg-white/5' };
    }
  };

  return (
    <div className="space-y-8">
      {/* STATS GRID */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {getStatItems().map((item, index) => {
          const theme = getColorClasses(item.color);
          return (
            <div key={index} className={`relative overflow-hidden rounded-[32px] border ${theme.border} bg-[#0F0F12] p-8 transition-all duration-500 hover:translate-y-[-6px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${theme.glow} group`}>
              
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              
              {/* Intense Radial Tint Background */}
              <div className={`absolute -top-16 -left-16 w-48 h-48 bg-gradient-radial ${theme.tint} to-transparent opacity-50 blur-3xl pointer-events-none group-hover:opacity-100 transition-opacity duration-700`} />
              
              <div className="relative z-10 flex items-center justify-between">
                <div className={`w-14 h-14 rounded-2xl ${theme.bg} border ${theme.border} flex items-center justify-center transition-all group-hover:rotate-[10deg] duration-500 shadow-inner`}>
                  <div className={`${theme.text} group-hover:scale-110 transition-transform`}>{item.icon}</div>
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-black text-gray-500 dark:text-white/30 uppercase tracking-[0.25em]">{item.label}</span>
                   <div className={`h-[1px] w-8 ml-auto mt-1 ${theme.bg}`} />
                </div>
              </div>

              <div className="relative z-10 mt-8">
                <div className="flex items-baseline gap-2">
                  <h4 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter tabular-nums">
                    {item.value}
                  </h4>
                  {item.isDisabledDisplay && typeof item.value === 'number' && item.value === 0 && (
                    <span className="text-[10px] font-bold text-[#05FF00]/40 uppercase tracking-widest animate-pulse">All Systems Clear</span>
                  )}
                </div>
                
                <div className="mt-6">
                  {item.isStatus ? (
                    <div className="flex items-center gap-4 h-8 bg-black/20 rounded-xl px-4 border border-white/5">
                      <div className="flex-1 h-[4px] bg-white/5 relative overflow-hidden rounded-full">
                         {item.active && (
                           <div className="absolute inset-0 flex">
                              <div className="h-full w-48 bg-gradient-to-r from-transparent via-[#05FF00] to-transparent animate-[pulse-flow_1.2s_infinite]" />
                           </div>
                         )}
                      </div>
                      <div className={`w-3.5 h-3.5 rounded-full transition-all duration-500 ${item.active ? 'bg-[#05FF00] shadow-[0_0_20px_#05FF00] scale-125' : 'bg-gray-800 shadow-none scale-100'}`} />
                    </div>
                  ) : item.isDisabledDisplay ? (
                     <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2 min-h-4 items-center">
                          {typeof item.value === 'number' && item.value > 0 ? (
                            [...Array(Math.min(20, item.value))].map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-sm bg-red-500/30 border border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.1)] rotate-45 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))
                          ) : (
                            <div className="w-full flex items-center gap-3">
                               <div className="h-[2px] flex-1 bg-gradient-to-r from-[#05FF00]/20 to-transparent rounded-full" />
                               <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">No Standby Accounts</span>
                            </div>
                          )}
                        </div>
                        {typeof item.value === 'number' && item.value > 0 && (
                          <div className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                             <span className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">Inventory Isolated</span>
                          </div>
                        )}
                     </div>
                  ) : (
                    <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden relative border border-white/5">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out 
                          ${index === 0 ? 'bg-gradient-to-r from-[#05FF00] to-[#00FF85]' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}
                        `}
                        style={{ width: `${item.progress}%` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2.5s_infinite]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Background Large Icon */}
              <div className={`absolute -bottom-6 -right-6 text-white/[0.03] scale-[2.5] pointer-events-none transition-transform group-hover:scale-[3] duration-1000`}>
                 {item.icon}
              </div>
            </div>
          );
        })}
      </div>

      {/* MATRIX STREAM CONTAINER */}
      <div className="relative overflow-hidden rounded-[32px] border-2 border-[#05FF00]/30 dark:bg-[#050506] shadow-[0_0_40px_rgba(5,255,0,0.15)] group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#05FF00]/5 blur-[120px] pointer-events-none transition-opacity group-hover:opacity-100 opacity-60" />

        {/* HEADER */}
        <div className="relative z-10 p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[#05FF00] shadow-[0_0_12px_#05FF00]" />
             <div className="flex items-center gap-2">
                <div className="h-5 w-[3px] bg-[#05FF00]" />
                <h3 className="text-base font-bold text-white tracking-tight">Kernel Execution Stream</h3>
             </div>
          </div>
        </div>
        
        {/* LOG FEED */}
        <div className="relative z-10 p-7 h-[450px] overflow-y-auto no-scrollbar bg-black/40">
           <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
             {logs.length > 0 ? logs.map((log, i) => {
               const lineNum = (100 + i).toString().padStart(4, '0');
               return (
                 <div key={i} className="flex gap-4 items-start group/line">
                   <span className="text-gray-700 shrink-0 select-none">{lineNum}</span>
                   <div className="flex flex-wrap gap-2">
                      <span className="text-[#05FF00] font-bold">[SYNC]</span>
                      <span className="text-gray-500">[Account System]</span>
                      <span className={`text-gray-300 group-hover/line:text-white transition-colors ${log.toLowerCase().includes('error') ? 'text-red-500/80' : ''}`}>
                        {log}
                      </span>
                   </div>
                 </div>
               );
             }) : (
               <div className="text-gray-700 animate-pulse">Establishing uplink to matrix...</div>
             )}
           </div>
        </div>

        {/* FOOTER */}
        <div className="relative z-10 p-5 bg-black/60 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="flex gap-1">
                 <div className="w-1.5 h-4 bg-[#05FF00]/60" />
                 <div className="w-1.5 h-4 bg-[#05FF00]/60" />
                 <div className="w-1.5 h-4 bg-[#05FF00]/60" />
              </div>
              <span className="text-xs font-black text-[#05FF00] uppercase tracking-[0.2em]">Live Matrix Stream</span>
           </div>
           <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">NODE_DA91_SECURED</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-flow {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .bg-gradient-radial {
          background-image: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-to));
        }
      `}</style>
    </div>
  );
};
