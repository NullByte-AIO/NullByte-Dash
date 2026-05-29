"use client";
import React, { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { GlassCard } from "../../../components/ui/GlassCard";
import { BoltIcon, BoxCubeIcon, ChevronDownIcon, ListIcon, PlugInIcon } from "@/icons";
import { TacticalTooltip } from "@/components/ui/TacticalTooltip";

interface Message {
  id: string;
  user: string;
  sender_id?: string | number;
  content: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
  replyTo?: {
    user: string;
    content: string;
  };
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
  enabled?: boolean;
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
  
  const [chatroomId, setChatroomId] = useState<string | null>(null);
  const [pusherConnected, setPusherConnected] = useState(false);
  const [isLiveFeedPaused, setIsLiveFeedPaused] = useState(false);
  const liveFeedPausedRef = useRef(isLiveFeedPaused);

  useEffect(() => {
    liveFeedPausedRef.current = isLiveFeedPaused;
  }, [isLiveFeedPaused]);
  
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
    
    // Fetch chatroomId from config
    fetch("/api/kick-bot/config")
      .then(res => res.json())
      .then(data => {
        if (data.chatroomId) setChatroomId(data.chatroomId);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!chatroomId) return;

    const pusher = new Pusher('32cbd69e4b950bf97679', {
      cluster: 'us2',
    });

    const channel = pusher.subscribe(`chatrooms.${chatroomId}.v2`);

    pusher.connection.bind('connected', () => {
      setPusherConnected(true);
    });

    pusher.connection.bind('disconnected', () => {
      setPusherConnected(false);
    });

    channel.bind('App\\Events\\ChatMessageEvent', (data: any) => {
      if (liveFeedPausedRef.current) return;

      const incomingMsg: Message = {
        id: data.id,
        user: data.sender?.username || 'Unknown',
        sender_id: data.sender?.id,
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'incoming'
      };
      
      setMessages(prev => {
        if (prev.some(m => m.id === incomingMsg.id)) return prev;

        // Check if this incoming message matches a recent outgoing message we sent
        const recentOutgoingIdx = prev.findIndex(m => 
          m.type === 'outgoing' && 
          m.user === incomingMsg.user && 
          m.content === incomingMsg.content
        );

        if (recentOutgoingIdx !== -1) {
          // Update the fake local message with the real Kick ID and Sender ID
          const newArr = [...prev];
          newArr[recentOutgoingIdx] = {
            ...newArr[recentOutgoingIdx],
            id: incomingMsg.id,
            sender_id: incomingMsg.sender_id
          };
          return newArr;
        }

        return [...prev.slice(-149), incomingMsg];
      });
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`chatrooms.${chatroomId}.v2`);
      pusher.disconnect();
    };
  }, [chatroomId]);

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

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-500";
    const s = status.toUpperCase();
    if (s === "ACTIVE") return "bg-[#05FF00] shadow-[0_0_8px_#05FF00]";
    if (s === "UNCHECKED" || s === "NEW") return "bg-yellow-500 shadow-[0_0_8px_#eab308]";
    return "bg-red-500 shadow-[0_0_8px_#ef4444]";
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
    } catch (e: any) {
      if (e.message !== "API_UPLINK_FAILURE") {
        console.error("EMOJI_FETCH_CRITICAL:", e);
      }
    }
  };

  const [replyingTo, setReplyingTo] = useState<{ id: string, user: string, content: string, sender_id?: string | number } | null>(null);

  const handleSendMessage = async (customContent?: string) => {
    const content = customContent || inputValue;
    if (!content.trim() || accounts.length === 0) return;

    const activeAccount = accounts[activePersonaIndex];
    const newMsg: Message = {
      id: crypto.randomUUID(),
      user: activeAccount.username,
      sender_id: activeAccount.userId,
      content: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'outgoing',
      replyTo: replyingTo ? { user: replyingTo.user, content: replyingTo.content } : undefined
    };
    
    setMessages(prev => [...prev.slice(-99), newMsg]);
    if (!customContent) setInputValue("");
    setAutoScroll(true);
    setOpenLibrary(null);

    let replyData = undefined;
    if (replyingTo) {
      const repliedAccount = accounts.find(a => a.username === replyingTo.user);
      
      let finalSenderId = replyingTo.sender_id;
      if (!finalSenderId && repliedAccount) {
        finalSenderId = parseInt(repliedAccount.userId) || 0;
      }
      
      replyData = {
        original_message_id: replyingTo.id,
        original_message_content: replyingTo.content,
        original_sender_id: finalSenderId || 0,
        original_sender_username: replyingTo.user
      };
      
      // Clear the reply UI indicator instantly
      setReplyingTo(null);
    }

    try {
      const response = await fetch("/api/kick-bot/command", {
        method: "POST",
        body: JSON.stringify({ 
          action: "send_msg", 
          token: activeAccount.token, 
          message: content, 
          humanMode: false,
          replyData: replyData 
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.id) {
          setMessages(prev => {
            const idx = prev.findIndex(m => m.id === newMsg.id);
            if (idx !== -1) {
              const newArr = [...prev];
              newArr[idx] = {
                ...newArr[idx],
                id: result.id,
                sender_id: result.sender_id
              };
              return newArr;
            }
            return prev;
          });
        }
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const emojiList = Array.isArray(emojis) ? emojis : [];
  const filteredEmojis = selectedEmojiCategory === "All Assets" 
    ? emojiList.filter(e => e.enabled !== false)
    : emojiList.filter(e => emojiCategories[selectedEmojiCategory]?.includes(e.name));

  const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(true);
  const [isEmojiMenuLocked, setIsEmojiMenuLocked] = useState(false);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-auto xl:h-[calc(100vh-200px)]">
      
      {/* MAIN CHAT AREA */}
      <div className="xl:col-span-3 flex flex-col h-[60vh] md:h-[600px] xl:h-full overflow-hidden border border-gray-100 dark:border-white/5 bg-white dark:bg-[#0A0A0B] rounded-[32px] shadow-sm dark:shadow-2xl relative">
        
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex flex-wrap md:flex-nowrap items-center justify-between gap-4 bg-gray-50/50 dark:bg-black/20 relative z-30">
           <div className="flex items-center gap-4 w-full md:w-auto">
              <button 
                onClick={() => setIsLiveFeedPaused(!isLiveFeedPaused)}
                className={`flex items-center gap-2 pr-4 border-r border-gray-100 dark:border-white/5 shrink-0 transition-opacity ${isLiveFeedPaused ? 'opacity-50' : 'opacity-100 hover:opacity-80'}`}
                title={isLiveFeedPaused ? "Resume Live Feed" : "Pause Live Feed"}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${pusherConnected && !isLiveFeedPaused ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-pulse' : 'bg-gray-500'}`} />
                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest hidden sm:block">
                  {isLiveFeedPaused ? 'Feed Paused' : 'Live Feed'}
                </span>
              </button>
              
              <div className="relative flex-1 md:flex-none" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex w-full md:w-auto items-center justify-between gap-3 min-w-[140px] md:min-w-[180px] bg-white dark:bg-[#121215] border border-gray-100 dark:border-white/10 rounded-xl px-4 py-2 text-[11px] font-bold text-gray-600 dark:text-white uppercase tracking-wider outline-none cursor-pointer hover:border-[#05FF00] transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    {accounts.length > 0 && (
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusColor(accounts[activePersonaIndex]?.status)}`} />
                    )}
                    <span className="truncate">{accounts[activePersonaIndex]?.username || 'Select Persona'}</span>
                  </div>
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
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getStatusColor(acc.status)}`} />
                            <span>{acc.username}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
           </div>

           <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
              {!autoScroll && (
                <button 
                  onClick={() => setAutoScroll(true)}
                  className="text-[10px] font-bold text-brand-500 dark:text-[#05FF00] uppercase tracking-wide px-3 py-1 bg-brand-500/10 rounded-full animate-bounce shrink-0"
                >
                  Resume
                </button>
              )}
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#05FF00]/20 bg-[#05FF00]/5 shrink-0">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#05FF00] animate-pulse" />
                 <span className="text-[10px] font-black text-[#05FF00] uppercase tracking-widest hidden sm:block">High-Speed Mode</span>
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
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar bg-white dark:bg-transparent"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col group/msg ${msg.type === 'outgoing' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <span className={`text-[11px] font-bold ${msg.type === 'outgoing' ? 'text-brand-500 dark:text-[#05FF00]' : 'text-gray-400'}`}>
                  {msg.user}
                </span>
                <span className="text-[10px] text-gray-300 dark:text-white/10">{msg.timestamp}</span>
              </div>

              {msg.replyTo && (
                <div className={`mb-1 px-3 py-1.5 rounded-xl bg-white/5 border-l-2 border-[#05FF00]/40 max-w-[85%] md:max-w-[70%] flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-1 duration-300`}>
                  <span className="text-[9px] font-black text-[#05FF00] uppercase tracking-widest opacity-60">Replied to {msg.replyTo.user}</span>
                  <span className="text-[10px] text-white/30 truncate">{msg.replyTo.content}</span>
                </div>
              )}

                <div className="relative flex items-center gap-2 group/bubble">
                  <div className={`px-4 md:px-5 py-2.5 rounded-2xl text-[13px] md:text-[14px] max-w-[90%] md:max-w-[85%] shadow-sm ${msg.type === 'outgoing' ? 'bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black font-bold' : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-white/80'}`}>
                    {msg.content}
                  </div>
                  
                  {msg.user !== accounts[activePersonaIndex]?.username && (
                    <button 
                      onClick={() => {
                        setReplyingTo({ id: msg.id, user: msg.user, content: msg.content, sender_id: msg.sender_id });
                        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
                      }}
                      className={`p-2 rounded-lg bg-white/5 text-white/20 hover:text-[#05FF00] hover:bg-[#05FF00]/10 opacity-100 md:opacity-0 md:group-hover/msg:opacity-100 transition-all duration-200 ${msg.type === 'outgoing' ? 'order-first' : ''}`}
                      title={`Reply to ${msg.user}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                    </button>
                  )}
                </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50/50 dark:bg-black/40 border-t border-gray-100 dark:border-white/5 relative z-30">
           {replyingTo && (
             <div className="px-4 md:px-6 py-3 bg-brand-500/5 dark:bg-[#05FF00]/5 border-b border-brand-500/10 dark:border-[#05FF00]/10 flex items-center justify-between animate-in slide-in-from-bottom-2 duration-300">
               <div className="flex items-center gap-3 overflow-hidden">
                 <div className="w-1 h-8 rounded-full bg-brand-500 dark:bg-[#05FF00] shrink-0" />
                 <div className="flex flex-col overflow-hidden">
                   <span className="text-[10px] font-black text-brand-500 dark:text-[#05FF00] uppercase tracking-widest truncate">Replying to {replyingTo.user}</span>
                   <span className="text-xs text-gray-400 truncate max-w-[200px] md:max-w-[500px]">{replyingTo.content}</span>
                 </div>
               </div>
               <button 
                onClick={() => setReplyingTo(null)}
                className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors shrink-0"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
               </button>
             </div>
           )}

           <div className="p-4 md:p-6">
             <div className="flex flex-col gap-3">
                <div className="relative">
                  <input 
                    type="text"
                    autoComplete="off"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={replyingTo ? `Replying to ${replyingTo.user}...` : `Chatting as ${accounts[activePersonaIndex]?.username || '...'}`}
                    className="w-full bg-white dark:bg-[#121215] border border-gray-200 dark:border-white/10 rounded-2xl px-4 md:px-6 py-4 text-sm outline-none focus:border-[#05FF00] transition-all pr-[80px] md:pr-24 dark:text-white dark:caret-[#05FF00] shadow-inner"
                  />
                  <TacticalTooltip title="Transmit Signal" description="Send the current payload into the live neural uplink.">
                    <button 
                      onClick={() => handleSendMessage()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-4 md:px-6 py-2 rounded-xl bg-gray-900 text-white dark:bg-[#05FF00] dark:text-black text-[10px] md:text-xs font-black uppercase tracking-wider shadow-lg hover:scale-[1.05] hover:shadow-[0_0_15px_rgba(5,255,0,0.4)] active:scale-[0.98] transition-all duration-200"
                    >
                      Send
                    </button>
                  </TacticalTooltip>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* TACTICAL SIDEBAR */}
      <div className="flex flex-col gap-6 h-auto xl:h-full overflow-hidden" ref={libDropdownRef}>
         
         {/* EMOJI PICKER WITH CATEGORIES */}
         <div className={`bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[32px] p-5 flex flex-col transition-all duration-500 ease-in-out ${isEmojiMenuOpen ? 'h-[350px] md:h-[400px]' : 'h-20'}`}>
            <div className="flex items-center justify-between mb-4 px-2">
               <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.4em] ml-2">Emoji Matrix</h3>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#05FF00] shadow-[0_0_8px_#05FF00]" />
               </div>
               
               <div className="flex items-center gap-2">
                  <TacticalTooltip title={isEmojiMenuLocked ? "Unlock Menu" : "Lock Menu"} description="Prevent the matrix from collapsing after asset deployment.">
                    <button 
                      onClick={() => setIsEmojiMenuLocked(!isEmojiMenuLocked)}
                      className={`p-1.5 rounded-lg transition-all ${isEmojiMenuLocked ? 'bg-[#05FF00] text-black shadow-[0_0_10px_#05FF00]' : 'bg-white/5 text-white/20 hover:text-white/40'}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    </button>
                  </TacticalTooltip>

                  <button 
                    onClick={() => setIsEmojiMenuOpen(!isEmojiMenuOpen)}
                    className={`p-1.5 rounded-lg transition-all ${isEmojiMenuOpen ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20 hover:text-white/40'}`}
                  >
                    <ChevronDownIcon className={`w-4 h-4 transition-transform duration-500 ${isEmojiMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
               </div>
            </div>

            {isEmojiMenuOpen && (
              <div className="flex flex-col flex-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
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
                
                <div className="grid grid-cols-4 gap-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
                   {filteredEmojis.map((emoji) => (
                     <button
                      key={emoji.name}
                      onClick={() => {
                        handleSendMessage(emoji.code);
                        if (!isEmojiMenuLocked) setIsEmojiMenuOpen(false);
                      }}
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
            )}
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
