import { createClient } from "@/lib/supabase/client";
import { MAX_MESSAGE_LENGTH } from "@/lib/schema";

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const { data, error } = await createClient().rpc(name, args);
  if (error) throw new Error(error.message || "The request could not be completed.");
  return data as T;
}

export async function likeUser(targetUid: string): Promise<{ matched: boolean; matchId: string | null; already: boolean }> {
  if (!targetUid) throw new Error("Invalid like target.");
  const result = await rpc<{ matched: boolean; matchId?: string | null; already?: boolean }>("record_interaction", {
    p_action: "like",
    p_target_id: targetUid,
  });
  return { matched: Boolean(result.matched), matchId: result.matchId || null, already: Boolean(result.already) };
}

export async function passUser(targetUid: string) {
  if (!targetUid) throw new Error("Invalid pass target.");
  await rpc("record_interaction", { p_action: "pass", p_target_id: targetUid });
}

export async function rewindLastAction(): Promise<{ restoredUid: string | null; blockedBecauseMatch: boolean }> {
  const result = await rpc<{ restoredUid: string | null; blockedBecauseMatch: boolean }>("record_interaction", {
    p_action: "rewind",
    p_target_id: null,
  });
  return { restoredUid: result.restoredUid || null, blockedBecauseMatch: Boolean(result.blockedBecauseMatch) };
}

export async function sendMessage(conversationId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) throw new Error("Enter a message of 1 to 2000 characters.");
  const result = await rpc<{ id: string }>("send_conversation_message", {
    p_conversation_id: conversationId,
    p_body: trimmed,
  });
  return result.id;
}

export async function markConversationRead(conversationId: string) {
  if (!conversationId) throw new Error("Invalid conversation.");
  await rpc("mark_conversation_read", { p_conversation_id: conversationId });
}

export async function blockUser(targetUid: string) {
  if (!targetUid) throw new Error("Invalid profile.");
  await rpc("block_user", { p_target_id: targetUid });
}

export async function recordReport(reportedUid: string, reason: string) {
  const normalizedReason = reason.trim();
  if (!reportedUid || normalizedReason.length < 1 || normalizedReason.length > 500) {
    throw new Error("Choose another profile and enter a report reason of 1 to 500 characters.");
  }
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Sign in to submit a report.");
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_id: reportedUid,
    reason: normalizedReason,
  });
  if (error) throw new Error(error.message || "Could not submit this report.");
}
