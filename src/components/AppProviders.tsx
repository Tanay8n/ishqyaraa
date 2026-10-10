"use client";

import { AppUserProvider } from "@/components/AppUserContext";
import { AuthGate } from "@/components/AuthGate";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppUserProvider>
      <AuthGate>{children}</AuthGate>
    </AppUserProvider>
  );
}
