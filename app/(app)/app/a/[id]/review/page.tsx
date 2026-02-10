import Link from "next/link";
import { redirect } from "next/navigation";

import AnswersSummary from "@/components/app/AnswersSummary";
import {
  getApplicationAnswers,
  updateApplicationStatus,
} from "@/lib/db/applications";
import { loadFormSchema } from "@/lib/schema-loader";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function ApplicationReviewPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const [schema, { data, error }] = await Promise.all([
    loadFormSchema(),
    getApplicationAnswers(resolvedParams.id),
  ]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Não foi possível carregar esta análise. Tente novamente.
      </div>
    );
  }

  const confirmAction = async (formData: FormData) => {
    "use server";
    const confirmed = formData.get("confirm") === "on";

    if (!confirmed) {
      redirect(`/app/a/${resolvedParams.id}/review?error=missing_confirm`);
    }

    const { error: statusError } = await updateApplicationStatus(
      resolvedParams.id,
      "awaiting_payment",
    );

    if (statusError) {
      redirect(`/app/a/${resolvedParams.id}/review?error=save_failed`);
    }

    redirect(`/app/a/${resolvedParams.id}/pay`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-zinc-900">Revisão</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Revise suas respostas antes de seguir para o pagamento. Sem pagamento,
          não geramos relatório de IA.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Não garantimos aprovação e não oferecemos aconselhamento jurídico.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-base font-semibold text-zinc-900">
          Resumo das respostas
        </h2>
        <div className="mt-4">
          <AnswersSummary schema={schema} data={data ?? {}} />
        </div>
      </div>

      <form
        action={confirmAction}
        className="rounded-2xl border border-zinc-200 bg-white p-6"
      >
        {resolvedSearchParams?.error === "missing_confirm" ? (
          <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Confirme a declaração para continuar.
          </p>
        ) : null}
        {resolvedSearchParams?.error === "save_failed" ? (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            Não foi possível continuar. Tente novamente.
          </p>
        ) : null}
        <label className="flex items-start gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            name="confirm"
            required
            className="mt-1 h-4 w-4"
          />
          Confirmo que as informações são verdadeiras e completas.
        </label>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/app"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700"
          >
            Voltar ao dashboard
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Ir para pagamento
          </button>
        </div>
      </form>
    </div>
  );
}
