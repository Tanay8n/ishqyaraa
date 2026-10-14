import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
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

    const body = await request.json().catch(() => ({}));
    const { action, targetId } = body;

    if (!action || !["like", "pass", "rewind"].includes(action)) {
      return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
    }

    // Rewind last action
    if (action === "rewind") {
      const { data: prevAction, error: prevErr } = await admin
        .from("user_actions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (prevErr) throw prevErr;
      if (!prevAction) {
        return NextResponse.json({ ok: true, restoredUid: null, blockedBecauseMatch: false });
      }

      const prevTargetId = prevAction.target_id;
      const userLow = user.id < prevTargetId ? user.id : prevTargetId;
      const userHigh = user.id < prevTargetId ? prevTargetId : user.id;

      if (prevAction.action === "like" && prevAction.created_match) {
        return NextResponse.json({ ok: true, restoredUid: prevTargetId, blockedBecauseMatch: true });
      }

      // Check if an active match exists
      const { data: existingMatch } = await admin
        .from("matches")
        .select("id")
        .eq("user_low", userLow)
        .eq("user_high", userHigh)
        .eq("status", "active")
        .maybeSingle();

      if (existingMatch) {
        return NextResponse.json({ ok: true, restoredUid: prevTargetId, blockedBecauseMatch: true });
      }

      if (prevAction.action === "like") {
        await admin.from("likes").delete().eq("user_id", user.id).eq("target_id", prevTargetId);
      } else {
        await admin.from("passes").delete().eq("user_id", user.id).eq("target_id", prevTargetId);
      }

      await admin.from("user_actions").delete().eq("user_id", user.id);
      return NextResponse.json({ ok: true, restoredUid: prevTargetId, blockedBecauseMatch: false });
    }

    // Like or Pass requires targetId
    if (!targetId || typeof targetId !== "string" || targetId === user.id) {
      return NextResponse.json({ ok: false, error: "Invalid target profile." }, { status: 400 });
    }

    // Check block list between both users
    const { data: blocks } = await admin
      .from("blocks")
      .select("blocker_id")
      .or(`and(blocker_id.eq.${user.id},blocked_id.eq.${targetId}),and(blocker_id.eq.${targetId},blocked_id.eq.${user.id})`);

    if (blocks && blocks.length > 0) {
      return NextResponse.json({ ok: false, error: "This profile is unavailable." }, { status: 403 });
    }

    if (action === "pass") {
      // Remove any existing like, insert pass
      await admin.from("likes").delete().eq("user_id", user.id).eq("target_id", targetId);
      const { error: passErr } = await admin
        .from("passes")
        .upsert({ user_id: user.id, target_id: targetId, created_at: new Date().toISOString() }, { onConflict: "user_id,target_id" });

      if (passErr) throw passErr;

      await admin.from("user_actions").upsert(
        {
          user_id: user.id,
          action: "pass",
          target_id: targetId,
          created_match: false,
          created_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      return NextResponse.json({ ok: true });
    }

    // Action === "like"
    // Connection preferences DO NOT restrict likes: anyone can send like/request to anyone.
    await admin.from("passes").delete().eq("user_id", user.id).eq("target_id", targetId);

    const { error: likeErr } = await admin
      .from("likes")
      .upsert({ user_id: user.id, target_id: targetId, created_at: new Date().toISOString() }, { onConflict: "user_id,target_id" });

    if (likeErr) throw likeErr;

    // Check if target user also liked the current user (mutual match)
    const { data: reciprocalLike } = await admin
      .from("likes")
      .select("created_at")
      .eq("user_id", targetId)
      .eq("target_id", user.id)
      .maybeSingle();

    let matched = false;
    let matchId: string | null = null;

    if (reciprocalLike) {
      matched = true;
      const userLow = user.id < targetId ? user.id : targetId;
      const userHigh = user.id < targetId ? targetId : user.id;

      const { data: matchData, error: matchErr } = await admin
        .from("matches")
        .upsert(
          {
            user_low: userLow,
            user_high: userHigh,
            status: "active",
            created_at: new Date().toISOString(),
          },
          { onConflict: "user_low,user_high" }
        )
        .select("id")
        .single();

      if (matchErr) throw matchErr;
      matchId = matchData.id;

      if (matchId) {
        const { data: convData, error: convErr } = await admin
          .from("conversations")
          .upsert(
            { match_id: matchId, created_at: new Date().toISOString() },
            { onConflict: "match_id" }
          )
          .select("id")
          .single();

        if (!convErr && convData?.id) {
          await admin.from("conversation_members").upsert(
            [
              { conversation_id: convData.id, user_id: userLow },
              { conversation_id: convData.id, user_id: userHigh },
            ],
            { onConflict: "conversation_id,user_id" }
          );
        }
      }
    }

    await admin.from("user_actions").upsert(
      {
        user_id: user.id,
        action: "like",
        target_id: targetId,
        created_match: matched,
        created_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    return NextResponse.json({
      ok: true,
      matched,
      matchId,
      already: false,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error processing interaction" },
      { status: 500 }
    );
  }
}
