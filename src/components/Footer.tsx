import React from "react";
import Link from "next/link";
import { Heart, ShieldCheck, Sparkles, MapPin } from "lucide-react";
import { AlpanaMotif } from "./AlpanaDecor";

export function Footer() {
  return (
    <footer className="relative bg-[#1c1917] text-stone-300 pt-16 pb-12 overflow-hidden border-t border-stone-800">
      {/* Decorative background Alpana subtle watermark */}
      <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none text-white">
        <AlpanaMotif className="w-96 h-96" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#9e1b22] to-[#c22830] flex items-center justify-center text-white shadow-md">
                <span className="text-lg">🪷</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Puja Partner
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/50">
                শারদীয়া
              </span>
            </div>

            <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
              Kolkata’s premier social and companion platform for Durga Puja. Find compatible friends, foodies, pandal hopping squads, and romance under the autumn sky.
            </p>

            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Celebrating the spirit of শারদীয়া 2026</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-400">
              <MapPin className="w-3.5 h-3.5 text-[#e65100]" />
              <span>Crafted for Kolkata, Howrah, Kalyani & Bengal</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link href="/discover" className="hover:text-amber-400 transition-colors">
                  Discover Buddies
                </Link>
              </li>
              <li>
                <Link href="/groups" className="hover:text-amber-400 transition-colors">
                  Pandal Hopping Groups
                </Link>
              </li>
              <li>
                <Link href="/home" className="hover:text-amber-400 transition-colors">
                  Member Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Safety & Values
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link href="/#safety" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Safety Center</span>
                </Link>
              </li>
              <li>
                <span className="hover:text-amber-400 transition-colors cursor-pointer">
                  Public Meetup Guidelines
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 transition-colors cursor-pointer">
                  Community Standards
                </span>
              </li>
              <li>
                <span className="hover:text-amber-400 transition-colors cursor-pointer">
                  Report & Block
                </span>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Legal & Support
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <span className="hover:text-amber-400 transition-colors cursor-pointer">
                  About Us
                </span>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="hover:text-amber-400 transition-colors cursor-pointer">
                  Contact Support
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© {new Date().getFullYear()} Puja Partner. All rights reserved. Find Your People. Celebrate Together. 🪷</p>
          <div className="flex items-center gap-1.5 text-stone-400">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-[#9e1b22] fill-current" />
            <span>for Bengal’s biggest carnival</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
