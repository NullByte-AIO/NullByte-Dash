"use client";
import React, { useEffect, useState } from "react";
import { GlassCard } from "../../../components/ui/GlassCard";

type LibraryType = "emojis" | "words";

export const LibraryManager = () => {
  const [activeLibrary, setActiveLibrary] = useState<LibraryType>("emojis");
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLibrary(activeLibrary);
  }, [activeLibrary]);

  const fetchLibrary = async (type: LibraryType) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/kick-bot/library?type=${type}`);
      const data = await res.json();
      setContent(type === "words" ? data.content : JSON.stringify(data, null, 2));
    } catch (e) {
      setContent("ERROR_FETCHING_DATA");
    }
    setIsLoading(false);
  };

  const saveLibrary = async () => {
    setIsLoading(true);
    try {
      const body = activeLibrary === "words" ? { content } : JSON.parse(content);
      await fetch(`/api/kick-bot/library?type=${activeLibrary}`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      });
      alert("LIBRARY_SYNC_SUCCESSFUL");
    } catch (e) {
      alert("MALFORMED_JSON_DETECTED");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {(["emojis", "words"] as LibraryType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveLibrary(type)}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeLibrary === type ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20 dark:bg-[#05FF00] dark:text-black dark:shadow-[#05FF00]/20' : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100 dark:bg-white/[0.02] dark:border-white/[0.05] dark:text-white/20 dark:hover:bg-white/5'}`}
          >
            {type}
          </button>
        ))}
      </div>

      <GlassCard title={`File Data: ${activeLibrary.toUpperCase()}`}>
        <div className="flex flex-col gap-6">
          <div className="relative group">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              className="w-full h-[600px] bg-black/80 dark:bg-black/80 rounded-2xl p-8 text-sm font-mono text-cyan-400 outline-none border border-white/[0.05] focus:border-cyan-500/50 transition-all no-scrollbar overflow-y-auto"
              placeholder="Awaiting data injection..."
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: `${i * 200}ms` }} />)}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-2">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em]">Validation Status</span>
              <span className="text-[10px] font-black text-brand-500 dark:text-[#05FF00] italic">KERNEL_SYNC_READY</span>
            </div>
            <button
              onClick={saveLibrary}
              disabled={isLoading}
              className="w-full sm:w-auto px-12 py-4 rounded-xl bg-brand-500 text-white text-[10px] font-black tracking-[0.3em] uppercase hover:bg-brand-600 transition-all dark:bg-[#05FF00] dark:text-black"
            >
              PUSH_TO_MASTER_BRANCH
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
