import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

// Handles the Supabase email-confirmation link:
//   /auth/confirm?token_hash=...&type=signup
// Verifies the OTP, then redirects to /login with a status flag.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      return NextResponse.redirect(`${origin}/login?confirmed=true`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
