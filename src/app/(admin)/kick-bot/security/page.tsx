import { KickBotLayout } from "@/apps/kick-bot/layout/KickBotLayout";
import { SecurityHub } from "@/apps/kick-bot/components/SecurityHub";

export default function SecurityPage() {
  return (
    <KickBotLayout title="Security Hub" subtitle="Gatekeeper protocols and authorization">
      <SecurityHub />
    </KickBotLayout>
  );
}
