"use client";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { GlassCard } from "../../../components/ui/GlassCard";
import { ConfirmationModal } from "@/components/ui/modal/ConfirmationModal";
import { TacticalTooltip } from "@/components/ui/TacticalTooltip";

export const TacticalConfigHub = () => {
  const { data: config, mutate } = useSWR("/api/kick-bot/config", fetcher);
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
    if (config && !pendingConfig) {
      setPendingConfig(JSON.parse(JSON.stringify(config)));
    }
  }, [config, pendingConfig]);
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

  // Replaced fetchConfig with SWR

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
        mutate(JSON.parse(JSON.stringify(pendingConfig)), false);
        await fetch("/api/kick-bot/config", {
          method: "POST",
          body: JSON.stringify(pendingConfig),
          headers: { "Content-Type": "application/json" },
        });
        mutate();
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
