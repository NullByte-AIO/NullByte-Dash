import React from "react";
import { KickBotOverview } from "@/apps/kick-bot/components/KickBotOverview";
import { SystemLogs } from "@/apps/kick-bot/components/SystemLogs";
import { KickBotLayout } from "@/apps/kick-bot/layout/KickBotLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NullByte NeuralDashboard",
  description: "This is a Neural Dashboard specific for NullByte associated Tools, built by KrArjan."
};

export default function OverviewPage() {
  return (
    <KickBotLayout title="System Overview" subtitle="Real-time status and activity monitoring">
      <div className="space-y-8">
        <KickBotOverview />
      </div>
    </KickBotLayout>
  );
}
