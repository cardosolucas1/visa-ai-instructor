import { NextResponse } from "next/server";

import { createBilling, createCustomer } from "@/lib/abacatepay/client";
import { getServerEnv } from "@/lib/env";
import { getPendingPaymentForApplication, createPayment } from "@/lib/db/payments";
import {
  getAbacatepayCustomerId,
  upsertAbacatepayCustomerId,
} from "@/lib/db/abacatepayCustomers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/security/rateLimit";

const ITEM_TITLE = "Revisão B1/B2 (Relatório)";
const ITEM_PRICE_CENTS = 4990;
const CURRENCY = "BRL";

type CreateChargeBody = {
  applicationId?: string;
  customer?: {
    name?: string;
    cellphone?: string;
    email?: string;
    taxId?: string;
  };
};

export async function POST(request: Request) {
  const { APP_BASE_URL } = getServerEnv();
  const payload = (await request.json()) as CreateChargeBody;
  const applicationId = payload.applicationId;

  if (!applicationId) {
    return NextResponse.json({ ok: false, message: "Application inválida." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limiter = rateLimit(`abacatepay:${ip}:${applicationId}`, {
    limit: 5,
    windowMs: 60_000,
  });

  if (!limiter.allowed) {
    return NextResponse.json({ ok: false, message: "Muitas tentativas. Tente novamente." }, { status: 429 });
  }

  const supabase = await createSupabaseServerClient({ allowWriteCookies: true });
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return NextResponse.json({ ok: false, message: "Usuário não autenticado." }, { status: 401 });
  }

  const { data: application, error: appError } = await supabase
    .from("visa_applications")
    .select("id, status")
    .eq("id", applicationId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (appError || !application) {
    return NextResponse.json({ ok: false, message: "Aplicação não encontrada." }, { status: 404 });
  }

  if (application.status !== "awaiting_payment") {
    return NextResponse.json({ ok: false, message: "Pagamento não disponível." }, { status: 409 });
  }

  const { data: existingPayment } = await getPendingPaymentForApplication(applicationId);
  if (existingPayment?.provider_checkout_url) {
    return NextResponse.json({ ok: true, payment_url: existingPayment.provider_checkout_url });
  }

  const { data: existingCustomerId } = await getAbacatepayCustomerId();
  let customerId = existingCustomerId ?? undefined;

  if (
    !customerId &&
    payload.customer &&
    payload.customer.name &&
    payload.customer.cellphone &&
    payload.customer.email &&
    payload.customer.taxId
  ) {
    const createdCustomer = await createCustomer({
      name: payload.customer.name,
      cellphone: payload.customer.cellphone,
      email: payload.customer.email,
      taxId: payload.customer.taxId,
    });
    customerId = createdCustomer.id;
    await upsertAbacatepayCustomerId({
      userId: userData.user.id,
      providerCustomerId: createdCustomer.id,
    });
  }

  if (!customerId && !getServerEnv().ABACATEPAY_CUSTOMER_ID) {
    return NextResponse.json(
      { ok: false, message: "Dados do cliente são obrigatórios." },
      { status: 422 },
    );
  }

  const billing = await createBilling({
    frequency: "ONE_TIME",
    methods: ["PIX", "CARD"],
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
    customerId: customerId ?? getServerEnv().ABACATEPAY_CUSTOMER_ID,
  });

  const { error: paymentError } = await createPayment({
    applicationId,
    userId: userData.user.id,
    provider: "abacatepay",
    providerPaymentId: billing.id,
    providerReference: applicationId,
    providerCheckoutUrl: billing.url,
    amountCents: ITEM_PRICE_CENTS,
    currency: CURRENCY,
  });

  if (paymentError) {
    return NextResponse.json({ ok: false, message: "Erro ao salvar pagamento." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, payment_url: billing.url });
}
