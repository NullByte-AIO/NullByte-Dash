"use client";
import React, { useEffect, useState } from "react";
import { GlassCard } from "../../../components/ui/GlassCard";

export const SecurityHub = () => {
  const [config, setConfig] = useState<any>(null);
  const [allowedUsersText, setAllowedUsersText] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const res = await fetch("/api/kick-bot/config");
    const data = await res.json();
    setConfig(data);
    setAllowedUsersText(data.allowedUsers.join("\n"));
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

  const saveAllowedUsers = () => {
    const users = allowedUsersText.split("\n").map(u => u.trim()).filter(u => u !== "");
    updateConfig({ allowedUsers: users });
  };

  if (!config) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-8">
        <GlassCard title="Authorization Firewall">
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em]">Authorized Discord IDs</label>
            <textarea
              value={allowedUsersText}
              onChange={(e) => setAllowedUsersText(e.target.value)}
              className="w-full h-48 bg-white dark:bg-black/60 border border-gray-200 dark:border-white/[0.1] rounded-2xl p-4 text-sm font-mono text-brand-500 dark:text-[#05FF00] outline-none focus:border-brand-500/50 dark:focus:border-[#05FF00]/50 no-scrollbar"
              placeholder="Enter Discord IDs (one per line)..."
            />
            <button
              onClick={saveAllowedUsers}
              className="w-full py-4 rounded-xl bg-brand-500 text-white text-[10px] font-black tracking-[0.3em] uppercase hover:bg-brand-600 transition-all dark:bg-[#05FF00] dark:text-black"
            >
              UPDATE_FIREWALL_RULES
            </button>
          </div>
        </GlassCard>

        <GlassCard title="Kernel Password Logic">
           <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase">Global Lock</span>
                  <span className={`text-xs font-black ${config.passwordEnabled ? 'text-[#05FF00]' : 'text-red-500'}`}>
                    {config.passwordEnabled ? "ENCRYPTED" : "UNPROTECTED"}
                  </span>
                </div>
                <button
                  onClick={() => updateConfig({ passwordEnabled: !config.passwordEnabled })}
                  className={`px-6 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase border ${config.passwordEnabled ? 'border-red-500/50 text-red-500' : 'border-brand-500/50 text-brand-500 dark:border-[#05FF00]/50 dark:text-[#05FF00]'}`}
                >
                  {config.passwordEnabled ? "DISABLE" : "ENABLE"}
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em]">Session Duration (Min)</label>
                <input
                  type="number"
                  value={config.passwordSessionMinutes}
                  onChange={(e) => updateConfig({ passwordSessionMinutes: parseInt(e.target.value) })}
                  className="bg-white dark:bg-black/60 border border-gray-200 dark:border-white/[0.1] rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none"
                />
              </div>
           </div>
        </GlassCard>
      </div>

      <div className="space-y-8">
        <GlassCard title="Gated Operations">
          <div className="space-y-4">
            {Object.entries(config.passwordGating).map(([key, value]: [string, any]) => (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05] group hover:border-brand-500/30 dark:hover:border-[#05FF00]/30 transition-all">
                <span className="text-[10px] font-black text-gray-500 dark:text-white/40 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</span>
                <button
                  onClick={() => updateConfig({ passwordGating: { ...config.passwordGating, [key]: !value } })}
                  className={`w-12 h-6 rounded-full transition-all relative ${value ? 'bg-brand-500 dark:bg-[#05FF00]' : 'bg-gray-200 dark:bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
