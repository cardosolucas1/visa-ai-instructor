import StepOneForm from "@/components/app/step-one-form";
import { getApplicationAnswers } from "@/lib/db/applications";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function ApplicationStepOnePage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const { data, error } = await getApplicationAnswers(resolvedParams.id);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Não foi possível carregar esta análise. Tente novamente.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-xl font-semibold text-zinc-900">Passo 1</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Preencha os dados básicos do passaporte.
      </p>
      {resolvedSearchParams?.error === "save_failed" ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Não foi possível salvar agora. Tente novamente.
        </p>
      ) : null}
      <StepOneForm
        initialValues={data ?? {}}
        applicationId={resolvedParams.id}
        nextPath={`/app/a/${resolvedParams.id}/step-2`}
      />
    </div>
  );
}
