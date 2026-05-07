import { KickBotLayout } from "@/apps/kick-bot/layout/KickBotLayout";
import { TacticalConfigHub } from "@/apps/kick-bot/components/TacticalConfigHub";

export default function ConfigPage() {
  return (
    <KickBotLayout title="Tactical Config Hub" subtitle="Full system synchronization and channel bridging">
      <TacticalConfigHub />
    </KickBotLayout>
  );
}
