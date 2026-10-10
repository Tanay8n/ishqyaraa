"use client";

import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";
import { useAppUser } from "@/components/AppUserContext";

export function LoginScreen() {
  const { signInWithGoogle, signingIn, signInError } = useAppUser();

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between p-4 sm:p-6">
      <div className="w-full max-w-sm mx-auto my-auto py-8">
        <div className="bg-white rounded-3xl border border-stone-200/90 p-7 sm:p-8 text-center shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-red-50 to-rose-100/70 text-[#9e1b22] flex items-center justify-center shadow-inner">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
              শারদীয়া • Kolkata
            </span>
          </div>
          <h1 className="mt-3 text-2xl font-black text-stone-900 tracking-tight">
            IshqYara
          </h1>
          <p className="text-xs font-semibold text-[#9e1b22]">Puja Partner</p>
          <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
            Find compatible pandal-hopping companions, squad members, and celebrate Durga Puja together.
          </p>

          <button
            type="button"
            id="google-signin-btn"
            onClick={signInWithGoogle}
            disabled={signingIn}
            className="mt-6 w-full min-h-[52px] rounded-2xl bg-white border border-stone-300 shadow-sm hover:shadow-md hover:border-stone-400 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-sm font-bold text-stone-800 disabled:opacity-60 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.95h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.25Z"/>
              <path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.7Z"/>
              <path fill="#FBBC05" d="M6.53 13.78a5.86 5.86 0 0 1 0-3.56V7.69H3.29a9.7 9.7 0 0 0 0 8.62l3.24-2.53Z"/>
              <path fill="#EA4335" d="M12 6.19c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.27 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.71 5.39l3.24 2.53C7.3 7.91 9.46 6.19 12 6.19Z"/>
            </svg>
            <span>{signingIn ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          {signInError && (
            <p className="mt-3 text-xs text-rose-600 font-semibold">{signInError}</p>
          )}

          {/* Prominent in-product consent disclosure */}
          <div className="mt-5 pt-4 border-t border-stone-100 text-[11px] text-stone-500 leading-normal">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              id="login-terms-link"
              className="font-semibold text-stone-800 underline hover:text-[#9e1b22] transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and acknowledge our{" "}
            <Link
              href="/privacy"
              id="login-privacy-link"
              className="font-semibold text-stone-800 underline hover:text-[#9e1b22] transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 py-1.5 px-2.5 rounded-xl border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Google OAuth 2.0 & Row-Level Data Security</span>
          </div>
        </div>
      </div>

      {/* Prominent Footer */}
      <footer className="w-full max-w-sm mx-auto text-center py-4">
        <nav aria-label="Legal navigation" className="flex items-center justify-center gap-4 text-xs font-semibold text-stone-600">
          <Link
            href="/privacy"
            id="footer-privacy-link"
            className="hover:text-[#9e1b22] underline underline-offset-4 transition-colors"
          >
            Privacy Policy
          </Link>
          <span className="text-stone-300">•</span>
          <Link
            href="/terms"
            id="footer-terms-link"
            className="hover:text-[#9e1b22] underline underline-offset-4 transition-colors"
          >
            Terms of Service
          </Link>
        </nav>
        <p className="mt-2 text-[11px] text-stone-400">
          © {new Date().getFullYear()} IshqYara (Puja Partner). All rights reserved.
        </p>
      </footer>
    </div>
  );
}
