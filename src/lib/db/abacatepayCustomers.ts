import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getAbacatepayCustomerId = async () => {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { data: null, error: userError ?? new Error("Usuário inválido.") };
  }

  const { data, error } = await supabase
    .from("abacatepay_customers")
    .select("provider_customer_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  return { data: data?.provider_customer_id ?? null, error: null };
};

export const upsertAbacatepayCustomerId = async (input: {
  userId: string;
  providerCustomerId: string;
}) => {
  const admin = createSupabaseAdminClient();

  const { error } = await admin.from("abacatepay_customers").upsert(
    {
      user_id: input.userId,
      provider_customer_id: input.providerCustomerId,
    },
    { onConflict: "user_id" },
  );

  return { error };
};

/** Remove o customer armazenado do usuário atual (ex.: quando o AbacatePay retorna "Customer not found"). */
export const clearStoredAbacatepayCustomerId = async () => {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { error: userError ?? new Error("Usuário inválido.") };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("abacatepay_customers")
    .delete()
    .eq("user_id", userData.user.id);

  return { error };
};
