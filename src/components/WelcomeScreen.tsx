"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Heart,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Laptop,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  MapPin,
  Download,
  ExternalLink,
  Mail,
  X,
  Menu,
  Flame,
  RotateCcw,
  MessageSquareQuote,
  Compass,
  MessageCircle,
  User,
  SlidersHorizontal,
  Bell,
  MoreVertical,
  Wifi,
  Battery,
} from "lucide-react";
import { useAppUser } from "@/components/AppUserContext";
import { LoginScreen } from "@/components/LoginScreen";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DEVELOPERS = [
  {
    name: "Tanay Biswas",
    role: "Lead Full-Stack Developer",
    linkedinId: "tanay-biswas-8n",
    linkedinUrl:
      "https://www.linkedin.com/in/tanay-biswas-8n?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    avatar: "/team/tanay-biswas.jpg",
  },
  {
    name: "Abir Mondal",
    role: "Frontend & UI/UX Engineer",
    linkedinId: "abir-mondal-1005913b4",
    linkedinUrl:
      "https://www.linkedin.com/in/abir-mondal-1005913b4?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    avatar: "/team/abir-mondal.jpg",
  },
  {
    name: "Titas Biswas",
    role: "Backend & Cloud Architect",
    linkedinId: "titas-biswas-84a85139a",
    linkedinUrl:
      "https://www.linkedin.com/in/titas-biswas-84a85139a?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    avatar: "/team/titas-biswas.jpg",
  },
  {
    name: "Anushmita Chhetri",
    role: "Product Designer & Community",
    linkedinId: "anushmita-chhetri-b4125b3b4",
    linkedinUrl:
      "https://www.linkedin.com/in/anushmita-chhetri-b4125b3b4?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    avatar: "/team/anushmita-chhetri.jpg",
  },
];

const KOLKATA_ZONES = [
  { name: "North Kolkata", icon: "🏛️", desc: "Heritage lanes & vintage addas" },
  { name: "South Kolkata", icon: "🪷", desc: "Maddox Square & cafes" },
  { name: "Salt Lake & New Town", icon: "🏙️", desc: "Parks & modern spots" },
  { name: "Central Kolkata", icon: "🚋", desc: "College Street & Park St" },
  { name: "Behala & South West", icon: "🥁", desc: "Mega pandals & dhunuchi" },
  { name: "Howrah & Riverside", icon: "🌉", desc: "Ghat sunsets & breezes" },
];

const INTENT_CARDS = [
  {
    title: "Dating & Romance",
    badge: "Dating ❤️",
    desc: "Genuine sparks, cafe dates, and hand-in-hand walks.",
    gradient: "from-[#9e1b22]/10 to-[#ea580c]/10 border-[#9e1b22]/25 text-[#9e1b22]",
  },
  {
    title: "Puja Buddy",
    badge: "Puja Buddy 🪷",
    desc: "Hop iconic pandals and beat the midnight rush together.",
    gradient: "from-amber-500/10 to-orange-500/10 border-amber-300/60 text-amber-800",
  },
  {
    title: "Food & Adda",
    badge: "Food Buddy 🍲",
    desc: "Late-night rolls, phuchka trails, and rooftop chai.",
    gradient: "from-orange-500/10 to-rose-500/10 border-orange-300/60 text-orange-800",
  },
  {
    title: "Photography",
    badge: "Photo Buddy 📸",
    desc: "Golden-hour dhunuchi shots and heritage lane walks.",
    gradient: "from-blue-500/10 to-purple-500/10 border-blue-300/60 text-blue-700",
  },
];

export function WelcomeScreen() {
  const { signInWithGoogle, signingIn, signInError } = useAppUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [viewMode, setViewMode] = useState<"welcome" | "login">("welcome");
  const [installPlatform, setInstallPlatform] = useState<"android" | "ios" | "desktop">("android");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoLiked, setDemoLiked] = useState(false);
  const [demoAction, setDemoAction] = useState<"like" | "nope" | null>(null);
  const [phonePhotoIndex, setPhonePhotoIndex] = useState(0);

  // Capture beforeinstallprompt for native PWA 1-click install
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerPwaInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      const el = document.getElementById("how-to-install");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleDemoLike = () => {
    setDemoLiked(true);
    setDemoAction("like");
    try {
      void confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#9e1b22", "#c22830", "#ea580c", "#d97706", "#fef3c7"],
      });
    } catch {
      // Safe fallback
    }
  };

  const handleDemoNope = () => {
    setDemoLiked(false);
    setDemoAction("nope");
  };

  const handleDemoRewind = () => {
    setDemoLiked(false);
    setDemoAction(null);
  };

  // If user explicitly chooses full login view
  if (viewMode === "login") {
    return <LoginScreen onBackToWelcome={() => setViewMode("welcome")} />;
  }

  return (
    <div className="min-h-screen bg-white text-stone-900 selection:bg-[#9e1b22] selection:text-white flex flex-col font-sans">
      {/* ======================================================== */}
      {/* TINDER-STYLE STICKY NAVBAR */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-stone-200/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-md shadow-[#9e1b22]/20 border border-[#9e1b22]/30 shrink-0 group-hover:scale-105 group-hover:rotate-1 transition-all">
              <Image
                src="/logo.png"
                alt="IshqYara Logo"
                width={44}
                height={44}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-stone-950 tracking-tight">
                  IshqYara
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-[#9e1b22] bg-[#fee2e2]/70 px-2.5 py-0.5 rounded-full border border-[#9e1b22]/20">
                  <Flame className="w-2.5 h-2.5 fill-current text-[#ea580c]" />
                  <span>Dil se, Ishq Tak</span>
                </span>
              </div>
              <p className="text-[11px] font-bold text-stone-500 -mt-0.5 tracking-tight">
                Dating &amp; Social Discovery
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-stone-700">
            <a
              href="#why-ishqyara"
              className="hover:text-[#9e1b22] transition-colors relative py-1 hover:scale-105"
            >
              Why IshqYara
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#9e1b22] transition-colors relative py-1 hover:scale-105"
            >
              How It Works
            </a>
            <a
              href="#demo-showcase"
              className="hover:text-[#9e1b22] transition-colors relative py-1 hover:scale-105"
            >
              App Demo
            </a>
            <a
              href="#how-to-install"
              className="hover:text-[#9e1b22] transition-colors relative py-1 hover:scale-105"
            >
              How to Install
            </a>
            <a
              href="#team"
              className="hover:text-[#9e1b22] transition-colors relative py-1 hover:scale-105"
            >
              Team
            </a>
          </nav>

          {/* Pill Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="rounded-full px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-bold text-stone-900 bg-white hover:bg-stone-100 transition-all border border-stone-300 hover:border-stone-900 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
            >
              Log in
            </button> */}

            <button
              type="button"
              id="header-get-started-btn"
              onClick={() => setShowLoginModal(true)}
              className="rounded-full px-5 sm:px-6 py-2.5 bg-gradient-to-r from-[#9e1b22] via-[#b82028] to-[#c22830] text-white text-xs sm:text-sm font-bold tinder-btn-glow hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#9e1b22]/20"
            >
              <span>Log in</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-stone-700 hover:bg-stone-100 rounded-full"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-5 py-4 space-y-3 text-sm font-bold text-stone-800 animate-in slide-in-from-top-2 duration-150">
            <a
              href="#why-ishqyara"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-[#9e1b22]"
            >
              Why IshqYara
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-[#9e1b22]"
            >
              How It Works
            </a>
            <a
              href="#demo-showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-[#9e1b22]"
            >
              App Demo
            </a>
            <a
              href="#how-to-install"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-[#9e1b22]"
            >
              How to Install
            </a>
            <a
              href="#team"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-[#9e1b22]"
            >
              Our Team
            </a>
          </div>
        )}
      </header>

      {/* ======================================================== */}
      {/* 1. HERO SECTION */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pt-20 sm:pb-28 bg-festive-hero">
        {/* Soft Ambient Glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-[#9e1b22]/15 via-[#ea580c]/10 to-transparent blur-3xl pointer-events-none rounded-full -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Clean Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#9e1b22]/20 text-[#9e1b22] text-xs font-black tracking-wide shadow-xs animate-in fade-in duration-500">
            <Flame className="w-3.5 h-3.5 fill-[#ea580c] text-[#ea580c]" />
            <span>Sign up for free</span>
            {/* <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse" /> */}
          </div>

          {/* Headline with Editorial Display Font */}
          <h1 className="font-display italic text-4xl sm:text-6xl lg:text-7xl font-black text-stone-950 tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Beyond the swipe, <br />
            where <span className="text-tinder-gradient not-italic font-black">dil finds its vibe.</span>
          </h1>

          {/* Subtitle */}
          <p className="font-subtitle text-base sm:text-xl text-stone-600 leading-relaxed max-w-2xl mx-auto font-medium">
            Someone on IshqYara might give you butterflies.
            <br />
            Find out who!
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 max-w-lg mx-auto">
            <button
              type="button"
              id="hero-google-join-btn"
              onClick={() => setShowLoginModal(true)}
              className="rounded-full min-h-[56px] px-8 sm:px-10 bg-gradient-to-r from-[#9e1b22] via-[#b82028] to-[#c22830] text-white font-black text-base tinder-btn-glow hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-[#9e1b22]/25"
            >
              {/* <Sparkles className="w-5 h-5 text-amber-200" /> */}
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* <a
              href="#how-it-works"
              className="rounded-full min-h-[56px] px-7 bg-white border-2 border-stone-300 hover:border-stone-900 text-stone-800 font-bold text-sm shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 tinder-pill-ghost"
            >
              <span>See How It Works</span>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </a> */}

            <button
              type="button"
              onClick={triggerPwaInstall}
              className="rounded-full min-h-[56px] px-6 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 font-bold text-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer tinder-pill-ghost"
              title="Install Progressive Web App on phone or desktop"
            >
              <Download className="w-4 h-4 text-[#9e1b22]" />
              <span>{isAppInstalled ? "App Installed ✓" : "Get the app"}</span>
            </button>
          </div>

          {/* Clean Trust & Culture Proof Badges */}
          {/* <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-bold text-stone-700">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-stone-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Selfie Verified Profiles</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-stone-200 shadow-2xs">
              <MapPin className="w-4 h-4 text-[#9e1b22]" />
              <span>6 Kolkata Zones</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-stone-200 shadow-2xs">
              <Heart className="w-4 h-4 text-[#9e1b22] fill-[#9e1b22]" />
              <span>Likes with Notes</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-stone-200 shadow-2xs">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Zero Mixed Signals</span>
            </div>
          </div> */}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. WHY ISHQYARA SECTION */}
      {/* ======================================================== */}
      <section id="why-ishqyara" className="py-20 sm:py-28 bg-[#faf7f2] border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#9e1b22] bg-[#fee2e2]/70 px-3.5 py-1.5 rounded-full border border-[#9e1b22]/25 inline-block">
              Why IshqYara
            </span>
            <h2 className="font-display italic text-3xl sm:text-4xl font-black text-stone-950 tracking-tight">
              More Than Just a<span className="not-italic text-tinder-gradient font-black"> Swipe</span>
            </h2>
          </div>

          {/* 4 Feature Pillars Grid */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1: Explicit Intentions */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 hover:border-[#9e1b22]/40 transition-all festive-card-hover space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#9e1b22] to-[#c22830] text-white flex items-center justify-center text-xl shadow-sm">
                ❤️
              </div>
              <h3 className="text-lg font-black text-stone-950 tracking-tight">
                Intentions Upfront
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                Choose dating, puja hop, or food adda so you match on the exact same page.
              </p>
            </div>

            {/* Pillar 2: Neighborhood Zones */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 hover:border-[#ea580c]/40 transition-all festive-card-hover space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ea580c] to-amber-500 text-white flex items-center justify-center text-xl shadow-sm">
                🚋
              </div>
              <h3 className="text-lg font-black text-stone-950 tracking-tight">
                Kolkata Zones
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                Filter by North, South, or Salt Lake for easy, spontaneous addas nearby.
              </p>
            </div>

            {/* Pillar 3: Notes & Compliments */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 hover:border-purple-500/40 transition-all festive-card-hover space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-sm">
                💬
              </div>
              <h3 className="text-lg font-black text-stone-950 tracking-tight">
                Likes with Notes
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                Reply to prompts directly. Start conversations naturally, with zero dry hellos.
              </p>
            </div>

            {/* Pillar 4: Safe & Verified */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 hover:border-emerald-500/40 transition-all festive-card-hover space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center text-xl shadow-sm">
                🛡️
              </div>
              <h3 className="text-lg font-black text-stone-950 tracking-tight">
                Safe &amp; Verified
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-medium">
                Selfie verification and instant controls keep your circle authentic and safe.
              </p>
            </div>
          </div>

          {/* Intention Cards Showcase */}
          <div className="mt-14">
            <h3 className="text-lg sm:text-xl font-black text-stone-950 text-center mb-6 tracking-tight">
              Select Your Vibe &amp; Intention
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {INTENT_CARDS.map((item) => (
                <div
                  key={item.badge}
                  className={`p-5 rounded-3xl border bg-white ${item.gradient} space-y-2 transition-all hover:scale-102 shadow-2xs`}
                >
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-white border border-current/25 inline-block shadow-2xs">
                    {item.badge}
                  </span>
                  <h4 className="text-base font-black text-stone-900">{item.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Deep Dark Container for Kolkata Zones */}
          <div className="mt-14 p-8 sm:p-10 rounded-[32px] bg-[#111418] text-white shadow-2xl space-y-6 border border-stone-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#ea580c] bg-[#ea580c]/15 px-3 py-1 rounded-full border border-[#ea580c]/30">
                  Cultural Resonance
                </span>
                <h3 className="font-display italic text-2xl sm:text-3xl font-black text-white mt-2">
                  Match across all 6 Kolkata zones.
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginModal(true)}
                className="self-start md:self-auto rounded-full px-7 py-3 bg-gradient-to-r from-[#9e1b22] via-[#b82028] to-[#c22830] text-white text-xs sm:text-sm font-black tinder-btn-glow hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#9e1b22]/25 cursor-pointer"
              >
                Explore Kolkata Matches
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-2">
              {KOLKATA_ZONES.map((zone) => (
                <div
                  key={zone.name}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all space-y-1.5 hover:scale-103"
                >
                  <div className="text-2xl">{zone.icon}</div>
                  <h4 className="text-xs font-black text-white">{zone.name}</h4>
                  <p className="text-[11px] text-stone-400 leading-tight font-medium">{zone.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. INTERACTIVE APP DEMO SHOWCASE */}
      {/* ======================================================== */}
      <section id="demo-showcase" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#9e1b22] bg-[#fee2e2]/70 px-3.5 py-1.5 rounded-full border border-[#9e1b22]/25 inline-block">
              Live Product Preview
            </span>
            <h2 className="font-display italic text-3xl sm:text-5xl font-black text-stone-950 tracking-tight">
              See IshqYara in action.
            </h2>
            {/* <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
              Experience the sleek discovery interface, interactive Kolkata cards, and festive companion matching before you sign in.
            </p> */}
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Authentic IshqYara App UI Mobile Chassis */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative max-w-[330px] sm:max-w-[350px] w-full rounded-[50px] bg-stone-900 p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.15)] border-[6px] border-stone-800 transition-all select-none festive-card-hover">
                {/* Left Hardware Volume Buttons */}
                <div className="absolute -left-[8px] top-24 w-[3px] h-8 bg-stone-700 rounded-l-sm" />
                <div className="absolute -left-[8px] top-36 w-[3px] h-10 bg-stone-700 rounded-l-sm" />
                <div className="absolute -left-[8px] top-50 w-[3px] h-10 bg-stone-700 rounded-l-sm" />
                {/* Right Power Button */}
                <div className="absolute -right-[8px] top-32 w-[3px] h-14 bg-stone-700 rounded-r-sm" />

                {/* Inner Screen Surface */}
                <div className="rounded-[40px] bg-stone-950 overflow-hidden flex flex-col justify-between relative border border-white/10 shadow-inner h-[620px]">
                  {/* 1. Phone Top Status Bar */}
                  <div className="pt-3 px-5 pb-1 flex items-center justify-between z-30 pointer-events-none">
                    <span className="text-[11px] font-bold text-white tracking-tight">9:41</span>
                    {/* Dynamic Island Pill */}
                    <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5 border border-white/10 shadow-inner">
                      <div className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-white/15" />
                    </div>
                    <div className="flex items-center gap-1.5 text-white">
                      <Wifi className="w-3 h-3" />
                      <Battery className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* 2. IshqYara App Top Navigation Bar (from AppShell) */}
                  <div className="px-4 py-2 flex items-center justify-between border-b border-white/10 bg-stone-950/90 backdrop-blur-md z-20">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl overflow-hidden border border-[#9e1b22]/40 shadow-xs">
                        <Image src="/logo.png" alt="IshqYara" width={28} height={28} className="object-cover" />
                      </div>
                      <span className="font-display italic font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#9e1b22] via-[#c22830] to-[#ea580c]">
                        IshqYara
                      </span>
                      <span className="text-xs">🪷</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-7 h-7 rounded-full bg-stone-900 border border-white/15 flex items-center justify-center text-stone-300">
                        <Bell className="w-3.5 h-3.5" />
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-stone-950" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-stone-900 border border-white/15 flex items-center justify-center text-stone-300">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* 3. Filter Chips Strip */}
                  <div className="px-3 pt-2 pb-1 flex items-center gap-1.5 overflow-x-hidden text-[10px] font-bold z-20">
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#9e1b22] to-[#c22830] text-white shadow-xs">
                      North Kolkata 🏛️
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-stone-900 text-amber-300 border border-amber-400/30">
                      Puja Buddy 🪷
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-stone-900 text-stone-400 border border-white/10">
                      Dating ❤️
                    </span>
                  </div>

                  {/* 4. The Real Discovery Card */}
                  <div className="relative flex-1 mx-2.5 my-1.5 rounded-[24px] overflow-hidden bg-stone-900 border border-white/15 shadow-xl group">
                    {/* Story Indicator Dashes */}
                    <div className="absolute top-2.5 inset-x-3 z-30 flex items-center gap-1 pointer-events-none">
                      <div className={`h-1 rounded-full flex-1 transition-all ${phonePhotoIndex === 0 ? "bg-white shadow-xs" : "bg-white/40"}`} />
                      <div className={`h-1 rounded-full flex-1 transition-all ${phonePhotoIndex === 1 ? "bg-white shadow-xs" : "bg-white/40"}`} />
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-5 inset-x-3 z-30 flex items-center justify-between pointer-events-none">
                      <div className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/40 flex items-center gap-1 shadow-md pointer-events-auto">
                        <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>96% Match</span>
                      </div>
                      <div className="flex items-center gap-1 pointer-events-auto">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                          Dating
                        </span>
                        <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center justify-center">
                          <MoreVertical className="w-3 h-3" />
                        </div>
                      </div>
                    </div>

                    {/* Interactive Action Stamps */}
                    {(demoAction === "like" || demoLiked) && (
                      <div className="absolute top-14 left-4 z-40 transform -rotate-[14deg] border-[3.5px] border-emerald-400 bg-emerald-950/70 text-emerald-300 px-3 py-1 rounded-xl font-black text-xl tracking-wider uppercase shadow-2xl backdrop-blur-xs flex items-center gap-1.5 ring-2 ring-emerald-400/40 animate-in zoom-in-75 duration-150">
                        <Heart className="w-5 h-5 fill-emerald-400 text-emerald-400" />
                        <span>LIKE</span>
                      </div>
                    )}
                    {demoAction === "nope" && (
                      <div className="absolute top-14 right-4 z-40 transform rotate-[14deg] border-[3.5px] border-rose-500 bg-rose-950/70 text-rose-300 px-3 py-1 rounded-xl font-black text-xl tracking-wider uppercase shadow-2xl backdrop-blur-xs flex items-center gap-1.5 ring-2 ring-rose-500/40 animate-in zoom-in-75 duration-150">
                        <X className="w-5 h-5 stroke-[3] text-rose-500" />
                        <span>NOPE</span>
                      </div>
                    )}

                    {/* Authentic Profile Photo with tap to change */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        phonePhotoIndex === 0
                          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                          : "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
                      }
                      alt="Riya Sen discovery profile card"
                      className="w-full h-full object-cover select-none cursor-pointer"
                      onClick={() => setPhonePhotoIndex((prev) => (prev === 0 ? 1 : 0))}
                      title="Tap photo to switch"
                    />

                    {/* Bottom Profile Details Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent flex flex-col justify-end p-3.5 text-white pointer-events-none">
                      <div className="space-y-1.5 pointer-events-auto">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xl font-black tracking-tight text-white drop-shadow-sm">
                            Riya Sen, <span className="font-semibold text-lg text-stone-200">23</span>
                          </h3>
                          <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-stone-200">
                          <span className="flex items-center gap-0.5 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
                            <MapPin className="w-3 h-3 text-[#ea580c]" />
                            North Kolkata 🏛️
                          </span>
                          <span className="bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
                            Presidency Univ.
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-200 font-medium leading-snug line-clamp-2">
                          &ldquo;Midnight phuchka at Hedua &amp; Dhunuchi naach at Bagbazar &rdquo;
                        </p>

                        <div className="flex flex-wrap gap-1 pt-0.5">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/15 backdrop-blur-xs text-white border border-white/20">
                            Heritage Walks
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-white/15 backdrop-blur-xs text-white border border-white/20">
                            Phuchka &amp; Cha
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/25 backdrop-blur-xs text-amber-200 border border-amber-400/30">
                            Sovabazar
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. In-App Action Dock (4 Authentic Buttons) */}
                  <div className="pt-1.5 pb-2 px-3 flex items-center justify-center gap-3 bg-stone-950/80 backdrop-blur-xs z-20">
                    {/* Rewind */}
                    <button
                      type="button"
                      onClick={handleDemoRewind}
                      className="w-9 h-9 rounded-full bg-white text-amber-500 border border-amber-200 shadow-md hover:scale-110 active:scale-90 transition-transform flex items-center justify-center cursor-pointer"
                      title="Rewind Profile"
                    >
                      <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    {/* Nope */}
                    <button
                      type="button"
                      onClick={handleDemoNope}
                      className="w-11 h-11 rounded-full bg-white text-rose-500 border border-rose-200 shadow-md hover:scale-110 active:scale-90 transition-transform flex items-center justify-center cursor-pointer"
                      title="Pass Profile"
                    >
                      <X className="w-5 h-5 stroke-[3]" />
                    </button>

                    {/* Send Note */}
                    <button
                      type="button"
                      onClick={handleDemoLike}
                      className="w-9 h-9 rounded-full bg-white text-[#9e1b22] border border-[#9e1b22]/20 shadow-md hover:scale-110 active:scale-90 transition-transform flex items-center justify-center cursor-pointer"
                      title="Send Note with Like"
                    >
                      <MessageSquareQuote className="w-4 h-4 stroke-[2.2]" />
                    </button>

                    {/* Like */}
                    <button
                      type="button"
                      onClick={handleDemoLike}
                      className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#9e1b22] to-[#c22830] text-white shadow-lg shadow-[#9e1b22]/35 hover:scale-110 active:scale-90 transition-transform flex items-center justify-center cursor-pointer"
                      title="Like Profile"
                    >
                      <Heart className="w-5 h-5 fill-white stroke-none" />
                    </button>
                  </div>

                  {/* 6. AppShell Bottom Navigation Bar */}
                  <div className="px-4 pt-1.5 pb-1 border-t border-white/10 bg-stone-950 flex items-center justify-around text-stone-400 z-20">
                    <div className="flex flex-col items-center gap-0.5 text-[#9e1b22]">
                      <Compass className="w-4 h-4 stroke-[2.5]" />
                      <span className="text-[9px] font-bold">Find</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 relative">
                      <Heart className="w-4 h-4" />
                      <span className="absolute -top-1 -right-2 px-1 rounded-full bg-[#9e1b22] text-white text-[8px] font-black">
                        3
                      </span>
                      <span className="text-[9px]">Matches</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 relative">
                      <MessageCircle className="w-4 h-4" />
                      <span className="absolute -top-1 -right-2 px-1 rounded-full bg-[#ea580c] text-white text-[8px] font-black">
                        1
                      </span>
                      <span className="text-[9px]">Chat</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <User className="w-4 h-4" />
                      <span className="text-[9px]">Profile</span>
                    </div>
                  </div>

                  {/* Bottom iPhone Home Indicator */}
                  <div className="pb-1.5 pt-0.5 bg-stone-950 flex justify-center">
                    <div className="w-24 h-1 bg-white/40 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Caption Below Phone */}
              <div className="text-center pt-3 space-y-0.5">
                <p className="text-xs font-bold text-stone-800 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#9e1b22]" />
                  <span>Real IshqYara Mobile Interface</span>
                </p>
                <p className="text-[11px] text-stone-500 font-medium">
                  Tap buttons on phone or deck to test live interactions
                </p>
              </div>
            </div>

            {/* Right: Interactive Live Discovery Card Preview */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#faf7f2] rounded-[32px] p-6 sm:p-8 border border-stone-200/90 shadow-xl space-y-6 relative festive-card-hover">
                {/* Demo Card Top Header */}
                <div className="flex items-center justify-between border-b border-stone-200/70 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-xl">
                      🪷
                    </div>
                    <div>
                      <h4 className="text-base font-black text-stone-950">
                        Interactive Deck Preview
                      </h4>
                      <p className="text-xs text-stone-500 font-medium">
                        Try liking this demo profile card below!
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Selfie Verified</span>
                  </span>
                </div>

                {/* Profile Card Mockup */}
                <div className="rounded-2xl border border-stone-200/90 p-5 bg-white space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-stone-950">
                          Riya Sen, 23
                        </span>
                        <span className="text-xs text-stone-500 font-bold">• North Kolkata 🏛️</span>
                      </div>
                      <p className="text-xs text-stone-600 font-medium">Presidency University • Literature</p>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-[#fee2e2]/70 border border-[#9e1b22]/25 text-[#9e1b22] font-black text-xs">
                      94% Match
                    </div>
                  </div>

                  {/* Intent & Vibe Tags */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      Puja Buddy 🪷
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#fee2e2]/70 text-[#9e1b22] border border-[#9e1b22]/30">
                      Dating ❤️
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-100 text-stone-700">
                      Midnight Rush Craver 🥁
                    </span>
                  </div>

                  {/* Cultural Prompt Answer */}
                  <div className="p-4 rounded-2xl bg-[#faf7f2] border border-stone-200/80 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#9e1b22]">
                      My Ideal Puja Date
                    </span>
                    <p className="text-xs sm:text-sm text-stone-700 font-medium">
                      &ldquo;Phuchka &amp; cha date at Maddox Square, followed by heritage lights walking tour from Sovabazar to Bagbazar at 2 AM.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="pt-2 flex items-center justify-center gap-3.5">
                  <button
                    type="button"
                    onClick={handleDemoRewind}
                    className="w-12 h-12 rounded-full border border-amber-200 bg-white hover:bg-amber-50 text-amber-500 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    title="Rewind Demo"
                  >
                    <RotateCcw className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoNope}
                    className="w-14 h-14 rounded-full border-2 border-stone-300 bg-white hover:bg-rose-50 hover:border-rose-300 text-rose-500 flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    title="Pass Demo"
                  >
                    <X className="w-6 h-6 stroke-[3]" />
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoLike}
                    className={`h-14 px-8 rounded-full font-black text-sm flex items-center justify-center gap-2.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                      demoLiked || demoAction === "like"
                        ? "bg-emerald-600 text-white shadow-emerald-600/30"
                        : "bg-gradient-to-r from-[#9e1b22] via-[#b82028] to-[#c22830] text-white tinder-btn-glow shadow-[#9e1b22]/25"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${(demoLiked || demoAction === "like") ? "fill-white" : "fill-white"}`} />
                    <span>{(demoLiked || demoAction === "like") ? "Matched! Confetti Sent 🎉" : "Send Like with Note"}</span>
                  </button>
                </div>

                {demoLiked && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-center text-xs font-bold animate-in fade-in duration-200">
                    ✨ You just experienced IshqYara&apos;s mutual chemistry spark! Sign in below to explore real Kolkata profiles.
                  </div>
                )}
              </div>

              {/* Quick Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-center">
                <div className="p-4 rounded-2xl bg-[#faf7f2] border border-stone-200/80 shadow-2xs space-y-1">
                  <span className="text-lg font-black text-[#9e1b22]">0% Fake</span>
                  <p className="text-xs text-stone-600 font-medium">Selfie verification check on sign-up</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf7f2] border border-stone-200/80 shadow-2xs space-y-1">
                  <span className="text-lg font-black text-[#ea580c]">Real-Time</span>
                  <p className="text-xs text-stone-600 font-medium">Live match alerts and messages</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#faf7f2] border border-stone-200/80 shadow-2xs space-y-1">
                  <span className="text-lg font-black text-emerald-700">100% Free</span>
                  <p className="text-xs text-stone-600 font-medium">No paywalls to find companions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. HOW IT WORKS SECTION */}
      {/* ======================================================== */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-[#faf7f2] border-t border-stone-200/80 relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-rose-100/40 via-amber-100/30 to-orange-100/40 blur-3xl pointer-events-none rounded-full -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#9e1b22] bg-[#fee2e2]/70 px-3.5 py-1.5 rounded-full border border-[#9e1b22]/25 inline-block">
              How It Works
            </span>
            <h2 className="font-display italic text-3xl sm:text-5xl font-black text-stone-950 tracking-tight">
              How IshqYara <br />
              <span className="not-italic text-tinder-gradient font-black">works.</span>
            </h2>
            <p className="font-subtitle text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
              Three simple steps to meet genuine people.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Step 1 */}
            <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-stone-200/90 hover:border-[#9e1b22]/40 transition-all space-y-5 relative shadow-xs hover:shadow-xl festive-card-hover flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-[#9e1b22] flex items-center justify-center">
                    <Compass className="w-6 h-6 text-[#9e1b22]" />
                  </div>
                  <span className="font-display italic font-black text-3xl text-stone-200 select-none">
                    01
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-stone-950 tracking-tight">
                    Sign In &amp; Set Your Vibe
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed font-medium">
                    Pick your intent dating, puja buddy, or food adda and select your Kolkata neighborhood.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-700">
                  <MapPin className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span>North • South • Salt Lake</span>
                </div> */}
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-stone-200/90 hover:border-[#ea580c]/40 transition-all space-y-5 relative shadow-xs hover:shadow-xl festive-card-hover flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 text-[#ea580c] flex items-center justify-center">
                    <MessageSquareQuote className="w-6 h-6 text-[#ea580c]" />
                  </div>
                  <span className="font-display italic font-black text-3xl text-stone-200 select-none">
                    02
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-stone-950 tracking-tight">
                    Like with a Note
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed font-medium">
                    Skip the empty swipe. Reply directly to someone&apos;s prompt with a personalized note that breaks the ice.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-800">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>&ldquo;Coffee at Flurys this weekend?&rdquo;</span>
                </div> */}
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-7 sm:p-8 rounded-[32px] bg-white border border-stone-200/90 hover:border-emerald-500/40 transition-all space-y-5 relative shadow-xs hover:shadow-xl festive-card-hover flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-emerald-600 fill-emerald-600" />
                  </div>
                  <span className="font-display italic font-black text-3xl text-stone-200 select-none">
                    03
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-stone-950 tracking-tight">
                    Chat &amp; Meet Up
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed font-medium">
                    When the feeling is mutual, start chatting in real time and plan your first in person adda or pandal hop.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mutual match unlocks chat</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. HOW TO INSTALL (PWA GUIDE) SECTION */}
      {/* ======================================================== */}
      <section id="how-to-install" className="py-20 sm:py-28 bg-white border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100/80 px-3.5 py-1.5 rounded-full border border-emerald-300 inline-block">
              Progressive Web App (PWA)
            </span>
            <h2 className="font-display italic text-3xl sm:text-5xl font-black text-stone-950 tracking-tight">
              Install in 3 seconds.
            </h2>
            <p className="font-subtitle text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
              No bulky 150MB App Store downloads! IshqYara installs directly onto your home screen from your browser, takes 0MB storage, and runs lightning-fast.
            </p>
          </div>

          <div className="mt-12 max-w-3xl mx-auto space-y-6">
            {/* Pill Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-stone-100 rounded-full border border-stone-200/90">
              <button
                type="button"
                onClick={() => setInstallPlatform("android")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  installPlatform === "android"
                    ? "bg-white text-stone-950 shadow-md border border-stone-200"
                    : "text-stone-600 hover:text-stone-950"
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Android</span>
              </button>

              <button
                type="button"
                onClick={() => setInstallPlatform("ios")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  installPlatform === "ios"
                    ? "bg-white text-stone-950 shadow-md border border-stone-200"
                    : "text-stone-600 hover:text-stone-950"
                }`}
              >
                <span>🍎</span>
                <span>iOS (Safari)</span>
              </button>

              <button
                type="button"
                onClick={() => setInstallPlatform("desktop")}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  installPlatform === "desktop"
                    ? "bg-white text-stone-950 shadow-md border border-stone-200"
                    : "text-stone-600 hover:text-stone-950"
                }`}
              >
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span>Desktop</span>
              </button>
            </div>

            {/* TAB CONTENT: ANDROID */}
            {installPlatform === "android" && (
              <div className="bg-[#faf7f2] rounded-[32px] p-6 sm:p-8 border border-stone-200/90 shadow-xl space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200/70">
                  <h3 className="font-black text-stone-950 text-base sm:text-lg flex items-center gap-2">
                    <span>🤖</span>
                    <span>Install on Android via Google Chrome</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Recommended
                  </span>
                </div>

                <div className="relative w-full aspect-[16/9] max-h-72 rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-xs flex items-center justify-center">
                  <Image
                    src="/install-guide-android.svg"
                    alt="How to install IshqYara on Android Chrome step-by-step visual preview"
                    fill
                    unoptimized
                    className="object-contain p-2"
                  />
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/70 text-xs">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[#9e1b22] to-[#c22830] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <span className="text-stone-800">Open <strong>ishqyara.social</strong> in <strong>Google Chrome</strong> on your phone.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/70 text-xs">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[#9e1b22] to-[#c22830] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <span className="text-stone-800">Tap the <strong>three-dot menu (⋮)</strong> in the top-right corner of Chrome.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/70 text-xs">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[#9e1b22] to-[#c22830] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <span className="text-stone-800">Select <strong>Install app</strong> (or <em>Add to Home screen</em>).</span>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/70 text-xs">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-r from-[#9e1b22] to-[#c22830] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                    <span className="text-stone-800">Tap <strong>Install</strong> to confirm.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                    <span className="text-emerald-950 font-bold">IshqYara now appears directly on your Home screen as a standalone app!</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={triggerPwaInstall}
                    className="rounded-full w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9e1b22] via-[#b82028] to-[#c22830] text-white font-black text-sm shadow-md tinder-btn-glow hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Click To Install Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: IOS */}
            {installPlatform === "ios" && (
              <div className="bg-[#faf7f2] rounded-[32px] p-6 sm:p-8 border border-stone-200/90 shadow-xl space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200/70">
                  <h3 className="font-black text-stone-950 text-base sm:text-lg flex items-center gap-2">
                    <span>🍎</span>
                    <span>Install on iPhone / iPad via Apple Safari</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Apple Safari
                  </span>
                </div>

                <div className="relative w-full aspect-[16/9] max-h-72 rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-xs flex items-center justify-center">
                  <Image
                    src="/install-guide-ios.svg"
                    alt="How to install IshqYara on iPhone Safari step-by-step visual preview"
                    fill
                    unoptimized
                    className="object-contain p-2"
                  />
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/70 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <span className="text-stone-800">Open <strong>ishqyara.social</strong> in <strong>Safari</strong> on your iPhone.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/70 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <span className="text-stone-800">Tap the <strong>Share button</strong> (the square with an arrow pointing upward) at the bottom.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/70 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <span className="text-stone-800">Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/70 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                    <span className="text-stone-800">Tap <strong>Add</strong> in the top-right corner to complete.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                    <span className="text-emerald-950 font-bold">Launch IshqYara anytime from your iOS home screen!</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DESKTOP */}
            {installPlatform === "desktop" && (
              <div className="bg-[#faf7f2] rounded-[32px] p-6 sm:p-8 border border-stone-200/90 shadow-xl space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200/70">
                  <h3 className="font-black text-stone-950 text-base sm:text-lg flex items-center gap-2">
                    <span>💻</span>
                    <span>Install on Desktop (Windows / Mac / Linux)</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Chrome / Edge / Brave
                  </span>
                </div>

                <div className="relative w-full aspect-[16/9] max-h-72 rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-xs flex items-center justify-center">
                  <Image
                    src="/install-guide-desktop.svg"
                    alt="How to install IshqYara on Desktop Chrome or Edge step-by-step visual preview"
                    fill
                    unoptimized
                    className="object-contain p-2"
                  />
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/70 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <span className="text-stone-800">Open <strong>ishqyara.social</strong> in <strong>Chrome, Edge, or Brave</strong>.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/70 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <span className="text-stone-800">Click the <strong>Install icon</strong> (🖥️ or ⊕) on the right side of the URL address bar.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-stone-200/70 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <span className="text-stone-800">Click <strong>Install</strong> in the dialog.</span>
                  </div>
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                    <span className="text-emerald-950 font-bold">IshqYara runs in its own window without browser toolbars!</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. MEET THE TEAM SECTION */}
      {/* ======================================================== */}
      <section id="team" className="py-20 sm:py-28 bg-[#faf7f2] border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-stone-700 bg-stone-200 px-3.5 py-1.5 rounded-full border border-stone-300 inline-block">
              Creators &amp; Vision
            </span>
            <h2 className="font-display italic text-3xl sm:text-5xl font-black text-stone-950 tracking-tight">
              The team behind IshqYara.
            </h2>
            {/* <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
              We’re the team behind IshqYara. We’re just a group of people trying to build something meaningful, learn new things, and bring people closer. This is our first time building an app like this, and we’re excited to see where this journey takes us. ❤️
            </p> */}
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DEVELOPERS.map((dev) => (
              <div
                key={dev.linkedinId}
                className="bg-white rounded-[28px] p-6 border border-stone-200/90 hover:border-stone-400 transition-all text-center space-y-5 festive-card-hover flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden shadow-lg ring-4 ring-[#9e1b22]/20">
                    <Image
                      src={dev.avatar}
                      alt={dev.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-stone-950">
                      {dev.name}
                    </h3>
                    <p className="text-xs text-stone-500 font-bold">
                      {dev.role}
                    </p>
                  </div>
                </div>

                <a
                  href={dev.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-[#0a66c2] text-xs font-black transition-all hover:scale-103 shadow-2xs"
                >
                  <LinkedinIcon className="w-3.5 h-3.5 fill-[#0a66c2]" />
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. PRE-LOGIN CALL TO ACTION BANNER (ISHQYARA BRAND CRIMSON GRADIENT) */}
      {/* ======================================================== */}
      <section className="py-20 sm:py-28 bg-[#111418] text-white relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#9e1b22]/30 via-[#ea580c]/20 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-7 relative z-10">
          <div className="w-18 h-18 mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-stone-900 ring-4 ring-[#9e1b22]/30">
            <Image
              src="/logo.png"
              alt="IshqYara"
              width={72}
              height={72}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#ea580c]">
              Dil se, Ishq Tak.
            </span>
            <h2 className="font-display italic text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
              Ready to find your vibe?
            </h2>
            <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed font-medium">
              Beyond appearances. Get to know the person behind the profile.
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              id="cta-banner-google-btn"
              onClick={() => setShowLoginModal(true)}
              className="rounded-full w-full sm:w-auto min-h-[56px] px-10 bg-white hover:bg-stone-100 text-stone-950 font-black text-base shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.95h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.25Z"/>
                <path fill="#34A853" d="M12 21.7c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.7Z"/>
                <path fill="#FBBC05" d="M6.53 13.78a5.86 5.86 0 0 1 0-3.56V7.69H3.29a9.7 9.7 0 0 0 0 8.62l3.24-2.53Z"/>
                <path fill="#EA4335" d="M12 6.19c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.27 14.63 2.3 12 2.3a9.74 9.74 0 0 0-8.71 5.39l3.24 2.53C7.3 7.91 9.46 6.19 12 6.19Z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("login")}
              className="rounded-full w-full sm:w-auto min-h-[56px] px-8 bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/25 backdrop-blur-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              Open Dedicated Login Page
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. TINDER-STYLE CLEAN DARK FOOTER */}
      {/* ======================================================== */}
      <footer className="bg-[#0b0d10] text-stone-300 py-16 sm:py-20 border-t border-stone-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/20">
                  <Image
                    src="/logo.png"
                    alt="IshqYara Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">IshqYara</h3>
                  <p className="text-xs text-[#ea580c] font-bold">Dil se, Ishq Tak.</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-sm font-medium">
                Dating should feel comfortable. We want to build a community where respect and personal boundaries matter.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://www.instagram.com/ishqyaraofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#9e1b22] text-white flex items-center justify-center transition-all hover:scale-110"
                  title="Follow @ishqyaraofficial on Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href="mailto:ishqyaraofficial@gmail.com"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#ea580c] text-white flex items-center justify-center transition-all hover:scale-110"
                  title="Email IshqYara Support"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Explore Column */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">
                Explore
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-stone-400">
                <li><a href="#why-ishqyara" className="hover:text-white transition-colors">Why IshqYara</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#demo-showcase" className="hover:text-white transition-colors">App Demo</a></li>
                <li><a href="#how-to-install" className="hover:text-white transition-colors">PWA Install Guide</a></li>
                <li><a href="#team" className="hover:text-white transition-colors">Our Developers</a></li>
              </ul>
            </div>

            {/* Legal Column */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">
                Legal &amp; Safety
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-stone-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <span className="text-stone-500 text-xs block">
                    Police Helpline: 1090 / 112
                  </span>
                </li>
                <li>
                  <span className="text-stone-500 text-xs block">
                    Women Safety: 1091
                  </span>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">
                Direct Contact
              </h4>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-medium">
                Have questions or need assistance? Reach out anytime:
              </p>
              <a
                href="mailto:ishqyaraofficial@gmail.com"
                className="text-xs sm:text-sm font-bold text-[#ea580c] hover:underline block break-all"
              >
                ishqyaraofficial@gmail.com
              </a>
              <span className="text-xs text-stone-500 block">
                Response within 24-48 hours
              </span>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-stone-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-stone-500">
            <p>© {new Date().getFullYear()} IshqYara. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <span>Crafted with</span>
              <Heart className="w-3.5 h-3.5 text-[#9e1b22] fill-current" />
              <span>by IshqYara Team</span>
            </p>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* GOOGLE SIGN-IN MODAL */}
      {/* ======================================================== */}
      {showLoginModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="bg-white w-full max-w-sm rounded-[36px] p-8 text-center shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Close login dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Logo */}
            <div className="w-16 h-16 mx-auto rounded-3xl overflow-hidden shadow-lg shadow-[#9e1b22]/25 border border-[#9e1b22]/30">
              <Image
                src="/logo.png"
                alt="IshqYara Logo"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-3.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#9e1b22] bg-[#fee2e2]/70 px-3 py-1 rounded-full border border-[#9e1b22]/25">
                Dil se, Ishq Tak.
              </span>
            </div>

            <h3 className="font-display italic mt-3 text-2xl font-black text-stone-950 tracking-tight">
              Welcome to IshqYara
            </h3>
            <p className="text-xs font-bold text-[#ea580c]">Puja &amp; Social Partner</p>
            {/* <p className="mt-2 text-xs text-stone-600 leading-relaxed font-medium">
              Sign in with your Google account to discover genuine Kolkata singles, pandal hopping buddies, and exciting addas.
            </p> */}

            {/* Google Sign In Button (Pill shaped) */}
            <button
              type="button"
              id="google-signin-btn"
              onClick={signInWithGoogle}
              disabled={signingIn}
              className="rounded-full mt-7 w-full min-h-[52px] bg-white border-2 border-stone-300 shadow-sm hover:shadow-md hover:border-stone-900 active:scale-95 hover:scale-102 transition-all flex items-center justify-center gap-3 text-sm font-black text-stone-900 disabled:opacity-60 cursor-pointer"
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

            {/* Terms and Privacy notice */}
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

            <div className="mt-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setViewMode("login");
                }}
                className="text-xs font-bold text-stone-600 hover:text-stone-950 underline cursor-pointer"
              >
                Go to Dedicated Full Login Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
