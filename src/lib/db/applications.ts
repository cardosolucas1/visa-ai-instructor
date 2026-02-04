import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ApplicationStatus =
  | "draft"
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "done"
  | "error";

export type ApplicationListItem = {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  hasReport: boolean;
};

export const getUserApplications = async () => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("visa_applications")
    .select("id, status, created_at, visa_application_reports(id)")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error };
  }

  const mapped =
    data?.map((item) => ({
      id: item.id,
      status: item.status as ApplicationStatus,
      createdAt: item.created_at,
      hasReport:
        Array.isArray(item.visa_application_reports) &&
        item.visa_application_reports.length > 0,
    })) ?? [];

  return { data: mapped, error: null };
};

export const createApplication = async () => {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { data: null, error: userError ?? new Error("Usuário inválido.") };
  }

  const { count: draftCount, error: countError } = await supabase
    .from("visa_applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userData.user.id)
    .eq("status", "draft");

  if (countError) {
    return { data: null, error: countError };
  }

  if ((draftCount ?? 0) >= 20) {
    return {
      data: null,
      error: new Error("draft_limit_reached"),
    };
  }

  const { data, error } = await supabase
    .from("visa_applications")
    .insert({
      user_id: userData.user.id,
      status: "draft",
      metadata: {},
    })
    .select("id")
    .single();

  if (error) {
    return { data: null, error };
  }

  const { error: answersError } = await supabase
    .from("visa_application_answers")
    .insert({
      application_id: data.id,
      user_id: userData.user.id,
      answers: {},
    });

  if (answersError) {
    await supabase.from("visa_applications").delete().eq("id", data.id);
    return { data: null, error: answersError };
  }

  return { data, error: null };
};

export const deleteApplication = async (applicationId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { error: userError ?? new Error("Usuário inválido.") };
  }

  const { error } = await supabase
    .from("visa_applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", userData.user.id);

  return { error };
};

export const getLatestReport = async (applicationId: string) => {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { data: null, error: userError ?? new Error("Usuário inválido.") };
  }

  const { data, error } = await supabase
    .from("visa_application_reports")
    .select("id, report, created_at, status")
    .eq("application_id", applicationId)
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
};

export const getApplicationAnswers = async (applicationId: string) => {
  noStore();
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { data: null, error: userError ?? new Error("Usuário inválido.") };
  }

  const { data, error } = await supabase
    .from("visa_application_answers")
    .select("answers")
    .eq("application_id", applicationId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  return { data: data?.answers ?? {}, error: null };
};

export const updateApplicationAnswers = async (
  applicationId: string,
  answers: Record<string, unknown>,
) => {
  const supabase = await createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { error: userError ?? new Error("Usuário inválido.") };
  }

  const { data: existing, error: existingError } = await supabase
    .from("visa_application_answers")
    .select("answers")
    .eq("application_id", applicationId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (existingError) {
    return { error: existingError };
  }

  const mergedAnswers = {
    ...(existing?.answers ?? {}),
    ...answers,
  };

  if (!existing) {
    const { error } = await supabase
      .from("visa_application_answers")
      .insert({
        application_id: applicationId,
        user_id: userData.user.id,
        answers: mergedAnswers,
      });

    return { error };
  }

  const { error } = await supabase
    .from("visa_application_answers")
    .update({ answers: mergedAnswers })
    .eq("application_id", applicationId)
    .eq("user_id", userData.user.id);

  return { error };
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: ApplicationStatus,
) => {
  const supabase = await createSupabaseServerClient({
    allowWriteCookies: true,
  });
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { error: userError ?? new Error("Usuário inválido.") };
  }

  const { data: application, error: appError } = await supabase
    .from("visa_applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (appError || !application) {
    return { error: appError ?? new Error("Aplicação não encontrada.") };
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("visa_applications")
    .update({ status })
    .eq("id", applicationId);

  return { error };
};
