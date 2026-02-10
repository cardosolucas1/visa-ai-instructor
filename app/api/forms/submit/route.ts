import { NextResponse } from "next/server";

import { buildZodSchema, loadFormSchema } from "@/lib/schema-loader";
import { saveSubmissionRecord } from "@/lib/forms-store";

const rateState = new Map<string, { count: number; resetAt: number }>();

const isRateLimited = (key: string) => {
  const now = Date.now();
  const current = rateState.get(key);
  if (!current || current.resetAt < now) {
    rateState.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (current.count >= 5) return true;
  current.count += 1;
  rateState.set(key, current);
  return false;
};

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, message: "rate_limited" }, { status: 429 });
  }

  const payload = (await request.json()) as {
    applicationId?: string;
    data?: Record<string, unknown>;
  };

  if (!payload.applicationId || !payload.data) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const schema = await loadFormSchema();
  const zodSchema = buildZodSchema(schema);
  const parsed = zodSchema.safeParse(payload.data);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const record = saveSubmissionRecord({
    applicationId: payload.applicationId,
    data: parsed.data,
  });

  return NextResponse.json({
    ok: true,
    confirmation_number: record.confirmationNumber,
  });
}
