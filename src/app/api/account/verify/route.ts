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
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    if (admin) {
      const { error } = await admin
        .from("profiles")
        .update({ college_verified: true })
        .eq("id", user.id);

      if (error) {
        return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, verified: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Verification error" },
      { status: 500 }
    );
  }
}
