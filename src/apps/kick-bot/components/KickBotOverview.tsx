"use client";
import React, { useEffect, useState, useRef } from "react";
import { GroupIcon, BoxIconLine, ListIcon, BoltIcon } from "@/icons";

export const KickBotOverview = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configRes, accountsRes] = await Promise.all([
          fetch("/api/kick-bot/config"),
          fetch("/api/kick-bot/accounts")
        ]);
        
        const config = await configRes.json();
        const db = await accountsRes.json();
        
        const accounts = Object.values(db.accounts || {});
        setStats({
          totalAccounts: accounts.length,
          activeAccounts: accounts.filter((a: any) => a.status === "ACTIVE" && a.enabled !== false).length,
          disabledAccounts: accounts.filter((a: any) => a.enabled === false).length,
          autopilotStatus: config.autopilot?.enabled || false,
        });
      } catch (e) {}
    };

    fetchData();
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

      <style jsx global>{`
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
