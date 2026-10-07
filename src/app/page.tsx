"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { INITIAL_PROFILES, USER_CURRENT_PROFILE, type Profile } from "@/lib/data";

export default function PartnerFinderPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>(INITIAL_PROFILES);
  const [deckIndex, setDeckIndex] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
  const [passedProfiles, setPassedProfiles] = useState<string[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentProfile = profiles[deckIndex % profiles.length];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.65 },
        colors: ["#9e1b22", "#ea580c", "#d97706", "#f59e0b", "#ec4899"],
      });
    } catch {
      // ignore
    }
  };

  // Swipe gesture state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showFullProfileModal, setShowFullProfileModal] = useState(false);

  // Lock body scroll when profile details modal is open
  useEffect(() => {
    if (showFullProfileModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showFullProfileModal]);

  const startPosRef = useRef({ x: 0, y: 0 });
  const isPointerDownRef = useRef(false);
  const isAnimatingRef = useRef(false);

  // Fallback gallery helper to ensure every profile has 2-3 immersive photos
  const getProfilePhotos = (p: Profile): string[] => {
    if (p.photos && p.photos.length > 0) return p.photos;
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
  };

  // Reset swipe & photo position when card changes
  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
    setExitDirection(null);
    setPhotoIndex(0);
    setShowBreakdown(false);
    isAnimatingRef.current = false;
  }, [deckIndex]);

  const handleLike = (profile: Profile) => {
    setLikedProfiles((prev) => [...prev, profile.id]);
    triggerConfetti();
    setMatchedProfile(profile);
  };

  const handlePass = (profile: Profile) => {
    setPassedProfiles((prev) => [...prev, profile.id]);
    showToast(`Nope'd on ${profile.name}`);
    setDeckIndex((prev) => prev + 1);
    setShowBreakdown(false);
  };

  const handleRewind = () => {
    if (deckIndex > 0) {
      setDeckIndex((prev) => prev - 1);
      showToast("Rewound to previous hopper ⏪");
    } else {
      showToast("Already at the start of the deck");
    }
  };

  const triggerSwipe = (direction: "left" | "right") => {
    if (isAnimatingRef.current || !currentProfile) return;
    isAnimatingRef.current = true;
    setExitDirection(direction);

    setTimeout(() => {
      if (direction === "right") {
        handleLike(currentProfile);
      } else {
        handlePass(currentProfile);
      }
      setExitDirection(null);
      setDragOffset({ x: 0, y: 0 });
      isAnimatingRef.current = false;
    }, 280);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || isAnimatingRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return;
    }
    isPointerDownRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || isAnimatingRef.current) return;
    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;

    if (!isDragging && (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6)) {
      setIsDragging(true);
    }

    if (isDragging || Math.abs(deltaX) > 6) {
      setDragOffset({ x: deltaX, y: deltaY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 85;
    if (dragOffset.x > threshold) {
      triggerSwipe("right");
    } else if (dragOffset.x < -threshold) {
      triggerSwipe("left");
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handlePointerCancel = () => {
    isPointerDownRef.current = false;
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const nextDeckCard = () => {
    setDeckIndex((prev) => prev + 1);
    setShowBreakdown(false);
  };

  const restartDeck = () => {
    setDeckIndex(0);
    setPassedProfiles([]);
    showToast("Deck refreshed!");
  };

  // Keyboard navigation for swipe
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchedProfile || isAnimatingRef.current) return;
      if (e.key === "ArrowLeft" && currentProfile) {
        triggerSwipe("left");
      } else if (e.key === "ArrowRight" && currentProfile) {
        triggerSwipe("right");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentProfile, matchedProfile]);

  return (
    <AppShell>
      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-[#1c1917] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 border border-stone-700 animate-in slide-in-from-top-3 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Tinder Swipe Deck */}
        {currentProfile && (() => {
          const photos = getProfilePhotos(currentProfile);
          const nextProfile =
            profiles.length > 1
              ? profiles[(deckIndex + 1) % profiles.length]
              : null;
          const thirdProfile =
            profiles.length > 2
              ? profiles[(deckIndex + 2) % profiles.length]
              : null;
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

          const handleCardTap = (e: React.MouseEvent<HTMLDivElement>) => {
            if (isDragging || Math.abs(dragOffset.x) > 6 || Math.abs(dragOffset.y) > 6) return;
            const target = e.target as HTMLElement;
            if (target.closest("button") || target.closest("a")) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (clickX < rect.width * 0.35) {
              setPhotoIndex((prev) => Math.max(0, prev - 1));
            } else {
              setPhotoIndex((prev) => Math.min(photos.length - 1, prev + 1));
            }
          };

          return (
            <div className="flex flex-col items-center justify-center pt-1 pb-6">
              <div className="w-full max-w-[390px] sm:max-w-[420px] relative select-none">
                {/* 3D Stack Card 3 (Distant background) */}
                {thirdProfile && (
                  <div className="absolute inset-0 h-[490px] xs:h-[530px] sm:h-[590px] md:h-[630px] max-h-[calc(100dvh-200px)] min-h-[450px] rounded-[32px] bg-stone-300/40 border border-stone-300 transform scale-[0.91] translate-y-6 pointer-events-none z-0" />
                )}

                {/* 3D Stack Card 2 (Immediate next profile) */}
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
                        {nextProfile.name}, <span className="font-medium text-xl">{nextProfile.age}</span>
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
                  className={`relative z-10 w-full h-[490px] xs:h-[530px] sm:h-[590px] md:h-[630px] max-h-[calc(100dvh-200px)] min-h-[450px] rounded-[32px] overflow-hidden shadow-[0_24px_50px_-10px_rgba(0,0,0,0.35)] bg-stone-900 border border-white/20 transition-shadow ${
                    isDragging ? "cursor-grabbing shadow-[0_32px_70px_rgba(0,0,0,0.5)]" : "cursor-grab"
                  }`}
                >
                  {/* Top Story Indicator Bars */}
                  <div className="absolute top-3 left-3.5 right-3.5 z-20 flex items-center gap-1.5 pointer-events-none">
                    {photos.map((_, i) => (
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

                  {/* Top Floating Match & Intention Badges */}
                  <div className="absolute top-7 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-black/45 backdrop-blur-md text-amber-300 border border-amber-400/40 shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{currentProfile.compatibility}% Match</span>
                    </div>

                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-black/45 backdrop-blur-md text-white border border-white/25 shadow-lg">
                      {currentProfile.intention}
                    </div>
                  </div>

                  {/* TINDER STAMP: LIKE (Right swipe) */}
                  {connectOpacity > 0 && (
                    <div
                      style={{ opacity: connectOpacity }}
                      className="absolute top-14 left-6 z-30 pointer-events-none transform -rotate-[16deg] border-[5px] border-emerald-400 bg-emerald-950/60 text-emerald-400 px-4 py-1.5 rounded-2xl font-black text-3xl sm:text-4xl tracking-widest uppercase shadow-2xl backdrop-blur-xs flex items-center gap-2 ring-2 ring-emerald-400/40 animate-in fade-in duration-75"
                    >
                      <Heart className="w-8 h-8 fill-emerald-400 text-emerald-400" />
                      <span>LIKE</span>
                    </div>
                  )}

                  {/* TINDER STAMP: NOPE (Left swipe) */}
                  {rejectOpacity > 0 && (
                    <div
                      style={{ opacity: rejectOpacity }}
                      className="absolute top-14 right-6 z-30 pointer-events-none transform rotate-[16deg] border-[5px] border-rose-500 bg-rose-950/60 text-rose-500 px-4 py-1.5 rounded-2xl font-black text-3xl sm:text-4xl tracking-widest uppercase shadow-2xl backdrop-blur-xs flex items-center gap-2 ring-2 ring-rose-500/40 animate-in fade-in duration-75"
                    >
                      <X className="w-8 h-8 stroke-[3.5] text-rose-500" />
                      <span>NOPE</span>
                    </div>
                  )}

                  {/* Full-bleed Photo with Smooth Transition */}
                  <img
                    src={photos[photoIndex] || currentProfile.image}
                    alt={currentProfile.name}
                    draggable={false}
                    className="w-full h-full object-cover select-none pointer-events-none transition-all duration-300"
                  />

                  {/* Desktop Hover Photo Chevrons & Tap Guidance */}
                  <div className="absolute inset-x-0 top-14 bottom-44 z-10 flex justify-between items-center px-2 pointer-events-none opacity-0 hover:opacity-100 sm:group-hover:opacity-100 transition-opacity">
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
                    ) : <div />}

                    {photoIndex < photos.length - 1 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotoIndex((prev) => Math.min(photos.length - 1, prev + 1));
                        }}
                        className="w-8 h-8 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 flex items-center justify-center hover:scale-110 active:scale-95 pointer-events-auto transition-transform shadow-lg"
                        title="Next photo"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : <div />}
                  </div>

                  {/* Bottom Vignette & Profile Details */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 via-35% to-transparent flex flex-col justify-end p-5 sm:p-6 text-white pointer-events-none">
                    <div className="space-y-2 pointer-events-auto">
                      {/* Name, Age, Verified Checkmark & (i) Info Button */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                            {currentProfile.name}, <span className="font-semibold text-2xl sm:text-3xl text-stone-200">{currentProfile.age}</span>
                          </h2>
                          {currentProfile.verified && (
                            <CheckCircle2 className="w-6 h-6 text-sky-400 fill-sky-400/20 drop-shadow-xs" />
                          )}
                        </div>

                        {/* Tinder-style Info Button */}
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

                      {/* Location & College pills */}
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

                      {/* Bio snippet */}
                      <p className="text-xs sm:text-sm text-stone-100 font-normal leading-relaxed line-clamp-2 drop-shadow-xs">
                        "{currentProfile.bio}"
                      </p>

                      {/* Interests / Vibes Frosted Chips */}
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

                {/* TINDER ACTION DOCK: REWIND, NOPE, LIKE */}
                <div className="pt-3 sm:pt-4 pb-1 flex items-center justify-center gap-3.5 sm:gap-5">
                  {/* 1. Rewind / Undo */}
                  <button
                    type="button"
                    onClick={handleRewind}
                    disabled={deckIndex === 0 || exitDirection !== null}
                    className="w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white text-amber-500 border border-amber-200/90 shadow-md hover:shadow-lg hover:scale-110 active:scale-90 hover:bg-amber-50 transition-all flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none group"
                    title="Rewind (Undo last nope)"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-rotate-45 transition-transform stroke-[2.5]" />
                  </button>

                  {/* 2. Nope / Reject */}
                  <button
                    type="button"
                    onClick={() => triggerSwipe("left")}
                    disabled={exitDirection !== null}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-rose-500 border border-rose-200 shadow-lg sm:shadow-xl shadow-rose-500/15 hover:shadow-2xl hover:scale-110 active:scale-90 hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center justify-center group"
                    title="Nope (Swipe Left or Left Arrow)"
                  >
                    <X className="w-7 h-7 sm:w-8 sm:h-8 stroke-[3.5] group-hover:scale-110 transition-transform" />
                  </button>

                  {/* 3. Like / Connect */}
                  <button
                    type="button"
                    onClick={() => triggerSwipe("right")}
                    disabled={exitDirection !== null}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#9e1b22] to-[#e11d48] text-white shadow-lg sm:shadow-xl shadow-[#9e1b22]/35 hover:shadow-2xl hover:scale-110 active:scale-90 hover:brightness-110 transition-all flex items-center justify-center group"
                    title="Like (Swipe Right or Right Arrow)"
                  >
                    <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-white group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TINDER-STYLE FULL PROFILE SLIDE-UP MODAL (Rendered at top level for proper mobile z-index & backdrop) */}
        {showFullProfileModal && currentProfile && (() => {
          const photos = getProfilePhotos(currentProfile);
          return (
            <div
              onClick={() => setShowFullProfileModal(false)}
              className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full sm:max-w-lg h-[86dvh] sm:h-[80vh] max-h-[88dvh] sm:max-h-[82vh] rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom)]"
              >
                {/* Mobile Pull-down Visual Handle */}
                <div className="sm:hidden w-full flex justify-center pt-2.5 pb-1 bg-stone-900 shrink-0">
                  <div className="w-12 h-1.5 rounded-full bg-white/40" />
                </div>

                {/* Header Photo & Close Button */}
                <div className="relative h-48 sm:h-56 w-full bg-stone-900 shrink-0 overflow-hidden">
                  <img
                    src={photos[photoIndex] || currentProfile.image}
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

                  {/* Story indicator inside modal */}
                  <div className="absolute bottom-3 left-4 right-4 flex gap-1.5 z-10">
                    {photos.map((_, idx) => (
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

                {/* Scrollable Profile Content */}
                <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 min-h-0 text-stone-900 overscroll-contain touch-pan-y">
                  {/* Name, Age, Verification */}
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

                  {/* Sharodiya Prompts */}
                  {currentProfile.prompts.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                        Puja Q&A & Prompts
                      </h4>
                      {currentProfile.prompts.map((prompt, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 sm:p-4 rounded-2xl bg-[#faf7f2] border border-[#e7dfd5] space-y-1"
                        >
                          <div className="text-xs font-bold text-[#9e1b22]">
                            {prompt.question}
                          </div>
                          <p className="text-sm text-stone-800 font-medium italic">
                            &ldquo;{prompt.answer}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sharodiya Preferences */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                      <Flame className="w-4 h-4 text-[#ea580c]" />
                      <span>Puja Rhythm</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                        <div className="text-stone-400 text-[10px] uppercase font-bold">Timing</div>
                        <div className="font-bold text-stone-800 mt-0.5">{currentProfile.pujaPreferences.timing}</div>
                      </div>
                      <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                        <div className="text-stone-400 text-[10px] uppercase font-bold">Food Priority</div>
                        <div className="font-bold text-stone-800 mt-0.5">{currentProfile.pujaPreferences.foodPriority}</div>
                      </div>
                      <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                        <div className="text-stone-400 text-[10px] uppercase font-bold">Favorite Zone</div>
                        <div className="font-bold text-stone-800 mt-0.5">{currentProfile.pujaPreferences.favoritePandalZone}</div>
                      </div>
                      <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200/60">
                        <div className="text-stone-400 text-[10px] uppercase font-bold">Crowd Tolerance</div>
                        <div className="font-bold text-stone-800 mt-0.5">{currentProfile.pujaPreferences.crowdComfort}</div>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Alignment */}
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
                        style={{ width: `${currentProfile.compatibility}%` }}
                      />
                    </div>
                  </div>

                  {/* Passions & Interests */}
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

                  {/* Bottom Action Buttons inside Modal */}
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
                        setShowFullProfileModal(false);
                        triggerSwipe("right");
                      }}
                      className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#9e1b22] to-[#e11d48] text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 touch-manipulation"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                      <span>Like</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}


        {/* MATCH CELEBRATION MODAL */}
        {matchedProfile && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-[#e7dfd5] p-6 max-w-sm w-full text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e1b22] px-3 py-1 rounded-full bg-red-50 border border-red-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>It's a Match! 🪷</span>
              </div>

              {/* Avatars Linked */}
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <img
                    src={USER_CURRENT_PROFILE.avatar}
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

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-stone-900">
                  Connected with {matchedProfile.name}!
                </h3>
                <p className="text-xs text-stone-500">
                  {matchedProfile.compatibility}% compatible for {matchedProfile.intention}.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium text-left space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <span>🪷 Shared Pandal Preference</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  {matchedProfile.pujaPreferences.favoritePandalZone} • {matchedProfile.pujaPreferences.timing}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href={`/messages?partner=${matchedProfile.id}`}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#9e1b22] to-[#c22830] hover:from-[#83161c] flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Message</span>
                </Link>

                <button
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
