import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className="mx-auto mb-10 w-full max-w-60 rounded-3xl bg-gray-50 px-4 py-6 text-center border border-gray-200 dark:bg-[#05FF00]/5 dark:border-[#05FF00]/10 dark:shadow-[0_0_20px_rgba(5,255,0,0.05)]"
    >
      <div className="flex justify-center mb-3">
        <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center dark:bg-[#05FF00]/20">
          <span className="text-brand-500 font-black text-xs dark:text-[#05FF00]">NB</span>
        </div>
      </div>
      <h3 className="mb-2 text-sm font-black text-gray-900 uppercase tracking-tighter dark:text-white">
        NullByte <span className="text-brand-500 dark:text-[#05FF00]"> NeuralDashboard</span>
      </h3>
      <p className="mb-4 text-xs font-medium text-gray-500 dark:text-white/40 leading-relaxed">
        Custom Dashboard for NullByte Tools Built By KrArjan
      </p>
      <button onClick={() => window.open("https://github.com/KrArjan/")}
        className="w-full py-2.5 font-black text-[10px] uppercase tracking-[0.2em] text-white rounded-xl bg-brand-500 hover:bg-brand-600 dark:bg-[#05FF00] dark:text-black dark:hover:bg-white transition-all shadow-lg shadow-brand-500/20 dark:shadow-[#05FF00]/10"
      >
        Open GitHub
      </button>
    </div>
  );
}
