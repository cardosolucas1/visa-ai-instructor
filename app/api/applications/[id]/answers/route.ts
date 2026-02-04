import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  const payload = (await request.json()) as Record<string, unknown>;
  const resolvedParams = await params;
  const applicationId = resolvedParams.id;

  if (!applicationId || typeof payload !== "object" || payload === null) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient({
    allowWriteCookies: true,
  });
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { data: existing, error: existingError } = await supabase
    .from("visa_application_answers")
    .select("answers")
    .eq("application_id", applicationId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const mergedAnswers = {
    ...(existing?.answers ?? {}),
    ...payload,
  };

  if (!existing) {
    const { error } = await supabase
      .from("visa_application_answers")
      .insert({
        application_id: applicationId,
        user_id: userData.user.id,
        answers: mergedAnswers,
      });

    if (error) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase
    .from("visa_application_answers")
    .update({ answers: mergedAnswers })
    .eq("application_id", applicationId)
    .eq("user_id", userData.user.id);

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
