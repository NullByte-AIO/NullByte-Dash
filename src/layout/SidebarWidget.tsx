import React from "react";

export default function SidebarWidget() {
  return (
    <div
      className="mx-auto mb-10 w-full max-w-60 rounded-3xl bg-white/[0.03] px-4 py-6 text-center border border-white/10 dark:shadow-[0_0_20px_rgba(0,210,255,0.05)]"
    >
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 flex-shrink-0">
          <img src="/images/logo/nb-icon.png" alt="NB" className="w-12 h-12 rounded-xl shadow-[0_0_15px_rgba(0,210,255,0.1)]" />
        </div>
      </div>
      <h3 className="mb-2 text-sm font-black text-gray-900 uppercase tracking-tighter dark:text-white">
        NullByte <span className="text-[#00D2FF]"> NeuralDashboard</span>
      </h3>
      <p className="mb-4 text-[10px] font-bold text-gray-500 dark:text-white/40 leading-relaxed uppercase tracking-widest">
        Master Administrative Hub Build v1.2
      </p>
      <button onClick={() => window.open("https://github.com/KrArjan/")}
        className="w-full py-2.5 font-black text-[10px] uppercase tracking-[0.2em] text-black rounded-xl bg-[#00D2FF] hover:bg-white transition-all shadow-lg shadow-[#00D2FF]/20"
      >
        Open GitHub
      </button>
    </div>
  );
}
