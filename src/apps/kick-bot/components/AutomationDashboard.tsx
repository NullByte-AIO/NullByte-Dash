"use client";
import React, { useEffect, useState } from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { ListIcon, ShootingStarIcon, BoltIcon } from "@/icons";
import { ConfirmationModal } from "@/components/ui/modal/ConfirmationModal";
import { TacticalTooltip } from "@/components/ui/TacticalTooltip";

export const AutomationDashboard = () => {
  const [config, setConfig] = useState<any>(null);
  const [chatLibraries, setChatLibraries] = useState<Record<string, string[]>>({});
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchConfig();
    fetchChatLibraries();
  }, []);

  const fetchConfig = async () => {
    const res = await fetch("/api/kick-bot/config");
    const data = await res.json();
    setConfig(data);
  };

  const fetchChatLibraries = async () => {
    try {
      const res = await fetch("/api/kick-bot/chat-libraries");
      const data = await res.json();
      setChatLibraries(data);
    } catch (e) {}
  };

  const updateConfig = async (updates: any) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    await fetch("/api/kick-bot/config", {
      method: "POST",
      body: JSON.stringify(newConfig),
      headers: { "Content-Type": "application/json" },
    });
  };

  const toggleAutopilot = (type: 'standard' | 'custom') => {
    const isStandard = type === 'standard';
    const currentStatus = isStandard ? config.autopilot.enabled : (config.customAutopilot?.enabled || false);
    
    if (!currentStatus) {
      setConfirmConfig({
        isOpen: true,
        message: `Are you sure you want to INITIATE the ${type} autopilot sequence? This will begin automated command dispatch based on your current tactical parameters.`,
        onConfirm: () => {
          if (isStandard) {
            updateConfig({ autopilot: { ...config.autopilot, enabled: true } });
          } else {
            updateConfig({ customAutopilot: { ...(config.customAutopilot || {}), enabled: true } });
          }
        }
      });
      return;
    }

    if (isStandard) {
      updateConfig({ autopilot: { ...config.autopilot, enabled: !config.autopilot.enabled } });
    } else {
      updateConfig({ customAutopilot: { ...(config.customAutopilot || {}), enabled: !(config.customAutopilot?.enabled || false) } });
    }
  };

  if (!config) return null;

  return (
    <div className="space-y-8 pb-20">
      {/* Standard Autopilot */}
      <GlassCard title="Strategic Autopilot (Main)">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-8 rounded-[32px] bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 relative overflow-hidden group">
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
                  onClick={() => toggleAutopilot('standard')}
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

            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                  <span className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest block mb-2">Cycle Limit</span>
                  <input 
                    type="number" 
                    value={config.autopilot.totalCircles}
                    onChange={(e) => updateConfig({ autopilot: { ...config.autopilot, totalCircles: parseInt(e.target.value) } })}
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
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-4">Inter-Message Latency (ms)</label>
              <div className="flex items-center gap-4 bg-white dark:bg-black/40 p-2 rounded-2xl border border-gray-100 dark:border-white/10">
                <input
                  type="number"
                  value={config.autopilot.minDelay}
                  onChange={(e) => updateConfig({ autopilot: { ...config.autopilot, minDelay: parseInt(e.target.value) } })}
                  className="flex-1 bg-transparent px-4 py-3 text-sm font-black text-brand-500 dark:text-[#05FF00] outline-none text-center"
                />
                <div className="w-px h-8 bg-white/10" />
                <input
                  type="number"
                  value={config.autopilot.maxDelay}
                  onChange={(e) => updateConfig({ autopilot: { ...config.autopilot, maxDelay: parseInt(e.target.value) } })}
                  className="flex-1 bg-transparent px-4 py-3 text-sm font-black text-brand-500 dark:text-[#05FF00] outline-none text-center"
                />
              </div>
            </div>
            <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <span className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest block mb-2">Circle Cooldown (ms)</span>
                <input 
                  type="number" 
                  value={config.autopilot.circleDelay}
                  onChange={(e) => updateConfig({ autopilot: { ...config.autopilot, circleDelay: parseInt(e.target.value) } })}
                  className="bg-transparent text-sm font-bold dark:text-white w-full outline-none"
                />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Custom Message Autopilot */}
      <GlassCard title="Tactical Payload Autopilot">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-8 rounded-[32px] bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 relative overflow-hidden group">
              <div className="flex flex-col gap-1 relative z-10">
                <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em]">Deployment Status</span>
                <span className={`text-2xl font-black uppercase tracking-tighter ${config.customAutopilot?.enabled ? 'text-cyan-500' : 'text-red-500'}`}>
                  {config.customAutopilot?.enabled ? "In_Flight" : "Grounded"}
                </span>
              </div>
              <TacticalTooltip 
                title={config.customAutopilot?.enabled ? "Abort Launch" : "Launch Payload"}
                description={config.customAutopilot?.enabled ? "Kill the current custom payload sequence and ground all units." : "Initialize the custom message/category deployment protocol."}
              >
                <button
                  onClick={() => toggleAutopilot('custom')}
                  className={`relative z-10 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all
                    ${config.customAutopilot?.enabled ? 'bg-red-500 text-white' : 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'}
                  `}
                >
                  {config.customAutopilot?.enabled ? "Abort" : "Launch"}
                </button>
              </TacticalTooltip>
            </div>
            
            {/* PAYLOAD MODE SELECTOR */}
            <div className="space-y-6 bg-white dark:bg-white/5 p-8 rounded-[32px] border border-gray-100 dark:border-white/10">
               <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">Payload Protocol</label>
                  <div className="flex items-center gap-4">
                     <button 
                       onClick={() => updateConfig({ customAutopilot: { ...config.customAutopilot, mode: 'static' } })}
                       className={`text-[9px] font-black uppercase tracking-widest ${config.customAutopilot?.mode !== 'category' ? 'text-cyan-500' : 'text-white/20'}`}
                     >
                       Static_String
                     </button>
                     <button 
                       onClick={() => updateConfig({ customAutopilot: { ...config.customAutopilot, mode: 'category' } })}
                       className={`text-[9px] font-black uppercase tracking-widest ${config.customAutopilot?.mode === 'category' ? 'text-[#05FF00]' : 'text-white/20'}`}
                     >
                       Matrix_Category
                     </button>
                  </div>
               </div>

               {config.customAutopilot?.mode === 'category' ? (
                 <div className="space-y-4">
                    <div className="relative group">
                       <ListIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#05FF00]" />
                       <select 
                         value={config.customAutopilot?.category || ""}
                         onChange={(e) => updateConfig({ customAutopilot: { ...config.customAutopilot, category: e.target.value } })}
                         className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-[#05FF00] appearance-none"
                       >
                          <option value="">Select Category Matrix...</option>
                          {Object.keys(chatLibraries).map(cat => (
                            <option key={cat} value={cat}>{cat} ({chatLibraries[cat].length} phrases)</option>
                          ))}
                       </select>
                    </div>
                    <p className="text-[9px] font-medium text-white/20 italic ml-2">The bot will randomly select payloads from the chosen category for each cycle.</p>
                 </div>
               ) : (
                 <div className="relative group">
                    <ShootingStarIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-cyan-500" />
                    <input
                      type="text"
                      value={config.customAutopilot?.customMessage || ""}
                      onChange={(e) => updateConfig({ customAutopilot: { ...config.customAutopilot, customMessage: e.target.value } })}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-cyan-500 transition-all"
                      placeholder="Static tactical string..."
                    />
                 </div>
               )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 rounded-[32px] bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <span className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest block mb-2">Cycle Count</span>
                <input 
                  type="number" 
                  value={config.customAutopilot?.totalCircles || 0}
                  onChange={(e) => updateConfig({ customAutopilot: { ...config.customAutopilot, totalCircles: parseInt(e.target.value) } })}
                  className="bg-transparent text-sm font-black dark:text-white w-full outline-none"
                />
             </div>
             <div className="p-6 rounded-[32px] bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                <span className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest block mb-2">Rest Period</span>
                <input 
                  type="number" 
                  value={config.customAutopilot?.circleDelay || 0}
                  onChange={(e) => updateConfig({ customAutopilot: { ...config.customAutopilot, circleDelay: parseInt(e.target.value) } })}
                  className="bg-transparent text-sm font-black dark:text-white w-full outline-none"
                />
             </div>
             <div className="p-6 rounded-[32px] bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 col-span-2 space-y-4">
                <label className="text-[9px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest block">Deployment Latency (ms)</label>
                <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                  <input
                    type="number"
                    value={config.customAutopilot?.minDelay || 0}
                    onChange={(e) => updateConfig({ customAutopilot: { ...config.customAutopilot, minDelay: parseInt(e.target.value) } })}
                    className="flex-1 bg-transparent px-3 py-2 text-xs font-mono dark:text-white text-center outline-none"
                  />
                  <div className="w-px h-6 bg-white/5" />
                  <input
                    type="number"
                    value={config.customAutopilot?.maxDelay || 0}
                    onChange={(e) => updateConfig({ customAutopilot: { ...config.customAutopilot, maxDelay: parseInt(e.target.value) } })}
                    className="flex-1 bg-transparent px-3 py-2 text-xs font-mono dark:text-white text-center outline-none"
                  />
                </div>
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
