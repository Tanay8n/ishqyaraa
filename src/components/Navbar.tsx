"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, Compass, Users, ArrowRight } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/", icon: Sparkles },
    { label: "Discover", href: "/discover", icon: Compass },
    { label: "Groups", href: "/groups", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#faf7f2]/90 border-b border-[#e7dfd5]/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Left Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="IshqYara Logo"
              width={40}
              height={40}
              priority
              className="w-10 h-10 rounded-xl object-cover shadow-md shadow-[#9e1b22]/20 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-[#9e1b22] transition-colors">
                  Puja Partner
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                  শারদীয়া
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-medium hidden sm:inline">
                Find Your People. Celebrate Together.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-[#9e1b22] bg-[#fbebee]"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/home"
              className="px-4 py-2 text-sm font-semibold text-stone-700 hover:text-[#9e1b22] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/home"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#9e1b22] to-[#b8232b] hover:from-[#83161c] hover:to-[#9e1b22] shadow-sm hover:shadow-md hover:shadow-[#9e1b22]/25 transition-all active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/home"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#9e1b22]"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-200/60 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e7dfd5] bg-[#faf7f2] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-200/60 text-xs text-stone-500 font-medium">
            <span>শারদীয়া 2026 Companion</span>
            <span className="text-[#9e1b22] font-semibold">Kolkata & Bengal</span>
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? "text-[#9e1b22] bg-[#fbebee]"
                    : "text-stone-700 hover:bg-stone-200/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#9e1b22]" : "text-stone-500"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-stone-200/80 flex flex-col gap-2">
            <Link
              href="/home"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-200/50"
            >
              Log in
            </Link>
            <Link
              href="/home"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#9e1b22] to-[#b8232b] shadow-sm"
            >
              Find My Puja Partner 🪷
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
