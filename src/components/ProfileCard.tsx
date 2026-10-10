"use client";

import React, { useState, useRef } from "react";
import {
  Heart,
  X,
  MapPin,
  GraduationCap,
  Sparkles,
  Flame,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import type { Profile } from "@/lib/data";

interface ProfileCardProps {
  profile: Profile;
  onLike?: (profile: Profile) => void;
  onPass?: (profile: Profile) => void;
  compact?: boolean;
}

export function ProfileCard(props: ProfileCardProps) {
  return <ProfileCardContent key={props.profile.id} {...props} />;
}

function ProfileCardContent({
  profile,
  onLike,
  onPass,
  compact = false,
}: ProfileCardProps) {
  const [liked, setLiked] = useState(false);
  const [passed, setPassed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Fallback gallery helper to ensure every profile has 2-3 immersive photos
  const photos = profile.photos && profile.photos.length > 0
    ? profile.photos
    : [
        profile.image,
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
      ];

  // Swipe gesture state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);

  const startPosRef = useRef({ x: 0, y: 0 });
  const isPointerDownRef = useRef(false);
  const isAnimatingRef = useRef(false);

  const triggerSwipe = (direction: "left" | "right") => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setExitDirection(direction);

    setTimeout(() => {
      if (direction === "right") {
        setLiked(true);
        setPassed(false);
        if (onLike) onLike(profile);
      } else if (direction === "left") {
        setPassed(true);
        setLiked(false);
        if (onPass) onPass(profile);
      }
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

  // Card transform calculation
  const rotation = dragOffset.x * 0.08;
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
    <div
      className={`relative select-none ${
        compact ? "w-full max-w-[340px]" : "w-full max-w-[400px]"
      } mx-auto`}
    >
      {/* Tinder Card Container */}
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
        className={`relative aspect-[3/4.4] sm:aspect-[3/4.5] w-full rounded-[30px] overflow-hidden shadow-[0_20px_45px_-10px_rgba(0,0,0,0.3)] bg-stone-900 border border-white/20 transition-shadow ${
          isDragging ? "cursor-grabbing shadow-[0_28px_60px_rgba(0,0,0,0.45)]" : "cursor-grab"
        }`}
      >
        {/* Story Progress Bars */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-1.5 pointer-events-none">
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

        {/* Top Badges */}
        <div className="absolute top-7 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-black/45 backdrop-blur-md text-amber-300 border border-amber-400/40 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{profile.compatibility}% Match</span>
          </div>

          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-black/45 backdrop-blur-md text-white border border-white/25 shadow-lg">
            {profile.intention}
          </div>
        </div>

        {/* STAMP: LIKE (Right swipe) */}
        {connectOpacity > 0 && (
          <div
            style={{ opacity: connectOpacity }}
            className="absolute top-14 left-5 z-30 pointer-events-none transform -rotate-[15deg] border-[4px] border-emerald-400 bg-emerald-950/60 text-emerald-400 px-3.5 py-1 rounded-2xl font-black text-2xl sm:text-3xl tracking-widest uppercase shadow-2xl backdrop-blur-xs flex items-center gap-2 ring-2 ring-emerald-400/40 animate-in fade-in duration-75"
          >
            <Heart className="w-6 h-6 fill-emerald-400 text-emerald-400" />
            <span>LIKE</span>
          </div>
        )}

        {/* STAMP: NOPE (Left swipe) */}
        {rejectOpacity > 0 && (
          <div
            style={{ opacity: rejectOpacity }}
            className="absolute top-14 right-5 z-30 pointer-events-none transform rotate-[15deg] border-[4px] border-rose-500 bg-rose-950/60 text-rose-500 px-3.5 py-1 rounded-2xl font-black text-2xl sm:text-3xl tracking-widest uppercase shadow-2xl backdrop-blur-xs flex items-center gap-2 ring-2 ring-rose-500/40 animate-in fade-in duration-75"
          >
            <X className="w-6 h-6 stroke-[3.5] text-rose-500" />
            <span>NOPE</span>
          </div>
        )}

        {/* Full-bleed Photo */}
        <img
          src={photos[photoIndex] || profile.image}
          alt={profile.name}
          draggable={false}
          className="w-full h-full object-cover select-none pointer-events-none transition-all duration-300"
        />

        {/* Tap area indicator for desktop hover */}
        <div className="absolute inset-y-16 left-0 w-1/3 flex items-center pl-2 opacity-0 hover:opacity-70 transition-opacity z-10 pointer-events-none">
          {photoIndex > 0 && (
            <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center">
              <ChevronLeft className="w-5 h-5" />
            </div>
          )}
        </div>
        <div className="absolute inset-y-16 right-0 w-1/3 flex items-center justify-end pr-2 opacity-0 hover:opacity-70 transition-opacity z-10 pointer-events-none">
          {photoIndex < photos.length - 1 && (
            <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center">
              <ChevronRight className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Bottom Vignette & Profile Details */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 via-35% to-transparent flex flex-col justify-end p-5 text-white pointer-events-none">
          <div className="space-y-2 pointer-events-auto">
            {/* Name, Age, Verified Checkmark & (i) Info Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
                  {profile.name}, <span className="font-semibold text-xl sm:text-2xl text-stone-200">{profile.age}</span>
                </h2>
                {profile.verified && (
                  <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20 drop-shadow-xs" />
                )}
              </div>

              {/* Info Button with mobile-friendly touch targets */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInfo(!showInfo);
                }}
                className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-white/25 hover:bg-white/40 active:bg-white/50 backdrop-blur-md flex items-center justify-center text-white border border-white/35 transition-all active:scale-95 shadow-md group touch-manipulation cursor-pointer z-30"
                title="Toggle details"
                aria-label="Toggle profile details"
              >
                <Info className="w-5 h-5 stroke-[2.5] group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Location & College pills */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-stone-200">
              <span className="flex items-center gap-1 font-medium bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                <MapPin className="w-3 h-3 text-[#ea580c]" />
                {profile.area} • {profile.distanceKm} km away
              </span>
              <span className="flex items-center gap-1 font-medium bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10">
                <GraduationCap className="w-3 h-3 text-stone-300" />
                {profile.college}
              </span>
            </div>

            {/* Bio snippet */}
            <p className="text-xs sm:text-sm text-stone-100 font-normal leading-relaxed line-clamp-2 drop-shadow-xs">
              &ldquo;{profile.bio}&rdquo;
            </p>

            {/* Interests Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.interests.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20 shadow-xs"
                >
                  {tag}
                </span>
              ))}
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/25 backdrop-blur-md text-amber-200 border border-amber-400/35 shadow-xs">
                🪷 {profile.pujaPreferences.favoritePandalZone.split(" ")[0]}
              </span>
            </div>
          </div>
        </div>

        {/* Full Details Scrollable Overlay when (i) Info is clicked */}
        {showInfo && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 z-40 bg-stone-950/95 backdrop-blur-xl text-white flex flex-col rounded-[30px] overflow-hidden animate-in fade-in duration-200"
          >
            {/* Overlay Header with Close Button */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-stone-900/70">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  {profile.name}, {profile.age}
                </h3>
                {profile.verified && (
                  <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                title="Close details"
                aria-label="Close profile details"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable details container */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 overscroll-contain touch-pan-y text-xs">
              {/* Location & College & Compatibility */}
              <div className="flex flex-wrap items-center gap-2 text-stone-300">
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
                  <MapPin className="w-3 h-3 text-[#ea580c]" />
                  {profile.area} • {profile.distanceKm} km
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
                  <GraduationCap className="w-3 h-3 text-stone-300" />
                  {profile.college}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  {profile.compatibility}% Match
                </span>
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">About</div>
                <p className="text-stone-200 leading-relaxed font-normal bg-white/5 p-3 rounded-xl border border-white/10 italic">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              </div>

              {/* Puja Preferences */}
              <div className="space-y-2 bg-gradient-to-br from-amber-950/40 to-stone-900/60 p-3 rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px] uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-[#ea580c]" />
                  <span>Sharodiya Vibes</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-black/30 p-2 rounded-lg">
                    <div className="text-stone-400 text-[9px] uppercase font-bold">Zone</div>
                    <div className="font-semibold text-stone-200 mt-0.5">{profile.pujaPreferences.favoritePandalZone}</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg">
                    <div className="text-stone-400 text-[9px] uppercase font-bold">Timing</div>
                    <div className="font-semibold text-stone-200 mt-0.5">{profile.pujaPreferences.timing}</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg">
                    <div className="text-stone-400 text-[9px] uppercase font-bold">Food</div>
                    <div className="font-semibold text-stone-200 mt-0.5">{profile.pujaPreferences.foodPriority}</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg">
                    <div className="text-stone-400 text-[9px] uppercase font-bold">Crowd</div>
                    <div className="font-semibold text-stone-200 mt-0.5">{profile.pujaPreferences.crowdComfort}</div>
                  </div>
                </div>
              </div>

              {/* Prompts */}
              {profile.prompts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Prompts</div>
                  {profile.prompts.map((p, idx) => (
                    <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                      <div className="text-[10px] uppercase font-bold text-amber-400">
                        {p.question}
                      </div>
                      <div className="text-stone-200 italic font-medium">
                        &ldquo;{p.answer}&rdquo;
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Interests */}
              <div className="space-y-1.5 pb-2">
                <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Interests</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 text-stone-200 border border-white/15"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3-BUTTON TINDER DOCK: REWIND, NOPE, LIKE */}
      <div className="pt-4 pb-1 flex items-center justify-center gap-4">
        {/* Rewind */}
        <button
          type="button"
          onClick={() => {
            setLiked(false);
            setPassed(false);
            setExitDirection(null);
            setDragOffset({ x: 0, y: 0 });
          }}
          disabled={!liked && !passed}
          className="w-12 h-12 rounded-full bg-white text-amber-500 border border-amber-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-90 hover:bg-amber-50 transition-all flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
          title="Rewind"
        >
          <RotateCcw className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Nope */}
        <button
          type="button"
          onClick={() => triggerSwipe("left")}
          disabled={passed || exitDirection !== null}
          className="w-15 h-15 rounded-full bg-white text-rose-500 border border-rose-200 shadow-xl shadow-rose-500/15 hover:shadow-2xl hover:scale-110 active:scale-90 hover:bg-rose-50 hover:border-rose-300 transition-all flex items-center justify-center"
          title="Nope"
        >
          <X className="w-8 h-8 stroke-[3.5]" />
        </button>

        {/* Like */}
        <button
          type="button"
          onClick={() => triggerSwipe("right")}
          disabled={liked || exitDirection !== null}
          className="w-15 h-15 rounded-full bg-gradient-to-tr from-[#9e1b22] to-[#e11d48] text-white shadow-xl shadow-[#9e1b22]/35 hover:shadow-2xl hover:scale-110 active:scale-90 hover:brightness-110 transition-all flex items-center justify-center"
          title="Like"
        >
          <Heart className="w-8 h-8 fill-white" />
        </button>
      </div>
    </div>
  );
}
