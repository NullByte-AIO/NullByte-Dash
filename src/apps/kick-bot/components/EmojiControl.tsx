"use client";
import React, { useEffect, useState, useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { EyeIcon, PlusIcon, TrashBinIcon, CheckLineIcon, BoltIcon, FileIcon, PencilIcon, CloseIcon, PlugInIcon, ShootingStarIcon } from "@/icons";
import { ConfirmationModal } from "@/components/ui/modal/ConfirmationModal";
import { TacticalTooltip } from "@/components/ui/TacticalTooltip";

interface EmojiEntry {
  name: string;
  code: string;
  image: string;
  enabled?: boolean;
}

export const EmojiControl = () => {
  const [emojis, setEmojis] = useState<EmojiEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newEmoji, setNewEmoji] = useState({ name: "", code: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Edit State
  const [editingEmoji, setEditingEmoji] = useState<{ index: number; data: EmojiEntry; originalName: string } | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEmojis();
  }, []);

  // KEYBOARD ESCAPE & ISOLATION LISTENER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditingEmoji(null);
        setEditFile(null);
      }
    };
    if (editingEmoji) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      document.body.classList.remove("modal-open");
    };
  }, [editingEmoji]);

  const fetchEmojis = async () => {
    try {
      const res = await fetch("/api/kick-bot/emojis");
      const data = await res.json();
      setEmojis(Array.isArray(data) ? data : []);
    } catch (e) {}
  };

  const handleDeepSync = () => {
    setConfirmConfig({
      isOpen: true,
      message: "Are you sure you want to GLOBALLY sync all emojis? This will rename all Display Names and physical assets to match their Kick codes. This operation is highly destructive and cannot be easily reversed.",
      variant: "danger",
      onConfirm: async () => {
        setIsSyncing(true);
        try {
          const formData = new FormData();
          formData.append("action", "bulk-sync");
          formData.append("payload", JSON.stringify(emojis));

          const res = await fetch("/api/kick-bot/emojis/upload", {
            method: "POST",
            body: formData
          });
          const data = await res.json();

          if (data.success && data.updatedEmojis) {
            setEmojis(data.updatedEmojis);
            await saveToBackend(data.updatedEmojis);
          }
        } catch (e) {
          console.error("Sync Error:", e);
        }
        setIsSyncing(false);
      }
    });
  };

  const extractNameFromCode = (code: string) => {
    // Robust regex to capture the name part of [emote:ID:NAME]
    const match = code.match(/\[emote:\d+:([^\]\s]+)\]/i);
    return match ? match[1] : "";
  };

  const handleAddEmoji = async () => {
    if (!newEmoji.code) return;
    
    let finalName = newEmoji.name.trim();
    if (!finalName) {
      finalName = extractNameFromCode(newEmoji.code);
    }
    if (!finalName) finalName = "Unnamed_Emote";

    const isDuplicate = emojis.some(e => 
        e.name.toLowerCase() === finalName.toLowerCase() || 
        e.code === newEmoji.code
    );
    if (isDuplicate) {
        alert("🚨 DUPLICATE_EMOTE_DETECTED: This name or code already exists in the matrix.");
        return;
    }
    
    setIsUploading(true);
    try {
      let finalFileName = "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("action", "upload");
        formData.append("file", selectedFile);
        formData.append("name", finalName);

        const uploadRes = await fetch("/api/kick-bot/emojis/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success) finalFileName = uploadData.fileName;
      }

      const entry: EmojiEntry = {
        name: finalName,
        code: newEmoji.code,
        image: finalFileName,
        enabled: true
      };
      
      const updatedEmojis = [...emojis, entry];
      setEmojis(updatedEmojis);
      await saveToBackend(updatedEmojis);
      
      setNewEmoji({ name: "", code: "" });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {}
    setIsUploading(false);
  };

  const handleSaveEdit = async () => {
    if (!editingEmoji) return;
    
    setIsUploading(true);
    try {
      let finalName = editingEmoji.data.name.trim();
      let finalFileName = editingEmoji.data.image;

      // Always try to extract name if it looks like it was accidentally cleared or needs sync
      if (!finalName) {
        finalName = extractNameFromCode(editingEmoji.data.code) || editingEmoji.originalName;
      }

      if (editFile) {
        const formData = new FormData();
        formData.append("action", "upload");
        formData.append("file", editFile);
        formData.append("name", finalName);
        formData.append("oldFileName", editingEmoji.data.image);

        const uploadRes = await fetch("/api/kick-bot/emojis/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) finalFileName = uploadData.fileName;
      } else if (finalName !== editingEmoji.originalName && editingEmoji.data.image) {
        const formData = new FormData();
        formData.append("action", "rename");
        formData.append("oldFileName", editingEmoji.data.image);
        formData.append("newName", finalName);

        const renameRes = await fetch("/api/kick-bot/emojis/upload", {
          method: "POST",
          body: formData,
        });
        const renameData = await renameRes.json();
        if (renameData.success) finalFileName = renameData.fileName;
      }

      const updatedEmojis = [...emojis];
      updatedEmojis[editingEmoji.index] = {
        ...editingEmoji.data,
        name: finalName,
        image: finalFileName
      };

      setEmojis(updatedEmojis);
      await saveToBackend(updatedEmojis);
      setEditingEmoji(null);
      setEditFile(null);
    } catch (e) {}
    setIsUploading(false);
  };

  const toggleEmojiStatus = async (index: number) => {
    const updated = [...emojis];
    updated[index].enabled = updated[index].enabled === false ? true : false;
    setEmojis(updated);
    await saveToBackend(updated);
  };

  const handleRemoveEmoji = async (index: number) => {
    const emoji = emojis[index];
    
    if (emoji.image) {
        const formData = new FormData();
        formData.append("action", "delete");
        formData.append("fileName", emoji.image);
        await fetch("/api/kick-bot/emojis/upload", { method: "POST", body: formData });
    }

    const updated = emojis.filter((_, i) => i !== index);
    setEmojis(updated);
    await saveToBackend(updated);
  };

  const saveToBackend = async (dataToSave: EmojiEntry[]) => {
    setIsSaving(true);
    try {
      const emojiMap: Record<string, any> = {};
      dataToSave.forEach(e => {
        emojiMap[e.name] = { 
            code: e.code, 
            image: e.image, 
            enabled: e.enabled !== false 
        };
      });

      await fetch("/api/kick-bot/emojis", {
        method: "POST",
        body: JSON.stringify(emojiMap),
        headers: { "Content-Type": "application/json" }
      });
    } catch (e) {}
    setIsSaving(false);
  };

  const filteredEmojis = emojis.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.code.includes(searchTerm)
  );

  return (
    <div className="space-y-8 pb-20">
      {/* INTELLIGENT UPLOAD PANEL */}
      <GlassCard title="Intelligent Emote Uplink">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2">Kick Emote Code (Required)</label>
            <input 
              type="text"
              value={newEmoji.code}
              onChange={(e) => setNewEmoji(prev => ({ ...prev, code: e.target.value }))}
              placeholder="[emote:ID:NAME]"
              className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] transition-all dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2">Display Name (Optional)</label>
            <div className="relative">
              <input 
                type="text"
                value={newEmoji.name}
                onChange={(e) => setNewEmoji(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Auto-extracted if empty"
                className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] transition-all dark:text-white pr-12"
              />
              <button 
                onClick={() => setNewEmoji(prev => ({ ...prev, name: extractNameFromCode(prev.code) }))}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#05FF00] transition-colors"
              >
                <ShootingStarIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2">Media File (Optional)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative h-[56px] border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition-all
                ${selectedFile ? 'border-[#05FF00] bg-[#05FF00]/5' : 'border-white/10 hover:border-[#05FF00]/40'}
              `}
            >
               <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
               <span className="text-[10px] font-bold uppercase tracking-widest truncate px-4 text-white/40">
                 {selectedFile ? selectedFile.name : 'Select File'}
               </span>
            </div>
          </div>
          <div className="flex items-end">
            <button onClick={handleAddEmoji} disabled={!newEmoji.code || isUploading} className="w-full h-[56px] rounded-2xl bg-[#05FF00] text-black text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(5,255,0,0.1)]">
              {isUploading ? 'UPLINKING...' : 'INITIALIZE'}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* SEARCH & GLOBAL ACTIONS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2">
         <div className="relative w-full md:w-96 group">
            <EyeIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#05FF00] transition-colors" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter Matrix..."
              className="w-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm outline-none focus:border-[#05FF00] transition-all dark:text-white"
            />
         </div>
         
         <button 
           onClick={handleDeepSync}
           disabled={isSyncing}
           className="px-8 h-[56px] rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 text-white hover:border-[#05FF00] transition-all hover:bg-[#05FF00]/5 group"
         >
            <ShootingStarIcon className={`w-5 h-5 transition-transform group-hover:rotate-12 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Deep Sync</span>
         </button>
      </div>

      {/* EMOTE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {filteredEmojis.map((emoji, index) => (
           <div key={index} className={`group relative overflow-hidden rounded-[40px] border p-8 transition-all hover:translate-y-[-4px] hover:shadow-2xl
             ${emoji.enabled === false ? 'bg-gradient-to-br from-[#1A0B0B] to-[#0F0F12] border-red-500/20' : 'bg-[#0F0F12] border-white/10'}
           `}>
              <div className="flex items-start justify-between mb-8">
                 <div className="flex items-center gap-5 min-w-0 flex-1">
                    <div className="w-20 h-20 shrink-0 rounded-3xl bg-black border border-white/10 flex items-center justify-center overflow-hidden shadow-inner relative">
                       {emoji.image ? (
                        <img src={`/images/emojis/${emoji.image}`} alt={emoji.name} className={`w-12 h-12 object-contain ${emoji.enabled === false ? 'grayscale opacity-30' : ''}`} onError={(e) => (e.currentTarget.src = "/favicon.ico")} />
                       ) : (
                        <BoltIcon className="w-8 h-8 text-white/5" />
                       )}
                       {emoji.enabled === false && <div className="absolute inset-0 bg-red-500/5 flex items-center justify-center"><PlugInIcon className="w-6 h-6 text-red-500/20" /></div>}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                       <h4 className={`text-lg font-black uppercase tracking-wider truncate ${emoji.enabled === false ? 'text-white/20' : 'text-white'}`} title={emoji.name}>
                         {emoji.name}
                       </h4>
                       <div className="flex items-center gap-2 text-[10px] font-mono text-white/20 truncate">
                          {emoji.image ? <span className="truncate">{emoji.image}</span> : <span>NO_MEDIA</span>}
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-2 ml-4 shrink-0">
                    <TacticalTooltip 
                      title={emoji.enabled === false ? "Enable Uplink" : "Disable Uplink"}
                      description={emoji.enabled === false ? "Restore active synchronization for this asset." : "Sever the live link to prevent this asset from being deployed."}
                    >
                      <button 
                        onClick={() => toggleEmojiStatus(index)} 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${emoji.enabled === false ? 'text-red-500 bg-red-500/10' : 'text-[#05FF00] hover:bg-[#05FF00]/10'}`}
                      >
                        <PlugInIcon className="w-5 h-5" />
                      </button>
                    </TacticalTooltip>
                    <TacticalTooltip 
                      title="Edit Metadata"
                      description="Modify display names and tactical codes for this asset."
                    >
                      <button 
                        onClick={() => setEditingEmoji({ index, data: emoji, originalName: emoji.name })} 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </TacticalTooltip>
                    <TacticalTooltip 
                      title="Purge Asset"
                      description="Permanently delete this asset and its physical media from the matrix."
                    >
                      <button 
                        onClick={() => handleRemoveEmoji(index)} 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-red-500/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <TrashBinIcon className="w-5 h-5" />
                      </button>
                    </TacticalTooltip>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                      <BoltIcon className={`w-3 h-3 ${emoji.enabled === false ? 'text-white/10' : 'text-[#05FF00]'}`} />
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Tactical Code</span>
                    </div>
                    {/* Manual Sync Check Icon */}
                    {extractNameFromCode(emoji.code) !== emoji.name && (
                        <div title="Name Mismatch Detected" className="flex items-center gap-1 text-[8px] font-black text-orange-500 uppercase tracking-widest">
                           <ShootingStarIcon className="w-3 h-3" />
                           <span>Mismatch</span>
                        </div>
                    )}
                 </div>
                 <div className={`rounded-2xl p-4 border overflow-hidden ${emoji.enabled === false ? 'bg-black/10 border-white/5' : 'bg-black/40 border-white/5'}`}>
                    <code className={`text-[11px] font-mono block truncate ${emoji.enabled === false ? 'text-white/10' : 'text-[#05FF00]'}`} title={emoji.code}>
                      {emoji.code}
                    </code>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* EDIT MODAL - FULL SCREEN ISOLATION */}
      {editingEmoji && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 pointer-events-auto">
           <div className="absolute inset-0 bg-black/90 backdrop-blur-[25px]" onClick={() => setEditingEmoji(null)} />
           
           <div className="relative w-full max-w-xl bg-[#0F0F12] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_200px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 z-10">
              <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#05FF00]/10 flex items-center justify-center">
                       <PencilIcon className="w-6 h-6 text-[#05FF00]" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tighter">Edit Emote Data</h3>
                       <p className="text-[8px] font-black text-[#05FF00] uppercase tracking-[0.3em]">Isolated Tactical Link</p>
                    </div>
                 </div>
                 <button onClick={() => setEditingEmoji(null)} className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-white/40 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 <div className="flex justify-center mb-4">
                    <div className="w-32 h-32 rounded-[32px] bg-black border border-white/10 flex items-center justify-center overflow-hidden relative group">
                       {editingEmoji.data.image ? (
                        <img src={`/images/emojis/${editingEmoji.data.image}`} className="w-20 h-20 object-contain z-10" />
                       ) : (
                        <BoltIcon className="w-12 h-12 text-white/5" />
                       )}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">Display Name</label>
                       <div className="relative">
                          <input 
                            type="text" 
                            value={editingEmoji.data.name}
                            onChange={(e) => setEditingEmoji({ ...editingEmoji, data: { ...editingEmoji.data, name: e.target.value } })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] transition-all text-white pr-12"
                          />
                          <button 
                            onClick={() => setEditingEmoji({ ...editingEmoji, data: { ...editingEmoji.data, name: extractNameFromCode(editingEmoji.data.code) } })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-[#05FF00] transition-colors"
                            title="Sync with Emote Code"
                          >
                             <ShootingStarIcon className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">Tactical Code</label>
                       <input 
                        type="text" 
                        value={editingEmoji.data.code}
                        onChange={(e) => setEditingEmoji({ ...editingEmoji, data: { ...editingEmoji.data, code: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] transition-all text-white"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">Replace Media (Optional)</label>
                    <div 
                      onClick={() => editFileInputRef.current?.click()}
                      className={`h-[64px] border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition-all
                        ${editFile ? 'border-[#05FF00] bg-[#05FF00]/5' : 'border-white/10 hover:border-white/20'}
                      `}
                    >
                       <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setEditFile(e.target.files?.[0] || null)} />
                       <span className="text-xs font-bold text-white/40 uppercase tracking-widest truncate px-4">
                          {editFile ? editFile.name : 'Click to Upload Asset'}
                       </span>
                    </div>
                 </div>
              </div>

              <div className="p-8 bg-white/5 flex gap-4">
                 <button onClick={() => setEditingEmoji(null)} className="flex-1 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all">
                    Cancel
                 </button>
                 <button onClick={handleSaveEdit} disabled={isUploading} className="flex-[2] py-4 rounded-2xl bg-[#05FF00] text-black text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(5,255,0,0.2)]">
                    {isUploading ? 'UPLOADING...' : 'SAVE CHANGES'}
                 </button>
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
    </div>
  );
};
