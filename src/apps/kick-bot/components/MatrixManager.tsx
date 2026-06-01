"use client";
import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PlusIcon, TrashBinIcon, PencilIcon, CloseIcon, CheckLineIcon, BoltIcon, ListIcon, BoxCubeIcon, FolderIcon } from "@/icons";
import { ConfirmationModal } from "@/components/ui/modal/ConfirmationModal";
import { TacticalTooltip } from "@/components/ui/TacticalTooltip";

export const MatrixManager = () => {
  const [activeTab, setActiveTab] = useState<"chat" | "emoji">("chat");
  const [chatLibraries, setChatLibraries] = useState<Record<string, string[]>>({});
  const [emojiCategories, setEmojiCategories] = useState<Record<string, string[]>>({});
  const [allEmojis, setAllEmojis] = useState<any[]>([]);
  const [isSavingChat, setIsSavingChat] = useState(false);
  const [isSavingEmoji, setIsSavingEmoji] = useState(false);

  const [kickChannel, setKickChannel] = useState("");
  const [isKickSyncing, setIsKickSyncing] = useState(false);
  const [kickSyncStatus, setKickSyncStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  
  const [isEditingChat, setIsEditingChat] = useState<string | null>(null);
  const [chatBuffer, setChatBuffer] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    variant: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
    variant: "info",
  });

  const [isEditingEmoji, setIsEditingEmoji] = useState<string | null>(null);
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);

  useEffect(() => {
    fetchChatLibraries();
    fetchEmojiCategories();
    fetchAllEmojis();
  }, []);

  const fetchChatLibraries = async () => {
    try {
      const res = await fetch("/api/kick-bot/chat-libraries");
      const data = await res.json();
      setChatLibraries(data);
    } catch (e) {}
  };

  const fetchEmojiCategories = async () => {
    try {
      const res = await fetch("/api/kick-bot/emoji-categories");
      const data = await res.json();
      setEmojiCategories(data);
    } catch (e) {}
  };

  const fetchAllEmojis = async () => {
    try {
      const res = await fetch("/api/kick-bot/emojis");
      if (!res.ok) throw new Error("API_UPLINK_FAILURE");
      const data = await res.json();
      if (Array.isArray(data)) {
        setAllEmojis(data);
      }
    } catch (e) {
      console.error("EMOJI_FETCH_CRITICAL:", e);
    }
  };

  const handleSaveChat = async (name: string, content: string) => {
    setIsSavingChat(true);
    try {
      await fetch("/api/kick-bot/chat-libraries", {
        method: "POST",
        body: JSON.stringify({ name, content, action: "save" }),
        headers: { "Content-Type": "application/json" }
      });
      setIsEditingChat(null);
      await fetchChatLibraries();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingChat(false);
    }
  };

  const handleDeleteChat = (name: string) => {
    setConfirmConfig({
      isOpen: true,
      message: `Are you sure you want to delete the chat category "${name}"? This will remove all associated phrases from the tactical database.`,
      variant: "danger",
      onConfirm: async () => {
        await fetch("/api/kick-bot/chat-libraries", {
          method: "POST",
          body: JSON.stringify({ name, action: "delete" }),
          headers: { "Content-Type": "application/json" }
        });
        fetchChatLibraries();
      }
    });
  };

  const handleSaveEmojiCategory = async () => {
    const name = isEditingEmoji || newCatName;
    if (!name) return;

    setIsSavingEmoji(true);
    try {
      const updated = { ...emojiCategories, [name]: selectedEmojis };
      await fetch("/api/kick-bot/emoji-categories", {
        method: "POST",
        body: JSON.stringify(updated),
        headers: { "Content-Type": "application/json" }
      });
      setIsEditingEmoji(null);
      setNewCatName("");
      setSelectedEmojis([]);
      await fetchEmojiCategories();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingEmoji(false);
    }
  };

  const handleDeleteEmojiCategory = (name: string) => {
    setConfirmConfig({
      isOpen: true,
      message: `Delete emoji group "${name}"? This action will unlink all assets from this formation but won't delete the physical emoji files.`,
      variant: "danger",
      onConfirm: async () => {
        const updated = { ...emojiCategories };
        delete updated[name];
        await fetch("/api/kick-bot/emoji-categories", {
          method: "POST",
          body: JSON.stringify(updated),
          headers: { "Content-Type": "application/json" }
        });
        fetchEmojiCategories();
      }
    });
  };

  const toggleEmojiInSelection = (name: string) => {
    setSelectedEmojis(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleKickSync = async () => {
    const channel = kickChannel.trim();
    if (!channel) {
      setKickSyncStatus({ type: 'error', msg: 'Enter a Kick channel name first' });
      return;
    }
    setIsKickSyncing(true);
    setKickSyncStatus(null);
    try {
      const kickRes = await fetch(`https://kick.com/emotes/${channel}`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'omit',
      });

      if (!kickRes.ok) {
        setKickSyncStatus({ type: 'error', msg: `Kick says channel "${channel}" not found (${kickRes.status})` });
        return;
      }

      const kickData = await kickRes.json();
      const allEmotes: { id: number; name: string }[] = [];
      if (Array.isArray(kickData)) {
        for (const set of kickData) {
          if (Array.isArray(set.emotes)) {
            for (const emote of set.emotes) {
              if (emote.id && emote.name) allEmotes.push({ id: emote.id, name: emote.name });
            }
          } else if (set.id && set.name) {
            allEmotes.push({ id: set.id, name: set.name });
          }
        }
      }

      if (allEmotes.length === 0) {
        setKickSyncStatus({ type: 'error', msg: `No emotes found for "${channel}"` });
        return;
      }

      const res = await fetch("/api/kick-bot/emojis/sync-kick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotes: allEmotes, channel }),
      });
      const data = await res.json();
      if (data.success) {
        setKickSyncStatus({ type: 'success', msg: `✓ Synced ${data.synced} emotes from "${channel}"` });
        await fetchAllEmojis();
      } else {
        setKickSyncStatus({ type: 'error', msg: data.error || 'Sync failed' });
      }
    } catch (e: any) {
      setKickSyncStatus({ type: 'error', msg: e.message || 'Network error' });
    } finally {
      setIsKickSyncing(false);
      setTimeout(() => setKickSyncStatus(null), 6000);
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* TACTICAL TAB SYSTEM */}
      <div className="flex items-center gap-4 p-2 bg-white/5 border border-white/10 rounded-[32px] w-fit">
         <button 
           onClick={() => setActiveTab("chat")}
           className={`px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border
             ${activeTab === "chat" ? 'bg-[#05FF00] text-black border-[#05FF00] shadow-[0_0_20px_rgba(5,255,0,0.3)]' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'}
           `}
         >
           <ListIcon className="w-4 h-4" />
           Chat Libraries
         </button>
         <button 
           onClick={() => setActiveTab("emoji")}
           className={`px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 border
             ${activeTab === "emoji" ? 'bg-[#05FF00] text-black border-[#05FF00] shadow-[0_0_20px_rgba(5,255,0,0.3)]' : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'}
           `}
         >
           <BoxCubeIcon className="w-4 h-4" />
           Emoji Groups
         </button>
      </div>

      {activeTab === "chat" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* CREATE NEW CHAT LIBRARY */}
           <GlassCard title="Deploy New Chat Category">
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">Category Name (e.g. Hype, Toxic)</label>
                    <input 
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Enter identity..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] transition-all text-white"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">Phrases (One per line)</label>
                    <textarea 
                      value={chatBuffer}
                      onChange={(e) => setChatBuffer(e.target.value)}
                      placeholder="LFG&#10;POG&#10;MASSIVE"
                      rows={6}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] transition-all text-white font-mono no-scrollbar"
                    />
                 </div>
                 <button 
                  onClick={() => {
                    handleSaveChat(newCatName, chatBuffer);
                    setNewCatName("");
                    setChatBuffer("");
                  }}
                  disabled={!newCatName || !chatBuffer || isSavingChat}
                  className="w-full py-5 rounded-2xl bg-[#05FF00] hover:bg-[#05FF00]/90 text-black text-[11px] font-black uppercase tracking-[0.25em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 shadow-[0_0_30px_rgba(5,255,0,0.25)] border border-[#05FF00]/50 flex items-center justify-center gap-2"
                 >
                    {isSavingChat ? (
                       <>
                         <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                         </svg>
                         <span>Deploying Category...</span>
                       </>
                     ) : 'Initialize Category'}
                 </button>
              </div>
           </GlassCard>

           {/* EXISTING CHAT LIBRARIES */}
           <div className="flex flex-col gap-4">
              <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.4em] ml-6">Tactical Reserves</h3>
              <div className="space-y-6 max-h-[630px] overflow-y-auto no-scrollbar pr-4">
              {Object.entries(chatLibraries).map(([name, msgs]) => {
                if (!Array.isArray(msgs)) return null;
                return (
                  <div key={name} className="group relative bg-[#0F0F12] border border-white/10 rounded-[40px] p-8 hover:border-[#05FF00]/40 transition-all overflow-hidden">
                   <div className="flex items-center justify-between mb-6 relative z-10">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                            <FolderIcon className="w-6 h-6 text-[#05FF00]" />
                         </div>
                         <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tighter">{name}</h4>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{msgs.length} Phrases Encrypted</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <TacticalTooltip 
                          title="Reconfigure Matrix"
                          description="Edit the underlying phrase data for this chat category."
                         >
                           <button 
                            onClick={() => {
                              setIsEditingChat(name);
                              setChatBuffer(msgs.join("\n"));
                            }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all"
                           >
                              <PencilIcon className="w-5 h-5" />
                           </button>
                         </TacticalTooltip>

                         <TacticalTooltip 
                          title="Purge Category"
                          description="Completely remove this chat library from the active reserves."
                         >
                           <button 
                            onClick={() => handleDeleteChat(name)} 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                           >
                              <TrashBinIcon className="w-5 h-5" />
                           </button>
                         </TacticalTooltip>
                      </div>
                   </div>
                   
                   <div className="flex flex-wrap gap-2 relative z-10 max-h-[100px] overflow-hidden opacity-40">
                      {msgs.slice(0, 10).map((m, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-mono text-white/60 whitespace-nowrap">{m}</span>
                      ))}
                      {msgs.length > 10 && <span className="text-[9px] text-white/20">+{msgs.length - 10} more</span>}
                   </div>
                   
                   <div className="absolute -right-10 -bottom-10 opacity-[0.02] rotate-12 transition-transform group-hover:rotate-0">
                      <ListIcon className="w-40 h-40" />
                   </div>
                </div>
              );
              })}
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-8">
           {/* KICK EMOTE SYNC UI */}
           <GlassCard title="Global Emote Uplink">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                 <div className="flex-1 space-y-2 w-full">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">Kick Channel Slug</label>
                    <input 
                      type="text"
                      value={kickChannel}
                      onChange={(e) => setKickChannel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleKickSync()}
                      placeholder="e.g. xqc, adinross, iamano"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] transition-all text-white"
                    />
                 </div>
                 <div className="flex-[0.5] flex items-end h-full mt-2 w-full">
                    <button 
                      onClick={handleKickSync}
                      disabled={isKickSyncing || !kickChannel.trim()}
                      className="w-full h-[56px] rounded-2xl bg-[#05FF00] hover:bg-[#05FF00]/90 text-black text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 shadow-[0_0_20px_rgba(5,255,0,0.2)] border border-[#05FF00]/50 flex items-center justify-center gap-2"
                    >
                      {isKickSyncing ? (
                         <>
                           <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                           </svg>
                           <span>Syncing...</span>
                         </>
                      ) : (
                         <span>Sync Emotes</span>
                      )}
                    </button>
                 </div>
              </div>
              {kickSyncStatus && (
                <div className={`mt-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest animate-in fade-in duration-300 ${
                  kickSyncStatus.type === 'success' ? 'bg-[#05FF00]/10 text-[#05FF00] border border-[#05FF00]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {kickSyncStatus.msg}
                </div>
              )}
           </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* CREATE/EDIT EMOJI GROUP */}
           <GlassCard title={isEditingEmoji ? `Reconfiguring ${isEditingEmoji}` : "Deploy New Emoji Matrix"}>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">Group Identity</label>
                    <input 
                      type="text"
                      value={isEditingEmoji || newCatName}
                      disabled={!!isEditingEmoji}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Reaction_Set_A"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] transition-all text-white disabled:opacity-40"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">Select Unit Assets ({selectedEmojis.length})</label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[280px] overflow-y-auto no-scrollbar p-3 bg-black/20 rounded-3xl border border-white/5">
                       {(Array.isArray(allEmojis) ? allEmojis : []).map((emoji) => (
                         <button
                           key={emoji.name}
                           onClick={() => toggleEmojiInSelection(emoji.name)}
                           title={emoji.name}
                           className={`h-12 w-full rounded-lg border flex items-center justify-center transition-all relative overflow-hidden
                             ${selectedEmojis.includes(emoji.name) ? 'border-[#05FF00] bg-[#05FF00]/20' : 'border-white/5 bg-white/5 hover:border-white/20'}
                           `}
                         >
                            {(() => {
                               const localSrc = emoji.image ? `/images/emojis/${emoji.image}` : null;
                               const cdnMatch = emoji.code?.match(/\[emote:(\d+):/);
                               const cdnSrc = cdnMatch ? `https://files.kick.com/emotes/${cdnMatch[1]}/fullsize` : null;
                               const src = localSrc || cdnSrc;
                               return src ? (
                                 <img src={src} className="w-6 h-6 object-contain" onError={(e) => { e.currentTarget.style.display='none'; }} />
                               ) : (
                                 <span className="text-[8px] font-mono text-white/40">{emoji.name.slice(0, 2)}</span>
                               );
                             })()}
                            {selectedEmojis.includes(emoji.name) && (
                              <div className="absolute top-0 right-0 p-0.5 bg-[#05FF00] rounded-bl">
                                <CheckLineIcon className="w-1.5 h-1.5 text-black" />
                              </div>
                            )}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="flex gap-4">
                    {isEditingEmoji && (
                      <button onClick={() => { setIsEditingEmoji(null); setSelectedEmojis([]); setNewCatName(""); }} className="flex-1 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all">
                        Cancel
                      </button>
                    )}
                    <button 
                      onClick={handleSaveEmojiCategory}
                      disabled={(!isEditingEmoji && !newCatName) || selectedEmojis.length === 0 || isSavingEmoji}
                      className="flex-[2] py-5 rounded-2xl bg-[#05FF00] hover:bg-[#05FF00]/90 text-black text-[11px] font-black uppercase tracking-[0.25em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20 shadow-[0_0_30px_rgba(5,255,0,0.25)] border border-[#05FF00]/50 flex items-center justify-center gap-2"
                    >
                        {isSavingEmoji ? (
                           <>
                             <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                             </svg>
                             <span>Syncing Matrix...</span>
                           </>
                         ) : isEditingEmoji ? 'Commit Synchronization' : 'Initialize Matrix'}
                    </button>
                 </div>
              </div>
           </GlassCard>

           {/* EXISTING EMOJI CATEGORIES */}
           <div className="flex flex-col gap-4">
              <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.4em] ml-6">Active Formations</h3>
              <div className="space-y-6 max-h-[630px] overflow-y-auto no-scrollbar pr-4">
              {Object.entries(emojiCategories).map(([name, items]) => {
                if (!Array.isArray(items)) return null;
                return (
                  <div key={name} className="group relative bg-[#0F0F12] border border-white/10 rounded-[40px] p-8 hover:border-[#05FF00]/40 transition-all overflow-hidden">
                   <div className="flex items-center justify-between mb-6 relative z-10">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                            <BoxCubeIcon className="w-6 h-6 text-[#05FF00]" />
                         </div>
                         <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tighter">{name}</h4>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{items.length} Assets Linked</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <TacticalTooltip 
                          title="Sync Formation"
                          description="Re-map the assets included in this tactical emoji group."
                         >
                           <button 
                            onClick={() => {
                              setIsEditingEmoji(name);
                              setSelectedEmojis(items);
                            }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all"
                           >
                              <PencilIcon className="w-5 h-5" />
                           </button>
                         </TacticalTooltip>

                         <TacticalTooltip 
                          title="Dismantle Group"
                          description="Unlink all assets from this formation and delete the category metadata."
                         >
                           <button 
                            onClick={() => handleDeleteEmojiCategory(name)} 
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                           >
                              <TrashBinIcon className="w-5 h-5" />
                           </button>
                         </TacticalTooltip>
                      </div>
                   </div>
                   
                   <div className="flex flex-wrap gap-2 relative z-10">
                      {items.slice(0, 15).map((eName) => {
                        const emoji = Array.isArray(allEmojis) ? allEmojis.find(e => e.name === eName) : null;
                        return (
                           <div key={eName} className="w-8 h-8 rounded-lg bg-black flex items-center justify-center border border-white/5 group-hover:border-[#05FF00]/20 transition-colors">
                             {(() => {
                               const localSrc = emoji?.image ? `/images/emojis/${emoji.image}` : null;
                               const cdnMatch = emoji?.code?.match(/\[emote:(\d+):/);
                               const cdnSrc = cdnMatch ? `https://files.kick.com/emotes/${cdnMatch[1]}/fullsize` : null;
                               const src = localSrc || cdnSrc;
                               return src ? (
                                 <img src={src} className="w-5 h-5 object-contain" onError={(e) => { e.currentTarget.style.display='none'; }} />
                               ) : (
                                 <span className="text-[8px] font-mono text-white/20">{eName.slice(0, 2)}</span>
                               );
                             })()}
                           </div>
                        );
                      })}
                      {items.length > 15 && <div className="flex items-center text-[10px] font-black text-white/20 ml-2">+{items.length - 15}</div>}
                   </div>
                   
                   <div className="absolute -right-10 -bottom-10 opacity-[0.02] rotate-12 transition-transform group-hover:rotate-0">
                      <BoxCubeIcon className="w-40 h-40" />
                   </div>
                </div>
              );
              })}
              </div>
           </div>
        </div>
        </div>
      )}

      {/* EDIT CHAT MODAL */}
      {isEditingChat && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-[25px]" onClick={() => setIsEditingChat(null)} />
           <div className="relative w-full max-w-xl bg-[#0F0F12] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 z-10">
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                 <div className="flex items-center gap-4">
                    <PencilIcon className="w-6 h-6 text-[#05FF00]" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Reconfiguring: {isEditingChat}</h3>
                 </div>
                 <button onClick={() => setIsEditingChat(null)} className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                 </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                 <textarea 
                  value={chatBuffer}
                  onChange={(e) => setChatBuffer(e.target.value)}
                  className="w-full h-80 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] transition-all text-white font-mono no-scrollbar"
                 />
                 <div className="flex gap-4">
                   <button onClick={() => setIsEditingChat(null)} disabled={isSavingChat} className="flex-1 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all disabled:opacity-40">Cancel</button>
                   <button onClick={() => handleSaveChat(isEditingChat, chatBuffer)} disabled={isSavingChat} className="flex-[2] py-4 rounded-2xl bg-[#05FF00] hover:bg-[#05FF00]/90 text-black text-[11px] font-black uppercase tracking-[0.25em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(5,255,0,0.25)] border border-[#05FF00]/50 flex items-center justify-center gap-2">
                     {isSavingChat ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Saving...</span>
                        </>
                      ) : 'Commit Changes'}
                   </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(5, 255, 0, 0.2);
        }
        
        body.modal-open .main-content-background {
          filter: blur(15px);
        }
      `}</style>
    </div>
  );
};
