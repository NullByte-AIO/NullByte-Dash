"use client";
import React from "react";
import { useBranding } from "@/context/BrandingContext";

interface NeuralLogoProps {
  className?: string;
}

export default function NeuralLogo({ className = "" }: NeuralLogoProps) {
  const { agencyName, logoUrl, primaryColor } = useBranding();

  return (
    <div className={`flex items-center gap-3 group cursor-pointer ${className}`}>
      <div className="relative w-10 h-10 flex-shrink-0">
        {/* Animated Glow Background */}
        <div 
          className="absolute inset-0 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ backgroundColor: `${primaryColor}20` }}
        />
        
        {/* Logo Image */}
        <img 
          src={logoUrl || "/images/logo/nb-icon.png"} 
          alt={agencyName} 
          className="relative z-10 w-10 h-10 rounded-xl group-hover:scale-110 transition-transform duration-500 object-contain"
        />
      </div>
      
      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <span 
          className="text-white font-black text-lg tracking-tight uppercase transition-colors duration-500"
          style={{ "--hover-color": primaryColor } as React.CSSProperties}
        >
          {agencyName}
        </span>
        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-1 transition-colors duration-500">
          Neural Dashboard
        </span>
      </div>
    </div>
  );
}
