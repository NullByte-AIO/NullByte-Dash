import { KickBotLayout } from "@/apps/kick-bot/layout/KickBotLayout";
import { LiveChatStation } from "@/apps/kick-bot/components/LiveChatStation";

export default function ChatPage() {
  return (
    <KickBotLayout title="Live Chat Station" subtitle="Multi-account broadcast center and live intercept">
      <LiveChatStation />
    </KickBotLayout>
  );
}
