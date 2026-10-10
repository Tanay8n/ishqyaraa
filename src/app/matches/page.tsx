"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppUser } from "@/components/AppUserContext";
import { createClient } from "@/lib/supabase/client";
import { loadMyConversations } from "@/lib/conversations";
import type { Profile } from "@/lib/data";

type MatchCardProfile = Profile & { matchId: string };

export default function MatchesPage() {
  const { user, publicProfile } = useAppUser();
  const [matches, setMatches] = useState<MatchCardProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const supabase = createClient();
    const refresh = async () => {
      try {
        const records = await loadMyConversations(user.id, publicProfile);
        if (!cancelled) { setMatches(records.map((item) => ({ ...item.profile, matchId: item.matchId }))); setError(null); setLoading(false); }
      } catch (reason) {
        if (!cancelled) { setError(reason instanceof Error ? reason.message : "Could not load matches."); setLoading(false); }
      }
    };
    void refresh();
    const channel = supabase.channel(`matches-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_members", filter: `user_id=eq.${user.id}` }, () => { void refresh(); })
      .subscribe();
    return () => { cancelled = true; void supabase.removeChannel(channel); };
  }, [user, publicProfile]);

  return (
    <AppShell>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              Your Matches <span className="text-2xl">❤️</span>
            </h1>
            <p className="text-stone-500 text-xs mt-1">
              You both liked each other! Start a conversation or coordinate pandal hopping.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{matches.length} Mutual Connections</span>
          </div>
        </div>

        {/* Tinder-style Match Portrait Grid */}
        {loading && <p className="py-16 text-center text-sm text-stone-500">Loading your matches…</p>}
        {error && <p role="alert" className="py-8 text-center text-sm text-rose-700">{error}</p>}
        {!loading && !error && matches.length === 0 && <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">Your mutual matches will appear here when someone you like likes you back.</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-sm sm:max-w-none mx-auto">
          {matches.map((profile) => (
            <div
              key={profile.id}
              className="group relative aspect-[3/4.2] rounded-[28px] overflow-hidden bg-stone-900 border border-stone-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-end"
            >
              {/* Full Bleed Image */}
              <img
                src={profile.image}
                alt={profile.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Top Floating Match Badge & Intention */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-black/50 backdrop-blur-md text-amber-300 border border-amber-400/40 shadow-xs">
                  <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{profile.compatibility}%</span>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/50 backdrop-blur-md text-white border border-white/20 shadow-xs">
                  {profile.intention}
                </div>
              </div>

              {/* Bottom Vignette & Profile Details */}
              <div className="relative z-10 bg-gradient-to-t from-black/95 via-black/60 via-40% to-transparent p-4 sm:p-5 flex flex-col justify-end space-y-2 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xl font-black tracking-tight text-white drop-shadow-xs">
                      {profile.name}, <span className="font-semibold text-lg text-stone-200">{profile.age}</span>
                    </h3>
                    {profile.verified && (
                      <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-200">
                  <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 font-medium">
                    <MapPin className="w-3 h-3 text-[#ea580c]" />
                    {profile.area}
                  </span>
                  <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 font-medium">
                    <Flame className="w-3 h-3 text-amber-400" />
                    {profile.pujaPreferences.favoritePandalZone.split(" ")[0]}
                  </span>
                </div>

                <p className="text-xs text-stone-200 font-normal line-clamp-1 italic">
                  &ldquo;{profile.bio}&rdquo;
                </p>

                {/* Direct Action Link */}
                <div className="pt-1.5">
                  <Link
                    href={`/messages?matchId=${profile.matchId}`}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#9e1b22] to-[#e11d48] hover:from-[#83161c] hover:to-[#9e1b22] flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat Now</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
