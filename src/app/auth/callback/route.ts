import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth + email-confirmation callback.
// Supabase redirects here with ?code=... after the user authenticates.
// We exchange the code for a session (sets cookies), then send the user on.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("OAuth code exchange failed:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
