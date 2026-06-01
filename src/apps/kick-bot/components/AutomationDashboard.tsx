"use client";
import React, { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { GlassCard } from "../../../components/ui/GlassCard";
import { ListIcon, ShootingStarIcon, BoltIcon } from "@/icons";
import { ConfirmationModal } from "@/components/ui/modal/ConfirmationModal";
import { TacticalTooltip } from "@/components/ui/TacticalTooltip";

export const AutomationDashboard = () => {
  const { data: config, mutate: mutateConfig } = useSWR("/api/kick-bot/config", fetcher);
  const { data: chatLibraries } = useSWR("/api/kick-bot/chat-libraries", fetcher);
  const { data: emojiCategories } = useSWR("/api/kick-bot/emoji-categories", fetcher);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  const [lastConfirmationTime, setLastConfirmationTime] = useState<number>(Date.now());
  const [isStreamOnline, setIsStreamOnline] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);

  // SAFETY & COMPLIANCE MONITOR has been disabled to prevent offline auto-stops.

  const handleStopAll = () => {
    updateConfig({ 
      autopilot: { ...config.autopilot, enabled: false }
    });
  };

  const updateConfig = async (updates: any) => {
    const newConfig = { ...config, ...updates };
    // Optimistic mutation: update the UI instantly without waiting for revalidation
    mutateConfig(newConfig, false);
    
    try {
      await fetch("/api/kick-bot/config", {
        method: "POST",
        body: JSON.stringify(newConfig),
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      // Re-fetch to ensure sync with server
      mutateConfig();
    }
  };

  const toggleAutopilot = async () => {
    const currentStatus = config.autopilot.enabled;
    
    if (!currentStatus) {
      setConfirmConfig({
        isOpen: true,
        message: `Are you sure you want to INITIATE the autopilot sequence? This will begin automated command dispatch based on your current tactical parameters.`,
        onConfirm: () => {
          setLastConfirmationTime(Date.now());
          updateConfig({ autopilot: { ...config.autopilot, enabled: true } });
        }
      });
    } else {
      updateConfig({ autopilot: { ...config.autopilot, enabled: false } });
    }
  };

  if (!config || config.error || !config.autopilot) return (
    <div className="py-20 flex flex-col items-center justify-center text-white/20">
      <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Uplink...</span>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <GlassCard title="Autopilot Cluster">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-0 p-8 rounded-[32px] bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 relative overflow-hidden group">
              <div className="flex flex-col gap-1 relative z-10">
                <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em]">Execution Status</span>
                <span className={`text-2xl font-black uppercase tracking-tighter ${config.autopilot.enabled ? 'text-brand-500 dark:text-[#05FF00]' : 'text-red-500'}`}>
                  {config.autopilot.enabled ? "Online" : "Offline"}
                </span>
              </div>
              <TacticalTooltip 
                title={config.autopilot.enabled ? "Terminate Sequence" : "Initiate Sequence"}
                description={config.autopilot.enabled ? "Immediately cease all automated operations and return units to standby." : "Deploy the primary autopilot protocol based on current tactical parameters."}
              >
                <button
                  onClick={toggleAutopilot}
                  className={`relative z-10 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all
                    ${config.autopilot.enabled 
                      ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                      : 'bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black shadow-[0_0_20px_rgba(5,255,0,0.2)]'}
                  `}
                >
                  {config.autopilot.enabled ? "Terminate" : "Initiate"}
                </button>
              </TacticalTooltip>
              <div className="absolute right-0 top-0 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform">
                 <BoltIcon className="w-32 h-32" />
              </div>
            </div>

            {/* PAYLOAD MODE SELECTOR */}
            <div className="space-y-6 bg-white dark:bg-white/5 p-8 rounded-[32px] border border-gray-100 dark:border-white/10">
               <div className="flex flex-col gap-4">
                  <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">Payload Protocol (Select Target Source)</label>
                  
                  <div className="relative group">
                     <ListIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#05FF00]" />
                     <select 
                       value={
                         config.autopilot.mode === 'static' ? 'static' :
                         config.autopilot.mode === 'category' ? `text_cat_${config.autopilot.category || ''}` :
                         config.autopilot.mode === 'emoji' && config.autopilot.emojiCategory ? `emoji_cat_${config.autopilot.emojiCategory}` :
                         'emoji_global'
                       }
                       onChange={(e) => {
                         const val = e.target.value;
                         if (val === 'static') {
                           updateConfig({ autopilot: { ...config.autopilot, mode: 'static' } });
                         } else if (val === 'emoji_global') {
                           updateConfig({ autopilot: { ...config.autopilot, mode: 'emoji', emojiCategory: '' } });
                         } else if (val.startsWith('emoji_cat_')) {
                           updateConfig({ autopilot: { ...config.autopilot, mode: 'emoji', emojiCategory: val.replace('emoji_cat_', '') } });
                         } else if (val.startsWith('text_cat_')) {
                           updateConfig({ autopilot: { ...config.autopilot, mode: 'category', category: val.replace('text_cat_', '') } });
                         }
                       }}
                       className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-[#05FF00] appearance-none"
                     >
                        <optgroup label="Emoji Matrices">
                          <option value="emoji_global">🎭 All Enabled Emojis (Global)</option>
                          {emojiCategories && Object.keys(emojiCategories).filter(catId => Array.isArray(emojiCategories[catId])).map(catId => (
                            <option key={`emoji_cat_${catId}`} value={`emoji_cat_${catId}`}>🎭 {catId} ({emojiCategories[catId].length} emojis)</option>
                          ))}
                        </optgroup>
                        
                        <optgroup label="Message Libraries">
                          <option value="text_cat_" disabled>Select a Message Library...</option>
                          {chatLibraries && Object.keys(chatLibraries).filter(cat => Array.isArray(chatLibraries[cat])).map(cat => (
                            <option key={`text_cat_${cat}`} value={`text_cat_${cat}`}>📝 {cat} ({chatLibraries[cat].length} phrases)</option>
                          ))}
                        </optgroup>

                        <optgroup label="Custom Static Protocol">
                          <option value="static">⚡ Custom Static String</option>
                        </optgroup>
                     </select>
                  </div>

                  {config.autopilot.mode === 'static' && (
                    <div className="relative group mt-2">
                       <ShootingStarIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#05FF00]" />
                       <input
                         type="text"
                         value={config.autopilot.customMessage || ""}
                         onChange={(e) => updateConfig({ autopilot: { ...config.autopilot, customMessage: e.target.value } })}
                         className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-[#05FF00] transition-all"
                         placeholder="Static tactical string..."
                       />
                    </div>
                  )}

                  <p className="text-[9px] font-medium text-white/20 italic ml-2">
                    {config.autopilot.mode === 'static' 
                      ? "The bot will deploy this exact static string for every dispatch." 
                      : "The bot will randomly select payloads from the chosen source for each cycle."}
                  </p>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <span className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest block mb-2">Cycle Limit</span>
                  <input 
                    type="number" 
                    value={config.autopilot.totalCircles || 0}
                    onChange={(e) => updateConfig({ autopilot: { ...config.autopilot, totalCircles: parseInt(e.target.value) || 0 } })}
                    className="bg-transparent text-xl font-black text-brand-500 dark:text-[#05FF00] w-full outline-none"
                  />
               </div>
               <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 flex flex-col justify-center">
                  <span className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest block mb-2">Loop Logic</span>
                  <button 
                    onClick={() => updateConfig({ autopilot: { ...config.autopilot, infiniteLoop: !config.autopilot.infiniteLoop } })}
                    className={`text-xs font-black uppercase tracking-widest transition-all text-left
                      ${config.autopilot.infiniteLoop ? 'text-brand-500 dark:text-[#05FF00]' : 'text-white/20'}
                    `}
                  >
                    {config.autopilot.infiniteLoop ? "Infinity_Enabled" : "Linear_Process"}
                  </button>
               </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-4">Inter-Message Latency (Seconds)</label>
              <div className="flex items-center gap-4 bg-white dark:bg-black/40 p-2 rounded-2xl border border-gray-100 dark:border-white/10">
                <input
                  type="number"
                  step="0.1"
                  value={(config.autopilot.minDelay || 0) / 1000}
                  onChange={(e) => updateConfig({ autopilot: { ...config.autopilot, minDelay: (parseFloat(e.target.value) || 0) * 1000 } })}
                  className="flex-1 bg-transparent px-4 py-3 text-sm font-black text-brand-500 dark:text-[#05FF00] outline-none text-center"
                />
                <div className="w-px h-8 bg-white/10" />
                <input
                  type="number"
                  step="0.1"
                  value={(config.autopilot.maxDelay || 0) / 1000}
                  onChange={(e) => updateConfig({ autopilot: { ...config.autopilot, maxDelay: (parseFloat(e.target.value) || 0) * 1000 } })}
                  className="flex-1 bg-transparent px-4 py-3 text-sm font-black text-brand-500 dark:text-[#05FF00] outline-none text-center"
                />
              </div>
            </div>
            
            <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <span className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest block mb-2">Circle Cooldown (Seconds)</span>
                <input 
                  type="number"
                  step="0.1"
                  value={(config.autopilot.circleDelay || 0) / 1000}
                  onChange={(e) => updateConfig({ autopilot: { ...config.autopilot, circleDelay: (parseFloat(e.target.value) || 0) * 1000 } })}
                  className="bg-transparent text-sm font-bold dark:text-white w-full outline-none"
                />
            </div>
          </div>
        </div>
      </GlassCard>

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        message={confirmConfig.message}
      />
    </div>
  );
};
