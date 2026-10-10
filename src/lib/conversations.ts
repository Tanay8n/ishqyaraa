import { createClient } from "@/lib/supabase/client";
import { loadPublicProfile } from "@/lib/discovery";
import type { PublicProfileRecord } from "@/lib/schema";
import type { Profile } from "@/lib/data";

export type AppConversation = { matchId: string; otherUid: string; profile: Profile };
export type AppMessage = { id: string; sender: "me" | "them"; text: string; time: string; createdAt: number };

export async function loadMyConversations(userId: string, me: PublicProfileRecord | null) {
  const { data, error } = await createClient().from("conversation_members")
    .select("conversation_id, conversations!inner(id, match_id, matches!inner(id,user_low,user_high,status))")
    .eq("user_id", userId);
  if (error) throw new Error(error.message || "Could not load conversations.");

  const rows = (data || []) as unknown as {
    conversation_id: string;
    conversations: { id: string; matches: { user_low: string; user_high: string; status: string } };
  }[];
  const open = rows.filter((row) => row.conversations?.matches?.status === "active");
  const conversations = await Promise.all(open.map(async (row) => {
    const match = row.conversations.matches;
    const otherUid = match.user_low === userId ? match.user_high : match.user_low;
    const profile = await loadPublicProfile(otherUid, me);
    return profile ? { matchId: row.conversations.id, otherUid, profile } : null;
  }));
  return conversations.filter((item): item is AppConversation => item !== null);
}

export async function loadConversationMessages(conversationId: string, userId: string): Promise<AppMessage[]> {
  const { data, error } = await createClient().from("messages").select("id,sender_id,body,created_at")
    .eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(100);
  if (error) throw new Error(error.message || "Could not load messages.");
  return (data || []).map((row) => ({
    id: row.id,
    sender: row.sender_id === userId ? "me" : "them",
    text: row.body,
    time: new Date(row.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    createdAt: Date.parse(row.created_at),
  }));
}
