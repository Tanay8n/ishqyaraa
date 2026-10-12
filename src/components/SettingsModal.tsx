"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Settings as SettingsIcon,
  User,
  MessageSquare,
  Shield,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Send,
  Star,
  MapPin,
  GraduationCap,
  Mail,
  AlertCircle,
  FileText,
  Sparkles,
  Heart,
  Download,
  Smartphone,
  Laptop,
} from "lucide-react";
import { useAppUser } from "@/components/AppUserContext";

export type SettingsOption =
  | "menu"
  | "userInfo"
  | "install"
  | "about"
  | "support"
  | "privacy"
  | "terms"
  | "developers"
  | "logout";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOption?: SettingsOption;
}

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

interface DeveloperItem {
  name: string;
  role: string;
  linkedinId: string;
  linkedinUrl: string;
  avatar: string;
}

const DEVELOPERS: DeveloperItem[] = [
  {
    name: "Tanay Biswas",
    role: "Lead Full-Stack Developer",
    linkedinId: "tanay-biswas-8n",
    linkedinUrl: "https://www.linkedin.com/in/tanay-biswas-8n?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    avatar: "/team/tanay-biswas.jpg",
  },
  {
    name: "Abir Mondal",
    role: "Frontend & UI/UX Engineer",
    linkedinId: "abir-mondal-1005913b4",
    linkedinUrl: "https://www.linkedin.com/in/abir-mondal-1005913b4?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    avatar: "/team/abir-mondal.jpg",
  },
  {
    name: "Titas Biswas",
    role: "Backend & Cloud Architect",
    linkedinId: "titas-biswas-84a85139a",
    linkedinUrl: "https://www.linkedin.com/in/titas-biswas-84a85139a?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    avatar: "/team/titas-biswas.jpg",
  },
  {
    name: "Anushmita Chhetri",
    role: "Product Designer & Community",
    linkedinId: "anushmita-chhetri-b4125b3b4",
    linkedinUrl: "https://www.linkedin.com/in/anushmita-chhetri-b4125b3b4?utm_source=share_via&utm_content=profile&utm_medium=member_ios",
    avatar: "/team/anushmita-chhetri.jpg",
  },
];

export function SettingsModal({
  isOpen,
  onClose,
  initialOption = "menu",
}: SettingsModalProps) {
  const { uiProfile, publicProfile, user, logout } = useAppUser();
  const [currentView, setCurrentView] = useState<SettingsOption>(initialOption);
  const [installPlatform, setInstallPlatform] = useState<"android" | "ios" | "desktop">("android");

  // Copy state for developers' LinkedIn IDs
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Support & Feedback state
  const [feedbackCategory, setFeedbackCategory] = useState<
    "feature" | "bug" | "pandal" | "safety" | "general"
  >("feature");
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [lastFeedbackMailto, setLastFeedbackMailto] = useState("");

  // Logout confirmation state
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyLinkedin = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    const categoryLabels: Record<string, string> = {
      feature: "✨ Feature Request",
      bug: "🐛 Bug Report",
      pandal: "🪷 Pandal Suggestion",
      safety: "🛡️ Safety Concern",
      general: "💬 General Feedback",
    };
    const catLabel = categoryLabels[feedbackCategory] || feedbackCategory;
    const senderName = publicProfile?.displayName || uiProfile?.name || "IshqYara User";
    const senderEmail = user?.email || "Not specified";

    const subject = `[IshqYara Feedback] ${catLabel} (${feedbackRating}/5 ★)`;
    const bodyText = [
      `Hi Team IshqYara,`,
      ``,
      `Category: ${catLabel}`,
      `Rating: ${feedbackRating} / 5 Stars`,
      `User: ${senderName} (${senderEmail})`,
      `Date: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}`,
      ``,
      `--- My Feedback / Issue ---`,
      feedbackText.trim(),
      ``,
      `---------------------------`,
      `Sent from IshqYara Web App (Soft launch v1.0.0)`,
    ].join("\n");

    const mailtoUrl = `mailto:ishqyaraofficial@gmail.com?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyText)}`;

    setLastFeedbackMailto(mailtoUrl);
    setFeedbackSubmitted(true);

    try {
      window.location.href = mailtoUrl;
    } catch (err) {
      console.warn("Mail client open error:", err);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      onClose();
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : "Could not sign out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      id: "userInfo" as SettingsOption,
      label: "User Info",
      description: "Profile summary and account details",
      icon: User,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      id: "about" as SettingsOption,
      label: "About IshqYara",
      description: "Beyond the swipe, where dil finds its vibe",
      icon: Sparkles,
      color: "bg-rose-50 text-[#9e1b22] border-rose-200",
    },
    {
      id: "install" as SettingsOption,
      label: "How to Install",
      description: "Add IshqYara to your home screen",
      icon: Download,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "support" as SettingsOption,
      label: "Support and Feedback",
      description: "Share feedback and view safety information",
      icon: MessageSquare,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      id: "privacy" as SettingsOption,
      label: "Privacy Policy",
      description: "How profile and account data are handled",
      icon: Shield,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      id: "terms" as SettingsOption,
      label: "Terms of Service",
      description: "Community guidelines, rules, and eligibility",
      icon: FileText,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
    {
      id: "developers" as SettingsOption,
      label: "About Developers",
      description: "LinkedIn profiles of developers",
      icon: LinkedinIcon,
      color: "bg-indigo-50 text-[#0a66c2] border-indigo-200",
    },
    {
      id: "logout" as SettingsOption,
      label: "Logout",
      description: "Sign out securely from your IshqYara account",
      icon: LogOut,
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setCurrentView("menu");
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-xl bg-[#faf7f2] border border-[#e7dfd5] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#e7dfd5] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {currentView !== "menu" ? (
              <button
                onClick={() => setCurrentView("menu")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 hover:text-[#9e1b22] hover:bg-stone-100 transition-colors mr-1 cursor-pointer shrink-0"
                aria-label="Back to Settings"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Settings</span>
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#fbebee] text-[#9e1b22] flex items-center justify-center border border-[#9e1b22]/20 shrink-0">
                <SettingsIcon className="w-4 h-4 animate-[spin_10s_linear_infinite]" />
              </div>
            )}

            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2 truncate">
                <span className="truncate">
                  {currentView === "menu" && "Settings"}
                  {currentView === "userInfo" && "User Info"}
                  {currentView === "about" && "About IshqYara"}
                  {currentView === "install" && "How to Install"}
                  {currentView === "support" && "Support & Feedback"}
                  {currentView === "privacy" && "Privacy Policy"}
                  {currentView === "terms" && "Terms of Service"}
                  {currentView === "developers" && "About Developers"}
                  {currentView === "logout" && "Logout"}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a] shrink-0">
                  Soft Launch v1.0.0
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentView("menu");
              onClose();
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 pb-8 sm:pb-5 bg-[#faf7f2]">
          {/* ======================================================== */}
          {/* MAIN SETTINGS MENU LIST (Shown by default) */}
          {/* ======================================================== */}
          {currentView === "menu" && (
            <div className="space-y-2.5 animate-in fade-in duration-150">
              <p className="text-xs text-stone-500 font-medium px-1 mb-2">
                Select an option to view details:
              </p>

              {menuItems.map((item) => {
                const Icon = item.icon;
                const isLogout = item.id === "logout";
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                      isLogout
                        ? "bg-white hover:bg-rose-50/70 border-stone-200/90 hover:border-rose-200 text-stone-900"
                        : "bg-white hover:bg-[#fbebee]/40 border-stone-200/90 hover:border-[#9e1b22]/30 text-stone-900 shadow-xs hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.color} group-hover:scale-105 transition-transform`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div
                          className={`text-sm font-bold truncate ${
                            isLogout
                              ? "text-rose-700 group-hover:text-rose-800"
                              : "text-stone-900 group-hover:text-[#9e1b22]"
                          }`}
                        >
                          {item.label}
                        </div>
                        <p className="text-xs text-stone-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-5 h-5 shrink-0 text-stone-400 group-hover:translate-x-1 transition-transform ${
                        isLogout
                          ? "group-hover:text-rose-600"
                          : "group-hover:text-[#9e1b22]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* ======================================================== */}
          {/* 1. USER INFO PAGE */}
          {/* ======================================================== */}
          {currentView === "userInfo" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Profile Card Summary */}
              <div className="bg-white rounded-2xl p-5 border border-[#e7dfd5] shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src={uiProfile?.image || ""}
                    alt={uiProfile?.name || "Your profile"}
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#9e1b22]/30 shadow-md"
                  />
                  <span
                    title="Verified Sharodiya Companion"
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-xs"
                  >
                    ✓
                  </span>
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">
                        {uiProfile?.name || "Your profile"}{uiProfile?.age ? `, ${uiProfile.age}` : ""}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">
                        {publicProfile?.tagline || "Complete your profile to add a tagline."}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-200 self-center sm:self-auto">
                      {user?.app_metadata?.provider === "google" ? "Google sign-in" : "Signed in"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start text-xs text-stone-600">
                    <span className="flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg">
                      <MapPin className="w-3 h-3 text-[#9e1b22]" />
                      {uiProfile?.area || "Area not added"}
                    </span>
                    <span className="flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-lg">
                      <GraduationCap className="w-3 h-3 text-[#ea580c]" />
                      {uiProfile?.college || "College not added"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e7dfd5] shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Account Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                    <label className="text-[11px] font-bold text-stone-500 block mb-0.5">
                      Registered Email
                    </label>
                    <div className="flex items-center gap-2 text-stone-800 text-xs font-semibold truncate">
                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{user?.email || "Email unavailable"}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                    <label className="text-[11px] font-bold text-stone-500 block mb-0.5">
                      Pandal Hopping Zone
                    </label>
                    <div className="flex items-center gap-2 text-stone-800 text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{uiProfile?.area || "Area not added"}</span>
                    </div>
                  </div>

                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
                  <p className="text-xs text-stone-500">
                    Update prompts, photos, or pandal preferences on your full profile.
                  </p>
                  <Link
                    href="/profile"
                    onClick={() => {
                      setCurrentView("menu");
                      onClose();
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#9e1b22] hover:bg-[#83161c] transition-all shadow-xs"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Go to Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ABOUT ISHQYARA PAGE                                     */}
          {/* ======================================================== */}
          {currentView === "about" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header Hero Banner */}
              <div className="bg-gradient-to-br from-[#9e1b22] to-[#c22830] rounded-3xl p-6 text-white shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-md border-2 border-white/40 shrink-0 bg-stone-900">
                    <img
                      src="/logo.png"
                      alt="IshqYara Logo"
                      className="w-full h-full object-cover block"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight leading-none mb-1.5">
                      IshqYara
                    </h3>
                    <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 tracking-wide">
                      Soft Launch v1.0.0
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-100 leading-relaxed font-normal pt-1">
                  Beyond the swipe, where dil finds it&apos;s vibe.
                </p>
              </div>

              {/* 1. A LITTLE ABOUT US */}
              <div className="bg-white rounded-2xl p-5 border border-[#e7dfd5] shadow-xs space-y-4 text-xs text-stone-700">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#9e1b22]" />
                    <span>A little about us</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#9e1b22] border border-red-200">
                    Our Story
                  </span>
                </div>

                <p className="text-xs text-stone-700 leading-relaxed font-normal">
                  IshqYara is more than just an app for us, it&apos;s our first step into building something meaningful and sharing it with real people.
                </p>
                <p className="text-xs text-stone-700 leading-relaxed font-normal">
                  This is our first experience creating an app of this kind and learning from a real user community. We&apos;re excited to have you here as part of our journey.
                </p>

                {/* Currently celebrating Puja season */}
                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/80 space-y-1">
                  <div className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                    <span>Currently celebrating the Puja season 🪔</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    IshqYara is temporarily dressed in a special Puja theme to celebrate the festive spirit. Once Puja ends, we&apos;ll switch back to our regular theme, while continuing to bring you new improvements and experiences.
                  </p>
                </div>

                {/* Learning and growing with you */}
                <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/80 space-y-2">
                  <div className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                    <span>We&apos;re learning and growing with you 💗</span>
                  </div>
                  <p className="text-[11px] text-stone-700 leading-relaxed">
                    As this is our first launch, some features may not work perfectly, and certain parts of the experience may still need improvement. We&apos;re sorry for any inconvenience and truly appreciate your patience, feedback, and support.
                  </p>
                  <p className="text-[11px] text-stone-700 leading-relaxed">
                    Every bit of feedback helps us make IshqYara better. We&apos;ll keep fixing issues, improving existing features, and working toward a smoother, more enjoyable experience for everyone.
                  </p>
                </div>

                {/* Sign-off */}
                <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="font-semibold text-stone-700">
                    Thank you for being part of our beginning. ❤️
                  </span>
                  <span className="font-black text-[#9e1b22]">
                    — Team IshqYara
                  </span>
                </div>
              </div>

              {/* CONTACT & SUPPORT (REDIRECT TO MAIL) */}
              <div className="bg-white rounded-2xl p-5 border border-[#e7dfd5] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#9e1b22]" />
                    <span>Contact &amp; Support</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Mail Us
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Have feedback, questions, or need help? Reach out directly via email. We read every response and work actively to support you.
                </p>

                <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <a
                    href="mailto:ishqyaraofficial@gmail.com?subject=IshqYara%20Support%20%26%20Feedback"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#9e1b22] to-[#c22830] hover:from-[#83161c] hover:to-[#9e1b22] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email: ishqyaraofficial@gmail.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyLinkedin("ishqyaraofficial@gmail.com", "support-email")}
                    className="px-3.5 py-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy email address"
                  >
                    {copiedId === "support-email" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* FOLLOW US ON INSTAGRAM */}
              <div className="bg-white rounded-2xl p-5 border border-[#e7dfd5] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <InstagramIcon className="w-4 h-4 text-[#dc2743]" />
                    <span>Follow us on Instagram</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-50 to-amber-50 text-rose-700 border border-rose-200">
                    @ishqyaraofficial
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Follow IshqYara on Instagram for updates and announcements!
                </p>

                <div className="pt-1">
                  <a
                    href="https://www.instagram.com/ishqyaraofficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-white text-xs font-bold transition-all shadow-sm active:scale-95 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:brightness-105"
                  >
                    <InstagramIcon className="w-4 h-4" />
                    <span>Follow @ishqyaraofficial on Instagram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* HOW TO INSTALL PAGE                                     */}
          {/* ======================================================== */}
          {currentView === "install" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Platform Switcher Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-stone-100/90 rounded-2xl border border-stone-200/80">
                <button
                  type="button"
                  onClick={() => setInstallPlatform("android")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    installPlatform === "android"
                      ? "bg-white text-stone-900 shadow-sm border border-stone-200/60"
                      : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Android</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInstallPlatform("ios")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    installPlatform === "ios"
                      ? "bg-white text-stone-900 shadow-sm border border-stone-200/60"
                      : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
                  }`}
                >
                  <span className="text-xs">🍎</span>
                  <span>iOS (iPhone)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInstallPlatform("desktop")}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    installPlatform === "desktop"
                      ? "bg-white text-stone-900 shadow-sm border border-stone-200/60"
                      : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Desktop</span>
                </button>
              </div>

              {/* ANDROID TAB */}
              {installPlatform === "android" && (
                <div className="bg-white rounded-2xl p-5 border border-[#e7dfd5] shadow-xs space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      <span className="text-base">🤖</span>
                      <span>How to install on Android</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Google Chrome
                    </span>
                  </div>

                  {/* Android Install Guide Image */}
                  <div className="rounded-2xl overflow-hidden border border-stone-200 bg-slate-50 shadow-xs">
                    <img
                      src="/install-guide-android.svg"
                      alt="How to install IshqYara on Android Chrome step-by-step visual preview"
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  {/* 5 Ordered Steps */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#9e1b22] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span className="text-stone-800">
                        Open <strong>ishqyara.social</strong> in <strong>Google Chrome</strong>.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#9e1b22] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span className="text-stone-800">
                        Tap the <strong>three-dot menu (⋮)</strong> in the top-right corner.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#9e1b22] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span className="text-stone-800">
                        Select <strong>Install app</strong> (or <em>Add to Home screen</em>).
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#9e1b22] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        4
                      </span>
                      <span className="text-stone-800">
                        Tap <strong>Install</strong> to confirm.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        5
                      </span>
                      <span className="text-stone-800">
                        Wait for the installation confirmation and find the <strong>IshqYara icon</strong> on your home screen.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* IOS (IPHONE/IPAD) TAB */}
              {installPlatform === "ios" && (
                <div className="bg-white rounded-2xl p-5 border border-[#e7dfd5] shadow-xs space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      <span className="text-base">🍎</span>
                      <span>How to install on iOS (iPhone / iPad)</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Apple Safari
                    </span>
                  </div>

                  {/* iOS Install Guide Image */}
                  <div className="rounded-2xl overflow-hidden border border-stone-200 bg-slate-50 shadow-xs">
                    <img
                      src="/install-guide-ios.svg"
                      alt="How to install IshqYara on iPhone Safari step-by-step visual preview"
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  {/* 5 Ordered Steps */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span className="text-stone-800">
                        Open <strong>ishqyara.social</strong> in <strong>Safari</strong>.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span className="text-stone-800">
                        Tap the <strong>Share button</strong> (the box with an upward pointing arrow at the bottom).
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span className="text-stone-800">
                        Scroll down and select <strong>Add to Home Screen</strong>.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#007aff] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        4
                      </span>
                      <span className="text-stone-800">
                        Tap <strong>Add</strong> in the top-right corner.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        5
                      </span>
                      <span className="text-stone-800">
                        Find the <strong>IshqYara icon</strong> on your Home Screen.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* DESKTOP (PC/MAC) TAB */}
              {installPlatform === "desktop" && (
                <div className="bg-white rounded-2xl p-5 border border-[#e7dfd5] shadow-xs space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                      <span className="text-base">💻</span>
                      <span>How to install on Desktop (PC &amp; Mac)</span>
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      Chrome / Edge / Brave
                    </span>
                  </div>

                  {/* Desktop Install Guide Image */}
                  <div className="rounded-2xl overflow-hidden border border-stone-200 bg-slate-50 shadow-xs">
                    <img
                      src="/install-guide-desktop.svg"
                      alt="How to install IshqYara on Desktop Chrome or Edge step-by-step visual preview"
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  {/* 4 Ordered Steps */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span className="text-stone-800">
                        Open <strong>ishqyara.social</strong> in <strong>Google Chrome</strong>, <strong>Microsoft Edge</strong>, or <strong>Brave</strong>.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span className="text-stone-800">
                        Click the <strong>Install icon</strong> (🖥️ or ⊕) on the right side of the address bar. <em>(Or click browser menu ⋮ &gt; &quot;Install IshqYara&quot;)</em>.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span className="text-stone-800">
                        Click <strong>Install</strong> in the popup prompt.
                      </span>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        4
                      </span>
                      <span className="text-stone-800">
                        Launch and enjoy <strong>IshqYara</strong> directly as a standalone app from your Desktop, Taskbar, or App Launcher.
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. SUPPORT AND FEEDBACK PAGE */}
          {/* ======================================================== */}
          {currentView === "support" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-5 border border-[#e7dfd5] shadow-xs">
                <div className="flex items-center gap-2 text-[#9e1b22] mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className="text-base font-bold text-stone-900">
                    Share Your Feedback
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mb-4">
                  Help us make IshqYara smoother and more joyful for everyone!
                </p>

                {feedbackSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-emerald-950">
                        Opening Your Email App...
                      </h4>
                      <p className="text-xs text-emerald-800 max-w-sm mx-auto leading-relaxed">
                        Your message has been formatted and directed to <strong className="font-bold underline">ishqyaraofficial@gmail.com</strong>. Click Send in your mail client to deliver it to us!
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                      <a
                        href={lastFeedbackMailto}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9e1b22] to-[#c22830] hover:from-[#83161c] hover:to-[#9e1b22] text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Open Email App</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackSubmitted(false);
                          setFeedbackText("");
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-emerald-300 text-emerald-900 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Write Another Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-3.5">
                    {/* Category Selection */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1.5">
                        Category
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: "feature", label: "✨ New Feature" },
                          { id: "bug", label: "🐛 Bug Report" },
                          { id: "safety", label: "🛡️ Safety" },
                          { id: "general", label: "💬 General" },
                        ].map((cat) => (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setFeedbackCategory(cat.id as "feature" | "bug" | "pandal" | "safety" | "general")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              feedbackCategory === cat.id
                                ? "bg-[#9e1b22] text-white shadow-xs"
                                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Rate Experience
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= feedbackRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-stone-300"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs text-stone-500 ml-2 font-medium">
                          {feedbackRating}/5 stars
                        </span>
                      </div>
                    </div>

                    {/* Textarea */}
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Your Message
                      </label>
                      <textarea
                        rows={3}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Tell us what you like or what we can improve..."
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#9e1b22] bg-stone-50/50 resize-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#9e1b22] hover:bg-[#83161c] shadow-xs transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Feedback</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Direct Email Support Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#e7dfd5] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#9e1b22]" />
                    <span>Direct Email Support</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#9e1b22] border border-red-200">
                    Official Support
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  Have feedback, questions, or need help? Reach out directly via email. We read every response and work actively to support you.
                </p>

                <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <a
                    href="mailto:ishqyaraofficial@gmail.com?subject=IshqYara%20Support%20%26%20Feedback"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9e1b22] to-[#c22830] hover:from-[#83161c] hover:to-[#9e1b22] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email: ishqyaraofficial@gmail.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyLinkedin("ishqyaraofficial@gmail.com", "support-email-supporttab")}
                    className="px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Copy email address"
                  >
                    {copiedId === "support-email-supporttab" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Helplines */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-[#92400e] font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Kolkata Festival & Emergency Helplines</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200/60">
                    <span className="text-stone-500 block text-[10px]">Police Puja Helpline</span>
                    <span className="font-bold text-stone-900">1090 / 112</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-amber-200/60">
                    <span className="text-stone-500 block text-[10px]">Women&apos;s Safety</span>
                    <span className="font-bold text-stone-900">1091</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. PRIVACY POLICY PAGE */}
          {/* ======================================================== */}
          {currentView === "privacy" && (
            <div className="space-y-3.5 text-stone-800 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-5 border border-[#e7dfd5] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#9e1b22]" />
                    Sharodiya Community Privacy Guidelines
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Overview
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-stone-600 leading-relaxed">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <h4 className="font-bold text-stone-900 mb-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9e1b22]" />
                      1. Location Information
                    </h4>
                    <p>
                      The profile asks for a broad area. Do not enter an exact address or live location.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <h4 className="font-bold text-stone-900 mb-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c]" />
                      2. College Information
                    </h4>
                    <p>
                      College names are user-provided and are not verified by this app. Google sign-in confirms an account, not student status.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <h4 className="font-bold text-stone-900 mb-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
                      3. Messages
                    </h4>
                    <p>
                      Messages are available to conversation participants under database access policies. They are not end-to-end encrypted. You can block a profile in discovery.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <h4 className="font-bold text-stone-900 mb-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      4. Data Privacy & Account Deletion
                    </h4>
                    <p>
                      Profile and conversation data are stored in the configured Supabase project. Account deletion requires the server-side secret configuration and removes associated account data when completed.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e1b22] hover:underline"
                  >
                    <span>Read full public Privacy Policy page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TERMS OF SERVICE PAGE */}
          {/* ======================================================== */}
          {currentView === "terms" && (
            <div className="space-y-3.5 text-stone-800 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl p-5 border border-[#e7dfd5] shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                  <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-700" />
                    Community Terms & Guidelines
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Rules
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-stone-600 leading-relaxed">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <h4 className="font-bold text-stone-900 mb-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#9e1b22]" />
                      1. Age Requirement (18+)
                    </h4>
                    <p>
                      IshqYara is strictly for individuals aged 18 and older. Anyone under 18 is not permitted to register or use this platform.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <h4 className="font-bold text-stone-900 mb-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      2. Code of Conduct & Respect
                    </h4>
                    <p>
                      Harassment, offensive behavior, hate speech, spam, and non-consensual content are strictly prohibited and will lead to an immediate ban.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <h4 className="font-bold text-stone-900 mb-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      3. Authentic Profiles & Photos
                    </h4>
                    <p>
                      Users must upload authentic photos representing their true identity. Impersonation of other people or entities is forbidden.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                    <h4 className="font-bold text-stone-900 mb-0.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      4. In-Person Safety
                    </h4>
                    <p>
                      IshqYara facilitates connections for festivities. When meeting new buddies, always meet in public places and prioritize your safety.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/terms"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:underline"
                  >
                    <span>Read full public Terms of Service page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. ABOUT DEVELOPERS PAGE (4 DEVELOPERS LINKEDIN IDS ONLY) */}
          {/* ======================================================== */}
          {currentView === "developers" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <p className="text-xs text-stone-500 font-medium px-1">
                Connect directly with the 4 developers on LinkedIn:
              </p>

              <div className="grid grid-cols-1 gap-3">
                {DEVELOPERS.map((dev) => {
                  const isCopied = copiedId === dev.linkedinId;
                  return (
                    <div
                      key={dev.linkedinId}
                      className="bg-white rounded-2xl p-4 border border-[#e7dfd5] shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={dev.avatar}
                            alt={dev.name}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-100"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0a66c2] text-white rounded-full flex items-center justify-center">
                            <LinkedinIcon className="w-2.5 h-2.5 fill-white" />
                          </div>
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-stone-900 truncate">
                            {dev.name}
                          </h4>
                          <p className="text-xs text-stone-500 truncate">
                            {dev.role}
                          </p>
                          <div className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-[#0a66c2]">
                            <span>@{dev.linkedinId}</span>
                          </div>
                        </div>
                      </div>

                      {/* LinkedIn Action Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <a
                          href={dev.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#004182] transition-colors shadow-xs"
                        >
                          <LinkedinIcon className="w-3.5 h-3.5 fill-white" />
                          <span>LinkedIn</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          onClick={() => handleCopyLinkedin(dev.linkedinUrl, dev.linkedinId)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer border border-stone-200"
                          title="Copy LinkedIn Link"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold text-[11px]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-stone-500" />
                              <span className="text-[11px]">Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. LOGOUT PAGE */}
          {/* ======================================================== */}
          {currentView === "logout" && (
            <div className="animate-in fade-in duration-200 py-3">
              <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-xs text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-200">
                  <LogOut className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-stone-900">
                    Log Out of Puja Partner?
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                    You will need to sign in again to access your profile, matches, and chats.
                  </p>
                </div>

                {isLoggingOut ? (
                  <div className="p-4 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold animate-pulse">
                    Signing you out…
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setCurrentView("menu")}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleConfirmLogout}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
                    >
                      Yes, Log Out
                    </button>
                  </div>
                )}
                {logoutError && <p role="alert" className="text-xs text-rose-700">{logoutError}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-[#e7dfd5] bg-stone-50 flex items-center justify-between text-[11px] text-stone-500">
          <span className="flex items-center gap-1 font-medium">
            <span>IshqYara - Soft Launch</span>
            <span className="text-[#9e1b22] font-bold">• v1.0.0</span>
          </span>
          {currentView !== "menu" ? (
            <button
              onClick={() => setCurrentView("menu")}
              className="font-bold text-[#9e1b22] hover:underline cursor-pointer"
            >
              Back to Options
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentView("menu");
                onClose();
              }}
              className="font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
