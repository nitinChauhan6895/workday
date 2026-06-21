import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

type EmailOtpType = "signup" | "magiclink" | "recovery" | "invite" | "email";

// Handles the magic-link callback. Supports both the PKCE `code` flow (default
// Supabase magic link) and the `token_hash` flow (custom email template).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type: type as any, token_hash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=link`);
}
