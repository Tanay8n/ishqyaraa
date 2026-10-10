import { createClient } from "@/lib/supabase/client";
import { resolvePhotoURLs } from "@/lib/photos";
import { toUiProfile, type PublicProfileRecord } from "@/lib/schema";
import { fromProfileRow, type ProfileRow } from "@/lib/supabase/profiles";
import type { Profile } from "@/lib/data";

export async function loadDiscoveryDeck(me: PublicProfileRecord): Promise<Profile[]> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Sign in to load discovery profiles.");

  const [profiles, likes, passes, blocks] = await Promise.all([
    supabase.from("profiles").select("*").eq("profile_complete", true).order("created_at", { ascending: false }).limit(200),
    supabase.from("likes").select("target_id").eq("user_id", user.id),
    supabase.from("passes").select("target_id").eq("user_id", user.id),
    supabase.from("blocks").select("blocker_id,blocked_id").or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`),
  ]);
  for (const result of [profiles, likes, passes, blocks]) {
    if (result.error) throw new Error(result.error.message);
  }

  const liked = new Set((likes.data || []).map((row) => row.target_id));
  const passed = new Set((passes.data || []).map((row) => row.target_id));
  const excluded = new Set((blocks.data || []).map((row) => row.blocker_id === user.id ? row.blocked_id : row.blocker_id));
  const eligible = (profiles.data || []).map((row) => ({ uid: row.id as string, record: fromProfileRow(row as ProfileRow) }))
    .filter(({ uid, record }) => {
      if (uid === user.id || !record.profileComplete || record.age < 18) return false;
      if (!record.displayName.trim() || !record.college.trim() || !record.photoURLs.length || !record.lookingFor.length) return false;
      if (!record.lookingFor.includes(me.intention) || !me.lookingFor.includes(record.intention)) return false;
      return !liked.has(uid) && !passed.has(uid) && !excluded.has(uid);
    });

  return Promise.all(eligible.map(async ({ uid, record }) => {
    const photos = await resolvePhotoURLs(record.photoURLs);
    return toUiProfile(uid, { ...record, photoURLs: photos }, me);
  }));
}

export async function loadPublicProfile(uid: string, me?: PublicProfileRecord | null) {
  const { data, error } = await createClient().from("profiles").select("*").eq("id", uid).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.profile_complete) return null;
  const record = fromProfileRow(data as ProfileRow);
  const photos = await resolvePhotoURLs(record.photoURLs);
  return toUiProfile(uid, { ...record, photoURLs: photos }, me || undefined);
}
