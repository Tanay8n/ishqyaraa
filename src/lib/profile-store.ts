import { createClient } from "@/lib/supabase/client";
import { isAdult, type Intention, type PublicProfileRecord } from "@/lib/schema";

export type ProfileDraft = {
  displayName: string;
  dateOfBirth: string;
  college: string;
  area: string;
  bio: string;
  tagline: string;
  intention: Intention;
  lookingFor: Intention[];
  interests: string[];
  /** Supabase object paths or existing externally hosted photo URLs. */
  photoURLs: string[];
  pujaPreferences?: PublicProfileRecord["pujaPreferences"];
  prompts?: { question: string; answer: string }[];
};

export function validateDraft(draft: ProfileDraft): string | null {
  if (!draft.displayName.trim()) return "Please add your display name.";
  if (!draft.dateOfBirth) return "Please add your date of birth.";
  if (!isAdult(draft.dateOfBirth)) return "IshqYara is for adults aged 18 and above.";
  if (!draft.college.trim()) return "Please add your college or university.";
  if (!draft.area.trim()) return "Please add your neighborhood / area.";
  if (!draft.intention) return "Please choose what you are looking for.";
  if (!draft.photoURLs.length) return "Please add at least one photo so other students can recognise you.";
  return null;
}

export async function loadMyPrivateProfile(uid: string) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.id !== uid) throw new Error("You can only load your own private profile.");
  const { data, error } = await supabase.from("profile_private").select("date_of_birth").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? { dateOfBirth: data.date_of_birth } : null;
}
