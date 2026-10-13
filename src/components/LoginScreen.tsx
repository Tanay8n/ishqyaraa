"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useAppUser } from "@/components/AppUserContext";

export function LoginScreen({ onBackToWelcome }: { onBackToWelcome?: () => void }) {
  const { signInWithGoogle, signingIn, signInError } = useAppUser();

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="w-full max-w-sm mx-auto my-auto py-8">
        {onBackToWelcome && (
          <div className="mb-4">
            <button
              type="button"
              onClick={onBackToWelcome}
              className="rounded-full inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-stone-100 text-stone-800 hover:text-stone-950 border border-stone-200 text-xs font-black transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#9e1b22]" />
              <span>Back to Welcome Page</span>
            </button>
          </div>
        )}
        <div className="bg-white rounded-[36px] border border-stone-200/90 p-8 sm:p-9 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-3xl overflow-hidden shadow-lg shadow-[#9e1b22]/25 border border-[#9e1b22]/30">
            <Image
              src="/logo.png"
              alt="IshqYara Logo"
              width={64}
              height={64}
              priority
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9e1b22] bg-[#fee2e2] px-3 py-1 rounded-full border border-[#9e1b22]/25">
              Dil se, Ishq Tak.
            </span>
          </div>
          <h1 className="font-display italic mt-3 text-3xl font-black text-stone-950 tracking-tight">
            IshqYara
          </h1>
          <p className="text-xs font-bold text-[#ea580c]">Puja &amp; Social Partner</p>
          <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
            Find compatible pandal hopping companions, squad members, and celebrate Durga Puja together.
          </p>

          <button
            type="button"
            id="google-signin-btn"
            onClick={signInWithGoogle}
            disabled={signingIn}
            className="rounded-full mt-7 w-full min-h-[52px] bg-white border-2 border-stone-300 shadow-sm hover:shadow-md hover:border-stone-900 active:scale-95 hover:scale-103 transition-all flex items-center justify-center gap-3 text-sm font-black text-stone-900 disabled:opacity-60 cursor-pointer"
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
          <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] text-stone-500 leading-normal font-medium">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              id="login-terms-link"
              className="font-bold text-stone-900 underline hover:text-[#9e1b22] transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and acknowledge our{" "}
            <Link
              href="/privacy"
              id="login-privacy-link"
              className="font-bold text-stone-900 underline hover:text-[#9e1b22] transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
 
      {/* Prominent Footer */}
      <footer className="w-full max-w-sm mx-auto text-center py-4">
        <nav aria-label="Legal navigation" className="flex items-center justify-center gap-4 text-xs font-bold text-stone-600">
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
        <p className="mt-2 text-[11px] text-stone-400 font-medium">
          © {new Date().getFullYear()} IshqYara (Puja Partner). All rights reserved.
        </p>
      </footer>
    </div>
  );
}
