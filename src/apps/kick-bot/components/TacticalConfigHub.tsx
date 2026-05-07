"use client";
import React, { useEffect, useState } from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { ConfirmationModal } from "@/components/ui/modal/ConfirmationModal";
import { TacticalTooltip } from "@/components/ui/TacticalTooltip";

export const TacticalConfigHub = () => {
  const [config, setConfig] = useState<any>(null);
  const [pendingConfig, setPendingConfig] = useState<any>(null);
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
  }, []);

  const fetchConfig = async () => {
    const res = await fetch("/api/kick-bot/config");
    const data = await res.json();
    setConfig(data);
    setPendingConfig(JSON.parse(JSON.stringify(data)));
  };

  const handleSave = (section: string) => {
    setConfirmConfig({
      isOpen: true,
      message: `Are you sure you want to commit the current modifications to the ${section} sector? This will synchronize all pending configurations with the tactical database.`,
      onConfirm: async () => {
        await fetch("/api/kick-bot/config", {
          method: "POST",
          body: JSON.stringify(pendingConfig),
          headers: { "Content-Type": "application/json" },
        });
        setConfig(JSON.parse(JSON.stringify(pendingConfig)));
      }
    });
  };

  if (!pendingConfig) return null;

  return (
    <div className="space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GENERAL SETTINGS */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard title="General Settings">
             <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Streamer Name</label>
                     <input 
                      type="text"
                      value={pendingConfig.streamerName}
                      onChange={(e) => setPendingConfig({ ...pendingConfig, streamerName: e.target.value })}
                      className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-5 py-3.5 text-sm font-bold text-brand-500 dark:text-[#05FF00] outline-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Chatroom ID</label>
                     <input 
                      type="text"
                      value={pendingConfig.chatroomId}
                      onChange={(e) => setPendingConfig({ ...pendingConfig, chatroomId: e.target.value })}
                      className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-5 py-3.5 text-sm font-bold text-brand-500 dark:text-[#05FF00] outline-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Master Password</label>
                     <input 
                      type="password"
                      value={pendingConfig.password}
                      onChange={(e) => setPendingConfig({ ...pendingConfig, password: e.target.value })}
                      className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-5 py-3.5 text-sm font-bold dark:text-white outline-none"
                     />
                  </div>
                  <div className="flex items-end">
                     <button 
                      onClick={() => setPendingConfig({ ...pendingConfig, panelsEnabled: !pendingConfig.panelsEnabled })}
                      className={`w-full py-3.5 rounded-xl text-xs font-bold uppercase transition-all border ${pendingConfig.panelsEnabled ? 'bg-brand-500/10 border-brand-500/20 text-brand-500 dark:text-[#05FF00]' : 'border-red-500/20 text-red-500'}`}
                     >
                       {pendingConfig.panelsEnabled ? "Panels Online" : "Panels Offline"}
                     </button>
                  </div>
               </div>
                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
                   <TacticalTooltip 
                    title="Commit Settings"
                    description="Synchronize general streamer and chatroom parameters with the database."
                   >
                     <button 
                      onClick={() => handleSave("General Settings")}
                      className="px-8 py-2.5 rounded-xl bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black text-xs font-bold shadow-lg"
                    >
                      Save Changes
                    </button>
                   </TacticalTooltip>
                </div>
             </div>
          </GlassCard>

          <GlassCard title="Discord Channels">
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Dashboard Channel", key: "controlChannelId" },
                    { label: "Activity Logs", key: "logsChannelId" },
                    { label: "Autopilot Dash", key: "autopilotChannelId" },
                    { label: "Autopilot Logs", key: "autopilotLogsChannelId" },
                  ].map((item) => (
                    <div key={item.key} className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{item.label}</label>
                      <input 
                        type="text"
                        value={pendingConfig[item.key] || ""}
                        onChange={(e) => setPendingConfig({ ...pendingConfig, [item.key]: e.target.value })}
                        className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-5 py-3 text-sm font-mono text-gray-500 dark:text-white/40 outline-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
                   <TacticalTooltip 
                    title="Link Channels"
                    description="Update the Discord webhook and channel IDs for tactical logging and control."
                   >
                     <button 
                      onClick={() => handleSave("Discord Channels")}
                      className="px-8 py-2.5 rounded-xl bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black text-xs font-bold shadow-lg"
                    >
                      Save Channels
                    </button>
                   </TacticalTooltip>
                </div>
             </div>
          </GlassCard>
        </div>

        {/* SECURITY */}
        <div className="space-y-8">
           <GlassCard title="Security Protocols">
              <div className="space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                        <span className="text-xs font-bold text-gray-400 uppercase">Master Lock</span>
                        <button 
                          onClick={() => setPendingConfig({ ...pendingConfig, passwordEnabled: !pendingConfig.passwordEnabled })}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${pendingConfig.passwordEnabled ? 'bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}
                        >
                          {pendingConfig.passwordEnabled ? "Locked" : "Unlocked"}
                        </button>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 block">Protected Actions</label>
                        {Object.entries(pendingConfig.passwordGating).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-white/[0.03]">
                            <span className="text-xs font-medium text-gray-600 dark:text-white/40">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <button
                              onClick={() => setPendingConfig({ ...pendingConfig, passwordGating: { ...pendingConfig.passwordGating, [key]: !value } })}
                              className={`w-8 h-4 rounded-full transition-all relative ${value ? 'bg-brand-500 dark:bg-[#05FF00]' : 'bg-gray-200 dark:bg-white/10'}`}
                            >
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${value ? 'left-4.5' : 'left-0.5'}`} />
                            </button>
                          </div>
                        ))}
                    </div>
                 </div>
                 <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
                    <TacticalTooltip 
                      title="Lock Protocols"
                      description="Apply the updated password gating and master lock security parameters."
                    >
                      <button 
                        onClick={() => handleSave("Security Protocols")}
                        className="w-full py-2.5 rounded-xl bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black text-xs font-bold shadow-lg"
                      >
                        Save Security
                      </button>
                    </TacticalTooltip>
                 </div>
              </div>
           </GlassCard>

           <GlassCard title="Whitelisted Users">
              <div className="space-y-6">
                 <div className="space-y-4">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Authorized Discord IDs</label>
                    <textarea 
                        value={pendingConfig.allowedUsers.join("\n")}
                        onChange={(e) => setPendingConfig({ ...pendingConfig, allowedUsers: e.target.value.split("\n").map(u => u.trim()).filter(u => u !== "") })}
                        className="w-full h-40 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl p-4 text-xs font-mono text-brand-500 dark:text-[#05FF00] outline-none no-scrollbar"
                        placeholder="One ID per line..."
                    />
                 </div>
                 <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
                    <TacticalTooltip 
                      title="Update Access"
                      description="Synchronize the list of authorized Discord IDs with the security matrix."
                    >
                      <button 
                        onClick={() => handleSave("Whitelist")}
                        className="w-full py-2.5 rounded-xl bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black text-xs font-bold shadow-lg"
                      >
                        Update Whitelist
                      </button>
                    </TacticalTooltip>
                 </div>
              </div>
           </GlassCard>
        </div>

      </div>

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        message={confirmConfig.message}
      />
    </div>
  );
};
