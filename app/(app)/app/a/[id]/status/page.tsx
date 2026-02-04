import Link from "next/link";
import { redirect } from "next/navigation";

import { getLatestReport } from "@/lib/db/applications";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const statusMessages = {
  paid: {
    title: "Pagamento aprovado",
    description: "Estamos preparando seu relatório. Isso pode levar alguns minutos.",
  },
  processing: {
    title: "Relatório em processamento",
    description: "Estamos analisando sua aplicação. Aguarde.",
  },
  done: {
    title: "Relatório concluído",
    description: "Seu relatório está disponível.",
  },
  error: {
    title: "Erro ao processar",
    description: "Houve um problema ao gerar seu relatório. Tente novamente mais tarde.",
  },
} as const;

export default async function ApplicationStatusPage({ params }: PageProps) {
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

  if (application.status === "awaiting_payment") {
    redirect(`/app/a/${resolvedParams.id}/pay`);
  }

  const message =
    statusMessages[application.status as keyof typeof statusMessages] ??
    statusMessages.processing;

  const { data: report } =
    application.status === "done"
      ? await getLatestReport(resolvedParams.id)
      : { data: null };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-zinc-900">{message.title}</h1>
        <p className="mt-2 text-sm text-zinc-600">{message.description}</p>
        {application.status === "done" && report ? (
          <div className="mt-4">
            <Link
              href={`/app/reports/${resolvedParams.id}`}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Ver relatório
            </Link>
          </div>
        ) : null}
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
