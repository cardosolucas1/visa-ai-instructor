import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import DeleteApplicationButton from "@/components/app/delete-application-button";
import { deleteApplication, getUserApplications } from "@/lib/db/applications";

const statusLabels = {
  draft: "Rascunho",
  awaiting_payment: "Aguardando pagamento",
  paid: "Pago",
  processing: "Processando",
  done: "Concluído",
  error: "Erro",
} as const;

const statusStyles = {
  draft: "bg-zinc-100 text-zinc-700",
  awaiting_payment: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  done: "bg-emerald-100 text-emerald-800",
  error: "bg-red-100 text-red-800",
} as const;

type PageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AppHomePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const { data, error } = await getUserApplications();

  const deleteAction = async (formData: FormData) => {
    "use server";
    const applicationId = formData.get("applicationId");

    if (typeof applicationId !== "string") {
      redirect("/app?error=delete_failed");
    }

    const { error: deleteError } = await deleteApplication(applicationId);

    if (deleteError) {
      redirect("/app?error=delete_failed");
    }

    revalidatePath("/app");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Suas análises mais recentes.
          </p>
        </div>
        <Link
          href="/app/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Nova análise
        </Link>
      </header>

      {resolvedSearchParams?.error === "create_failed" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          Não foi possível criar uma nova análise. Tente novamente.
        </p>
      ) : null}
      {resolvedSearchParams?.error === "delete_failed" ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          Não foi possível excluir a análise. Tente novamente.
        </p>
      ) : null}
      {resolvedSearchParams?.error === "draft_limit" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          Você atingiu o limite de 20 rascunhos. Exclua análises antigas para
          criar novas.
        </p>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Não foi possível carregar suas análises agora. Tente novamente em
          instantes.
        </div>
      ) : null}

      {!error && data && data.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
          Você ainda não criou nenhuma análise. Clique em “Nova análise” para
          começar.
        </div>
      ) : null}

      {!error && data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((application) => {
            const createdAt = new Date(application.createdAt).toLocaleDateString(
              "pt-BR",
              { day: "2-digit", month: "short", year: "numeric" },
            );
            const statusLabel = statusLabels[application.status];
            const statusStyle = statusStyles[application.status];
            const continueHref =
              application.status === "done"
                ? `/app/reports/${application.id}`
                : `/app/a/${application.id}/step-1`;

            return (
              <div
                key={application.id}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-zinc-900">
                    Análise #{application.id.slice(0, 8)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>{createdAt}</span>
                    <span className={`rounded-full px-2 py-1 ${statusStyle}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={continueHref}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                  >
                    Continuar
                  </Link>
                  {application.status === "done" && application.hasReport ? (
                    <Link
                      href={`/app/reports/${application.id}`}
                      className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Ver relatório
                    </Link>
                  ) : null}
                  <DeleteApplicationButton
                    applicationId={application.id}
                    action={async (formData) => {
                      "use server";
                      await deleteAction(formData);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
