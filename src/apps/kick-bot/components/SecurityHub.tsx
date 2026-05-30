"use client";
import React from "react";
import { GlassCard } from "../../../components/ui/GlassCard";

export const SecurityHub = () => {
  return (
    <div className="space-y-8">
      <GlassCard title="Security & Authentication">
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-brand-500/10 dark:bg-[#05FF00]/10 border border-brand-500/20 dark:border-[#05FF00]/20">
            <h3 className="text-sm font-bold text-brand-500 dark:text-[#05FF00] mb-2">Zero-Trust OAuth Architecture Active</h3>
            <p className="text-xs text-gray-500 dark:text-white/60 leading-relaxed">
              This system is currently protected by a strict Discord OAuth middleware. Passwords and legacy authentication methods have been completely removed.
              <br /><br />
              To add or remove authorized administrators, you must modify the <code className="px-2 py-1 bg-black/20 rounded font-mono text-[10px]">ALLOWED_DISCORD_IDS</code> variable inside your <code className="px-2 py-1 bg-black/20 rounded font-mono text-[10px]">.env.local</code> file and restart the Next.js server.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
