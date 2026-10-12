"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Sparkles,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Flame,
  Heart,
  X,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppUser } from "@/components/AppUserContext";
import { createClient } from "@/lib/supabase/client";
import { loadMyConversations } from "@/lib/conversations";
import { loadPublicProfile } from "@/lib/discovery";
import { likeUser, passUser } from "@/lib/interactions";
import type { Profile } from "@/lib/data";

type MatchCardProfile = Profile & { matchId: string };
type RequestCardProfile = Profile & {
  actionState?: "idle" | "accepting" | "declining" | "matched";
  newMatchId?: string | null;
};

export default function MatchesPage() {
  const { user, publicProfile, refreshProfile } = useAppUser();
  const [matches, setMatches] = useState<MatchCardProfile[]>([]);
  const [requests, setRequests] = useState<RequestCardProfile[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!user) return;
    try {
      const records = await loadMyConversations(user.id, publicProfile);
      setMatches(records.map((item) => ({ ...item.profile, matchId: item.matchId })));
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load matches.");
    } finally {
      setLoadingMatches(false);
    }
  }, [user, publicProfile]);

  const fetchIncomingRequests = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/matches/requests");
      if (!res.ok) throw new Error("Could not fetch incoming requests");
      const data = await res.json();
      if (data.ok && Array.isArray(data.senderIds)) {
        const loaded = await Promise.all(
          data.senderIds.map(async (senderId: string) => {
            try {
              return await loadPublicProfile(senderId, publicProfile);
            } catch {
              return null;
            }
          })
        );
        setRequests(loaded.filter((p): p is RequestCardProfile => p !== null));
      }
    } catch {
      // Non-blocking for incoming requests
    } finally {
      setLoadingRequests(false);
    }
  }, [user, publicProfile]);

  const refreshAll = useCallback(async () => {
    setLoadingMatches(true);
    setLoadingRequests(true);
    await Promise.all([fetchMatches(), fetchIncomingRequests()]);
  }, [fetchMatches, fetchIncomingRequests]);

  useEffect(() => {
    if (!user) return;
    void refreshAll();

    const supabase = createClient();
    const channel = supabase
      .channel(`matches-live-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversation_members",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void refreshAll();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, refreshAll]);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#9e1b22", "#ea580c", "#d97706", "#ec4899"],
      });
    } catch {
      // Ignore confetti errors
    }
  };

  const handleAcceptRequest = async (profile: RequestCardProfile) => {
    setRequests((curr) =>
      curr.map((r) => (r.id === profile.id ? { ...r, actionState: "accepting" } : r))
    );
    try {
      const result = await likeUser(profile.id);
      triggerCelebration();

      if (result.matched && result.matchId) {
        setRequests((curr) =>
          curr.map((r) =>
            r.id === profile.id
              ? { ...r, actionState: "matched", newMatchId: result.matchId }
              : r
          )
        );
        setActionFeedback(`You and ${profile.name} are now connected! 🎉`);
      } else {
        setRequests((curr) => curr.filter((r) => r.id !== profile.id));
        setActionFeedback(`Connected with ${profile.name}!`);
      }

      await Promise.all([fetchMatches(), refreshProfile()]);
    } catch (err) {
      setRequests((curr) =>
        curr.map((r) => (r.id === profile.id ? { ...r, actionState: "idle" } : r))
      );
      setActionFeedback(err instanceof Error ? err.message : "Could not complete connection.");
    }
  };

  const handleDeclineRequest = async (profile: RequestCardProfile) => {
    setRequests((curr) =>
      curr.map((r) => (r.id === profile.id ? { ...r, actionState: "declining" } : r))
    );
    try {
      await passUser(profile.id);
      setRequests((curr) => curr.filter((r) => r.id !== profile.id));
      setActionFeedback(`Declined connection with ${profile.name}.`);
    } catch (err) {
      setRequests((curr) =>
        curr.map((r) => (r.id === profile.id ? { ...r, actionState: "idle" } : r))
      );
      setActionFeedback(err instanceof Error ? err.message : "Could not decline connection.");
    }
  };

  const isLoading = loadingMatches || loadingRequests;

  return (
    <AppShell>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Page Top Header */}
        <div className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              Your Connections
            </h1>
          
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void refreshAll()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              title="Refresh matches and requests"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{matches.length} Matches</span>
              {requests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#9e1b22] text-white text-[10px]">
                  +{requests.length} new
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {actionFeedback && (
          <div className="p-3.5 rounded-2xl bg-[#fbebee] border border-[#f3c2c6] text-[#9e1b22] text-xs font-bold flex items-center justify-between animate-in fade-in">
            <span>{actionFeedback}</span>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-stone-500 hover:text-stone-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div role="alert" className="py-4 text-center text-sm font-semibold text-rose-700 bg-rose-50 rounded-2xl border border-rose-200">
            {error}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 1: INCOMING CONNECTION REQUESTS (User A liked User B) */}
        {/* ============================================================== */}
        {requests.length > 0 && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#9e1b22]"></span>
                </span>
                <h2 className="text-lg font-black text-stone-900 tracking-tight">
                  Connection Requests ({requests.length})
                </h2>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                They liked you! Like back to unlock instant chat.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4.5 lg:gap-5">
              {requests.map((profile) => {
                const isAccepting = profile.actionState === "accepting";
                const isDeclining = profile.actionState === "declining";
                const isMatched = profile.actionState === "matched";

                return (
                  <div
                    key={profile.id}
                    className="group relative aspect-[3/4.4] sm:aspect-[3/4.3] rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 border-2 border-rose-300/80 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-end"
                  >
                    {/* Full Bleed Image */}
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Top Floating Badge: "Liked You" */}
                    <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between z-10 gap-1">
                      <div className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-[#9e1b22] text-white shadow-md shadow-[#9e1b22]/30 border border-white/20 shrink-0">
                        <Heart className="w-3 h-3 fill-white text-white" />
                        <span>Liked you</span>
                      </div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/40 shrink-0">
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 fill-amber-400" />
                        <span>{profile.compatibility}%</span>
                      </div>
                    </div>

                    {/* Bottom Vignette & Profile Details */}
                    <div className="relative z-10 bg-gradient-to-t from-black/95 via-black/70 via-45% to-transparent p-3 sm:p-4 lg:p-4.5 flex flex-col justify-end space-y-1.5 sm:space-y-2 text-white">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-xs truncate">
                            {profile.name},{" "}
                            <span className="font-semibold text-sm sm:text-base text-stone-200">
                              {profile.age}
                            </span>
                          </h3>
                          {profile.verified && (
                            <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" />
                          )}
                        </div>
                        {profile.intention && (
                          <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md shrink-0">
                            {profile.intention}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px] text-stone-200">
                        {profile.area && (
                          <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 font-medium truncate">
                            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#ea580c] shrink-0" />
                            <span className="truncate">{profile.area}</span>
                          </span>
                        )}
                        {profile.pujaPreferences?.favoritePandalZone && (
                          <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 font-medium shrink-0">
                            <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                            <span>{profile.pujaPreferences.favoritePandalZone.split(" ")[0]}</span>
                          </span>
                        )}
                      </div>

                      {profile.bio && (
                        <p className="text-[11px] text-stone-200 font-normal line-clamp-1 italic hidden xs:block">
                          &ldquo;{profile.bio}&rdquo;
                        </p>
                      )}

                      {/* Request Action Buttons */}
                      <div className="pt-1 sm:pt-1.5">
                        {isMatched ? (
                          <Link
                            href={`/messages?matchId=${profile.newMatchId || ""}`}
                            className="w-full py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 flex items-center justify-center gap-1.5 shadow-lg animate-in zoom-in-95 duration-200"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Chat Now 💬</span>
                          </Link>
                        ) : (
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                              type="button"
                              onClick={() => void handleDeclineRequest(profile)}
                              disabled={isDeclining || isAccepting}
                              className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                              title="Decline request"
                            >
                              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleAcceptRequest(profile)}
                              disabled={isAccepting || isDeclining}
                              className="flex-1 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-[#9e1b22] to-[#c22830] hover:brightness-110 flex items-center justify-center gap-1 shadow-md active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                            >
                              {isAccepting ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white" />
                                  <span>Like Back</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 2: MUTUAL CONNECTIONS (Both liked each other)         */}
        {/* ============================================================== */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Mutual Matches ({matches.length})</span>
            </h2>
          </div>

          {loadingMatches && (
            <p className="py-12 text-center text-sm text-stone-500">Loading your matches…</p>
          )}

          {!loadingMatches && matches.length === 0 && (
            <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700 text-2xl">
                🪷
              </div>
              <h3 className="text-base font-bold text-stone-900">No mutual matches yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {requests.length > 0
                  ? "You have connection requests waiting above! Like them back to unlock instant chatting."
                  : "Keep swiping on the Partner Finder deck. When someone you like likes you back, they will appear here!"}
              </p>
              {requests.length === 0 && (
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#9e1b22] to-[#c22830] text-white text-xs font-bold shadow-md hover:brightness-105"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Explore Profiles in Partner Finder</span>
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4.5 lg:gap-5">
            {matches.map((profile) => (
              <div
                key={profile.id}
                className="group relative aspect-[3/4.4] sm:aspect-[3/4.3] rounded-2xl sm:rounded-3xl overflow-hidden bg-stone-900 border border-stone-200/80 hover:border-[#9e1b22]/50 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-end"
              >
                {/* Full Bleed Image */}
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Top Floating Match Badge & Intention */}
                <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex items-center justify-between z-10 pointer-events-none gap-1">
                  <div className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black bg-black/55 backdrop-blur-md text-amber-300 border border-amber-400/40 shadow-xs shrink-0">
                    <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{profile.compatibility}%</span>
                  </div>
                  {profile.intention && (
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-md text-white border border-white/20 shadow-xs truncate max-w-[55%]">
                      <span className="truncate">{profile.intention}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Vignette & Profile Details */}
                <div className="relative z-10 bg-gradient-to-t from-black/95 via-black/65 via-45% to-transparent p-3 sm:p-4 lg:p-4.5 flex flex-col justify-end space-y-1.5 sm:space-y-2 text-white">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-xs truncate">
                        {profile.name},{" "}
                        <span className="font-semibold text-sm sm:text-base text-stone-200">
                          {profile.age}
                        </span>
                      </h3>
                      {profile.verified && (
                        <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px] text-stone-200">
                    {profile.area && (
                      <span className="inline-flex items-center gap-1 bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 font-medium truncate max-w-full">
                        <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#ea580c] shrink-0" />
                        <span className="truncate">{profile.area}</span>
                      </span>
                    )}
                    {profile.pujaPreferences?.favoritePandalZone && (
                      <span className="inline-flex items-center gap-1 bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 font-medium shrink-0">
                        <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                        <span>{profile.pujaPreferences.favoritePandalZone.split(" ")[0]}</span>
                      </span>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-[11px] text-stone-200 font-normal line-clamp-1 italic opacity-90 hidden xs:block">
                      &ldquo;{profile.bio}&rdquo;
                    </p>
                  )}

                  {/* Direct Chat Action */}
                  <div className="pt-1">
                    <Link
                      href={`/messages?matchId=${profile.matchId}`}
                      className="w-full py-2 sm:py-2.5 px-3 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-[#9e1b22] to-[#c22830] hover:from-[#83161c] hover:to-[#9e1b22] flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Chat Now 💬</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
