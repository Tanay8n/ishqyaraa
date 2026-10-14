import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ ok: false, error: "Missing conversationId" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ ok: false, error: "Database admin not configured." }, { status: 500 });
    }

    // 1. Verify user is a member of this active conversation
    const { data: convData, error: convError } = await admin
      .from("conversations")
      .select("id, match_id, matches!inner(id, user_low, user_high, status)")
      .eq("id", conversationId)
      .maybeSingle();

    if (convError || !convData) {
      return NextResponse.json({ ok: false, error: "Conversation not found." }, { status: 404 });
    }

    const match = (convData as unknown as {
      matches: { id: string; user_low: string; user_high: string; status: string };
    }).matches;

    if (!match || match.status !== "active" || (match.user_low !== user.id && match.user_high !== user.id)) {
      return NextResponse.json({ ok: false, error: "Unauthorized for this conversation." }, { status: 403 });
    }

    const partnerId = match.user_low === user.id ? match.user_high : match.user_low;

    // 2. Fetch conversation members to get partner's unread_count and last_read_at
    const { data: members } = await admin
      .from("conversation_members")
      .select("user_id, unread_count, last_read_at")
      .eq("conversation_id", conversationId);

    const partnerMember = (members || []).find((m) => m.user_id === partnerId);
    const partnerLastReadAt = partnerMember?.last_read_at || null;
    const partnerUnreadCount = typeof partnerMember?.unread_count === "number" ? partnerMember.unread_count : 0;

    // 3. Fetch messages
    const { data: msgRows, error: msgError } = await admin
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(200);

    if (msgError) {
      return NextResponse.json({ ok: false, error: msgError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      partnerId,
      partnerLastReadAt,
      partnerUnreadCount,
      messages: (msgRows || []).map((row) => ({
        id: row.id,
        sender: row.sender_id === user.id ? "me" : "them",
        text: row.body,
        time: new Date(row.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        createdAt: Date.parse(row.created_at),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
