"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { fromProfileRow, type ProfileRow } from "@/lib/supabase/profiles";
import { resolvePhotoURLs } from "@/lib/photos";
import { toUiProfile, type PublicProfileRecord } from "@/lib/schema";
import { validateDraft, type ProfileDraft } from "@/lib/profile-store";
import type { Profile } from "@/lib/data";

type AuthStatus = "loading" | "signedOut" | "needsProfile" | "ready" | "dataError";

type AppUserContextValue = {
  status: AuthStatus;
  user: User | null;
  publicProfile: PublicProfileRecord | null;
  privateDob: string | null;
  uiProfile: Profile | null;
  unreadTotal: number;
  matchCount: number;
  matchesLoadError: string | null;
  signInError: string | null;
  dataError: string | null;
  signingIn: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  saveProfile: (draft: ProfileDraft) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AppUserContext = createContext<AppUserContextValue | null>(null);
const INITIAL_PROFILE_TIMEOUT_MS = 12_000;
const INITIAL_AUTH_TIMEOUT_MS = 12_000;

async function readOwnProfile(uid: string) {
  const supabase = createClient();
  const [profileResult, privateResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
    supabase.from("profile_private").select("date_of_birth").eq("user_id", uid).maybeSingle(),
  ]);
  if (profileResult.error) throw new Error(profileResult.error.message);
  if (privateResult.error) throw new Error(privateResult.error.message);
  if (profileResult.data?.profile_complete && !privateResult.data?.date_of_birth) {
    throw new Error("Your private date of birth is missing. Contact the project administrator before editing your profile.");
  }
  return {
    profile: profileResult.data ? fromProfileRow(profileResult.data as ProfileRow) : null,
    privateDob: privateResult.data?.date_of_birth || null,
  };
}

export function AppUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const currentUserId = useRef<string | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [profileResolved, setProfileResolved] = useState(false);
  const [publicProfile, setPublicProfile] = useState<PublicProfileRecord | null>(null);
  const [privateDob, setPrivateDob] = useState<string | null>(null);
  const [ownPhotoURLs, setOwnPhotoURLs] = useState<string[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [matchesLoadError, setMatchesLoadError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase may redirect OAuth-provider errors through a URL fragment.
    // Some provider error descriptions can include authorization details, so
    // remove error fragments from the address bar and history immediately.
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    if (fragment.has("error") || fragment.has("error_code") || fragment.has("error_description")) {
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}`);
    }
    const authError = new URLSearchParams(window.location.search).get("authError");
    if (authError === "supabase-not-configured") queueMicrotask(() => setSignInError("Add the Supabase URL and publishable key to .env.local, then restart Next.js."));
    else if (authError) queueMicrotask(() => setSignInError("Google sign-in could not be completed. Check the Supabase and Google OAuth redirect settings, then try again."));
    if (!hasSupabaseConfig()) {
      queueMicrotask(() => {
        setAuthResolved(true);
        setProfileResolved(true);
        setSignInError("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local.");
      });
      return;
    }

    const supabase = createClient();
    let active = true;
    let authReadSettled = false;
    const applyUser = (nextUser: User | null) => {
      if (currentUserId.current !== (nextUser?.id || null)) {
        currentUserId.current = nextUser?.id || null;
        setProfileResolved(!nextUser);
        setPublicProfile(null);
        setPrivateDob(null);
        setOwnPhotoURLs([]);
        setProfileLoadError(null);
        setMatchesLoadError(null);
        setUnreadTotal(0);
        setMatchCount(0);
      }
      setUser(nextUser);
      setAuthResolved(true);
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      applyUser(session?.user || null);
    });
    const authTimeout = window.setTimeout(() => {
      if (!active || authReadSettled) return;
      authReadSettled = true;
      setSignInError("Your saved session could not be restored. Check your connection and try signing in again.");
      applyUser(null);
    }, INITIAL_AUTH_TIMEOUT_MS);
    void supabase.auth.getUser().then(({ data, error }) => {
      if (!active || authReadSettled) return;
      authReadSettled = true;
      window.clearTimeout(authTimeout);
      if (error && error.name !== "AuthSessionMissingError") {
        setSignInError("Your saved session could not be restored. Please sign in again.");
      }
      applyUser(data.user || null);
    }).catch(() => {
      if (!active || authReadSettled) return;
      authReadSettled = true;
      window.clearTimeout(authTimeout);
      setSignInError("Your saved session could not be restored. Please sign in again.");
      setAuthResolved(true);
      setProfileResolved(true);
    });
    return () => { active = false; window.clearTimeout(authTimeout); subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    let finished = false;
    const timeout = window.setTimeout(() => {
      if (!active || finished) return;
      finished = true;
      setProfileLoadError("Your profile request timed out. Check your connection and Supabase setup, then retry.");
      setProfileResolved(true);
    }, INITIAL_PROFILE_TIMEOUT_MS);

    void readOwnProfile(user.id).then(({ profile, privateDob: dob }) => {
      if (!active || finished) return;
      finished = true;
      window.clearTimeout(timeout);
      setPublicProfile(profile);
      setPrivateDob(dob);
      setProfileLoadError(null);
      if (!profile) setOwnPhotoURLs([]);
      else void resolvePhotoURLs(profile.photoURLs).then((urls) => { if (active) setOwnPhotoURLs(urls); }).catch(() => { if (active) setOwnPhotoURLs([]); });
    }).catch((error: unknown) => {
      if (!active || finished) return;
      finished = true;
      window.clearTimeout(timeout);
      setProfileLoadError(error instanceof Error ? error.message : "Could not load your profile. Try again.");
    }).finally(() => { if (active) setProfileResolved(true); });

    return () => { active = false; window.clearTimeout(timeout); };
  }, [user]);

  useEffect(() => {
    if (!user || !hasSupabaseConfig()) return;
    const supabase = createClient();
    let active = true;
    const refreshCounts = async () => {
      const [matches, members] = await Promise.all([
        supabase.from("matches").select("id").eq("status", "active").or(`user_low.eq.${user.id},user_high.eq.${user.id}`),
        supabase.from("conversation_members").select("unread_count").eq("user_id", user.id),
      ]);
      if (!active) return;
      if (matches.error || members.error) {
        setMatchesLoadError("Match and unread counts could not be refreshed. You can continue using your profile.");
        return;
      }
      setMatchesLoadError(null);
      setMatchCount(matches.data?.length || 0);
      setUnreadTotal((members.data || []).reduce((sum, row) => sum + Number(row.unread_count || 0), 0));
    };
    void refreshCounts();
    const channel = supabase.channel(`account-summary-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_members", filter: `user_id=eq.${user.id}` }, () => { void refreshCounts(); })
      .subscribe();
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const result = await readOwnProfile(user.id);
    setPublicProfile(result.profile);
    setPrivateDob(result.privateDob);
    setOwnPhotoURLs(result.profile ? await resolvePhotoURLs(result.profile.photoURLs) : []);
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    if (signingIn) return;
    setSigningIn(true);
    setSignInError(null);
    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=%2F`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (error) {
      setSignInError(error instanceof Error ? error.message : "Google sign-in could not be started.");
      setSigningIn(false);
    }
  }, [signingIn]);

  const logout = useCallback(async () => {
    const { error } = await createClient().auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null);
  }, []);

  const saveProfile = useCallback(async (draft: ProfileDraft) => {
    if (!user) throw new Error("You need to be signed in.");
    const validation = validateDraft(draft);
    if (validation) throw new Error(validation);
    const { error } = await createClient().rpc("save_my_profile", {
      p_profile: {
        displayName: draft.displayName,
        college: draft.college,
        area: draft.area,
        bio: draft.bio,
        tagline: draft.tagline,
        intention: draft.intention,
        lookingFor: draft.lookingFor,
        interests: draft.interests,
        photoURLs: draft.photoURLs,
        pujaPreferences: draft.pujaPreferences,
        prompts: draft.prompts,
      },
      p_date_of_birth: draft.dateOfBirth,
    });
    if (error) throw new Error(error.message || "Could not save your profile.");
    await refreshProfile();
  }, [user, refreshProfile]);

  const baseUiProfile = useMemo(() => user && publicProfile ? toUiProfile(user.id, publicProfile, publicProfile) : null, [user, publicProfile]);
  const uiProfile = useMemo(() => baseUiProfile ? {
    ...baseUiProfile,
    image: ownPhotoURLs[0] || "",
    photos: ownPhotoURLs,
  } : null, [baseUiProfile, ownPhotoURLs]);
  const dataError = profileLoadError;
  const status: AuthStatus = !authResolved || (user !== null && !profileResolved)
    ? "loading"
    : !user ? "signedOut"
    : dataError ? "dataError"
    : publicProfile?.profileComplete ? "ready" : "needsProfile";

  const value = useMemo(() => ({
    status, user, publicProfile, privateDob, uiProfile, unreadTotal, matchCount,
    matchesLoadError, signInError, dataError, signingIn, signInWithGoogle,
    logout, saveProfile, refreshProfile,
  }), [status, user, publicProfile, privateDob, uiProfile, unreadTotal, matchCount, matchesLoadError, signInError, dataError, signingIn, signInWithGoogle, logout, saveProfile, refreshProfile]);

  return <AppUserContext.Provider value={value}>{children}</AppUserContext.Provider>;
}

export function useAppUser() {
  const context = useContext(AppUserContext);
  if (!context) throw new Error("useAppUser must be used inside AppUserProvider");
  return context;
}
