import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getPendingPaymentForApplication = async (applicationId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { data: null, error: userError ?? new Error("Usuário inválido.") };
  }

  const { data, error } = await supabase
    .from("payments")
    .select("id, provider_checkout_url, provider_payment_id, status")
    .eq("application_id", applicationId)
    .eq("user_id", userData.user.id)
    .eq("provider", "abacatepay")
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
};

export const createPayment = async (input: {
  applicationId: string;
  userId: string;
  provider: "abacatepay";
  providerPaymentId: string;
  providerReference?: string;
  providerCheckoutUrl?: string;
  amountCents: number;
  currency: string;
}) => {
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("payments").insert({
    application_id: input.applicationId,
    user_id: input.userId,
    provider: input.provider,
    provider_payment_id: input.providerPaymentId,
    provider_reference: input.providerReference,
    provider_checkout_url: input.providerCheckoutUrl,
    status: "pending",
    amount_cents: input.amountCents,
    currency: input.currency,
  });

  return { error };
};
