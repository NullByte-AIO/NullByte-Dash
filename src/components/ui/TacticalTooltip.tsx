"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  title: string;
  description?: string;
  children: React.ReactElement;
}

export const TacticalTooltip: React.FC<TooltipProps> = ({ title, description, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  };

  const handleMouseEnter = () => {
    updateCoords();
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  if (!mounted) return children;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div 
          className="fixed z-[1000002] pointer-events-none mb-2 animate-tooltip-slide -translate-x-1/2 -translate-y-full"
          style={{ 
            top: coords.top - 16, 
            left: coords.left 
          }}
        >
          <div className="relative bg-[#1A1A1E] border border-white/5 p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col gap-0.5 min-w-[140px] max-w-[220px]">
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1A1A1E] border-r border-b border-white/5 rotate-45" />
            
            <h4 className="text-[9px] font-bold text-white/90 uppercase tracking-widest leading-tight">
              {title}
            </h4>
            {description && (
              <p className="text-[8px] font-medium text-white/40 leading-snug uppercase tracking-tight">
                {description}
              </p>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
