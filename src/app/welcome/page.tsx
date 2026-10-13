import type { Metadata } from "next";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export const metadata: Metadata = {
  title: "Welcome to IshqYara — Beyond the Swipe, Where Dil Finds Its Vibe",
  description:
    "IshqYara is a free & trusted dating app. Find potential partners for dating, relationships, and friendship.",
};

export default function WelcomePage() {
  return <WelcomeScreen />;
}
