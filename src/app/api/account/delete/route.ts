import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PROFILE_PHOTO_BUCKET = "profile-photos";

export async function DELETE(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const suppliedOrigin = request.headers.get("origin");
  if (!suppliedOrigin || suppliedOrigin !== requestOrigin) {
    return NextResponse.json({ ok: false, message: "Invalid request origin." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ ok: false, message: "Account removal is not configured on this server." }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ ok: false, message: "Sign in again to remove your account." }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    if (body.confirmation !== "DELETE") return NextResponse.json({ ok: false, message: "Type DELETE to confirm account removal." }, { status: 400 });
    const lastSignIn = user.last_sign_in_at ? Date.parse(user.last_sign_in_at) : 0;
    if (!lastSignIn || Date.now() - lastSignIn > 5 * 60 * 1000) {
      return NextResponse.json({ ok: false, message: "For your security, complete Google sign-in again before deleting your account." }, { status: 401 });
    }

    // The bucket is private. Remove the signed-in user's own objects before
    // deleting Auth; row data is removed through auth.users foreign-key cascades.
    // Always read from the start because each successful removal shifts the
    // remaining page offsets. Advancing an offset while deleting can skip files.
    for (;;) {
      const { data: objects, error } = await admin.storage.from(PROFILE_PHOTO_BUCKET).list(user.id, { limit: 100, offset: 0 });
      if (error) throw error;
      const names = (objects || []).map((object) => `${user.id}/${object.name}`);
      if (names.length) {
        const { error: removeError } = await admin.storage.from(PROFILE_PHOTO_BUCKET).remove(names);
        if (removeError) throw removeError;
      }
      if (!objects?.length || objects.length < 100) break;
    }
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Account removal could not be completed. Try again or contact the project administrator." }, { status: 500 });
  }
}
