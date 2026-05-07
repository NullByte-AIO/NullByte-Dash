"use client";
import React from "react";
import { GlassCard } from "../../../components/ui/GlassCard";
import Link from "next/link";
import { BoxCubeIcon, UserCircleIcon, ListIcon, PlugInIcon } from "../../../icons";

export const DashboardHome = () => {
  const stats = [
    { label: "Managed Apps", value: "01", trend: "Active", accent: "text-neural-300", glow: "shadow-neural-500/20" },
    { label: "System Health", value: "Optimal", trend: "Stable", accent: "text-neural-300", glow: "shadow-neural-500/10" },
    { label: "Neural Load", value: "84%", trend: "+5%", accent: "text-purple-300", glow: "shadow-purple-500/10" },
    { label: "Security Core", value: "Shielded", trend: "Protected", accent: "text-neural-300", glow: "shadow-neural-500/10" },
  ];

  const quickLinks = [
    { name: "Global Logs", path: "/kick-bot/logs", icon: <ListIcon />, desc: "Unified diagnostic stream for all active modules." },
    { name: "App Matrix", path: "/kick-bot/overview", icon: <BoxCubeIcon />, desc: "Manage and monitor your deployed applications." },
    { name: "Safety Protocol", path: "/kick-bot/config", icon: <PlugInIcon />, desc: "Global encryption and safety interlocks." },
    { name: "Root Profile", path: "/profile", icon: <UserCircleIcon />, desc: "Operator identity & security signatures." },
  ];

  return (
    <div className="min-h-screen space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Cinematic Hero Section */}
      <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/[0.08] bg-[#0A0A0B] p-12 lg:p-20 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neural-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-[#05FF00] animate-ping shadow-[0_0_8px_#05FF00]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">System Online</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white leading-[0.9]">
              NULLBYTE <br />
              <span className="bg-gradient-to-r from-neural-500 to-cyan-300 bg-clip-text text-transparent">NEURAL</span> <br />
              DASHBOARD
            </h1>
            
            <p className="text-gray-400 text-lg lg:text-xl font-medium leading-relaxed max-w-xl">
              Global administrative uplink established. Centralized control over your entire neural network architecture and multi-project operations.
            </p>
            
            <div className="flex flex-wrap gap-6 pt-6">
              <Link href="/kick-bot/overview" className="relative group/btn overflow-hidden px-10 py-4 bg-neural-500 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(0,240,255,0.7)] border border-neural-400">
                <span className="relative z-10 text-white font-black uppercase text-xs tracking-[0.2em] drop-shadow-sm">Initialize Matrix</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              </Link>
              
              <button className="px-10 py-4 bg-white/[0.05] border border-white/20 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-xl">
                Diagnostics
              </button>
            </div>
          </div>

          {/* Neural Tech Graphic */}
          <div className="hidden lg:flex relative w-[500px] h-[500px] items-center justify-center">
            {/* Background Data Grid */}
            <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,240,255,0.15) 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }} />
            
            <div className="absolute inset-0 bg-neural-500/5 rounded-full blur-[100px] animate-pulse" />
            
            {/* Rotating Tech Rings */}
            <div className="absolute w-[400px] h-[400px] border-[3px] border-dashed border-neural-500/20 rounded-full animate-[spin_30s_linear_infinite]" />
            <div className="absolute w-[350px] h-[350px] border border-white/10 rounded-full animate-[spin_25s_linear_infinite_reverse]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-neural-500 shadow-[0_0_15px_#00F0FF]" />
            </div>
            <div className="absolute w-[280px] h-[280px] border-2 border-neural-500/40 rounded-full animate-[spin_15s_linear_infinite] shadow-[inset_0_0_30px_rgba(0,240,255,0.1)]" />
            
            {/* Orbital Particles */}
            {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]"
                style={{
                  animation: `spin ${10 + i * 2}s linear infinite`,
                  transform: `rotate(${i * 60}deg) translateX(${160 + i * 10}px)`
                }}
              />
            ))}

            {/* Neural Core */}
            <div className="relative w-[320px] h-[320px] bg-white/[0.03] backdrop-blur-3xl rounded-[4rem] border border-white/20 flex items-center justify-center group-hover:scale-105 group-hover:border-neural-500/50 transition-all duration-700 shadow-[0_0_100px_-20px_rgba(0,240,255,0.4)]">
              <div className="absolute inset-0 bg-neural-500/5 blur-[80px] rounded-full" />
              
              {/* Internal Scanner Effect */}
              <div className="absolute inset-8 border border-white/10 rounded-[3rem] overflow-hidden bg-black/40">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neural-500/20 to-transparent h-1/3 w-full animate-[scan_2.5s_ease-in-out_infinite]" />
                
                {/* Micro Data Readouts */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end gap-1.5 h-12">
                  {[40, 70, 50, 90, 60, 80, 45, 75, 30].map((h, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-[#00F0FF]/30 rounded-full animate-pulse" 
                      style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }} 
                    />
                  ))}
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  {/* Neural Energy Pulse */}
                  <div className="absolute inset-0 bg-[#00D2FF]/5 blur-[80px] rounded-full animate-pulse" />
                  <div className="absolute inset-10 border-2 border-[#00D2FF]/20 rounded-full animate-[ping_3s_linear_infinite]" />
                  
                  {/* High-Detail Neural Core SVG */}
                  <svg 
                    viewBox="0 0 200 200" 
                    className="w-56 h-56 text-[#00D2FF] filter drop-shadow-[0_0_25px_rgba(0,210,255,0.6)] animate-[pulse_4s_ease-in-out_infinite] relative z-10"
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M100 20L170 60V140L100 180L30 140V60L100 20Z" stroke="currentColor" strokeWidth="2" />
                    <path d="M100 20V180M170 60L30 140M170 140L30 60" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="3" />
                    <circle cx="100" cy="100" r="15" fill="currentColor" className="animate-pulse" />
                    {/* Orbital Nodes */}
                    <circle cx="100" cy="20" r="4" fill="currentColor" />
                    <circle cx="100" cy="180" r="4" fill="currentColor" />
                    <circle cx="170" cy="60" r="4" fill="currentColor" />
                    <circle cx="30" cy="140" r="4" fill="currentColor" />
                    <circle cx="170" cy="140" r="4" fill="currentColor" />
                    <circle cx="30" cy="60" r="4" fill="currentColor" />
                  </svg>
                </div>
              </div>
              
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
                <div className="px-8 py-3 rounded-2xl bg-[#00D2FF] shadow-[0_0_30px_rgba(0,210,255,0.5)] border border-white/20">
                  <span className="text-sm font-black uppercase tracking-[0.6em] text-black block leading-none">Core_Active</span>
                </div>
              </div>
              
              {/* Neural Node Links */}
              {[0, 90, 180, 270].map((deg) => (
                <div 
                  key={deg}
                  className="absolute"
                  style={{ transform: `rotate(${deg}deg) translateX(170px)` }}
                >
                  <div className="w-16 h-[3px] bg-gradient-to-r from-[#00D2FF] to-transparent" />
                  <div className="absolute -right-2 -top-2 w-4 h-4 bg-[#00D2FF] rounded-full shadow-[0_0_15px_rgba(0,210,255,0.6)] animate-pulse" />
                </div>
              ))}
            </div>

            {/* Diagnostic HUD Elements */}
            <div className="absolute -top-10 -right-10 p-8 border-t-2 border-r-2 border-white/20 rounded-tr-[4rem] backdrop-blur-sm">
              <div className="text-sm font-black text-white uppercase tracking-[0.3em] drop-shadow-md">Matrix_v4.2</div>
              <div className="text-[10px] text-[#00D2FF] font-bold mt-2 uppercase tracking-[0.2em]">Uplink Stable</div>
            </div>
            <div className="absolute -bottom-10 -left-10 p-8 border-b-2 border-l-2 border-white/20 rounded-bl-[4rem] backdrop-blur-sm">
              <div className="text-sm font-black text-white uppercase tracking-[0.3em] drop-shadow-md">Shield_Enabled</div>
              <div className="text-[10px] text-[#00D2FF] font-bold mt-2 uppercase tracking-[0.2em]">Core Protected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <GlassCard key={stat.label} className={`group hover:translate-y-[-4px] transition-all duration-500 ${stat.glow}`}>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-neural-400 transition-colors">{stat.label}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${stat.accent.replace('text', 'bg')} animate-pulse shadow-[0_0_5px_currentColor]`} />
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white tracking-tighter">{stat.value}</span>
                <span className={`text-[10px] font-bold italic ${stat.accent}`}>{stat.trend}</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Tactical Sectors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassCard title="Operational Gateways" className="h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {quickLinks.map((link) => (
                <Link key={link.name} href={link.path} className="group relative overflow-hidden p-8 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:border-neural-500/40 hover:bg-neural-500/[0.03] transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-neural-500/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-5 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-neural-500 group-hover:bg-neural-500/10 transition-all duration-500">
                      {link.icon}
                    </div>
                    <span className="font-black text-sm uppercase tracking-[0.2em] text-gray-100 transition-colors">{link.name}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed group-hover:text-gray-300 transition-colors">{link.desc}</p>
                </Link>
              ))}
            </div>
          </GlassCard>
        </div>

        <GlassCard title="Neural Activity" className="h-full">
          <div className="space-y-6 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="group flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all">
                <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-neural-500 shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'bg-gray-700'}`} />
                <div className="flex-1">
                  <p className="text-[11px] text-gray-400 group-hover:text-gray-100 transition-colors">
                    <span className="text-neural-500 font-bold uppercase tracking-tighter mr-2">Core_Update:</span> 
                    Protocol phase 0{i} synchronization established.
                  </p>
                  <p className="text-[9px] text-gray-600 uppercase tracking-tighter mt-1">Status Nominal • {i * 4}m ago</p>
                </div>
              </div>
            ))}
            <Link href="/kick-bot/logs" className="block text-center py-4 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-gray-200 hover:text-neural-500 hover:bg-neural-500/5 transition-all">
              Full Archive Access
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
