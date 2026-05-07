import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const GlassCard = ({ children, className = "", title }: GlassCardProps) => {
  return (
    <div className={`relative overflow-hidden rounded-[24px] border transition-all duration-300
      border-gray-100 bg-white shadow-sm
      dark:border-white/5 dark:bg-[#0F0F10] dark:shadow-2xl
      hover:border-brand-500/30 dark:hover:border-[#05FF00]/20 
      p-6 ${className}`}>
      
      {/* Subtle Glow */}
      <div className="absolute -right-16 -top-16 h-32 w-32 bg-brand-500/5 dark:bg-[#05FF00]/5 blur-[60px] pointer-events-none" />
      
      {title && (
        <div className="flex items-center gap-3 mb-5">
          <div className="h-4 w-1 rounded-full bg-brand-500 dark:bg-[#05FF00]" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
