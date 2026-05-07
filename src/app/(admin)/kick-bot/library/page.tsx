import { KickBotLayout } from "@/apps/kick-bot/layout/KickBotLayout";
import { LibraryManager } from "@/apps/kick-bot/components/LibraryManager";

export default function LibraryPage() {
  return (
    <KickBotLayout title="Library Manager" subtitle="Message matrices, emojis, and vocabularies">
      <LibraryManager />
    </KickBotLayout>
  );
}
