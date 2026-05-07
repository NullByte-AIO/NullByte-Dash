import React from "react";
import { MatrixManager } from "@/apps/kick-bot/components/MatrixManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NullByte NeuralDashboard",
  description: "This is a Neural Dashboard specific for NullByte associated Tools, built by KrArjan."
};

export default function MatrixPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Matrix Manager</h1>
        <p className="text-sm text-white/40 uppercase tracking-[0.3em] font-bold">Category & Quick-Response Logistics</p>
      </div>
      <MatrixManager />
    </div>
  );
}
