import type { Metadata } from "next";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export const metadata: Metadata = {
  title: "Welcome to IshqYara — Beyond the Swipe, Where Dil Finds Its Vibe",
  description:
    "Explore IshqYara: Kolkata's premier dating and companion discovery app. Find pandal hopping buddies, date compatible singles, and discover meaningful connections.",
};

export default function WelcomePage() {
  return <WelcomeScreen />;
}
