import React from "react";
import { AccountsControl } from "@/apps/kick-bot/components/AccountsControl";
import { KickBotLayout } from "@/apps/kick-bot/layout/KickBotLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NullByte NeuralDashboard",
  description: "This is a Neural Dashboard specific for NullByte associated Tools, built by KrArjan."
};

export default function AccountsPage() {
  return (
    <KickBotLayout title="Account Inventory" subtitle="Manage, validate, and control individual account nodes">
      <AccountsControl />
    </KickBotLayout>
  );
}
