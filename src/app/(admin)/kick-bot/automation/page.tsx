import { KickBotLayout } from "@/apps/kick-bot/layout/KickBotLayout";
import { AutomationDashboard } from "@/apps/kick-bot/components/AutomationDashboard";

export default function AutomationPage() {
  return (
    <KickBotLayout title="Automation Cluster" subtitle="Neural execution and loop management">
      <AutomationDashboard />
    </KickBotLayout>
  );
}
