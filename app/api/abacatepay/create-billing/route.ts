import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createBilling } from "@/lib/abacatepay/client";
import { getServerEnv } from "@/lib/env";

type BillingRequestBody = {
  applicationId?: string;
};

const ITEM_TITLE = "Revisão B1/B2";
const ITEM_PRICE_CENTS = 4990;
const PAYMENT_METHODS = ["PIX"] as const;

export async function POST(request: Request) {
  const payload = (await request.json()) as BillingRequestBody;
  const applicationId = payload.applicationId;

  if (!applicationId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { APP_BASE_URL, ABACATEPAY_CUSTOMER_ID } = getServerEnv();

  const supabase = await createSupabaseServerClient({
    allowWriteCookies: true,
  });
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { data: application, error: appError } = await supabase
    .from("visa_applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (appError || !application) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  let billing;

  try {
    billing = await createBilling({
      frequency: "ONE_TIME",
      methods: [...PAYMENT_METHODS],
      products: [
        {
          externalId: applicationId,
          name: ITEM_TITLE,
          description: "Revisão de consistência e completude B1/B2",
          quantity: 1,
          price: ITEM_PRICE_CENTS,
        },
      ],
      returnUrl: `${APP_BASE_URL}/app/a/${applicationId}/pay/abacate?status=cancelled`,
      completionUrl: `${APP_BASE_URL}/app/a/${applicationId}/pay/abacate?status=success`,
      ...(ABACATEPAY_CUSTOMER_ID
        ? { customerId: ABACATEPAY_CUSTOMER_ID }
        : {}),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar cobrança.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error: paymentError } = await admin.from("payments").insert({
    application_id: applicationId,
    user_id: userData.user.id,
    provider: "abacatepay",
    status: "pending",
    amount_cents: ITEM_PRICE_CENTS,
    currency: "BRL",
    provider_payment_id: billing.id,
    provider_reference: applicationId,
    provider_checkout_url: billing.url,
    provider_payload: {
      billing_id: billing.id,
      payment_url: billing.url,
      status: billing.status,
    },
  });

  if (paymentError) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, payment_url: billing.url });
}
