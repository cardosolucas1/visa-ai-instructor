import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PayWithApplePayPage({ params }: PageProps) {
  const resolvedParams = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: application } = await supabase
    .from("visa_applications")
    .select("id, status")
    .eq("id", resolvedParams.id)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!application) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Não foi possível carregar esta análise.
      </div>
    );
  }

  if (application.status === "draft") {
    redirect(`/app/a/${resolvedParams.id}/review`);
  }

  if (["paid", "processing", "done"].includes(application.status)) {
    redirect(`/app/a/${resolvedParams.id}/status`);
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-xl font-semibold text-zinc-900">Apple Pay (Stripe)</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Integração Stripe ainda não configurada. Em breve.
      </p>
    </div>
  );
}
