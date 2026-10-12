import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ ok: false, message: "Admin not configured" }, { status: 500 });
    }

    // 1. Fetch likes sent to this user, active matches, passes, and blocks
    const [likesRes, matchesRes, passesRes, blocksRes] = await Promise.all([
      admin
        .from("likes")
        .select("user_id, created_at")
        .eq("target_id", user.id)
        .order("created_at", { ascending: false }),
      admin
        .from("matches")
        .select("user_low, user_high")
        .eq("status", "active")
        .or(`user_low.eq.${user.id},user_high.eq.${user.id}`),
      admin.from("passes").select("target_id").eq("user_id", user.id),
      admin
        .from("blocks")
        .select("blocker_id, blocked_id")
        .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`),
    ]);

    if (likesRes.error) {
      return NextResponse.json({ ok: false, message: likesRes.error.message }, { status: 500 });
    }

    const matchedIds = new Set<string>();
    for (const m of matchesRes.data || []) {
      matchedIds.add(m.user_low === user.id ? m.user_high : m.user_low);
    }
    const passedIds = new Set((passesRes.data || []).map((p) => p.target_id));
    const blockedIds = new Set(
      (blocksRes.data || []).map((b) => (b.blocker_id === user.id ? b.blocked_id : b.blocker_id))
    );

    // Pending incoming connection requests (User A liked me, but we don't have an active match yet, and I haven't passed or blocked User A)
    const pendingSenderIds = (likesRes.data || [])
      .map((l) => l.user_id)
      .filter((senderId) => !matchedIds.has(senderId) && !passedIds.has(senderId) && !blockedIds.has(senderId));

    return NextResponse.json({ ok: true, senderIds: pendingSenderIds });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error fetching requests" },
      { status: 500 }
    );
  }
}
