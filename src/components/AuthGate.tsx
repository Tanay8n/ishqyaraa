"use client";

import { Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAppUser } from "@/components/AppUserContext";
import { LoginScreen } from "@/components/LoginScreen";
import { OnboardingForm } from "@/components/OnboardingForm";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, dataError, matchesLoadError, logout } = useAppUser();
  const pathname = usePathname();

  // Allow public access to legal pages regardless of authentication status
  if (pathname === "/privacy" || pathname === "/terms") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="flex items-center gap-2 text-stone-500 text-sm">
          <Heart className="w-5 h-5 text-[#9e1b22] fill-current animate-pulse" />
          <span>Loading IshqYara...</span>
        </div>
      </div>
    );
  }

  if (status === "signedOut") {
    return <LoginScreen />;
  }

  if (status === "dataError") {
    return (
      <main className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6">
        <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-7 text-center shadow-xl">
          <h1 className="text-xl font-black text-stone-900">Couldn&apos;t load your account</h1>
          <p role="alert" className="mt-3 text-sm text-stone-600">{dataError}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-[#9e1b22] px-4 py-2.5 text-sm font-bold text-white">Try again</button>
            <button type="button" onClick={() => { void logout(); }} className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-bold text-stone-700">Sign out</button>
          </div>
        </section>
      </main>
    );
  }

  if (status === "needsProfile") {
    return (
      <>
        {matchesLoadError && (
          <div role="status" className="fixed inset-x-4 top-4 z-50 mx-auto max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
            {matchesLoadError}
          </div>
        )}
        <OnboardingForm />
      </>
    );
  }

  return (
    <>
      {matchesLoadError && (
        <div role="status" className="fixed inset-x-4 top-4 z-50 mx-auto max-w-xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
          {matchesLoadError}
        </div>
      )}
      {children}
    </>
  );
}
