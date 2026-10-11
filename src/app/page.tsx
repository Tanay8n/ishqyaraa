"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Heart,
  X,
  Sparkles,
  MapPin,
  GraduationCap,
  Flame,
  CheckCircle2,
  RotateCcw,
  ChevronRight,
  Info,
  MessageCircle,
  SlidersHorizontal,
  Bell,
  MoreVertical,
  ShieldAlert,
  Send,
  MessageSquareQuote,
  Camera,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { type Profile } from "@/lib/data";
import { useAppUser } from "@/components/AppUserContext";
import { authAvatarUrl } from "@/lib/supabase/user";
import { loadDiscoveryDeck, loadPublicProfile } from "@/lib/discovery";
import { blockUser, likeUser, passUser, recordReport, rewindLastAction } from "@/lib/interactions";
import { SelfieVerificationModal } from "@/components/SelfieVerificationModal";

type DragOffset = {
  x: number;
  y: number;
};

const KOLKATA_ZONES = [
  { id: "all", label: "All Kolkata" },
  { id: "North Kolkata", label: "North Kolkata 🏛️" },
  { id: "South Kolkata", label: "South Kolkata 🪷" },
  { id: "Central Kolkata", label: "Central Kolkata 🚋" },
  { id: "Salt Lake", label: "Salt Lake & New Town 🏙️" },
  { id: "Behala", label: "Behala & South West 🥁" },
  { id: "Howrah", label: "Howrah & Beyond 🌉" },
];

const INTENT_OPTIONS = [
  { id: "all", label: "All Intentions" },
  { id: "Dating", label: "Dating ❤️" },
  { id: "Puja Buddy", label: "Puja Buddy 🪷" },
  { id: "Friendship", label: "Friendship 🤝" },
  { id: "Food Buddy", label: "Food Buddy 🍲" },
  { id: "Photography Buddy", label: "Photography Buddy 📸" },
];

const QUICK_ICEBREAKERS = [
  "Which pandal is number 1 on your Puja bucket list? 🪷",
  "Phuchka & cha date at Maddox Square? ☕",
  "Are you team North Kolkata heritage or South theme pandals? 🥁",
  "Your Puja bio is awesome, let's explore together! 🌟",
  "Midnight roll at Park Street after pandal hopping? 🌯",
];

const REPORT_REASONS = [
  "Fake Profile / Impersonation",
  "Inappropriate Photos / Bio",
  "Harassment or Rude Behavior",
  "Underage (Below 18)",
  "Commercial Account / Spam",
  "Other Safety Concern",
];

export default function PartnerFinderPage() {
  const { user, publicProfile, uiProfile, refreshProfile } = useAppUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingAction, setIsSavingAction] = useState(false);
  const actionLockRef = useRef(false);

  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showFullProfileModal, setShowFullProfileModal] = useState(false);

  // Filters State
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedIntent, setSelectedIntent] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Like with Note / Comment Modal (Hinge style)
  const [noteModalProfile, setNoteModalProfile] = useState<Profile | null>(null);
  const [noteContext, setNoteContext] = useState<string>("");
  const [noteText, setNoteText] = useState<string>("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Web Push Notifications
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default"
  );

  // Selfie Verification
  const [showSelfieModal, setShowSelfieModal] = useState(false);

  // Safety Menu & Actions
  const [showSafetyMenu, setShowSafetyMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReasonCategory, setReportReasonCategory] = useState(REPORT_REASONS[0]);
  const [reportCustomDetail, setReportCustomDetail] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);

  const startPosRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef<DragOffset>({ x: 0, y: 0 });
  const isPointerDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const swipeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (!user || !publicProfile?.profileComplete) return;
    let cancelled = false;
    loadDiscoveryDeck(publicProfile)
      .then((deck) => {
        if (!cancelled) setProfiles(deck);
      })
      .catch((error) => {
        if (!cancelled)
          setProfileError(error instanceof Error ? error.message : "Could not load discovery profiles.");
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProfiles(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, publicProfile]);

  // Body Scroll Lock for Modals
  useEffect(() => {
    const hasOpenModal =
      showFullProfileModal ||
      showFiltersModal ||
      Boolean(noteModalProfile) ||
      showReportModal ||
      showBlockModal ||
      showSelfieModal;

    if (!hasOpenModal) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [
    showFullProfileModal,
    showFiltersModal,
    noteModalProfile,
    showReportModal,
    showBlockModal,
    showSelfieModal,
  ]);

  useEffect(() => {
    return () => {
      if (swipeTimeoutRef.current) clearTimeout(swipeTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 2400);
  }, []);

  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#9e1b22", "#ea580c", "#d97706", "#f59e0b", "#ec4899"],
      });
    } catch {
      // Ignore confetti errors
    }
  }, []);

  // Filter computation
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      if (selectedZone !== "all") {
        const zoneStr = `${p.pujaPreferences?.favoritePandalZone || ""} ${p.area || ""}`.toLowerCase();
        if (!zoneStr.includes(selectedZone.toLowerCase())) return false;
      }
      if (selectedIntent !== "all") {
        if (p.intention !== selectedIntent) return false;
      }
      if (selectedGender !== "all" && selectedGender !== "Everyone") {
        const profileGender = (p as any).gender || (p.pujaPreferences as any)?.gender;
        if (profileGender) {
          if (selectedGender === "Men" && profileGender !== "Man") return false;
          if (selectedGender === "Women" && profileGender !== "Woman") return false;
        }
      }
      return true;
    });
  }, [profiles, selectedZone, selectedIntent, selectedGender]);

  const activeFilterCount =
    (selectedZone !== "all" ? 1 : 0) +
    (selectedIntent !== "all" ? 1 : 0) +
    (selectedGender !== "all" && selectedGender !== "Everyone" ? 1 : 0);

  // Reset deck on filter change
  useEffect(() => {
    setDeckIndex(0);
    setPhotoIndex(0);
  }, [selectedZone, selectedIntent, selectedGender]);

  const currentProfile: Profile | null = filteredProfiles[deckIndex] ?? null;
  const nextProfile: Profile | null =
    filteredProfiles.length > deckIndex + 1 ? filteredProfiles[deckIndex + 1] ?? null : null;
  const thirdProfile: Profile | null =
    filteredProfiles.length > deckIndex + 2 ? filteredProfiles[deckIndex + 2] ?? null : null;

  const getProfilePhotos = useCallback((p: Profile): string[] => {
    const profileWithPhotos = p as Profile & { photos?: string[] };
    if (profileWithPhotos.photos && profileWithPhotos.photos.length > 0) {
      return profileWithPhotos.photos;
    }
    return [p.image];
  }, []);

  const currentPhotos: string[] = currentProfile ? getProfilePhotos(currentProfile) : [];

  // Request Web Push Notification Permission
  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Notifications are not supported in this browser.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        showToast("Push notifications active! 🔔");
        try {
          new Notification("IshqYara Notifications Active 🪷", {
            body: "You'll be alerted as soon as you get a match or message during Puja!",
            icon: "/favicon.ico",
          });
        } catch {}
      } else {
        showToast("Notification permission was dismissed.");
      }
    } catch {
      showToast("Could not request notification permission.");
    }
  };

  const handleLike = useCallback(
    async (profile: Profile) => {
      if (!user || actionLockRef.current) return;
      if (!uiProfile?.verified) {
        setShowSelfieModal(true);
        showToast("Selfie verification required! Please verify to send likes 🪷");
        return;
      }
      actionLockRef.current = true;
      setIsSavingAction(true);
      try {
        const result = await likeUser(profile.id);
        setProfiles((current) => current.filter((candidate) => candidate.id !== profile.id));
        setDeckIndex(0);
        setPhotoIndex(0);
        setShowSafetyMenu(false);
        if (result.matched) {
          triggerConfetti();
          setMatchedProfile(profile);
          if (
            typeof window !== "undefined" &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(`It's a Match with ${profile.name}! 🪷`, {
                body: `${profile.name} is looking for a ${profile.intention}. Say hi before Puja starts!`,
                icon: profile.image || "/favicon.ico",
              });
            } catch {}
          }
        } else {
          showToast(result.already ? "You already liked this profile." : "Like saved.");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Could not save your like.");
      } finally {
        actionLockRef.current = false;
        setIsSavingAction(false);
      }
    },
    [user, uiProfile?.verified, showToast, triggerConfetti]
  );

  const handlePass = useCallback(
    async (profile: Profile) => {
      if (!user || actionLockRef.current) return;
      actionLockRef.current = true;
      setIsSavingAction(true);
      try {
        await passUser(profile.id);
        setProfiles((current) => current.filter((candidate) => candidate.id !== profile.id));
        setDeckIndex(0);
        setPhotoIndex(0);
        setShowSafetyMenu(false);
        showToast(`Passed on ${profile.name}`);
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Could not save your pass.");
      } finally {
        actionLockRef.current = false;
        setIsSavingAction(false);
      }
    },
    [user, showToast]
  );

  const handleRewind = useCallback(async () => {
    if (!user || actionLockRef.current) return;
    actionLockRef.current = true;
    try {
      const result = await rewindLastAction();
      if (result.blockedBecauseMatch) {
        showToast("You matched with them; that like cannot be rewound.");
      } else if (result.restoredUid) {
        const profile = await loadPublicProfile(result.restoredUid, publicProfile);
        if (profile) {
          setProfiles((current) => [profile, ...current.filter((item) => item.id !== profile.id)]);
          setDeckIndex(0);
          showToast("Last action rewound.");
        }
      } else showToast("There is no action to rewind yet.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not rewind your last action.");
    } finally {
      actionLockRef.current = false;
    }
  }, [user, publicProfile, showToast]);

  const triggerSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!currentProfile || isAnimatingRef.current) return;
      if (direction === "right" && !uiProfile?.verified) {
        setShowSelfieModal(true);
        showToast("Selfie verification required! Please verify to send likes 🪷");
        setDragOffset({ x: 0, y: 0 });
        dragOffsetRef.current = { x: 0, y: 0 };
        return;
      }
      isAnimatingRef.current = true;
      setExitDirection(direction);
      setShowSafetyMenu(false);

      swipeTimeoutRef.current = setTimeout(() => {
        if (direction === "right") {
          void handleLike(currentProfile);
        } else {
          void handlePass(currentProfile);
        }
        setExitDirection(null);
        setDragOffset({ x: 0, y: 0 });
        dragOffsetRef.current = { x: 0, y: 0 };
        isAnimatingRef.current = false;
        swipeTimeoutRef.current = null;
      }, 300);
    },
    [currentProfile, handleLike, handlePass, uiProfile?.verified, showToast]
  );

  // Submit Note with Like
  const handleSendNoteAndLike = async () => {
    if (!noteModalProfile || !user || isSubmittingNote) return;
    if (!uiProfile?.verified) {
      setShowSelfieModal(true);
      showToast("Selfie verification required! Please verify to send notes & likes 🪷");
      return;
    }
    setIsSubmittingNote(true);
    try {
      const target = noteModalProfile;
      const result = await likeUser(target.id);
      setProfiles((current) => current.filter((candidate) => candidate.id !== target.id));
      setDeckIndex(0);
      setPhotoIndex(0);
      setNoteModalProfile(null);
      setNoteText("");
      setNoteContext("");

      if (result.matched) {
        triggerConfetti();
        setMatchedProfile(target);
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification(`It's a Match with ${target.name}! 🪷`, {
              body: `You connected with ${target.name}!`,
              icon: target.image || "/favicon.ico",
            });
          } catch {}
        }
      } else {
        showToast(`Note & Like sent to ${target.name}! 🪷`);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not send like with note.");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Submit Report
  const handleConfirmReport = async () => {
    if (!currentProfile || !user || isSubmittingReport) return;
    setIsSubmittingReport(true);
    try {
      const fullReason = `${reportReasonCategory}${
        reportCustomDetail.trim() ? `: ${reportCustomDetail.trim()}` : ""
      }`;
      await recordReport(currentProfile.id, fullReason);
      setProfiles((current) => current.filter((candidate) => candidate.id !== currentProfile.id));
      setDeckIndex(0);
      setPhotoIndex(0);
      setShowReportModal(false);
      setReportCustomDetail("");
      showToast("Report submitted. Profile removed from your deck.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not submit report.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Submit Block
  const handleConfirmBlock = async () => {
    if (!currentProfile || !user) return;
    try {
      await blockUser(currentProfile.id);
      setProfiles((current) => current.filter((candidate) => candidate.id !== currentProfile.id));
      setDeckIndex(0);
      setPhotoIndex(0);
      setShowBlockModal(false);
      setShowFullProfileModal(false);
      showToast(`${currentProfile.name} has been blocked.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not block profile.");
    }
  };

  // Swipe gesture handlers
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isAnimatingRef.current) return;
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("a")) return;
    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    dragOffsetRef.current = { x: 0, y: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || isAnimatingRef.current) return;
    const dx = e.clientX - startPosRef.current.x;
    const dy = e.clientY - startPosRef.current.y;
    if (!isDraggingRef.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      isDraggingRef.current = true;
      setIsDragging(true);
      suppressClickRef.current = true;
    }
    if (isDraggingRef.current) {
      dragOffsetRef.current = { x: dx, y: dy };
      setDragOffset({ x: dx, y: dy });
    }
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
      const finalX = dragOffsetRef.current.x;
      const finalY = dragOffsetRef.current.y;
      isDraggingRef.current = false;
      setIsDragging(false);

      if (Math.abs(finalX) > 110) {
        triggerSwipe(finalX > 0 ? "right" : "left");
        return;
      }
      if (Math.abs(finalX) > 50 && Math.abs(finalX) > Math.abs(finalY) * 1.5) {
        triggerSwipe(finalX > 0 ? "right" : "left");
        return;
      }
      dragOffsetRef.current = { x: 0, y: 0 };
      setDragOffset({ x: 0, y: 0 });
    },
    [triggerSwipe]
  );

  const handlePointerCancel = useCallback(() => {
    isPointerDownRef.current = false;
    isDraggingRef.current = false;
    dragOffsetRef.current = { x: 0, y: 0 };
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleCardTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }
      if (isDraggingRef.current) return;
      if (Math.abs(dragOffsetRef.current.x) > 6 || Math.abs(dragOffsetRef.current.y) > 6) return;
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest("a")) return;
      if (currentPhotos.length === 0) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width * 0.35) {
        setPhotoIndex((prev) => Math.max(0, prev - 1));
      } else {
        setPhotoIndex((prev) => Math.min(currentPhotos.length - 1, prev + 1));
      }
    },
    [currentPhotos.length]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchedProfile || isAnimatingRef.current || !currentProfile) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        triggerSwipe("left");
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        triggerSwipe("right");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentProfile, matchedProfile, triggerSwipe]);

  if (!user) return null;

  const dragProgress = Math.min(1, Math.abs(dragOffset.x) / 120);
  const rotation = dragOffset.x * 0.07;
  const cardTransform =
    exitDirection === "left"
      ? "translate3d(-150vw, 0px, 0px) rotate(-28deg)"
      : exitDirection === "right"
      ? "translate3d(150vw, 0px, 0px) rotate(28deg)"
      : isDragging || dragOffset.x !== 0 || dragOffset.y !== 0
      ? `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.25}px, 0px) rotate(${rotation}deg)`
      : "translate3d(0px, 0px, 0px) rotate(0deg)";

  const connectOpacity =
    exitDirection === "right" ? 1 : Math.max(0, Math.min(1, (dragOffset.x - 25) / 60));
  const rejectOpacity =
    exitDirection === "left" ? 1 : Math.max(0, Math.min(1, (-dragOffset.x - 25) / 60));

  return (
    <AppShell>
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9e1b22]">IshqYara</p>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900">Find your Puja person 🪷</h1>
          </div>

          {/* Action Header Icons */}
          <div className="flex items-center gap-2">
            {/* Selfie Verification Badge or Button */}
            {uiProfile?.verified ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-200 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-sky-500 fill-sky-500/20" />
                <span className="hidden sm:inline">Verified</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowSelfieModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#9e1b22] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full border border-red-200 shadow-xs transition-all active:scale-95"
                title="Get verified with a quick selfie"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Get Verified</span>
                <span className="xs:hidden">Verify</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              type="button"
              onClick={requestNotificationPermission}
              className="w-9 h-9 rounded-full bg-white border border-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center relative shadow-xs transition-all active:scale-95"
              title={
                notificationPermission === "granted"
                  ? "Push notifications active"
                  : "Enable Match Alerts"
              }
            >
              <Bell className="w-4 h-4" />
              {notificationPermission === "granted" && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>

            {/* Filter Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowFiltersModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 border ${
                activeFilterCount > 0
                  ? "bg-[#9e1b22] text-white border-[#9e1b22]"
                  : "bg-white text-stone-700 border-stone-200 hover:border-stone-300"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#9e1b22] text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Unverified Safety Notice Banner */}
        {uiProfile && !uiProfile.verified && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                <Camera className="w-4 h-4 text-[#9e1b22]" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">Verification Required to Like</p>
                <p className="text-[11px] text-stone-600 line-clamp-1">
                  Complete a quick selfie to unlock sending likes, notes & matching with Kolkata students 🪷
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSelfieModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#9e1b22] hover:bg-[#85161c] text-white text-xs font-bold shrink-0 shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Verify Now</span>
            </button>
          </div>
        )}



        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#1c1917] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-stone-700 animate-in slide-in-from-top-3 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {isLoadingProfiles && (
          <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
            Finding Puja companions for you…
          </div>
        )}

        {!isLoadingProfiles && profileError && (
          <div role="alert" className="rounded-3xl border border-red-200 bg-white p-8 text-center">
            <p className="text-sm text-rose-700">{profileError}</p>
            <button
              className="mt-3 text-sm font-bold text-[#9e1b22]"
              onClick={() => {
                if (!user || !publicProfile) return;
                setIsLoadingProfiles(true);
                loadDiscoveryDeck(publicProfile)
                  .then(setProfiles)
                  .catch((error) =>
                    setProfileError(
                      error instanceof Error ? error.message : "Could not load discovery profiles."
                    )
                  )
                  .finally(() => setIsLoadingProfiles(false));
              }}
            >
              Try again
            </button>
          </div>
        )}

        {!isLoadingProfiles && !profileError && filteredProfiles.length === 0 && (
          <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center space-y-3">
            <h2 className="text-lg font-bold text-stone-900">
              {profiles.length > 0
                ? "No profiles match your filters 🔍"
                : "You’re all caught up 🪷"}
            </h2>
            <p className="text-sm text-stone-500 max-w-sm mx-auto">
              {profiles.length > 0
                ? "Try broadening your Kolkata zone or intention filter to see more students."
                : "There are no eligible profiles to show right now. Check back when more students join."}
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedZone("all");
                  setSelectedIntent("all");
                  setSelectedGender("all");
                }}
                className="mt-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-[#9e1b22] to-[#c22830] text-white text-xs font-bold shadow-md hover:brightness-105"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Tinder Swipe Deck */}
        {currentProfile && (
          <div className="flex flex-col items-center justify-center pt-0 pb-6">
            <div className="w-full max-w-[390px] sm:max-w-[420px] relative select-none">
              {/* 3D Stack Card 3 */}
              {thirdProfile && (
                <div className="absolute inset-0 h-[490px] xs:h-[530px] sm:h-[590px] md:h-[630px] max-h-[calc(100dvh-200px)] min-h-[450px] rounded-[32px] bg-stone-300/40 border border-stone-300 transform scale-[0.91] translate-y-6 pointer-events-none z-0" />
              )}

              {/* 3D Stack Card 2 */}
              {nextProfile && (
                <div
                  style={{
                    transform: `scale(${0.95 + dragProgress * 0.05}) translateY(${
                      12 - dragProgress * 12
                    }px)`,
                    opacity: 0.7 + dragProgress * 0.3,
                    transition: isDragging ? "none" : "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  className="absolute inset-0 h-[490px] xs:h-[530px] sm:h-[590px] md:h-[630px] max-h-[calc(100dvh-200px)] min-h-[450px] rounded-[32px] overflow-hidden shadow-lg border border-stone-200/80 bg-stone-900 pointer-events-none z-0"
                >
                  <img
                    src={nextProfile.image}
                    alt={nextProfile.name}
                    className="w-full h-full object-cover filter brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                    <h3 className="text-2xl font-black">
                      {nextProfile.name},{" "}
                      <span className="font-medium text-xl">{nextProfile.age}</span>
                    </h3>
                    <p className="text-xs text-stone-300">
                      {nextProfile.area} • {nextProfile.college}
                    </p>
                  </div>
                </div>
              )}

              {/* Active Tinder Card */}
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onClick={handleCardTap}
                style={{
                  transform: cardTransform,
                  transition: isDragging
                    ? "none"
                    : "transform 0.32s cubic-bezier(0.175, 0.885, 0.32, 1.2), opacity 0.3s ease",
                  opacity: exitDirection ? 0 : 1,
                  touchAction: "pan-y",
                }}
                className={`relative z-10 w-full h-[490px] xs:h-[530px] sm:h-[590px] md:h-[630px] max-h-[calc(100dvh-200px)] min-h-[450px] rounded-[32px] overflow-hidden shadow-[0_24px_50px_-10px_rgba(0,0,0,0.35)] bg-stone-900 border border-white/20 ${
                  isDragging
                    ? "cursor-grabbing shadow-[0_32px_70px_rgba(0,0,0,0.5)]"
                    : "cursor-grab"
                }`}
              >
                {/* Story Indicator */}
                <div className="absolute top-3 left-3.5 right-3.5 z-20 flex items-center gap-1.5 pointer-events-none">
                  {currentPhotos.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full flex-1 transition-all duration-200 ${
                        i === photoIndex
                          ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                          : "bg-white/35"
                      }`}
                    />
                  ))}
                </div>

                {/* Match + Intention + Safety Action */}
                <div className="absolute top-7 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-black/45 backdrop-blur-md text-amber-300 border border-amber-400/40 shadow-lg pointer-events-auto">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{currentProfile.compatibility}% Match</span>
                  </div>

                  <div className="flex items-center gap-1.5 pointer-events-auto">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-black/45 backdrop-blur-md text-white border border-white/25 shadow-lg">
                      {currentProfile.intention}
                    </div>

                    {/* Safety Dropdown Menu Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSafetyMenu((prev) => !prev);
                        }}
                        className="w-8 h-8 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md text-white border border-white/25 flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                        title="Report or Block"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {showSafetyMenu && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-10 w-44 bg-white/95 backdrop-blur-md text-stone-900 rounded-2xl shadow-xl border border-stone-200 py-1.5 z-40 text-left text-xs font-semibold animate-in fade-in zoom-in-95"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setShowSafetyMenu(false);
                              setShowReportModal(true);
                            }}
                            className="w-full px-3.5 py-2 text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                          >
                            <ShieldAlert className="w-4 h-4 text-rose-600" />
                            <span>Report Profile</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowSafetyMenu(false);
                              setShowBlockModal(true);
                            }}
                            className="w-full px-3.5 py-2 text-stone-700 hover:bg-stone-100 flex items-center gap-2 border-t border-stone-100"
                          >
                            <X className="w-4 h-4 text-stone-500" />
                            <span>Block User</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* LIKE Stamp */}
                {connectOpacity > 0 && (
                  uiProfile?.verified ? (
                    <div
                      style={{ opacity: connectOpacity }}
                      className="absolute top-16 left-6 z-30 pointer-events-none transform -rotate-[16deg] border-[5px] border-emerald-400 bg-emerald-950/60 text-emerald-400 px-4 py-1.5 rounded-2xl font-black text-3xl sm:text-4xl tracking-widest uppercase shadow-2xl backdrop-blur-xs flex items-center gap-2 ring-2 ring-emerald-400/40 animate-in fade-in duration-75"
                    >
                      <Heart className="w-8 h-8 fill-emerald-400 text-emerald-400" />
                      <span>LIKE</span>
                    </div>
                  ) : (
                    <div
                      style={{ opacity: connectOpacity }}
                      className="absolute top-16 left-6 z-30 pointer-events-none transform -rotate-[16deg] border-[5px] border-amber-400 bg-amber-950/80 text-amber-300 px-4 py-1.5 rounded-2xl font-black text-xl sm:text-2xl tracking-widest uppercase shadow-2xl backdrop-blur-xs flex items-center gap-2 ring-2 ring-amber-400/40 animate-in fade-in duration-75"
                    >
                      <Camera className="w-6 h-6 text-amber-300" />
                      <span>VERIFY TO LIKE 🪷</span>
                    </div>
                  )
                )}

                {/* NOPE Stamp */}
                {rejectOpacity > 0 && (
                  <div
                    style={{ opacity: rejectOpacity }}
                    className="absolute top-16 right-6 z-30 pointer-events-none transform rotate-[16deg] border-[5px] border-rose-500 bg-rose-950/60 text-rose-500 px-4 py-1.5 rounded-2xl font-black text-3xl sm:text-4xl tracking-widest uppercase shadow-2xl backdrop-blur-xs flex items-center gap-2 ring-2 ring-rose-500/40 animate-in fade-in duration-75"
                  >
                    <X className="w-8 h-8 stroke-[3.5] text-rose-500" />
                    <span>NOPE</span>
                  </div>
                )}

                {/* Full Photo */}
                <img
                  src={currentPhotos[photoIndex] || currentProfile.image}
                  alt={currentProfile.name}
                  draggable={false}
                  className="w-full h-full object-cover select-none pointer-events-none transition-all duration-300"
                />

                {/* Photo Navigation arrows */}
                <div className="absolute inset-x-0 top-14 bottom-44 z-10 flex justify-between items-center px-2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                  {photoIndex > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIndex((prev) => Math.max(0, prev - 1));
                      }}
                      className="w-8 h-8 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:scale-110 active:scale-95 pointer-events-auto transition-transform shadow-lg"
                      title="Previous photo"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                  ) : (
                    <div />
                  )}

                  {photoIndex < currentPhotos.length - 1 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIndex((prev) => Math.min(currentPhotos.length - 1, prev + 1));
                      }}
                      className="w-8 h-8 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:scale-110 active:scale-95 pointer-events-auto transition-transform shadow-lg"
                      title="Next photo"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Bottom Profile Details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white pointer-events-none">
                  <div className="space-y-2 pointer-events-auto">
                    {/* Name + Details Info Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                          {currentProfile.name},{" "}
                          <span className="font-semibold text-2xl sm:text-3xl text-stone-200">
                            {currentProfile.age}
                          </span>
                        </h2>

                        {currentProfile.verified && (
                          <CheckCircle2 className="w-6 h-6 text-sky-400 fill-sky-400/20" />
                        )}
                      </div>

                      <button
                        type="button"
                        onPointerDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFullProfileModal(true);
                        }}
                        className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-white/25 hover:bg-white/40 active:bg-white/50 backdrop-blur-md flex items-center justify-center text-white border border-white/35 transition-all active:scale-95 shadow-lg group touch-manipulation cursor-pointer z-30"
                        title="Open profile details"
                        aria-label="Open profile details"
                      >
                        <Info className="w-5 h-5 stroke-[2.5] group-hover:scale-110 transition-transform" />
                      </button>
                    </div>

                    {/* Location + College */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-stone-200">
                      <span className="flex items-center gap-1 font-medium bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                        <MapPin className="w-3.5 h-3.5 text-[#ea580c]" />
                        {currentProfile.area} • {currentProfile.distanceKm} km away
                      </span>

                      <span className="flex items-center gap-1 font-medium bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                        <GraduationCap className="w-3.5 h-3.5 text-stone-300" />
                        {currentProfile.college}
                      </span>
                    </div>

                    {/* Bio */}
                    <p className="text-xs sm:text-sm text-stone-100 font-normal leading-relaxed line-clamp-2 drop-shadow-xs">
                      &ldquo;{currentProfile.bio}&rdquo;
                    </p>

                    {/* Interests & Puja Zone */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentProfile.interests.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-xs"
                        >
                          {tag}
                        </span>
                      ))}

                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/25 backdrop-blur-md text-amber-200 border border-amber-400/35 shadow-xs">
                        🪷 {currentProfile.pujaPreferences.favoritePandalZone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Dock (Hinge / Tinder Combo) */}
              <div className="pt-3 sm:pt-4 pb-1 flex items-center justify-center gap-3.5 sm:gap-5">
                {/* Rewind */}
                <button
                  type="button"
                  onClick={handleRewind}
                  disabled={exitDirection !== null || isSavingAction}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-amber-500 border border-amber-200/90 shadow-md hover:shadow-lg hover:scale-110 active:scale-90 hover:bg-amber-50 transition-all flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none group"
                  title="Rewind"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-rotate-45 transition-transform stroke-[2.5]" />
                </button>

                {/* Nope */}
                <button
                  type="button"
                  onClick={() => triggerSwipe("left")}
                  disabled={exitDirection !== null || isSavingAction}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-rose-500 border border-rose-200 shadow-lg sm:shadow-xl shadow-rose-500/15 hover:shadow-2xl hover:scale-110 active:scale-90 hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center justify-center group"
                  title="Nope"
                >
                  <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] group-hover:scale-110 transition-transform" />
                </button>

                {/* Send Note 💬 (Hinge style note with like) */}
                <button
                  type="button"
                  onClick={() => {
                    if (!uiProfile?.verified) {
                      setShowSelfieModal(true);
                      showToast("Selfie verification required! Please verify to send notes & likes 🪷");
                      return;
                    }
                    setNoteContext("");
                    setNoteModalProfile(currentProfile);
                  }}
                  disabled={exitDirection !== null || isSavingAction}
                  className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white text-[#9e1b22] border border-red-200 shadow-lg hover:shadow-xl hover:scale-110 active:scale-90 hover:bg-red-50 transition-all flex items-center justify-center group"
                  title={uiProfile?.verified ? "Send Note with Like" : "Verify selfie to send notes & likes"}
                >
                  <MessageSquareQuote className="w-6 h-6 stroke-[2.2] group-hover:scale-110 transition-transform" />
                </button>

                {/* Like */}
                <button
                  type="button"
                  onClick={() => {
                    if (!uiProfile?.verified) {
                      setShowSelfieModal(true);
                      showToast("Selfie verification required! Please verify to send likes 🪷");
                      return;
                    }
                    triggerSwipe("right");
                  }}
                  disabled={exitDirection !== null || isSavingAction}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#9e1b22] to-[#e11d48] text-white shadow-lg sm:shadow-xl shadow-[#9e1b22]/35 hover:shadow-2xl hover:scale-110 active:scale-90 hover:brightness-110 transition-all flex items-center justify-center group relative"
                  title={uiProfile?.verified ? "Like" : "Verify selfie to send likes"}
                >
                  <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-white group-hover:scale-110 transition-transform" />
                  {!uiProfile?.verified && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 border-2 border-white flex items-center justify-center shadow-xs" title="Verification required">
                      <Camera className="w-3 h-3 stroke-[2.5]" />
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIKE WITH NOTE MODAL (Hinge Style) */}
        {noteModalProfile && (
          <div
            onClick={() => setNoteModalProfile(null)}
            className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)] text-stone-900"
            >
              {/* Header */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={noteModalProfile.image}
                    alt={noteModalProfile.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-red-200"
                  />
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-base">
                      Send Note to {noteModalProfile.name}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Stand out before matching with a thoughtful Puja message 🪷
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNoteModalProfile(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Context if replying to a prompt */}
              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {noteContext && (
                  <div className="p-3 rounded-2xl bg-[#faf7f2] border border-[#e7dfd5] text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#9e1b22]">
                      Responding to:
                    </span>
                    <p className="font-medium text-stone-800 italic">&ldquo;{noteContext}&rdquo;</p>
                  </div>
                )}

                {/* Quick Kolkata Icebreakers */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Quick Puja Icebreakers
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_ICEBREAKERS.map((text, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNoteText(text)}
                        className="px-2.5 py-1 rounded-xl text-xs bg-stone-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-200 border border-transparent transition-all text-stone-700 text-left font-medium"
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Area */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                    Your Note
                  </label>
                  <textarea
                    rows={3}
                    maxLength={280}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder={`Say something friendly to ${noteModalProfile.name}…`}
                    className="w-full px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#9e1b22]/20 focus:border-[#9e1b22] text-sm text-stone-900 resize-none transition-all"
                  />
                  <div className="flex justify-between items-center text-[10px] text-stone-400">
                    <span>Be kind and festive 🪷</span>
                    <span>{noteText.length} / 280</span>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSendNoteAndLike}
                    disabled={isSubmittingNote || !noteText.trim()}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#9e1b22] to-[#c22830] text-white flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 hover:brightness-105 active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {isSubmittingNote ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Like & Note</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DISCOVERY FILTERS MODAL */}
        {showFiltersModal && (
          <div
            onClick={() => setShowFiltersModal(false)}
            className="fixed inset-0 z-[110] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)] text-stone-900"
            >
              {/* Header */}
              <div className="p-5 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#9e1b22]" />
                  <h3 className="font-black text-stone-900 text-lg">Discovery Filters</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFiltersModal(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filters Content */}
              <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Kolkata Zones */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Kolkata Zone
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {KOLKATA_ZONES.map((zone) => {
                      const isSel = selectedZone === zone.id;
                      return (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => setSelectedZone(zone.id)}
                          className={`p-2.5 rounded-2xl text-xs font-bold text-left border transition-all ${
                            isSel
                              ? "bg-red-50 text-[#9e1b22] border-[#9e1b22]"
                              : "bg-[#faf7f2] text-stone-700 border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          {zone.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Connection Intention */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Connection Intent
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {INTENT_OPTIONS.map((intent) => {
                      const isSel = selectedIntent === intent.id;
                      return (
                        <button
                          key={intent.id}
                          type="button"
                          onClick={() => setSelectedIntent(intent.id)}
                          className={`p-2.5 rounded-2xl text-xs font-bold text-left border transition-all ${
                            isSel
                              ? "bg-red-50 text-[#9e1b22] border-[#9e1b22]"
                              : "bg-[#faf7f2] text-stone-700 border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          {intent.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Who are you interested in seeing? */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Who are you interested in seeing?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "all", label: "Everyone 🌟" },
                      { id: "Women", label: "Women 👩" },
                      { id: "Men", label: "Men 👨" },
                    ].map((opt) => {
                      const isSel =
                        selectedGender === opt.id ||
                        (opt.id === "all" && selectedGender === "Everyone");
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedGender(opt.id)}
                          className={`p-2.5 rounded-2xl text-xs font-bold text-center border transition-all ${
                            isSel
                              ? "bg-red-50 text-[#9e1b22] border-[#9e1b22]"
                              : "bg-[#faf7f2] text-stone-700 border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filter Modal Action Buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedZone("all");
                      setSelectedIntent("all");
                      setSelectedGender("all");
                      setShowFiltersModal(false);
                    }}
                    className="flex-1 py-3 rounded-2xl font-bold text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all"
                  >
                    Reset All
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFiltersModal(false)}
                    className="flex-1 py-3 rounded-2xl font-bold text-xs bg-gradient-to-r from-[#9e1b22] to-[#c22830] text-white transition-all shadow-md hover:brightness-105 active:scale-95"
                  >
                    Apply Filters ({filteredProfiles.length} Profiles)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REPORT MODAL */}
        {showReportModal && currentProfile && (
          <div
            onClick={() => setShowReportModal(false)}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] border border-stone-200 max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 text-stone-900 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-stone-900 text-base">Report {currentProfile.name}</h3>
                    <p className="text-[11px] text-stone-500">Your report is private and encrypted.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Reasons */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Select Reason
                </label>
                <div className="space-y-1.5">
                  {REPORT_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setReportReasonCategory(reason)}
                      className={`w-full p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                        reportReasonCategory === reason
                          ? "bg-rose-50 text-rose-800 border-rose-300"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reportCustomDetail}
                  onChange={(e) => setReportCustomDetail(e.target.value)}
                  placeholder="Provide context so we can keep IshqYara safe…"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-xs bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReport}
                  disabled={isSubmittingReport}
                  className="flex-1 py-3 rounded-2xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingReport ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* BLOCK MODAL */}
        {showBlockModal && currentProfile && (
          <div
            onClick={() => setShowBlockModal(false)}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[32px] border border-stone-200 max-w-sm w-full p-6 space-y-4 shadow-2xl relative animate-in zoom-in-95 duration-200 text-stone-900 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-rose-100 mx-auto flex items-center justify-center text-rose-700">
                <X className="w-8 h-8 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-stone-900 text-lg">Block {currentProfile.name}?</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  They will be permanently removed from your deck and matches. Neither of you will see each other on IshqYara again.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-xs bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBlock}
                  className="flex-1 py-3 rounded-2xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-95"
                >
                  Confirm Block
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SELFIE VERIFICATION MODAL */}
        <SelfieVerificationModal
          userId={user.id}
          isOpen={showSelfieModal}
          onClose={() => setShowSelfieModal(false)}
          onVerified={() => {
            void refreshProfile();
            showToast("Selfie verified! You can now send likes & have the verified badge 🪷");
          }}
        />

        {/* FULL PROFILE DETAILS MODAL */}
        {showFullProfileModal && currentProfile && (
          <div
            onClick={() => setShowFullProfileModal(false)}
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-lg h-[86dvh] sm:h-[80vh] max-h-[88dvh] sm:max-h-[82vh] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)]"
            >
              {/* Mobile Handle */}
              <div className="sm:hidden w-full flex justify-center pt-2.5 pb-1 bg-stone-900 shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-white/40" />
              </div>

              {/* Header Photo */}
              <div className="relative h-48 sm:h-56 w-full bg-stone-900 shrink-0 overflow-hidden">
                <img
                  src={currentPhotos[photoIndex] || currentProfile.image}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => setShowFullProfileModal(false)}
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 shadow-md touch-manipulation z-20"
                  aria-label="Close profile details"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>

                {/* Story Indicator */}
                <div className="absolute bottom-3 left-4 right-4 flex gap-1.5 z-10">
                  {currentPhotos.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoIndex(idx)}
                      className={`h-1.5 rounded-full flex-1 transition-all ${
                        idx === photoIndex ? "bg-white shadow-xs" : "bg-white/40"
                      }`}
                      aria-label={`Photo ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 min-h-0 text-stone-900 overscroll-contain touch-pan-y">
                {/* Name */}
                <div className="space-y-1.5 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                      {currentProfile.name}, {currentProfile.age}
                    </h1>
                    {currentProfile.verified && (
                      <CheckCircle2 className="w-6 h-6 text-sky-500 fill-sky-500/20" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#ea580c]" />
                      {currentProfile.area} • {currentProfile.distanceKm} km away
                    </span>

                    <span className="flex items-center gap-1 font-semibold">
                      <GraduationCap className="w-3.5 h-3.5 text-stone-500" />
                      {currentProfile.college}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#9e1b22] font-bold border border-red-200">
                      {currentProfile.intention}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    About Me
                  </h4>
                  <p className="text-sm text-stone-700 leading-relaxed font-medium">
                    {currentProfile.bio}
                  </p>
                </div>

                {/* Prompts with Hinge-style "Reply to Prompt" button */}
                {currentProfile.prompts && currentProfile.prompts.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Puja Q&A & Prompts
                    </h4>

                    {currentProfile.prompts.map((prompt, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 sm:p-4 rounded-2xl bg-[#faf7f2] border border-[#e7dfd5] space-y-2 relative group"
                      >
                        <div className="text-xs font-bold text-[#9e1b22]">{prompt.question}</div>
                        <p className="text-sm text-stone-800 font-medium italic">
                          &ldquo;{prompt.answer}&rdquo;
                        </p>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (!uiProfile?.verified) {
                                setShowSelfieModal(true);
                                showToast("Selfie verification required! Please verify to send notes & likes 🪷");
                                return;
                              }
                              setShowFullProfileModal(false);
                              setNoteContext(`${prompt.question}: ${prompt.answer}`);
                              setNoteModalProfile(currentProfile);
                            }}
                            className="px-3 py-1 rounded-full text-[11px] font-bold text-[#9e1b22] bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-1 transition-all"
                          >
                            <MessageSquareQuote className="w-3 h-3" />
                            <span>Reply to Prompt</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Puja Rhythm */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-[#ea580c]" />
                    <span>Puja Rhythm</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                      <div className="text-stone-400 text-[10px] uppercase font-bold">Timing</div>
                      <div className="font-bold text-stone-800 mt-0.5">
                        {currentProfile.pujaPreferences.timing}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                      <div className="text-stone-400 text-[10px] uppercase font-bold">Food Priority</div>
                      <div className="font-bold text-stone-800 mt-0.5">
                        {currentProfile.pujaPreferences.foodPriority}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                      <div className="text-stone-400 text-[10px] uppercase font-bold">Favorite Zone</div>
                      <div className="font-bold text-stone-800 mt-0.5">
                        {currentProfile.pujaPreferences.favoritePandalZone}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                      <div className="text-stone-400 text-[10px] uppercase font-bold">Crowd Tolerance</div>
                      <div className="font-bold text-stone-800 mt-0.5">
                        {currentProfile.pujaPreferences.crowdComfort}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compatibility */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      Compatibility Score
                    </span>
                    <span className="text-sm font-black text-[#9e1b22]">
                      {currentProfile.compatibility}%
                    </span>
                  </div>

                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-[#9e1b22] h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, currentProfile.compatibility))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Interests */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    Passions & Interests
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentProfile.interests.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-xl text-xs font-medium bg-[#faf7f2] text-stone-700 border border-[#e7dfd5]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFullProfileModal(false);
                      triggerSwipe("left");
                    }}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation"
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                    <span>Nope</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!uiProfile?.verified) {
                        setShowSelfieModal(true);
                        showToast("Selfie verification required! Please verify to send notes & likes 🪷");
                        return;
                      }
                      setShowFullProfileModal(false);
                      setNoteContext("");
                      setNoteModalProfile(currentProfile);
                    }}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation"
                  >
                    <MessageSquareQuote className="w-4 h-4 text-amber-700" />
                    <span>Note</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!uiProfile?.verified) {
                        setShowSelfieModal(true);
                        showToast("Selfie verification required! Please verify to send likes 🪷");
                        return;
                      }
                      setShowFullProfileModal(false);
                      triggerSwipe("right");
                    }}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#9e1b22] to-[#e11d48] text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                    <span>Like</span>
                  </button>
                </div>

                {/* Safety Actions */}
                <div className="flex justify-end gap-4 text-xs pt-1 border-t border-stone-100">
                  <button
                    type="button"
                    className="text-stone-500 hover:text-rose-700"
                    onClick={() => {
                      setShowFullProfileModal(false);
                      setShowReportModal(true);
                    }}
                  >
                    Report profile
                  </button>
                  <button
                    type="button"
                    className="text-stone-500 hover:text-rose-700"
                    onClick={() => {
                      setShowFullProfileModal(false);
                      setShowBlockModal(true);
                    }}
                  >
                    Block profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MATCH CELEBRATION MODAL */}
        {matchedProfile && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 max-w-sm w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e1b22] px-3 py-1 rounded-full bg-red-50 border border-red-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>It&apos;s a Match! 🪷</span>
              </div>

              {/* Avatars */}
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <img
                    src={uiProfile?.image || authAvatarUrl(user) || ""}
                    alt="You"
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-[#9e1b22]/20"
                  />
                  <span className="text-[10px] font-bold absolute -bottom-2 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-2 py-0.5 rounded-full">
                    You
                  </span>
                </div>

                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#9e1b22] animate-bounce">
                  <Heart className="w-5 h-5 fill-current" />
                </div>

                <div className="relative">
                  <img
                    src={matchedProfile.image}
                    alt={matchedProfile.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-[#9e1b22]/20"
                  />
                  <span className="text-[10px] font-bold absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#9e1b22] text-white px-2 py-0.5 rounded-full">
                    {matchedProfile.name.split(" ")[0]}
                  </span>
                </div>
              </div>

              {/* Match Text */}
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-stone-900">
                  Connected with {matchedProfile.name}!
                </h3>
                <p className="text-xs text-stone-500">
                  {matchedProfile.compatibility}% compatible for {matchedProfile.intention}.
                </p>
              </div>

              {/* Shared Preference */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium text-left space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <span>🪷 Shared Pandal Preference</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  {matchedProfile.pujaPreferences.favoritePandalZone} •{" "}
                  {matchedProfile.pujaPreferences.timing}
                </p>
              </div>

              {/* Match Actions */}
              <div className="space-y-2 pt-1">
                <Link
                  href={`/messages?partner=${matchedProfile.id}`}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#9e1b22] to-[#c22830] hover:from-[#83161c] flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Message</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMatchedProfile(null);
                    setDeckIndex(0);
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  Keep Swiping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
