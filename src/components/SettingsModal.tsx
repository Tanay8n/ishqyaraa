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
  Send,
  Star,
  MapPin,
  GraduationCap,
  Mail,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useAppUser } from "@/components/AppUserContext";

export type SettingsOption =
  | "menu"
  | "userInfo"
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

interface DeveloperItem {
  name: string;
  role: string;
  linkedinId: string;
  linkedinUrl: string;
  avatar: string;
}

const DEVELOPERS: DeveloperItem[] = [
  {
    name: "Tanay Mukherjee",
    role: "Lead Full-Stack Developer",
    linkedinId: "tanay8n",
    linkedinUrl: "https://www.linkedin.com/in/tanay8n",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Saptarshi Roy",
    role: "Frontend & UI/UX Engineer",
    linkedinId: "saptarshi-roy-dev",
    linkedinUrl: "https://www.linkedin.com/in/saptarshi-roy-dev",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Aniket Das",
    role: "Backend & Cloud Architect",
    linkedinId: "aniket-das-cloud",
    linkedinUrl: "https://www.linkedin.com/in/aniket-das-cloud",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Debalina Sen",
    role: "Product Designer & Community",
    linkedinId: "debalina-sen-design",
    linkedinUrl: "https://www.linkedin.com/in/debalina-sen-design",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
];

export function SettingsModal({
  isOpen,
  onClose,
  initialOption = "menu",
}: SettingsModalProps) {
  const { uiProfile, publicProfile, user, logout } = useAppUser();
  const [currentView, setCurrentView] = useState<SettingsOption>(initialOption);

  // Copy state for developers' LinkedIn IDs
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Support & Feedback state
  const [feedbackCategory, setFeedbackCategory] = useState<
    "feature" | "bug" | "pandal" | "safety" | "general"
  >("feature");
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

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
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackText("");
    }, 3200);
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
      label: "About Developers (developers linkdin id)",
      description: "LinkedIn profiles of the 4 platform creators",
      icon: LinkedinIcon,
      color: "bg-indigo-50 text-[#0a66c2] border-indigo-200",
    },
    {
      id: "logout" as SettingsOption,
      label: "Logout",
      description: "Sign out securely from Puja Partner",
      icon: LogOut,
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setCurrentView("menu");
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-xl bg-[#faf7f2] border border-[#e7dfd5] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-[#e7dfd5] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {currentView !== "menu" ? (
              <button
                onClick={() => setCurrentView("menu")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 hover:text-[#9e1b22] hover:bg-stone-100 transition-colors mr-1 cursor-pointer"
                aria-label="Back to Settings"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Settings</span>
              </button>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[#fbebee] text-[#9e1b22] flex items-center justify-center border border-[#9e1b22]/20">
                <SettingsIcon className="w-4 h-4 animate-[spin_10s_linear_infinite]" />
              </div>
            )}

            <div>
              <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
                {currentView === "menu" && "Settings"}
                {currentView === "userInfo" && "User Info"}
                {currentView === "support" && "Support and Feedback"}
                {currentView === "privacy" && "Privacy Policy"}
                {currentView === "terms" && "Terms of Service"}
                {currentView === "developers" && "About Developers"}
                {currentView === "logout" && "Logout"}
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
                  শারদীয়া
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#faf7f2]">
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
                  Help us make Sharodiya pandal hopping smoother and more joyful for everyone!
                </p>

                {feedbackSubmitted ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-xl">
                      🪷
                    </div>
                    <h4 className="text-base font-bold text-emerald-900">
                      Feedback was not sent
                    </h4>
                    <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                      Feedback delivery is not configured in this app. Your message stayed in this page and was not submitted.
                    </p>
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
                          { id: "pandal", label: "🪷 Pandal Routes" },
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
            <span>Puja Partner</span>
            <span className="text-[#9e1b22] font-bold">• Sharodiya 2026</span>
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
