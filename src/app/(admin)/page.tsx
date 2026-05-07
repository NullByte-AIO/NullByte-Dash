import { DashboardHome } from "@/apps/kick-bot/components/DashboardHome";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neural Home | NullByte Dash",
  description: "Advanced Neural Command Center for Kick Bot Operations",
};

export default function Home() {
  return <DashboardHome />;
}
