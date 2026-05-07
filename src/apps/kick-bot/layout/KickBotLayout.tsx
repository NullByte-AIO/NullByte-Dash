import React from "react";

interface KickBotLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const KickBotLayout = ({ children, title, subtitle }: KickBotLayoutProps) => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 px-2">
        <div className="flex items-center gap-3">
          <div className="h-6 w-[3px] bg-brand-500 dark:bg-[#05FF00]" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h1>
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-white/40">
          {subtitle}
        </p>
      </div>
      
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};
