import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") || "/";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/";

  if (!hasSupabaseConfig()) {
    return NextResponse.redirect(new URL("/?authError=supabase-not-configured", requestUrl.origin));
  }
  if (!code) {
    return NextResponse.redirect(new URL("/?authError=oauth-callback-failed", requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/?authError=oauth-callback-failed", requestUrl.origin));
  }
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
