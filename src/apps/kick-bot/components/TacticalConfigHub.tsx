"use client";
import React, { useEffect, useState } from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { ConfirmationModal } from "@/components/ui/modal/ConfirmationModal";
import { TacticalTooltip } from "@/components/ui/TacticalTooltip";

export const TacticalConfigHub = () => {
  const [config, setConfig] = useState<any>(null);
  const [pendingConfig, setPendingConfig] = useState<any>(null);
  const [streamerLink, setStreamerLink] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const [isNavigationWarningOpen, setIsNavigationWarningOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const isBypassingWarning = React.useRef(false);

  useEffect(() => {
    if (!config || !pendingConfig) return;

    const hasChanges = JSON.stringify(config) !== JSON.stringify(pendingConfig);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && !isBypassingWarning.current) {
        e.preventDefault();
        e.returnValue = "You have unsaved tactical configurations. Exit anyway?";
        return e.returnValue;
      }
    };

    const handleInternalNavigation = (e: MouseEvent) => {
      if (!hasChanges || isBypassingWarning.current) return;
      
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.href && link.href.startsWith(window.location.origin) && !link.href.includes(window.location.pathname)) {
        e.preventDefault();
        e.stopPropagation();
        setPendingUrl(link.href);
        setIsNavigationWarningOpen(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleInternalNavigation, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleInternalNavigation, true);
    };
  }, [config, pendingConfig]);

  const handleConfirmNavigation = () => {
    if (pendingUrl) {
      isBypassingWarning.current = true;
      window.location.href = pendingUrl;
    }
    setIsNavigationWarningOpen(false);
  };

  const fetchConfig = async () => {
    const res = await fetch("/api/kick-bot/config");
    const data = await res.json();
    setConfig(data);
    setPendingConfig(JSON.parse(JSON.stringify(data)));
  };

  const handleExtract = async () => {
    if (!streamerLink) return;
    setIsExtracting(true);
    setError(null);

    try {
      const res = await fetch("/api/kick-bot/fetch-streamer", {
        method: "POST",
        body: JSON.stringify({ streamerLink }),
        headers: { "Content-Type": "application/json" },
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract streamer data.");
      }

      setPendingConfig({
        ...pendingConfig,
        streamerName: data.streamerName,
        chatroomId: data.chatroomId
      });
      setStreamerLink(""); // Clear on success
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    setConfirmConfig({
      isOpen: true,
      message: `Are you sure you want to deploy these parameters? This will synchronize the bot with ${pendingConfig.streamerName}'s neural network.`,
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
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <GlassCard title="Streamer Configuration">
        <div className="space-y-8">
          
          {/* LINK EXTRACTION SECTOR */}
          <div className="p-8 rounded-[32px] bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2">Neural Link (Kick URL)</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                   <input 
                    type="text"
                    placeholder="https://kick.com/username"
                    value={streamerLink}
                    onChange={(e) => setStreamerLink(e.target.value)}
                    className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm font-bold dark:text-white outline-none focus:border-brand-500 dark:focus:border-[#05FF00] transition-all"
                   />
                   {isExtracting && (
                     <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-brand-500 dark:border-[#05FF00] border-t-transparent rounded-full animate-spin" />
                     </div>
                   )}
                </div>
                <button 
                  onClick={handleExtract}
                  disabled={isExtracting || !streamerLink}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black text-[10px] font-black uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Extract
                </button>
              </div>
              {error && (
                <p className="text-[10px] font-bold text-red-500 mt-2 ml-2 animate-in fade-in slide-in-from-top-1">
                  ERROR: {error}
                </p>
              )}
            </div>
          </div>

          {/* ACTIVE PARAMETERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2">Active Streamer</label>
              <input 
                type="text"
                readOnly
                value={pendingConfig.streamerName}
                className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-black text-brand-500 dark:text-[#05FF00] outline-none cursor-not-allowed opacity-80"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2">Chatroom Identifier</label>
              <input 
                type="text"
                readOnly
                value={pendingConfig.chatroomId}
                className="w-full bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-mono text-gray-500 dark:text-white/40 outline-none cursor-not-allowed opacity-80"
              />
            </div>
          </div>

          <div className="flex justify-end pt-8 border-t border-gray-100 dark:border-white/5">
            <TacticalTooltip 
              title="Synchronize Neural Link"
              description="Deploy the extracted streamer parameters to the core tactical engine."
            >
              <button 
                onClick={handleSave}
                disabled={pendingConfig.streamerName === config.streamerName && pendingConfig.chatroomId === config.chatroomId}
                className="px-12 py-4 rounded-2xl bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 dark:shadow-[#05FF00]/10 hover:translate-y-[-2px] disabled:opacity-30 disabled:translate-y-0 disabled:grayscale transition-all"
              >
                Deploy Profile
              </button>
            </TacticalTooltip>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Neural Uplink (Logging)">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-1">Discord Webhook URL</span>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={pendingConfig.logging?.discordWebhookUrl || ""}
                  onChange={(e) => setPendingConfig({ 
                    ...pendingConfig, 
                    logging: { 
                      ...(pendingConfig.logging || {}), 
                      discordWebhookUrl: e.target.value 
                    } 
                  })}
                  className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:border-[#05FF00] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-1">Webhook Identity</span>
              <input 
                type="text"
                placeholder="Nickname"
                value={pendingConfig.logging?.username || "NullByte Neural"}
                onChange={(e) => setPendingConfig({ 
                  ...pendingConfig, 
                  logging: { 
                    ...(pendingConfig.logging || {}), 
                    username: e.target.value 
                  } 
                })}
                className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:border-[#05FF00] transition-all"
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-1">Avatar URL</span>
              <input 
                type="text"
                placeholder="https://..."
                value={pendingConfig.logging?.avatarUrl || ""}
                onChange={(e) => setPendingConfig({ 
                  ...pendingConfig, 
                  logging: { 
                    ...(pendingConfig.logging || {}), 
                    avatarUrl: e.target.value 
                  } 
                })}
                className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:border-[#05FF00] transition-all"
              />
            </div>
          </div>

          {/* EMBED CONFIG */}
          <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 space-y-6">
            <span className="text-[10px] font-black text-[#05FF00] uppercase tracking-[0.3em] ml-1 block">Embed Orchestrator</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-white/20 uppercase">Primary Color</span>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-lg border border-white/10 shrink-0" style={{ backgroundColor: pendingConfig.logging?.embedColor || '#05FF00' }} />
                    <input 
                      type="text"
                      placeholder="#05FF00"
                      value={pendingConfig.logging?.embedColor || "#05FF00"}
                      onChange={(e) => setPendingConfig({ 
                        ...pendingConfig, 
                        logging: { ...(pendingConfig.logging || {}), embedColor: e.target.value } 
                      })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white outline-none focus:border-[#05FF00]"
                    />
                  </div>
               </div>
               <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-white/20 uppercase">Footer Text</span>
                  <input 
                    type="text"
                    placeholder="NullByte Neural Operations"
                    value={pendingConfig.logging?.footerText || ""}
                    onChange={(e) => setPendingConfig({ 
                      ...pendingConfig, 
                      logging: { ...(pendingConfig.logging || {}), footerText: e.target.value } 
                    })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#05FF00]"
                  />
               </div>
               <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-white/20 uppercase">Author Name</span>
                  <input 
                    type="text"
                    placeholder="Uplink Node_01"
                    value={pendingConfig.logging?.authorName || ""}
                    onChange={(e) => setPendingConfig({ 
                      ...pendingConfig, 
                      logging: { ...(pendingConfig.logging || {}), authorName: e.target.value } 
                    })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#05FF00]"
                  />
               </div>
               <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-white/20 uppercase">Thumbnail URL</span>
                  <input 
                    type="text"
                    placeholder="https://..."
                    value={pendingConfig.logging?.thumbnailUrl || ""}
                    onChange={(e) => setPendingConfig({ 
                      ...pendingConfig, 
                      logging: { ...(pendingConfig.logging || {}), thumbnailUrl: e.target.value } 
                    })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#05FF00]"
                  />
               </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
            <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-1 mb-4 block">Event Filtration Matrix</span>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { id: 'SYSTEM', label: 'System' },
                { id: 'ACCOUNTS', label: 'Accounts' },
                { id: 'CHAT', label: 'Chat' },
                { id: 'AUTOMATION', label: 'Automation' },
                { id: 'SECURITY', label: 'Security' }
              ].map(event => (
                <button
                  key={event.id}
                  onClick={() => {
                    const events = pendingConfig.logging?.events || {};
                    setPendingConfig({
                      ...pendingConfig,
                      logging: {
                        ...pendingConfig.logging,
                        events: { ...events, [event.id]: !events[event.id] }
                      }
                    });
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    pendingConfig.logging?.events?.[event.id] 
                      ? 'bg-[#05FF00]/10 border-[#05FF00] text-[#05FF00]' 
                      : 'bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/20'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${pendingConfig.logging?.events?.[event.id] ? 'bg-[#05FF00] shadow-[0_0_8px_#05FF00]' : 'bg-current opacity-20'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{event.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
             <TacticalTooltip title="Synchronize Matrix" description="Deploy the updated logging identity and filtration parameters.">
               <button 
                onClick={handleSave}
                className="px-8 py-2.5 rounded-xl bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black text-xs font-black uppercase tracking-widest shadow-lg"
               >
                 Deploy Uplink Config
               </button>
             </TacticalTooltip>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Autopilot Protocols">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 group">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">Confirmation Cycle</span>
                <span className="text-xs font-bold dark:text-white/60">Require manual approval every X min</span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="number"
                  value={pendingConfig.autopilotProtocols?.confirmationInterval || 10}
                  onChange={(e) => setPendingConfig({ 
                    ...pendingConfig, 
                    autopilotProtocols: { 
                      ...(pendingConfig.autopilotProtocols || {}), 
                      confirmationInterval: parseInt(e.target.value) 
                    } 
                  })}
                  className="w-16 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-black text-brand-500 dark:text-[#05FF00] outline-none text-center"
                />
                <button 
                  onClick={() => setPendingConfig({ 
                    ...pendingConfig, 
                    autopilotProtocols: { 
                      ...(pendingConfig.autopilotProtocols || {}), 
                      requireConfirmation: !(pendingConfig.autopilotProtocols?.requireConfirmation ?? true) 
                    } 
                  })}
                  className={`w-12 h-6 rounded-full transition-all relative ${pendingConfig.autopilotProtocols?.requireConfirmation ?? true ? 'bg-brand-500 dark:bg-[#05FF00]' : 'bg-gray-200 dark:bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${pendingConfig.autopilotProtocols?.requireConfirmation ?? true ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 group">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">Auto-Terminate</span>
                <span className="text-xs font-bold dark:text-white/60">End sequence if stream goes offline</span>
              </div>
              <button 
                onClick={() => setPendingConfig({ 
                  ...pendingConfig, 
                  autopilotProtocols: { 
                    ...(pendingConfig.autopilotProtocols || {}), 
                    stopOnStreamEnd: !(pendingConfig.autopilotProtocols?.stopOnStreamEnd ?? true) 
                  } 
                })}
                className={`w-12 h-6 rounded-full transition-all relative ${pendingConfig.autopilotProtocols?.stopOnStreamEnd ?? true ? 'bg-brand-500 dark:bg-[#05FF00]' : 'bg-gray-200 dark:bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${pendingConfig.autopilotProtocols?.stopOnStreamEnd ?? true ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/5">
             <TacticalTooltip title="Update Protocols" description="Commit the new autopilot strategic parameters to the core database.">
               <button 
                onClick={handleSave}
                className="px-8 py-2.5 rounded-xl bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black text-xs font-black uppercase tracking-widest shadow-lg"
               >
                 Save Protocols
               </button>
             </TacticalTooltip>
          </div>
        </div>
      </GlassCard>

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        message={confirmConfig.message}
      />

      <ConfirmationModal
        isOpen={isNavigationWarningOpen}
        onClose={() => setIsNavigationWarningOpen(false)}
        onConfirm={handleConfirmNavigation}
        message="CRITICAL: You have unsaved tactical configurations. If you leave now, all pending parameter changes will be purged. Do you wish to abort and remain on uplink?"
        confirmText="Exit Anyway"
        cancelText="Stay on Uplink"
      />
    </div>
  );
};
