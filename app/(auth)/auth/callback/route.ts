import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const emailOtpTypes = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;
type EmailOtpType = (typeof emailOtpTypes)[number];

const isEmailOtpType = (value: string): value is EmailOtpType =>
  emailOtpTypes.includes(value as EmailOtpType);

const getSafeNextPath = (value: string | null) => {
  if (!value) return "/app";
  return value.startsWith("/") ? value : "/app";
};

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = getSafeNextPath(searchParams.get("next"));

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=invalid_or_expired_link`,
      );
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  if (tokenHash && type) {
    if (!isEmailOtpType(type)) {
      return NextResponse.redirect(
        `${origin}/login?error=invalid_or_expired_link`,
      );
    }

    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=invalid_or_expired_link`,
      );
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
