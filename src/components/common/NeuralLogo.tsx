import React from "react";

interface NeuralLogoProps {
  className?: string;
}

export default function NeuralLogo({ className = "" }: NeuralLogoProps) {
  return (
    <div className={`flex items-center gap-2 group cursor-pointer ${className}`}>
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Animated Glow Background */}
        <div className="absolute inset-0 bg-[#00D2FF]/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Logo Icon Frame */}
        <div className="relative w-full h-full bg-black border border-white/10 rounded-xl flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-[#00D2FF]/50 group-hover:shadow-[0_0_20px_rgba(0,210,255,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          {/* NB Initials with Neural Accent */}
          <span className="text-white font-black text-lg tracking-tighter relative z-10 group-hover:scale-110 transition-transform duration-500">
            N<span className="text-[#00D2FF]">B</span>
          </span>
          
          {/* Scanning Line Animation */}
          <div className="absolute inset-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00D2FF]/40 to-transparent -translate-y-full animate-[scan_2s_linear_infinite]" />
        </div>
      </div>
      
      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <span className="text-white font-black text-lg tracking-tight uppercase group-hover:text-[#00D2FF] transition-colors duration-500">
          NullByte
        </span>
        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-1 group-hover:text-gray-300 transition-colors duration-500">
          Neural Dashboard
        </span>
      </div>
    </div>
  );
}
