"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Heart,
  MessageCircle,
  User,
  ChevronRight,
  Flame,
  Settings,
} from "lucide-react";
import { useAppUser } from "@/components/AppUserContext";
import { SettingsModal, type SettingsOption } from "./SettingsModal";

interface AppShellProps {
  children: React.ReactNode;
  hideMobileNav?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  count?: number;
}

export function AppShell({ children, hideMobileNav = false }: AppShellProps) {
  const pathname = usePathname();
  const { uiProfile, unreadTotal, matchCount } = useAppUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsOption, setSettingsOption] = useState<SettingsOption>("menu");

  useEffect(() => {
    const handleOpenSettings = (event: Event) => {
      const detail = (event as CustomEvent<{ option?: SettingsOption; tab?: SettingsOption }>).detail;
      setSettingsOption(detail?.option ?? detail?.tab ?? "menu");
      setIsSettingsOpen(true);
    };
    window.addEventListener("open-settings", handleOpenSettings);
    return () => window.removeEventListener("open-settings", handleOpenSettings);
  }, []);

  const openSettings = (option: SettingsOption = "menu") => {
    setSettingsOption(option);
    setIsSettingsOpen(true);
  };

  const navItems: NavItem[] = [
    { label: "Find Partners", href: "/", icon: Compass },
    { label: "Matches", href: "/matches", icon: Heart, count: matchCount },
    { label: "Messages", href: "/messages", icon: MessageCircle, count: unreadTotal },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const mobileNavItems: NavItem[] = [
    { label: "Find", href: "/", icon: Compass },
    { label: "Matches", href: "/matches", icon: Heart, count: matchCount },
    { label: "Chat", href: "/messages", icon: MessageCircle, count: unreadTotal },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col md:flex-row text-stone-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col justify-between border-r border-[#e7dfd5] bg-[#faf7f2] sticky top-0 h-screen p-5 z-40">
        <div className="space-y-6">
          {/* Logo & Sharodiya Badge */}
          <Link href="/" className="flex items-center gap-3 px-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9e1b22] to-[#c22830] flex items-center justify-center text-white shadow-md shadow-[#9e1b22]/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🪷</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-stone-900 tracking-tight">
                  Puja Partner
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                  শারদীয়া
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Pandal Companion
              </p>
            </div>
          </Link>

          {/* Quick Status Pill */}
          <div className="mx-1 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/70 text-xs flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-[#9e1b22]">
              <Flame className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>শারদীয়া 2026</span>
            </div>
            <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded-full text-stone-600 border border-amber-200">
              Live Matching
            </span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                    isActive
                      ? "bg-[#9e1b22] text-white shadow-sm shadow-[#9e1b22]/30"
                      : "text-stone-700 hover:bg-stone-200/60 hover:text-stone-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? "text-white" : "text-stone-500 group-hover:text-stone-800"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && !isActive && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#9e1b22]">
                        {item.badge}
                      </span>
                    )}
                    {item.count && (
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#9e1b22] text-white"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Mini Card at Bottom */}
        <div className="pt-4 border-t border-[#e7dfd5] space-y-3">
          <Link
            href="/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-200/50 transition-colors group"
          >
            <div className="relative">
              <img
                src={uiProfile?.image || ""}
                alt={uiProfile?.name || "Profile"}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#9e1b22]/30"
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 truncate">
                  {uiProfile?.name || "Your profile"}
                </span>
                <span className="text-[10px] text-[#9e1b22] font-semibold">{uiProfile?.age ?? ""}</span>
              </div>
              <p className="text-[11px] text-stone-500 truncate">
                {uiProfile?.area || "Add your area"}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <button
            type="button"
            onClick={() => openSettings()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#e7dfd5] bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:text-[#9e1b22]"
          >
            <Settings className="h-4 w-4" /> Settings
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${hideMobileNav ? "pb-0 md:pb-6 h-dvh overflow-hidden md:h-auto md:overflow-visible" : "pb-28 md:pb-6"}`}>
        {/* Mobile Top Header (Hidden in full-bleed mobile views like active chat) */}
        {!hideMobileNav && (
          <div className="md:hidden sticky top-0 z-40 bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#e7dfd5] px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9e1b22] to-[#c22830] flex items-center justify-center text-white">
                <span className="text-base">🪷</span>
              </div>
              <span className="font-bold text-stone-900 text-base">Puja Partner</span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#fef3c7] text-[#92400e]">
                শারদীয়া
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/matches"
                className="p-2 rounded-full text-stone-600 hover:bg-stone-200/60"
                aria-label="Matches"
              >
                <Heart className="w-4 h-4 text-[#9e1b22]" />
              </Link>
              <Link
                href="/profile"
                className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-[#9e1b22]"
              >
                <img
                  src={uiProfile?.image || ""}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </Link>
              <button
                type="button"
                onClick={() => openSettings()}
                className="p-2 rounded-xl border border-[#e7dfd5] bg-white text-stone-700"
                aria-label="Open settings"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page Inner Container (no stacking-context-breaking animation on root main) */}
        <main className={`flex-1 ${hideMobileNav ? "p-0 md:p-6 lg:p-8" : "p-3 sm:p-6 lg:p-8"} max-w-7xl w-full mx-auto`}>
          {children}
        </main>
      </div>

      <SettingsModal
        key={`${settingsOption}-${isSettingsOpen}`}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialOption={settingsOption}
      />

      {/* Mobile Floating Capsule Navigation Bar */}
      {!hideMobileNav && (
        <div className="md:hidden fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
          <nav className="pointer-events-auto w-full max-w-sm bg-[#faf7f2]/95 backdrop-blur-md border border-[#e7dfd5] shadow-[0_12px_36px_rgba(0,0,0,0.12)] rounded-full p-1.5 flex items-center justify-between gap-1 transition-all">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isProfile = item.label === "Profile";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-2.5 rounded-full transition-all duration-200 relative group ${
                  isActive
                    ? "bg-[#fbebee] text-[#9e1b22] shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  {isProfile ? (
                    <div
                      className={`w-5 h-5 rounded-full overflow-hidden transition-all ${
                        isActive
                          ? "ring-2 ring-[#9e1b22] ring-offset-1 ring-offset-[#faf7f2]"
                          : "ring-1 ring-stone-300 group-hover:ring-stone-400"
                      }`}
                    >
                      <img
                        src={uiProfile?.image || ""}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive
                          ? "stroke-[2.5] scale-105 text-[#9e1b22]"
                          : "stroke-[2] text-stone-500 group-hover:text-stone-800 group-hover:scale-105"
                      }`}
                    />
                  )}

                  {/* Notification count badge matching previous crimson palette */}
                  {item.count && (
                    <span className="absolute -top-1.5 -right-2.5 px-1.5 min-w-4 h-4 bg-[#9e1b22] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs ring-2 ring-[#faf7f2]">
                      {item.count}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] mt-1 font-semibold tracking-tight transition-colors ${
                    isActive ? "text-[#9e1b22]" : "text-stone-600 group-hover:text-stone-900"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      )}
    </div>
  );
}
