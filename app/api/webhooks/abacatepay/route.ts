import { NextResponse } from "next/server";

import { validateWebhookSignature } from "@/lib/abacatepay/signature";
import { recordPaymentEvent } from "@/lib/db/paymentEvents";
import { getServerEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AbacatePayWebhookPayload = {
  id?: string;
  eventId?: string;
  type?: string;
  data?: {
    id?: string;
    status?: string;
    externalId?: string;
  };
  status?: string;
};

const mapPaymentStatus = (status?: string) => {
  if (!status) return "pending";
  const normalized = status.toLowerCase();
  if (["approved", "paid", "success"].includes(normalized)) return "approved";
  if (["failed", "canceled", "cancelled"].includes(normalized)) return "failed";
  if (["refunded"].includes(normalized)) return "refunded";
  return "pending";
};

export async function POST(request: Request) {
  const { ABACATEPAY_WEBHOOK_SECRET } = getServerEnv();
  const url = new URL(request.url);
  const webhookSecret = url.searchParams.get("webhookSecret");

  if (!webhookSecret) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (webhookSecret !== ABACATEPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const signatureHeader = request.headers.get("x-webhook-signature");
  if (!signatureHeader) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const rawBody = await request.text();
  const signatureValid = validateWebhookSignature(
    rawBody,
    ABACATEPAY_WEBHOOK_SECRET,
    signatureHeader,
  );

  if (!signatureValid) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: AbacatePayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as AbacatePayWebhookPayload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const eventId = payload.eventId ?? payload.id ?? payload.data?.id;

  if (!eventId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  const { ignored, error: eventError } = await recordPaymentEvent({
    provider: "abacatepay",
    providerEventId: eventId,
    rawPayload: (payload ?? {}) as Record<string, unknown>,
  });

  if (eventError) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  if (ignored) {
    return NextResponse.json({ ok: true });
  }

  const providerPaymentId = payload.data?.id ?? payload.id;
  const providerReference = payload.data?.externalId;
  const paymentStatus = mapPaymentStatus(payload.data?.status ?? payload.status);

  if (paymentStatus === "approved" || paymentStatus === "failed") {
    if (providerPaymentId) {
      await admin
        .from("payments")
        .update({ status: paymentStatus })
        .eq("provider", "abacatepay")
        .eq("provider_payment_id", providerPaymentId);
    } else if (providerReference) {
      await admin
        .from("payments")
        .update({ status: paymentStatus })
        .eq("provider", "abacatepay")
        .eq("provider_reference", providerReference);
    }

    if (providerReference && paymentStatus === "approved") {
      await admin
        .from("visa_applications")
        .update({ status: "paid" })
        .eq("id", providerReference);
    }
  }

  return NextResponse.json({ ok: true });
}
