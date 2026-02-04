import Link from "next/link";
import { redirect } from "next/navigation";

import AutoCreateForm from "@/components/app/auto-create-form";
import { createApplication } from "@/lib/db/applications";

export default async function NewApplicationPage() {
  const createAction = async () => {
    "use server";
    const { data, error } = await createApplication();

    if (error?.message === "draft_limit_reached") {
      redirect("/app?error=draft_limit");
    }

    if (error || !data) {
      redirect("/app?error=create_failed");
    }

    redirect(`/app/a/${data.id}/step-1`);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-xl font-semibold text-zinc-900">Criando análise</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Aguarde enquanto preparamos sua nova análise.
      </p>
      <AutoCreateForm action={createAction} />
      <Link
        href="/app"
        className="mt-6 inline-flex text-sm font-semibold text-zinc-700 hover:text-zinc-900"
      >
        ← Voltar ao dashboard
      </Link>
    </div>
  );
}
