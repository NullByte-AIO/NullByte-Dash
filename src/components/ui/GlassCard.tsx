import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  accentColor?: string; // e.g. "#00F0FF" or "#05FF00"
}

export const GlassCard = ({ children, className = "", title, accentColor = "#00F0FF" }: GlassCardProps) => {
  return (
    <div className={`relative overflow-hidden rounded-[24px] border transition-all duration-300
      border-gray-100 bg-white shadow-sm
      dark:border-white/5 dark:bg-[#0F0F10] dark:shadow-2xl
      p-6 ${className}`}
      style={{
        ["--card-accent" as any]: accentColor,
      }}
    >
      
      {/* Subtle Glow */}
      <div className="absolute -right-16 -top-16 h-32 w-32 bg-brand-500/5 blur-[60px] pointer-events-none" 
           style={{ backgroundColor: `${accentColor}10` }} />
      
      {title && (
        <div className="flex items-center gap-3 mb-5">
          <div className="h-4 w-1 rounded-full" style={{ backgroundColor: accentColor }} />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">{title}</h3>
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
