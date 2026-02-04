import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    status?: string;
  }>;
};

export default async function ApplicationPayPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
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

  if (resolvedSearchParams?.status) {
    redirect(`/app/a/${resolvedParams.id}/pay/abacate?status=${resolvedSearchParams.status}`);
  }

  if (application.status === "draft") {
    redirect(`/app/a/${resolvedParams.id}/review`);
  }

  if (["paid", "processing", "done", "error"].includes(application.status)) {
    redirect(`/app/a/${resolvedParams.id}/status`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-zinc-900">Pagamento</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Escolha como deseja pagar a revisão do seu relatório.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-600">Produto</p>
        <p className="mt-1 text-base font-semibold text-zinc-900">
          Revisão B1/B2 (Relatório)
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <p className="text-sm font-medium text-zinc-700">
          Escolha o método de pagamento
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/app/a/${resolvedParams.id}/pay/abacate`}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-center text-sm font-semibold text-white"
          >
            PIX ou Cartão (AbacatePay)
          </Link>
          <Link
            href={`/app/a/${resolvedParams.id}/pay/apple-pay`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-semibold text-zinc-700"
          >
            Apple Pay (Stripe)
          </Link>
        </div>
      </div>

      <Link
        href="/app"
        className="inline-flex text-sm font-semibold text-zinc-700 hover:text-zinc-900"
      >
        ← Voltar ao dashboard
      </Link>
    </div>
  );
}
