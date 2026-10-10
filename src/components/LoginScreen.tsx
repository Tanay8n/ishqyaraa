"use client";

import { Heart } from "lucide-react";
import { useAppUser } from "@/components/AppUserContext";

export function LoginScreen() {
  const { signInWithGoogle, signingIn, signInError } = useAppUser();

  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-stone-200 p-7 text-center shadow-xl">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-[#9e1b22] flex items-center justify-center">
          <Heart className="w-7 h-7 fill-current" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-stone-900">Welcome to IshqYara</h1>
        <p className="mt-2 text-sm text-stone-500">Please sign in to continue.</p>
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={signingIn}
          className="mt-7 w-full min-h-[52px] rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-stone-300 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm font-bold text-stone-800 disabled:opacity-60"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.95h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.25Z"/>
            <path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.7Z"/>
            <path fill="#FBBC05" d="M6.53 13.78a5.86 5.86 0 0 1 0-3.56V7.69H3.29a9.7 9.7 0 0 0 0 8.62l3.24-2.53Z"/>
            <path fill="#EA4335" d="M12 6.19c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.27 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.71 5.39l3.24 2.53C7.3 7.91 9.46 6.19 12 6.19Z"/>
          </svg>
          <span>{signingIn ? "Signing in..." : "Continue with Google"}</span>
        </button>
        {signInError && (
          <p className="mt-3 text-xs text-rose-600 font-semibold">{signInError}</p>
        )}
      </div>
    </div>
  );
}
