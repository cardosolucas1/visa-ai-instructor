import Link from "next/link";

import { getLatestReport } from "@/lib/db/applications";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function ReportPage({ params }: PageProps) {
  const { data, error } = await getLatestReport(params.id);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-zinc-900">Relatório</h1>
        {error ? (
          <p className="mt-2 text-sm text-red-600">
            Não foi possível carregar o relatório agora.
          </p>
        ) : null}
        {!error && !data ? (
          <p className="mt-2 text-sm text-zinc-600">
            Ainda não há relatório disponível para esta análise.
          </p>
        ) : null}
        {!error && data ? (
          <div className="mt-4 space-y-2 text-sm text-zinc-700">
            <p>Status: {data.status}</p>
            <pre className="whitespace-pre-wrap rounded-lg bg-zinc-50 p-4 text-xs text-zinc-600">
              {JSON.stringify(data.report, null, 2)}
            </pre>
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
