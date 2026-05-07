"use client";
import React, { useEffect, useState } from "react";
import { GlassCard } from "../../../components/ui/GlassCard";

export const BotControlCenter = () => {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const res = await fetch("/api/kick-bot/config");
    const data = await res.json();
    setConfig(data);
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

  if (!config) return null;

  return (
    <div className="space-y-8">
      <GlassCard title="Autonomous Logic Cluster">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/[0.05]">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-gray-400 dark:text-white/30 uppercase tracking-[0.2em]">Logic Engine</span>
              <span className={`text-lg font-black italic tracking-tighter ${config.autopilot.enabled ? 'text-brand-500 dark:text-[#05FF00]' : 'text-red-500'}`}>
                {config.autopilot.enabled ? "RUNNING_KERNEL_V4" : "STOPPED_KERNEL_V4"}
              </span>
            </div>
            <button
              onClick={() => updateConfig({ autopilot: { ...config.autopilot, enabled: !config.autopilot.enabled } })}
              className={`px-8 py-3 rounded-xl text-[10px] font-black tracking-[0.3em] uppercase transition-all ${config.autopilot.enabled ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500 hover:text-white' : 'bg-brand-500/10 text-brand-500 border border-brand-500/50 hover:bg-brand-500 hover:text-white dark:bg-[#05FF00]/10 dark:text-[#05FF00] dark:border-[#05FF00]/50 dark:hover:bg-[#05FF00] dark:hover:text-black'}`}
            >
              {config.autopilot.enabled ? "TERMINATE" : "INITIALIZE"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em]">Sync Interval Min</label>
              <input
                type="number"
                value={config.autopilot.minDelay}
                onChange={(e) => updateConfig({ autopilot: { ...config.autopilot, minDelay: parseInt(e.target.value) } })}
                className="bg-white dark:bg-black/60 border border-gray-200 dark:border-white/[0.1] rounded-xl px-4 py-4 text-sm font-mono text-brand-500 dark:text-[#05FF00] outline-none focus:border-brand-500/50 dark:focus:border-[#05FF00]/50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em]">Sync Interval Max</label>
              <input
                type="number"
                value={config.autopilot.maxDelay}
                onChange={(e) => updateConfig({ autopilot: { ...config.autopilot, maxDelay: parseInt(e.target.value) } })}
                className="bg-white dark:bg-black/60 border border-gray-200 dark:border-white/[0.1] rounded-xl px-4 py-4 text-sm font-mono text-brand-500 dark:text-[#05FF00] outline-none focus:border-brand-500/50 dark:focus:border-[#05FF00]/50"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Network Parameters">
        <div className="space-y-8">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em]">Target Broadcast ID</label>
            <input
              type="text"
              value={config.streamerName}
              onChange={(e) => updateConfig({ streamerName: e.target.value })}
              className="bg-white dark:bg-black/60 border border-gray-200 dark:border-white/[0.1] rounded-xl px-4 py-4 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-cyan-500/50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em]">Kernel Chatroom UID</label>
            <input
              type="text"
              value={config.chatroomId}
              onChange={(e) => updateConfig({ chatroomId: e.target.value })}
              className="bg-white dark:bg-black/60 border border-gray-200 dark:border-white/[0.1] rounded-xl px-4 py-4 text-sm font-mono text-cyan-600 dark:text-cyan-400 outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
