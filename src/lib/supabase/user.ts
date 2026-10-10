import type { User } from "@supabase/supabase-js";

export function authDisplayName(user: User | null | undefined) {
  const metadata = user?.user_metadata;
  return typeof metadata?.full_name === "string"
    ? metadata.full_name
    : typeof metadata?.name === "string" ? metadata.name : "";
}

export function authAvatarUrl(user: User | null | undefined) {
  const metadata = user?.user_metadata;
  return typeof metadata?.avatar_url === "string"
    ? metadata.avatar_url
    : typeof metadata?.picture === "string" ? metadata.picture : "";
}
