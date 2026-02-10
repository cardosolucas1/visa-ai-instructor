import { NextResponse } from "next/server";

import { getDraftRecord, saveDraftRecord, verifyDraftAccess } from "@/lib/forms-store";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    applicationId?: string;
    data?: Record<string, unknown>;
    securityQuestion?: string;
    securityAnswer?: string;
  };

  if (!payload.applicationId || !payload.data) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const record = saveDraftRecord({
    applicationId: payload.applicationId,
    data: payload.data,
    securityQuestion: payload.securityQuestion,
    securityAnswer: payload.securityAnswer,
  });

  return NextResponse.json({ ok: true, updatedAt: record.updatedAt });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const securityAnswer = url.searchParams.get("securityAnswer") ?? undefined;

  if (!id) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const record = getDraftRecord(id);
  if (!record) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  if (!verifyDraftAccess(record, securityAnswer)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    data: record.data,
    securityQuestion: record.securityQuestion,
    updatedAt: record.updatedAt,
  });
}
