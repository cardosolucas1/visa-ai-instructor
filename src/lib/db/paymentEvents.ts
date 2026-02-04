import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const recordPaymentEvent = async (input: {
  provider: "abacatepay";
  providerEventId: string;
  rawPayload: Record<string, unknown>;
}) => {
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("payment_events").insert({
    provider: input.provider,
    provider_event_id: input.providerEventId,
    raw_payload: input.rawPayload,
  });

  if (error?.code === "23505") {
    return { ignored: true, error: null };
  }

  if (error) {
    return { ignored: false, error };
  }

  return { ignored: false, error: null };
};
