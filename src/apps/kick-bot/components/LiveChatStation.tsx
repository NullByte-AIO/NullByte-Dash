"use client";
import React, { useState, useEffect, useRef } from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { BoltIcon, BoxCubeIcon, ChevronDownIcon, ListIcon, PlugInIcon } from "@/icons";
import { TacticalTooltip } from "@/components/ui/TacticalTooltip";

interface Message {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
}

interface ChatLibraries {
  [key: string]: string[];
}

interface Emoji {
  name: string;
  code: string;
  id: string | null;
  url: string | null;
  image: string;
}

export const LiveChatStation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [activePersonaIndex, setActivePersonaIndex] = useState(0);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chatLibraries, setChatLibraries] = useState<ChatLibraries>({});
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [emojiCategories, setEmojiCategories] = useState<Record<string, string[]>>({});
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<string>("All Assets");
  const [openLibrary, setOpenLibrary] = useState<string | null>(null);
  
  const chatRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const libDropdownRef = useRef<HTMLDivElement>(null);
  const emojiScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (emojiScrollRef.current) {
        e.preventDefault();
        emojiScrollRef.current.scrollLeft += e.deltaY;
      }
    };
    const current = emojiScrollRef.current;
    if (current) {
      current.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (current) current.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchChatLibraries();
    fetchEmojis();
    fetchEmojiCategories();
    
    const interval = setInterval(() => {
       const mockUsers = ["xQc_Fan", "LulMaster", "KickBot_99", "Shadow"];
       const mockMsgs = ["LFG", "pog", "W", "massive", "nice", "EZ", "kek", "777"];
       const mockMsg: Message = {
         id: Math.random().toString(),
         user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
         content: mockMsgs[Math.floor(Math.random() * mockMsgs.length)],
         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
         type: 'incoming'
       };
       setMessages(prev => [...prev.slice(-99), mockMsg]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (libDropdownRef.current && !libDropdownRef.current.contains(event.target as Node)) {
        setOpenLibrary(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAccounts = async () => {
    const res = await fetch("/api/kick-bot/accounts");
    const data = await res.json();
    setAccounts(Object.values(data.accounts || {}).filter((a: any) => a.enabled));
  };

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

  const fetchEmojis = async () => {
    try {
      const res = await fetch("/api/kick-bot/emojis");
      if (!res.ok) throw new Error("API_UPLINK_FAILURE");
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmojis(data);
      }
    } catch (e) {
      console.error("EMOJI_FETCH_CRITICAL:", e);
    }
  };

  const handleSendMessage = async (customContent?: string) => {
    const content = customContent || inputValue;
    if (!content.trim() || accounts.length === 0) return;

    const activeAccount = accounts[activePersonaIndex];
    const newMsg: Message = {
      id: Math.random().toString(),
      user: activeAccount.username,
      content: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'outgoing'
    };
    
    setMessages(prev => [...prev.slice(-99), newMsg]);
    if (!customContent) setInputValue("");
    setAutoScroll(true);
    setOpenLibrary(null);

    fetch("/api/kick-bot/command", {
      method: "POST",
      body: JSON.stringify({ 
        action: "send_msg", 
        token: activeAccount.token, 
        message: content, 
        humanMode: false 
      }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const emojiList = Array.isArray(emojis) ? emojis : [];
  const filteredEmojis = selectedEmojiCategory === "All Assets" 
    ? emojiList.filter(e => e.enabled !== false)
    : emojiList.filter(e => emojiCategories[selectedEmojiCategory]?.includes(e.name));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-auto xl:h-[calc(100vh-200px)]">
      
      {/* MAIN CHAT AREA */}
      <div className="xl:col-span-3 flex flex-col h-[600px] xl:h-full overflow-hidden border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0A0A0B] rounded-[32px] shadow-sm dark:shadow-2xl relative">
        
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-black/20 relative z-30">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 pr-4 border-r border-gray-100 dark:border-white/5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Live Feed</span>
              </div>
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between gap-3 min-w-[180px] bg-white dark:bg-[#121215] border border-gray-100 dark:border-white/10 rounded-xl px-4 py-2 text-[11px] font-bold text-gray-600 dark:text-white uppercase tracking-wider outline-none cursor-pointer hover:border-[#05FF00] transition-all shadow-sm"
                >
                  <span className="truncate">{accounts[activePersonaIndex]?.username || 'Select Persona'}</span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-[#0F0F10] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {accounts.map((acc, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setActivePersonaIndex(index);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider transition-colors border-b border-white/[0.03] last:border-0
                            ${activePersonaIndex === index ? 'bg-[#05FF00] text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                          `}
                        >
                          {acc.username}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
           </div>

           <div className="flex items-center gap-3">
              {!autoScroll && (
                <button 
                  onClick={() => setAutoScroll(true)}
                  className="text-[10px] font-bold text-brand-500 dark:text-[#05FF00] uppercase tracking-wide px-3 py-1 bg-brand-500/10 rounded-full animate-bounce"
                >
                  Resume Auto-Scroll
                </button>
              )}
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#05FF00]/20 bg-[#05FF00]/5">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#05FF00] animate-pulse" />
                 <span className="text-[10px] font-black text-[#05FF00] uppercase tracking-widest">High-Speed Mode</span>
              </div>
           </div>
        </div>

        <div 
          ref={chatRef} 
          onScroll={() => {
            if (chatRef.current) {
              const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
              setAutoScroll(scrollHeight - scrollTop <= clientHeight + 100);
            }
          }}
          className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-white dark:bg-transparent"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.type === 'outgoing' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <span className={`text-[11px] font-bold ${msg.type === 'outgoing' ? 'text-brand-500 dark:text-[#05FF00]' : 'text-gray-400'}`}>
                  {msg.user}
                </span>
                <span className="text-[10px] text-gray-300 dark:text-white/10">{msg.timestamp}</span>
              </div>
              <div className={`px-5 py-2.5 rounded-2xl text-[14px] max-w-[85%] shadow-sm ${msg.type === 'outgoing' ? 'bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black font-bold' : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white/80'}`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50/50 dark:bg-black/40 border-t border-gray-100 dark:border-white/5 relative z-30">
           <div className="flex flex-col gap-3">
              <div className="relative">
                <input 
                  type="text"
                  autoComplete="off"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Chatting as ${accounts[activePersonaIndex]?.username || '...'}`}
                  className="w-full bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] transition-all pr-24 dark:text-white dark:caret-[#05FF00] shadow-inner"
                />
                <TacticalTooltip title="Transmit Signal" description="Send the current payload into the live neural uplink.">
                  <button 
                    onClick={() => handleSendMessage()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 rounded-xl bg-gray-900 text-white dark:bg-[#05FF00] dark:text-black text-xs font-black uppercase tracking-wider shadow-lg hover:scale-[1.05] hover:shadow-[0_0_15px_rgba(5,255,0,0.4)] active:scale-[0.98] transition-all duration-200"
                  >
                    Send
                  </button>
                </TacticalTooltip>
              </div>
           </div>
        </div>
      </div>

      {/* TACTICAL SIDEBAR */}
      <div className="flex flex-col gap-6 h-auto xl:h-full overflow-hidden" ref={libDropdownRef}>
         
         {/* EMOJI PICKER WITH CATEGORIES */}
         <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[32px] p-5 flex flex-col h-[350px]">
            <div className="flex items-center justify-between mb-4 px-2">
               <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.4em] ml-2">Emoji Matrix</h3>
               <div className="w-1.5 h-1.5 rounded-full bg-[#05FF00] shadow-[0_0_8px_#05FF00]" />
            </div>

            {/* Category Tabs for Emojis */}
            <div 
               ref={emojiScrollRef}
               className="overflow-x-auto overflow-y-hidden custom-scrollbar mb-4 -mx-5 px-5"
            >
               <div className="flex gap-2 pb-8 pt-2">
                  <button 
                    onClick={() => setSelectedEmojiCategory("All Assets")}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                      ${selectedEmojiCategory === "All Assets" ? 'bg-[#05FF00] text-black' : 'bg-white/5 text-white/40 hover:text-white'}
                    `}
                  >
                     All
                  </button>
                  {Object.keys(emojiCategories).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedEmojiCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all
                        ${selectedEmojiCategory === cat ? 'bg-[#05FF00] text-black' : 'bg-white/5 text-white/40 hover:text-white'}
                      `}
                    >
                       {cat}
                    </button>
                  ))}
               </div>
            </div>
            
            <div className="grid grid-cols-4 gap-3 overflow-y-auto custom-scrollbar pr-1">
               {filteredEmojis.map((emoji) => (
                 <button
                  key={emoji.name}
                  onClick={() => handleSendMessage(emoji.code)}
                  className="group relative aspect-square bg-gray-50 dark:bg-black/40 rounded-xl border border-gray-100 dark:border-white/10 flex items-center justify-center hover:border-[#05FF00] hover:bg-[#05FF00]/10 transition-all overflow-hidden"
                  title={emoji.name}
                 >
                    {emoji.image ? (
                      <img 
                       src={`/images/emojis/${emoji.image}`} 
                       alt={emoji.name} 
                       className="w-7 h-7 object-contain group-hover:scale-125 transition-transform duration-300" 
                       loading="lazy"
                       onError={(e) => (e.currentTarget.src = "/favicon.ico")}
                      />
                    ) : (
                      <span className="text-xs font-mono text-white/40">{emoji.name.slice(0, 2)}</span>
                    )}
                   <div className="absolute inset-0 bg-[#05FF00]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>
               ))}
               {filteredEmojis.length === 0 && (
                 <div className="col-span-4 py-10 flex flex-col items-center justify-center text-white/10">
                    <BoxCubeIcon className="w-8 h-8 mb-2" />
                    <span className="text-[9px] font-black uppercase">No Assets in Set</span>
                 </div>
               )}
            </div>
         </div>

         {/* LIBRARIES */}
         <div className="flex-1 flex flex-col overflow-hidden">
            <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.4em] ml-4 mb-6">Tactical Libraries</h3>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
              {Object.entries(chatLibraries).map(([name, msgs]) => (
                <div key={name} className="relative">
                  <button
                    onClick={() => setOpenLibrary(openLibrary === name ? null : name)}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group
                      ${openLibrary === name 
                        ? 'bg-[#05FF00] border-[#05FF00] text-black shadow-[0_0_20px_rgba(5,255,0,0.2)]' 
                        : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-500 dark:text-white/40 hover:border-[#05FF00]/50'}
                    `}
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest">{name}</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${openLibrary === name ? 'rotate-180' : ''}`} />
                  </button>

                  {openLibrary === name && (
                    <div className="mt-2 bg-[#0F0F10] border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50 no-scrollbar">
                      <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                        {msgs.map((m, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(m)}
                            className="w-full px-4 py-3 text-left text-[11px] font-bold text-white/60 hover:bg-[#05FF00] hover:text-black transition-all border-b border-white/[0.03] last:border-0 uppercase tracking-wide"
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
         </div>

         <div className="p-4 bg-black/20 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-[#05FF00] animate-pulse" />
               <span className="text-[9px] font-black text-[#05FF00] uppercase tracking-[0.2em]">Hot-Swap Ready</span>
            </div>
         </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
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
      `}</style>
    </div>
  );
};
