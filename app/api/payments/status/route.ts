import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type StatusBody = {
  applicationId?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as StatusBody;
  const applicationId = payload.applicationId;

  if (!applicationId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient({ allowWriteCookies: true });
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("payments")
    .select("status, created_at")
    .eq("application_id", applicationId)
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!error && data?.status && data.status !== "pending") {
    return NextResponse.json({ ok: true, status: data.status });
  }

  const { data: application } = await supabase
    .from("visa_applications")
    .select("status")
    .eq("id", applicationId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!application) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  if (["paid", "processing", "done", "error"].includes(application.status)) {
    return NextResponse.json({ ok: true, status: "approved" });
  }

  return NextResponse.json({ ok: true, status: "pending" });
}
