"use client";
import React, { useEffect, useState } from "react";
import { BoltIcon } from "@/icons";

export const BackendGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBackendOffline, setIsBackendOffline] = useState(false);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const res = await fetch("/api/kick-bot/health", { cache: "no-store" });
        if (res.status === 503 || res.status === 500) {
          setIsBackendOffline(true);
        } else {
          setIsBackendOffline(false);
        }
      } catch (e) {
        setIsBackendOffline(true);
      }
    };

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {children}
      {isBackendOffline && (
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl pointer-events-auto">
          <div className="relative flex flex-col items-center p-12 bg-black/80 border border-red-500/30 rounded-[32px] shadow-[0_0_100px_rgba(239,68,68,0.15)] overflow-hidden">
             <div className="absolute top-0 right-0 opacity-[0.03] rotate-12 -translate-y-10 translate-x-10 pointer-events-none">
               <BoltIcon className="w-64 h-64 text-red-500" />
             </div>
             
             <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                  <div className="w-6 h-6 rounded-full bg-red-500 animate-ping" />
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black tracking-tighter text-red-500 uppercase">Uplink Lost</h2>
                  <p className="text-sm font-medium text-white/50 tracking-widest uppercase">System Lockdown Engaged</p>
                </div>
                
                <div className="mt-4 px-6 py-3 bg-red-500/5 rounded-xl border border-red-500/10 max-w-sm text-center">
                  <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">
                    The backend connection has been severed. All interfaces are frozen to prevent payload corruption. Re-initialize the backend server to restore full operations.
                  </p>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
};
