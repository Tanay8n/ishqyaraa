import { createClient } from "@/lib/supabase/client";
import { loadPublicProfile } from "@/lib/discovery";
import type { PublicProfileRecord } from "@/lib/schema";
import type { Profile } from "@/lib/data";

export type AppConversation = {
  matchId: string;
  otherUid: string;
  profile: Profile;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  lastSenderId?: string | null;
  unreadCount?: number;
  createdAt?: string | null;
};
export type AppMessage = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  createdAt: number;
  status?: "sent" | "delivered" | "read";
};

export function enrichMessageStatuses(
  messages: AppMessage[],
  partnerLastReadAt: number | null,
  partnerUnreadCount: number
): AppMessage[] {
  const lastThemIndex = messages.map((m) => m.sender).lastIndexOf("them");
  const lastThemTime = lastThemIndex >= 0 ? messages[lastThemIndex].createdAt : 0;

  let remainingUnread = partnerUnreadCount;
  const result: AppMessage[] = new Array(messages.length);

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.sender === "them") {
      result[i] = msg;
      continue;
    }

    let isRead = false;
    // 1. If recipient sent a message at or after this message, they definitely saw it
    if (i <= lastThemIndex || msg.createdAt <= lastThemTime) {
      isRead = true;
    }
    // 2. If recipient has unread messages, the latest ones sent by "me" are still unread (delivered)
    else if (remainingUnread > 0) {
      isRead = false;
      remainingUnread--;
    }
    // 3. If recipient has opened the chat after this message was sent
    else if (partnerLastReadAt && partnerLastReadAt >= msg.createdAt) {
      isRead = true;
    }
    // 4. Default: delivered (double grey tick), never prematurely marked as read
    else {
      isRead = false;
    }

    result[i] = {
      ...msg,
      status: isRead ? "read" : "delivered",
    };
  }

  return result;
}

export {
  formatConversationTime,
  formatMessageTime,
  formatChatDateHeader,
  isDifferentChatDay,
} from "./time";

export async function loadMyConversations(
  userId: string,
  me: PublicProfileRecord | null
): Promise<AppConversation[]> {
  const { data, error } = await createClient()
    .from("conversation_members")
    .select(
      "conversation_id, unread_count, last_read_at, conversations!inner(id, match_id, last_message, last_message_at, last_sender_id, created_at, matches!inner(id, user_low, user_high, status, created_at))"
    )
    .eq("user_id", userId);
  if (error) throw new Error(error.message || "Could not load conversations.");

  const rows = (data || []) as unknown as {
    conversation_id: string;
    unread_count?: number;
    last_read_at?: string | null;
    conversations: {
      id: string;
      match_id: string;
      last_message?: string | null;
      last_message_at?: string | null;
      last_sender_id?: string | null;
      created_at?: string | null;
      matches: {
        id: string;
        user_low: string;
        user_high: string;
        status: string;
        created_at?: string | null;
      };
    };
  }[];
  const open = rows.filter((row) => row.conversations?.matches?.status === "active");
  const conversations = await Promise.all(
    open.map(async (row) => {
      const match = row.conversations.matches;
      const otherUid = match.user_low === userId ? match.user_high : match.user_low;
      const profile = await loadPublicProfile(otherUid, me);
      if (!profile) return null;
      return {
        matchId: row.conversations.id,
        otherUid,
        profile,
        lastMessage: row.conversations.last_message || null,
        lastMessageAt: row.conversations.last_message_at || null,
        lastSenderId: row.conversations.last_sender_id || null,
        unreadCount: typeof row.unread_count === "number" ? row.unread_count : 0,
        createdAt: row.conversations.created_at || match.created_at || null,
      };
    })
  );

  const valid: AppConversation[] = [];
  for (const item of conversations) {
    if (item) {
      valid.push(item);
    }
  }

  // Sort with most recently active chat (latest message, or match creation) on top
  valid.sort((a, b) => {
    const timeA = a.lastMessageAt ? Date.parse(a.lastMessageAt) : (a.createdAt ? Date.parse(a.createdAt) : 0);
    const timeB = b.lastMessageAt ? Date.parse(b.lastMessageAt) : (b.createdAt ? Date.parse(b.createdAt) : 0);
    return timeB - timeA;
  });

  return valid;
}

export async function loadConversationMessages(conversationId: string, userId: string): Promise<AppMessage[]> {
  try {
    const res = await fetch(`/api/conversations/messages?conversationId=${encodeURIComponent(conversationId)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.ok && Array.isArray(json.messages)) {
        const enriched = enrichMessageStatuses(
          json.messages,
          json.partnerLastReadAt ? Date.parse(json.partnerLastReadAt) : null,
          json.partnerUnreadCount ?? 0
        );
        return enriched.map((m) => ({
          ...m,
          time: formatMessageTime(m.createdAt) || m.time,
        }));
      }
    }
  } catch {
    // API route fetch failed, fallback to direct Supabase client
  }

  const { data, error } = await createClient().from("messages").select("id,sender_id,body,created_at")
    .eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(100);
  if (error) throw new Error(error.message || "Could not load messages.");
  const mapped: AppMessage[] = (data || []).map((row) => ({
    id: row.id,
    sender: row.sender_id === userId ? "me" : "them",
    text: row.body,
    time: formatMessageTime(row.created_at),
    createdAt: Date.parse(row.created_at),
  }));
  return enrichMessageStatuses(mapped, null, 0);
}
