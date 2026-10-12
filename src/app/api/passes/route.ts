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

    // 1. Fetch user passes, blocks, and active matches
    const [passesRes, blocksRes, matchesRes] = await Promise.all([
      admin
        .from("passes")
        .select("target_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      admin
        .from("blocks")
        .select("blocker_id, blocked_id")
        .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`),
      admin
        .from("matches")
        .select("user_low, user_high")
        .eq("status", "active")
        .or(`user_low.eq.${user.id},user_high.eq.${user.id}`),
    ]);

    if (passesRes.error) {
      return NextResponse.json({ ok: false, message: passesRes.error.message }, { status: 500 });
    }

    const blockedIds = new Set(
      (blocksRes.data || []).map((b) => (b.blocker_id === user.id ? b.blocked_id : b.blocker_id))
    );
    const matchedIds = new Set<string>();
    for (const m of matchesRes.data || []) {
      matchedIds.add(m.user_low === user.id ? m.user_high : m.user_low);
    }

    const validPassedIds = (passesRes.data || [])
      .map((p) => p.target_id)
      .filter((id) => !blockedIds.has(id) && !matchedIds.has(id));

    return NextResponse.json({ ok: true, passedIds: validPassedIds });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error loading passes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json().catch(() => ({}));
    const { action, targetId } = body;

    if (action === "remove_one" && targetId) {
      const { error } = await admin
        .from("passes")
        .delete()
        .eq("user_id", user.id)
        .eq("target_id", targetId);

      if (error) throw error;
      return NextResponse.json({ ok: true, targetId });
    }

    // Default: Reset all passes for current user
    const { error } = await admin
      .from("passes")
      .delete()
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ ok: true, resetAll: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error resetting passes" },
      { status: 500 }
    );
  }
}
