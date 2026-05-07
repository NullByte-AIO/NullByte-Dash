"use client";
import React, { useEffect, useState } from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import { ConfirmationModal } from "@/components/ui/modal/ConfirmationModal";
import { TacticalTooltip } from "@/components/ui/TacticalTooltip";

interface Account {
  id: string;
  username: string;
  token: string;
  discordId: string;
  rainbetId: string;
  email: string;
  emailPassword?: string;
  discordEmail?: string;
  discordPassword?: string;
  status: "ACTIVE" | "UNCHECKED" | "INVALID" | string;
  enabled: boolean;
}

export const AccountsControl = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showPassword, setShowPassword] = useState(false);
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

  useEffect(() => {
    fetchAccounts();
  }, []);

  // KEYBOARD ESCAPE & ISOLATION LISTENER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setEditingAccount(null);
      }
    };
    if (isModalOpen) {
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
  }, [isModalOpen]);

  const fetchAccounts = async () => {
    const res = await fetch("/api/kick-bot/accounts");
    const data = await res.json();
    const accountsWithIds = Object.entries(data.accounts || {}).map(([key, value]: [string, any]) => ({
      ...value,
      id: value.id || key
    }));
    setAccounts(accountsWithIds);
  };

  const handleToggleAccount = (id: string, currentStatus: boolean) => {
    setConfirmConfig({
      isOpen: true,
      message: `Are you sure you want to ${currentStatus ? 'DISABLE' : 'ENABLE'} this account?`,
      variant: currentStatus ? "warning" : "info",
      onConfirm: async () => {
        const updatedAccounts = accounts.map(acc => 
          acc.id === id ? { ...acc, enabled: !currentStatus } : acc
        );
        setAccounts(updatedAccounts);
        await saveAccounts(updatedAccounts);
      }
    });
  };

  const handleDeleteAccount = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      message: "Are you sure you want to DELETE this account? This action cannot be undone.",
      variant: "danger",
      onConfirm: async () => {
        const updatedAccounts = accounts.filter(acc => acc.id !== id);
        setAccounts(updatedAccounts);
        await saveAccounts(updatedAccounts);
      }
    });
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const accountData: any = Object.fromEntries(formData.entries());
    
    const shortId = Math.random().toString(36).substr(2, 4).toUpperCase();
    const defaultUsername = `OPERATOR_${shortId}`;

    let updatedAccounts;
    if (editingAccount) {
      updatedAccounts = accounts.map(acc => 
        acc.id === editingAccount.id ? { ...acc, ...accountData, username: accountData.username || acc.username || defaultUsername } : acc
      );
    } else {
      const newAccount: Account = {
        ...accountData,
        username: accountData.username || defaultUsername,
        id: Math.random().toString(36).substr(2, 9),
        status: "UNCHECKED",
        enabled: true
      };
      updatedAccounts = [...accounts, newAccount];
    }

    setAccounts(updatedAccounts);
    await saveAccounts(updatedAccounts);
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const saveAccounts = async (updatedAccounts: Account[]) => {
    const dbFormat = {
      accounts: updatedAccounts.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {})
    };
    await fetch("/api/kick-bot/accounts", {
      method: "POST",
      body: JSON.stringify(dbFormat),
      headers: { "Content-Type": "application/json" },
    });
  };

  const truncate = (str: string) => {
    if (!str) return "-";
    return str.length > 8 ? str.substring(0, 8) + "..." : str;
  };

  const getStatusConfig = (acc: Account) => {
    if (!acc.enabled) return { label: "DISABLED", color: "text-gray-400", bg: "bg-gray-100 dark:bg-white/5 dark:text-white/20", dot: "bg-gray-400" };
    if (acc.status === "ACTIVE") return { label: "ACTIVE", color: "text-brand-500 dark:text-[#05FF00]", bg: "bg-brand-500/10 dark:bg-[#05FF00]/10", dot: "bg-brand-500 dark:bg-[#05FF00] animate-pulse" };
    if (acc.status === "UNCHECKED") return { label: "UNCHECKED", color: "text-cyan-500", bg: "bg-cyan-500/10", dot: "bg-cyan-400" };
    return { label: "INVALID", color: "text-red-500", bg: "bg-red-500/10", dot: "bg-red-500" };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
        <div className="relative w-full sm:w-96 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <input 
            type="text"
            autoComplete="off"
            placeholder="Search username, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-brand-500 dark:focus:border-[#05FF00] placeholder-gray-400 dark:placeholder-white/30 dark:text-white dark:caret-[#05FF00] transition-all shadow-sm"
          />
        </div>
        <button 
          onClick={() => { setEditingAccount(null); setIsModalOpen(true); }}
          data-tooltip="Deploy Identity"
          data-tooltip-desc="Initialize a new unit deployment by entering tactical credentials."
          className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black text-xs font-bold uppercase shadow-xl shadow-brand-500/20 dark:shadow-[#05FF00]/10 hover:translate-y-[-2px] transition-all"
        >
          Add New Account
        </button>
      </div>

      <GlassCard className="!p-0 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar max-h-[680px] no-scrollbar">
          <table className="w-full border-collapse sticky-header">
            <thead className="sticky top-0 z-20">
              <tr className="bg-gray-50 dark:bg-[#121215] border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[180px]">Username</th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[120px]">Rainbet ID</th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[120px]">Discord ID</th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center w-[100px]">Status</th>
                <th className="px-6 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider w-[150px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {accounts.filter(acc => 
                (acc.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (acc.rainbetId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (acc.discordId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (acc.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                (acc.discordEmail || "").toLowerCase().includes(searchTerm.toLowerCase())
              ).map((acc) => {
                const statusInfo = getStatusConfig(acc);
                return (
                  <tr key={acc.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 max-w-[160px]">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${statusInfo.dot}`} />
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{acc.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-mono text-gray-500 dark:text-white/40">{truncate(acc.rainbetId)}</td>
                    <td className="px-6 py-5 text-xs font-mono text-gray-500 dark:text-white/40">{truncate(acc.discordId)}</td>
                    <td className="px-6 py-5 text-xs text-gray-400 max-w-[200px] truncate">{acc.email}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">

                        <TacticalTooltip 
                          title={acc.enabled ? "Deactivate Unit" : "Activate Unit"}
                          description={acc.enabled ? "Safely power down this account's tactical uplink." : "Establish a live neural link for this account."}
                        >
                          <button 
                            onClick={() => handleToggleAccount(acc.id, acc.enabled)}
                            className={`p-2 rounded-xl transition-all ${acc.enabled ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-brand-500 dark:hover:text-[#05FF00]'}`}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                          </button>
                        </TacticalTooltip>

                        <TacticalTooltip 
                          title="Edit Persona"
                          description="Modify credentials and tactical identifiers for this unit."
                        >
                          <button 
                            onClick={() => { setEditingAccount(acc); setIsModalOpen(true); }}
                            className="p-2 rounded-xl text-gray-400 hover:text-brand-500 dark:hover:text-[#05FF00] transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                          </button>
                        </TacticalTooltip>

                        <TacticalTooltip 
                          title="Terminate Link"
                          description="Permanently purge this unit from the tactical database."
                        >
                          <button 
                            onClick={() => handleDeleteAccount(acc.id)}
                            className="p-2 rounded-xl text-gray-400 hover:text-red-500 transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </TacticalTooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 pointer-events-auto">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-[25px]" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F0F10] rounded-[40px] border border-gray-100 dark:border-white/5 shadow-[0_0_200px_rgba(0,0,0,1)] overflow-hidden animate-in zoom-in-95 duration-200 z-10">
             <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-white/5">
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                  {editingAccount ? 'Edit Account Persona' : 'Deploy New Account'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 transition-colors">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
             </div>
             
             <form onSubmit={handleSaveAccount} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-2">Kick Username</label>
                   <input 
                    name="username" 
                    autoComplete="off"
                    placeholder="Auto-identifying..." 
                    defaultValue={editingAccount?.username} 
                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] dark:text-white dark:caret-[#05FF00] transition-all" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-2">Kick Token</label>
                   <input 
                    name="token" 
                    autoComplete="off"
                    defaultValue={editingAccount?.token} 
                    required 
                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] dark:text-white dark:caret-[#05FF00] transition-all" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-2">Rainbet ID</label>
                   <input 
                    name="rainbetId" 
                    autoComplete="off"
                    defaultValue={editingAccount?.rainbetId} 
                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] dark:text-white dark:caret-[#05FF00] transition-all" 
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-2">Discord ID</label>
                   <input 
                    name="discordId" 
                    autoComplete="off"
                    defaultValue={editingAccount?.discordId} 
                    className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] dark:text-white dark:caret-[#05FF00] transition-all" 
                   />
                </div>
                
                <div className="md:col-span-2 pt-6 border-t border-gray-100 dark:border-white/5">
                   <h4 className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] mb-6">Credentials Management</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-2">Primary Email</label>
                         <input 
                          name="email" 
                          autoComplete="off"
                          defaultValue={editingAccount?.email} 
                          className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#05FF00] dark:text-white dark:caret-[#05FF00] transition-all" 
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest ml-2">Email Password</label>
                         <div className="relative group/pass">
                            <input 
                              name="emailPassword" 
                              type={showPassword ? "text" : "password"} 
                              autoComplete="new-password"
                              defaultValue={editingAccount?.emailPassword} 
                              className="w-full bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/10 rounded-2xl px-6 py-4 pr-14 text-sm outline-none focus:border-[#05FF00] dark:text-white dark:caret-[#05FF00] transition-all" 
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#05FF00] transition-colors"
                            >
                               {showPassword ? (
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268-2.943 9.543-7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                               ) : (
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                               )}
                            </button>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-4 pt-8 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 -mx-8 -mb-8 px-8 py-8">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all">Cancel</button>
                   <button type="submit" className="px-12 py-4 rounded-2xl bg-brand-500 text-white dark:bg-[#05FF00] dark:text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                      {editingAccount ? 'Update Identity' : 'Deploy Account'}
                   </button>
                </div>
             </form>
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
        /* Kill Browser Autofill Styles */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #0F0F10 inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
        }

        /* Tactical Scrollbar */
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

        /* Sticky Table Header styling for Dark Mode */
        .sticky-header th {
          background: #121215;
          position: sticky;
          top: 0;
          z-index: 10;
        }
      `}</style>
    </div>
  );
};
