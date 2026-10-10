"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
  Settings,
  User as UserIcon,
  LifeBuoy,
  ShieldCheck,
  Code2,
  LogOut,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { type Profile } from "@/lib/data";
import { useAppUser } from "@/components/AppUserContext";
import { createClient } from "@/lib/supabase/client";
import { authAvatarUrl, authDisplayName } from "@/lib/supabase/user";
import { loadDiscoveryDeck, loadPublicProfile } from "@/lib/discovery";
import { blockUser, likeUser, passUser, recordReport, rewindLastAction } from "@/lib/interactions";

type DragOffset = {
  x: number;
  y: number;
};

export default function PartnerFinderPage() {
  const { user, publicProfile, uiProfile, logout } = useAppUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [matchedProfile, setMatchedProfile] =
    useState<Profile | null>(null);

  const [toastMessage, setToastMessage] =
    useState<string | null>(null);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingAction, setIsSavingAction] = useState(false);
  const actionLockRef = useRef(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<"main" | "userinfo" | "privacy" | "about" | "delete">("main");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [dragOffset, setDragOffset] =
    useState<DragOffset>({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);

  const [exitDirection, setExitDirection] =
    useState<"left" | "right" | null>(null);

  const [photoIndex, setPhotoIndex] = useState(0);

  const [showFullProfileModal, setShowFullProfileModal] =
    useState(false);

  /* The stack contains eligible profiles returned by Supabase. */
  const currentProfile: Profile | null = profiles[deckIndex] ?? null;

  const nextProfile: Profile | null =
    profiles.length > deckIndex + 1
      ? profiles[deckIndex + 1] ?? null
      : null;

  const thirdProfile: Profile | null =
    profiles.length > deckIndex + 2
      ? profiles[deckIndex + 2] ?? null
      : null;

  /*
   * Refs used for swipe gestures.
   *
   * These prevent stale state from being read during pointer
   * movement/up events.
   */
  const startPosRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef<DragOffset>({ x: 0, y: 0 });

  const isPointerDownRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isAnimatingRef = useRef(false);

  const swipeTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const toastTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (!user || !publicProfile?.profileComplete) return;
    let cancelled = false;
    loadDiscoveryDeck(publicProfile).then((deck) => {
      if (!cancelled) setProfiles(deck);
    }).catch((error) => {
      if (!cancelled) setProfileError(error instanceof Error ? error.message : "Could not load discovery profiles.");
    }).finally(() => {
      if (!cancelled) setIsLoadingProfiles(false);
    });
    return () => { cancelled = true; };
  }, [user, publicProfile]);

  /*
   * BODY SCROLL LOCK
   */
  useEffect(() => {
    if (!showFullProfileModal) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [showFullProfileModal]);

  /*
   * CLEANUP TIMERS
   */
  useEffect(() => {
    return () => {
      if (swipeTimeoutRef.current) {
        clearTimeout(swipeTimeoutRef.current);
      }

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  /*
   * TOAST
   */
  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToastMessage(msg);

    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 2400);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setShowSettings(false);
      setSettingsView("main");
    } catch (error) {
      console.error("Logout failed:", error);
      showToast("Could not log out. Please try again.");
    }
  }, [logout, showToast]);

  const handleDeleteAccount = useCallback(async () => {
    if (deleteConfirmation !== "DELETE" || !user) return;
    setDeletingAccount(true);
    setDeleteError(null);
    try {
      sessionStorage.setItem("ishqyara-delete-intent", JSON.stringify({ uid: user.id, confirmation: deleteConfirmation }));
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=%2F%3FfinishAccountDeletion%3D1`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (error) {
      sessionStorage.removeItem("ishqyara-delete-intent");
      setDeleteError(error instanceof Error ? error.message : "Could not delete account.");
      setDeletingAccount(false);
    }
  }, [deleteConfirmation, user]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("finishAccountDeletion") !== "1") return;
    const rawIntent = sessionStorage.getItem("ishqyara-delete-intent");
    sessionStorage.removeItem("ishqyara-delete-intent");
    if (!rawIntent) return;
    let intent: { uid?: string; confirmation?: string };
    try { intent = JSON.parse(rawIntent); } catch { return; }
    if (intent.uid !== user?.id || intent.confirmation !== "DELETE") {
      queueMicrotask(() => {
        setDeleteError("Account removal was cancelled because the signed-in Google account changed.");
        setSettingsView("delete");
        setShowSettings(true);
      });
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
    queueMicrotask(() => setDeletingAccount(true));
    void fetch("/api/account/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation: intent.confirmation }),
    }).then(async (response) => {
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Could not delete account.");
      // The Auth account has already been deleted; clear this browser's local
      // session without requiring a server-side sign-out for a deleted user.
      await createClient().auth.signOut({ scope: "local" });
      window.location.replace("/");
    }).catch((error: unknown) => {
      setDeleteError(error instanceof Error ? error.message : "Could not delete account.");
      setDeletingAccount(false);
      setSettingsView("delete");
      setShowSettings(true);
    }).finally(() => window.history.replaceState({}, "", window.location.pathname));
  }, [user, logout]);

  /*
   * CONFETTI
   */
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.65 },
        colors: [
          "#9e1b22",
          "#ea580c",
          "#d97706",
          "#f59e0b",
          "#ec4899",
        ],
      });
    } catch {
      // Ignore confetti errors.
    }
  }, []);

  /*
   * FALLBACK PROFILE GALLERIES
   */
  const getProfilePhotos = useCallback(
    (p: Profile): string[] => {
      /*
       * Some versions of the Profile type may not explicitly
       * contain "photos", so access it safely.
       */
      const profileWithPhotos = p as Profile & {
        photos?: string[];
      };

      if (
        profileWithPhotos.photos &&
        profileWithPhotos.photos.length > 0
      ) {
        return profileWithPhotos.photos;
      }

      const fallbackGalleries: Record<string, string[]> = {
        "riya-20": [
          p.image,
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
        ],

        "sourav-22": [
          p.image,
          "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
        ],

        "ananya-21": [
          p.image,
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
        ],

        "debojyoti-23": [
          p.image,
          "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80",
        ],

        "sneha-20": [
          p.image,
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
        ],

        "ishaan-21": [
          p.image,
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
        ],
      };

      return fallbackGalleries[p.id] || [p.image];
    },
    []
  );

  /*
   * CURRENT PHOTO LIST
   */
  const currentPhotos: string[] = currentProfile
    ? getProfilePhotos(currentProfile)
    : [];

  /*
   * LIKE
   */
  const handleLike = useCallback(async (profile: Profile) => {
    if (!user || actionLockRef.current) return;
    actionLockRef.current = true;
    setIsSavingAction(true);
    try {
      const result = await likeUser(profile.id);
      setProfiles((current) => current.filter((candidate) => candidate.id !== profile.id));
      setDeckIndex(0);
      setPhotoIndex(0);
      if (result.matched) {
        triggerConfetti();
        setMatchedProfile(profile);
      } else {
        showToast(result.already ? "You already liked this profile." : "Like saved.");
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not save your like.");
    } finally {
      actionLockRef.current = false;
      setIsSavingAction(false);
    }
  }, [user, showToast, triggerConfetti]);

  /*
   * PASS
   */
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

  /*
   * REWIND
   */
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

  /*
   * SWIPE
   */
  const triggerSwipe = useCallback(
    (direction: "left" | "right") => {
      const profile = currentProfile;

      if (!profile || actionLockRef.current || isSavingAction) {
        return;
      }

      if (isAnimatingRef.current) {
        return;
      }

      isAnimatingRef.current = true;

      setExitDirection(direction);

      if (swipeTimeoutRef.current) {
        clearTimeout(swipeTimeoutRef.current);
      }

      swipeTimeoutRef.current = setTimeout(() => {
        if (direction === "right") {
          handleLike(profile);
        } else {
          handlePass(profile);
        }

        dragOffsetRef.current = { x: 0, y: 0 };

        setExitDirection(null);
        setDragOffset({ x: 0, y: 0 });

        isAnimatingRef.current = false;
        swipeTimeoutRef.current = null;
      }, 280);
    },
    [currentProfile, handleLike, handlePass, isSavingAction]
  );

  /*
   * POINTER DOWN
   */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) {
        return;
      }

      if (isAnimatingRef.current) {
        return;
      }

      const target = e.target as HTMLElement;

      if (
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input")
      ) {
        return;
      }

      isPointerDownRef.current = true;
      isDraggingRef.current = false;
      suppressClickRef.current = false;

      startPosRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore pointer capture errors.
      }
    },
    []
  );

  /*
   * POINTER MOVE
   */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPointerDownRef.current) {
        return;
      }

      if (isAnimatingRef.current) {
        return;
      }

      const deltaX =
        e.clientX - startPosRef.current.x;

      const deltaY =
        e.clientY - startPosRef.current.y;

      if (
        !isDraggingRef.current &&
        (Math.abs(deltaX) > 6 ||
          Math.abs(deltaY) > 6)
      ) {
        isDraggingRef.current = true;
        setIsDragging(true);
        suppressClickRef.current = true;
      }

      if (
        isDraggingRef.current ||
        Math.abs(deltaX) > 6
      ) {
        const nextOffset = {
          x: deltaX,
          y: deltaY,
        };

        dragOffsetRef.current = nextOffset;
        setDragOffset(nextOffset);
      }
    },
    []
  );

  /*
   * POINTER UP
   */
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isPointerDownRef.current) {
        return;
      }

      isPointerDownRef.current = false;

      try {
        if (
          e.currentTarget.hasPointerCapture(
            e.pointerId
          )
        ) {
          e.currentTarget.releasePointerCapture(
            e.pointerId
          );
        }
      } catch {
        // Ignore pointer capture errors.
      }

      const wasDragging = isDraggingRef.current;
      const currentX = dragOffsetRef.current.x;

      if (!wasDragging) {
        return;
      }

      isDraggingRef.current = false;
      setIsDragging(false);

      const threshold = 85;

      if (currentX > threshold) {
        triggerSwipe("right");
        return;
      }

      if (currentX < -threshold) {
        triggerSwipe("left");
        return;
      }

      dragOffsetRef.current = {
        x: 0,
        y: 0,
      };

      setDragOffset({
        x: 0,
        y: 0,
      });
    },
    [triggerSwipe]
  );

  /*
   * POINTER CANCEL
   */
  const handlePointerCancel = useCallback(() => {
    isPointerDownRef.current = false;
    isDraggingRef.current = false;

    dragOffsetRef.current = {
      x: 0,
      y: 0,
    };

    setIsDragging(false);
    setDragOffset({
      x: 0,
      y: 0,
    });
  }, []);

  /*
   * NEXT CARD
   */
  const nextDeckCard = useCallback(() => {
    setDeckIndex(0);
  }, []);

  /*
   * CARD TAP / PHOTO NAVIGATION
   */
  const handleCardTap = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }

      if (isDraggingRef.current) {
        return;
      }

      if (
        Math.abs(dragOffsetRef.current.x) > 6 ||
        Math.abs(dragOffsetRef.current.y) > 6
      ) {
        return;
      }

      const target = e.target as HTMLElement;

      if (
        target.closest("button") ||
        target.closest("a")
      ) {
        return;
      }

      if (currentPhotos.length === 0) {
        return;
      }

      const rect =
        e.currentTarget.getBoundingClientRect();

      const clickX =
        e.clientX - rect.left;

      if (clickX < rect.width * 0.35) {
        setPhotoIndex((prev) =>
          Math.max(0, prev - 1)
        );
      } else {
        setPhotoIndex((prev) =>
          Math.min(
            currentPhotos.length - 1,
            prev + 1
          )
        );
      }
    },
    [currentPhotos.length]
  );

  /*
   * KEYBOARD NAVIGATION
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchedProfile) {
        return;
      }

      if (isAnimatingRef.current) {
        return;
      }

      if (!currentProfile) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        triggerSwipe("left");
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        triggerSwipe("right");
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    currentProfile,
    matchedProfile,
    triggerSwipe,
  ]);

  /*
   * SAFE CARD VALUES
   */
  if (!user) return null;

  const dragProgress = Math.min(
    1,
    Math.abs(dragOffset.x) / 120
  );

  const rotation = dragOffset.x * 0.07;

  const cardTransform =
    exitDirection === "left"
      ? "translate3d(-150vw, 0px, 0px) rotate(-28deg)"
      : exitDirection === "right"
      ? "translate3d(150vw, 0px, 0px) rotate(28deg)"
      : isDragging ||
        dragOffset.x !== 0 ||
        dragOffset.y !== 0
      ? `translate3d(${dragOffset.x}px, ${
          dragOffset.y * 0.25
        }px, 0px) rotate(${rotation}deg)`
      : "translate3d(0px, 0px, 0px) rotate(0deg)";

  const connectOpacity =
    exitDirection === "right"
      ? 1
      : Math.max(
          0,
          Math.min(
            1,
            (dragOffset.x - 25) / 60
          )
        );

  const rejectOpacity =
    exitDirection === "left"
      ? 1
      : Math.max(
          0,
          Math.min(
            1,
            (-dragOffset.x - 25) / 60
          )
        );

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#9e1b22]">IshqYara</p>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900">Find your Puja person 🪷</h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setSettingsView("main");
              setShowSettings(true);
            }}
            className="w-11 h-11 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-700 hover:text-[#9e1b22] hover:border-red-200 hover:bg-red-50 transition-all active:scale-95"
            aria-label="Open Settings"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#1c1917] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-stone-700 animate-in slide-in-from-top-3 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-xs font-semibold">
              {toastMessage}
            </span>
          </div>
        )}

        {isLoadingProfiles && <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">Finding people for you…</div>}
        {!isLoadingProfiles && profileError && <div role="alert" className="rounded-3xl border border-red-200 bg-white p-8 text-center"><p className="text-sm text-rose-700">{profileError}</p><button className="mt-3 text-sm font-bold text-[#9e1b22]" onClick={() => { if (!user || !publicProfile) return; setIsLoadingProfiles(true); loadDiscoveryDeck(publicProfile).then(setProfiles).catch((error) => setProfileError(error instanceof Error ? error.message : "Could not load discovery profiles.")).finally(() => setIsLoadingProfiles(false)); }}>Try again</button></div>}
        {!isLoadingProfiles && !profileError && profiles.length === 0 && <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center"><h2 className="text-lg font-bold text-stone-900">You’re all caught up 🪷</h2><p className="mt-2 text-sm text-stone-500">There are no eligible profiles to show right now. Check back when more students join.</p></div>}

        {/* Tinder Swipe Deck */}
        {currentProfile && (
          <div className="flex flex-col items-center justify-center pt-1 pb-6">
            <div className="w-full max-w-[390px] sm:max-w-[420px] relative select-none">
              {/* 3D Stack Card 3 */}
              {thirdProfile && (
                <div className="absolute inset-0 h-[490px] xs:h-[530px] sm:h-[590px] md:h-[630px] max-h-[calc(100dvh-200px)] min-h-[450px] rounded-[32px] bg-stone-300/40 border border-stone-300 transform scale-[0.91] translate-y-6 pointer-events-none z-0" />
              )}

              {/* 3D Stack Card 2 */}
              {nextProfile && (
                <div
                  style={{
                    transform: `scale(${
                      0.95 + dragProgress * 0.05
                    }) translateY(${
                      12 - dragProgress * 12
                    }px)`,
                    opacity:
                      0.7 + dragProgress * 0.3,
                    transition: isDragging
                      ? "none"
                      : "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
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
                      <span className="font-medium text-xl">
                        {nextProfile.age}
                      </span>
                    </h3>

                    <p className="text-xs text-stone-300">
                      {nextProfile.area} •{" "}
                      {nextProfile.college}
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

                {/* Match + Intention */}
                <div className="absolute top-7 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-black/45 backdrop-blur-md text-amber-300 border border-amber-400/40 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />

                    <span>
                      {currentProfile.compatibility}% Match
                    </span>
                  </div>

                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-black/45 backdrop-blur-md text-white border border-white/25 shadow-lg">
                    {currentProfile.intention}
                  </div>
                </div>

                {/* LIKE Stamp */}
                {connectOpacity > 0 && (
                  <div
                    style={{
                      opacity: connectOpacity,
                    }}
                    className="absolute top-14 left-6 z-30 pointer-events-none transform -rotate-[16deg] border-[5px] border-emerald-400 bg-emerald-950/60 text-emerald-400 px-4 py-1.5 rounded-2xl font-black text-3xl sm:text-4xl tracking-widest uppercase shadow-2xl backdrop-blur-xs flex items-center gap-2 ring-2 ring-emerald-400/40 animate-in fade-in duration-75"
                  >
                    <Heart className="w-8 h-8 fill-emerald-400 text-emerald-400" />

                    <span>LIKE</span>
                  </div>
                )}

                {/* NOPE Stamp */}
                {rejectOpacity > 0 && (
                  <div
                    style={{
                      opacity: rejectOpacity,
                    }}
                    className="absolute top-14 right-6 z-30 pointer-events-none transform rotate-[16deg] border-[5px] border-rose-500 bg-rose-950/60 text-rose-500 px-4 py-1.5 rounded-2xl font-black text-3xl sm:text-4xl tracking-widest uppercase shadow-2xl backdrop-blur-xs flex items-center gap-2 ring-2 ring-rose-500/40 animate-in fade-in duration-75"
                  >
                    <X className="w-8 h-8 stroke-[3.5] text-rose-500" />

                    <span>NOPE</span>
                  </div>
                )}

                {/* Full Photo */}
                <img
                  src={
                    currentPhotos[photoIndex] ||
                    currentProfile.image
                  }
                  alt={currentProfile.name}
                  draggable={false}
                  className="w-full h-full object-cover select-none pointer-events-none transition-all duration-300"
                />

                {/* Photo Navigation */}
                <div className="absolute inset-x-0 top-14 bottom-44 z-10 flex justify-between items-center px-2 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                  {photoIndex > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        setPhotoIndex((prev) =>
                          Math.max(0, prev - 1)
                        );
                      }}
                      className="w-8 h-8 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:scale-110 active:scale-95 pointer-events-auto transition-transform shadow-lg"
                      title="Previous photo"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                  ) : (
                    <div />
                  )}

                  {photoIndex <
                  currentPhotos.length - 1 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        setPhotoIndex((prev) =>
                          Math.min(
                            currentPhotos.length - 1,
                            prev + 1
                          )
                        );
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
                    {/* Name */}
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
                        onPointerDown={(e) =>
                          e.stopPropagation()
                        }
                        onTouchStart={(e) =>
                          e.stopPropagation()
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFullProfileModal(
                            true
                          );
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

                        {currentProfile.area} •{" "}
                        {currentProfile.distanceKm} km away
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

                    {/* Interests */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentProfile.interests
                        .slice(0, 3)
                        .map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-xs"
                          >
                            {tag}
                          </span>
                        ))}

                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/25 backdrop-blur-md text-amber-200 border border-amber-400/35 shadow-xs">
                        🪷{" "}
                        {
                          currentProfile
                            .pujaPreferences
                            .favoritePandalZone
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Dock */}
              <div className="pt-3 sm:pt-4 pb-1 flex items-center justify-center gap-3.5 sm:gap-5">
                {/* Rewind */}
                <button
                  type="button"
                  onClick={handleRewind}
                  disabled={exitDirection !== null || isSavingAction}
                  className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white text-amber-500 border border-amber-200/90 shadow-md hover:shadow-lg hover:scale-110 active:scale-90 hover:bg-amber-50 transition-all flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none group"
                  title="Rewind"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-rotate-45 transition-transform stroke-[2.5]" />
                </button>

                {/* Nope */}
                <button
                  type="button"
                  onClick={() =>
                    triggerSwipe("left")
                  }
                  disabled={exitDirection !== null || isSavingAction}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-rose-500 border border-rose-200 shadow-lg sm:shadow-xl shadow-rose-500/15 hover:shadow-2xl hover:scale-110 active:scale-90 hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center justify-center group"
                  title="Nope"
                >
                  <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] group-hover:scale-110 transition-transform" />
                </button>

                {/* Like */}
                <button
                  type="button"
                  onClick={() =>
                    triggerSwipe("right")
                  }
                  disabled={exitDirection !== null || isSavingAction}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#9e1b22] to-[#e11d48] text-white shadow-lg sm:shadow-xl shadow-[#9e1b22]/35 hover:shadow-2xl hover:scale-110 active:scale-90 hover:brightness-110 transition-all flex items-center justify-center group"
                  title="Like"
                >
                  <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-white group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {showSettings && (
          <div
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => {
              setShowSettings(false);
              setSettingsView("main");
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-[28px] border border-stone-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                <div>
                  <h2 className="text-lg font-black text-stone-900">Settings</h2>
                  <p className="text-xs text-stone-400">Manage your IshqYara account</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSettings(false);
                    setSettingsView("main");
                  }}
                  className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200"
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {settingsView === "main" && (
                <div className="p-4 space-y-2">
                  <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e7dfd5] flex items-center gap-3 mb-3">
                    {authAvatarUrl(user) ? (
                      <img src={authAvatarUrl(user)} alt="Your profile" className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-100 text-[#9e1b22] flex items-center justify-center font-black">
                        {(authDisplayName(user) || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-stone-900 truncate">{authDisplayName(user) || "IshqYara User"}</p>
                      <p className="text-xs text-stone-500 truncate">{user.email || "No email available"}</p>
                    </div>
                  </div>

                  <button type="button" onClick={() => setSettingsView("userinfo")} className="w-full p-4 rounded-2xl hover:bg-stone-50 flex items-center gap-3 text-left transition-colors">
                    <UserIcon className="w-5 h-5 text-[#9e1b22]" />
                    <span className="flex-1"><span className="block text-sm font-bold text-stone-900">User Info</span><span className="block text-xs text-stone-500">Your signed-in account details</span></span>
                  </button>

                  <div className="w-full p-4 rounded-2xl bg-stone-50 flex items-center gap-3 text-left">
                    <LifeBuoy className="w-5 h-5 text-[#9e1b22]" />
                    <span className="flex-1"><span className="block text-sm font-bold text-stone-900">Support and Feedback</span><span className="block text-xs text-stone-500">No support destination is configured for this project.</span></span>
                  </div>

                  <button type="button" onClick={() => setSettingsView("privacy")} className="w-full p-4 rounded-2xl hover:bg-stone-50 flex items-center gap-3 text-left transition-colors">
                    <ShieldCheck className="w-5 h-5 text-[#9e1b22]" />
                    <span className="flex-1"><span className="block text-sm font-bold text-stone-900">Privacy Policy</span><span className="block text-xs text-stone-500">How IshqYara handles your information</span></span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>

                  <button type="button" onClick={() => setSettingsView("about")} className="w-full p-4 rounded-2xl hover:bg-stone-50 flex items-center gap-3 text-left transition-colors">
                    <Code2 className="w-5 h-5 text-[#9e1b22]" />
                    <span className="flex-1"><span className="block text-sm font-bold text-stone-900">About Developers</span><span className="block text-xs text-stone-500">Meet the team behind IshqYara</span></span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>

                  <div className="pt-2 mt-2 border-t border-stone-100">
                    <button type="button" onClick={() => { setDeleteConfirmation(""); setDeleteError(null); setSettingsView("delete"); }} className="w-full p-4 rounded-2xl hover:bg-red-50 flex items-center gap-3 text-left text-rose-600 transition-colors">
                      <Trash2 className="w-5 h-5" /><span className="text-sm font-bold">Delete account</span>
                    </button>
                    <button type="button" onClick={handleLogout} className="w-full p-4 rounded-2xl hover:bg-red-50 flex items-center gap-3 text-left text-rose-600 transition-colors">
                      <LogOut className="w-5 h-5" />
                      <span className="text-sm font-bold">Logout</span>
                    </button>
                  </div>
                </div>
              )}

              {settingsView === "userinfo" && (
                <div className="p-5 space-y-4">
                  <button type="button" onClick={() => setSettingsView("main")} className="text-xs font-bold text-[#9e1b22]">← Back to Settings</button>
                  <h3 className="text-xl font-black text-stone-900">User Info</h3>
                  <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e7dfd5] space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Name</p>
                    <p className="text-sm font-bold text-stone-900">{authDisplayName(user) || "IshqYara User"}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Email</p>
                    <p className="text-sm font-medium text-stone-700 break-all">{user.email || "No email available"}</p>
                  </div>
                </div>
              )}

              {settingsView === "delete" && (
                <div className="p-5 space-y-4">
                  <button type="button" onClick={() => setSettingsView("main")} className="text-xs font-bold text-[#9e1b22]">← Back to Settings</button>
                  <h3 className="text-xl font-black text-rose-700">Delete your account</h3>
                  <p className="text-sm text-stone-600">This permanently removes your profile, private details, photos, interactions and match conversations, then deletes your sign-in account. Conversation history is removed for both participants. This cannot be undone.</p>
                  <label className="block text-sm font-semibold text-stone-700">Type DELETE to continue<input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-2" autoComplete="off" /></label>
                  {deleteError && <p role="alert" className="text-sm text-rose-700">{deleteError}</p>}
                  <button type="button" onClick={handleDeleteAccount} disabled={deletingAccount || deleteConfirmation !== "DELETE"} className="w-full rounded-xl bg-rose-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{deletingAccount ? "Deleting…" : "Reauthenticate and delete account"}</button>
                  <p className="text-xs text-stone-500">Requires Supabase configuration and recent Google sign-in. If the server reports a failure, your account may require administrator follow-up.</p>
                </div>
              )}

              {settingsView === "privacy" && (
                <div className="p-5 space-y-4">
                  <button type="button" onClick={() => setSettingsView("main")} className="text-xs font-bold text-[#9e1b22]">← Back to Settings</button>
                  <h3 className="text-xl font-black text-stone-900">Privacy Policy</h3>
                  <div className="space-y-3 text-sm leading-relaxed text-stone-600">
                    <p>IshqYara uses your sign-in information to identify your account and provide access to the app.</p>
                    <p>We only request information needed for the features you choose to use. Your profile information should be shared thoughtfully, and you can contact the team for support or data-related requests.</p>
                    <p>Never share passwords, private messages, or sensitive personal information with other users.</p>
                    <p className="text-xs text-stone-400">This is the initial app privacy notice and should be replaced with the team&apos;s final legal policy before public launch.</p>
                  </div>
                </div>
              )}

              {settingsView === "about" && (
                <div className="p-5 space-y-4">
                  <button type="button" onClick={() => setSettingsView("main")} className="text-xs font-bold text-[#9e1b22]">← Back to Settings</button>
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#9e1b22] flex items-center justify-center"><Code2 className="w-7 h-7" /></div>
                  <h3 className="text-xl font-black text-stone-900">About the Developers</h3>
                  <p className="text-sm leading-relaxed text-stone-600">IshqYara is a student-built dating and Puja companion app designed to help college students connect around shared interests, intentions and Puja experiences.</p>
                  <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e7dfd5]">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Built by</p>
                    <p className="mt-1 text-sm font-bold text-stone-900">The IshqYara student developer team</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FULL PROFILE MODAL */}
        {showFullProfileModal &&
          currentProfile && (
            <div
              onClick={() =>
                setShowFullProfileModal(false)
              }
              className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
            >
              <div
                onClick={(e) =>
                  e.stopPropagation()
                }
                className="bg-white w-full sm:max-w-lg h-[86dvh] sm:h-[80vh] max-h-[88dvh] sm:max-h-[82vh] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)]"
              >
                {/* Mobile Handle */}
                <div className="sm:hidden w-full flex justify-center pt-2.5 pb-1 bg-stone-900 shrink-0">
                  <div className="w-12 h-1.5 rounded-full bg-white/40" />
                </div>

                {/* Header Photo */}
                <div className="relative h-48 sm:h-56 w-full bg-stone-900 shrink-0 overflow-hidden">
                  <img
                    src={
                      currentPhotos[
                        photoIndex
                      ] || currentProfile.image
                    }
                    alt={currentProfile.name}
                    className="w-full h-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowFullProfileModal(
                        false
                      )
                    }
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 shadow-md touch-manipulation z-20"
                    aria-label="Close profile details"
                  >
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  {/* Story Indicator */}
                  <div className="absolute bottom-3 left-4 right-4 flex gap-1.5 z-10">
                    {currentPhotos.map(
                      (_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setPhotoIndex(idx)
                          }
                          className={`h-1.5 rounded-full flex-1 transition-all ${
                            idx === photoIndex
                              ? "bg-white shadow-xs"
                              : "bg-white/40"
                          }`}
                          aria-label={`Photo ${
                            idx + 1
                          }`}
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Profile Content */}
                <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 min-h-0 text-stone-900 overscroll-contain touch-pan-y">
                  {/* Name */}
                  <div className="space-y-1.5 border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                        {currentProfile.name},{" "}
                        {currentProfile.age}
                      </h1>

                      {currentProfile.verified && (
                        <CheckCircle2 className="w-6 h-6 text-sky-500 fill-sky-500/20" />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-600">
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#ea580c]" />

                        {currentProfile.area} •{" "}
                        {currentProfile.distanceKm} km away
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

                  {/* Prompts */}
                  {currentProfile.prompts &&
                    currentProfile.prompts.length >
                      0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                          Puja Q&A & Prompts
                        </h4>

                        {currentProfile.prompts.map(
                          (prompt, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 sm:p-4 rounded-2xl bg-[#faf7f2] border border-[#e7dfd5] space-y-1"
                            >
                              <div className="text-xs font-bold text-[#9e1b22]">
                                {
                                  prompt.question
                                }
                              </div>

                              <p className="text-sm text-stone-800 font-medium italic">
                                &ldquo;
                                {
                                  prompt.answer
                                }
                                &rdquo;
                              </p>
                            </div>
                          )
                        )}
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
                        <div className="text-stone-400 text-[10px] uppercase font-bold">
                          Timing
                        </div>

                        <div className="font-bold text-stone-800 mt-0.5">
                          {
                            currentProfile
                              .pujaPreferences
                              .timing
                          }
                        </div>
                      </div>

                      <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                        <div className="text-stone-400 text-[10px] uppercase font-bold">
                          Food Priority
                        </div>

                        <div className="font-bold text-stone-800 mt-0.5">
                          {
                            currentProfile
                              .pujaPreferences
                              .foodPriority
                          }
                        </div>
                      </div>

                      <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                        <div className="text-stone-400 text-[10px] uppercase font-bold">
                          Favorite Zone
                        </div>

                        <div className="font-bold text-stone-800 mt-0.5">
                          {
                            currentProfile
                              .pujaPreferences
                              .favoritePandalZone
                          }
                        </div>
                      </div>

                      <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                        <div className="text-stone-400 text-[10px] uppercase font-bold">
                          Crowd Tolerance
                        </div>

                        <div className="font-bold text-stone-800 mt-0.5">
                          {
                            currentProfile
                              .pujaPreferences
                              .crowdComfort
                          }
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
                        {
                          currentProfile.compatibility
                        }%
                      </span>
                    </div>

                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-[#9e1b22] h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              currentProfile.compatibility
                            )
                          )}%`,
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
                      {currentProfile.interests.map(
                        (tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-xl text-xs font-medium bg-[#faf7f2] text-stone-700 border border-[#e7dfd5]"
                          >
                            {tag}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-100 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowFullProfileModal(
                          false
                        );

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
                        setShowFullProfileModal(
                          false
                        );

                        triggerSwipe("right");
                      }}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#9e1b22] to-[#e11d48] text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation"
                    >
                      <Heart className="w-5 h-5 fill-current" />

                      <span>Like</span>
                    </button>
                  </div>
                  <div className="flex justify-end gap-4 text-xs">
                    <button type="button" className="text-stone-500 hover:text-rose-700" onClick={async () => {
                      if (!user) return;
                      const reason = window.prompt("What would you like to report? Please do not include sensitive personal information.")?.trim();
                      if (!reason) return;
                      try { await recordReport(currentProfile.id, reason); showToast("Report stored privately. This app has no moderation team configured."); }
                      catch (error) { showToast(error instanceof Error ? error.message : "Could not submit your report."); }
                    }}>Report profile</button>
                    <button type="button" className="text-stone-500 hover:text-rose-700" onClick={async () => {
                      if (!user || !window.confirm(`Block ${currentProfile.name}? They will be removed from discovery and your active match list.`)) return;
                      try {
                        await blockUser(currentProfile.id);
                        setProfiles((current) => current.filter((profile) => profile.id !== currentProfile.id));
                        setPhotoIndex(0);
                        setShowFullProfileModal(false);
                        showToast("Profile blocked.");
                      } catch (error) { showToast(error instanceof Error ? error.message : "Could not block this profile."); }
                    }}>Block profile</button>
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
                    {
                      matchedProfile.name.split(
                        " "
                      )[0]
                    }
                  </span>
                </div>
              </div>

              {/* Match Text */}
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-stone-900">
                  Connected with{" "}
                  {matchedProfile.name}!
                </h3>

                <p className="text-xs text-stone-500">
                  {
                    matchedProfile.compatibility
                  }
                  % compatible for{" "}
                  {matchedProfile.intention}.
                </p>
              </div>

              {/* Shared Preference */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium text-left space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <span>
                    🪷 Shared Pandal Preference
                  </span>
                </div>

                <p className="text-[11px] text-amber-800">
                  {
                    matchedProfile
                      .pujaPreferences
                      .favoritePandalZone
                  }{" "}
                  •{" "}
                  {
                    matchedProfile
                      .pujaPreferences
                      .timing
                  }
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
                    nextDeckCard();
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
