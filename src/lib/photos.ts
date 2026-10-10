import { ALLOWED_PHOTO_TYPES, MAX_PHOTO_BYTES, MAX_PHOTOS } from "@/lib/schema";
import { createClient } from "@/lib/supabase/client";

export const PROFILE_PHOTO_BUCKET = "profile-photos";
const SIGNED_URL_SECONDS = 60 * 60;

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    throw new Error("Please choose a JPEG, PNG, or WebP image.");
  }
  if (file.size > MAX_PHOTO_BYTES) {
    throw new Error("Please keep each photo under 5 MB.");
  }
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.id !== uid) throw new Error("Sign in again before uploading this photo.");

  const safeName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
  const path = `${uid}/${safeName}`;
  const { error } = await supabase.storage.from(PROFILE_PHOTO_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message || "Could not upload photo.");
  return `${PROFILE_PHOTO_BUCKET}/${path}`;
}

export async function resolvePhotoURLs(photoURLs: string[]): Promise<string[]> {
  const supabasePaths = photoURLs.map((value) => value.startsWith(`${PROFILE_PHOTO_BUCKET}/`) ? value.slice(PROFILE_PHOTO_BUCKET.length + 1) : null);
  const paths = supabasePaths.filter((value): value is string => value !== null);
  if (!paths.length) return photoURLs;

  const { data, error } = await createClient().storage.from(PROFILE_PHOTO_BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS);
  if (error || !data) throw new Error(error?.message || "Could not load profile photos.");
  const signed = new Map(data.flatMap((item) => item.path && item.signedUrl ? [[item.path, item.signedUrl] as const] : []));
  return photoURLs.map((value, index) => {
    const path = supabasePaths[index];
    return path ? signed.get(path) || "" : value;
  });
}

export async function removeProfilePhoto(value: string, uid: string) {
  const prefix = `${PROFILE_PHOTO_BUCKET}/${uid}/`;
  if (!value.startsWith(prefix)) return;
  const path = value.slice(PROFILE_PHOTO_BUCKET.length + 1);
  const { error } = await createClient().storage.from(PROFILE_PHOTO_BUCKET).remove([path]);
  if (error) throw new Error(error.message || "Could not remove photo.");
}

export async function removeOwnProfilePhotos(uid: string) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.id !== uid) throw new Error("Sign in again before removing these photos.");
  const { data, error } = await supabase.storage.from(PROFILE_PHOTO_BUCKET).list(uid, { limit: 100 });
  if (error) throw new Error(error.message || "Could not list profile photos.");
  const paths = (data || []).map((item) => `${uid}/${item.name}`);
  if (!paths.length) return;
  const { error: removeError } = await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove(paths);
  if (removeError) throw new Error(removeError.message || "Could not remove profile photos.");
}

export function canAddPhoto(currentCount: number) {
  return currentCount < MAX_PHOTOS;
}
