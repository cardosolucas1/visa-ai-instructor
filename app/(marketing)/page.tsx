import Link from "next/link";

export default function MarketingPage() {
  return (
    <div className="bg-zinc-50">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Pré-check B1/B2
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-zinc-900 sm:text-4xl">
            Pré-check de consistência e completude do seu preenchimento de visto
            B1/B2.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
            Evite erros comuns, ganhe clareza sobre campos faltantes e mantenha
            suas respostas coerentes. Não prometemos aprovação, não somos
            afiliados ao governo e nunca ajudamos a mentir.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app"
              className="rounded-lg bg-zinc-900 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Começar
            </Link>
            <Link
              href="#como-funciona"
              className="rounded-lg border border-zinc-300 px-5 py-3 text-center text-sm font-semibold text-zinc-900"
            >
              Ver como funciona
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold text-zinc-900">
              Alertas de risco
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Indicamos respostas inconsistentes e possíveis riscos de
              preenchimento incorreto.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold text-zinc-900">
              Checklist de completude
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Sinalizamos campos faltantes e perguntas que precisam de atenção.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-base font-semibold text-zinc-900">
              Resumo organizado
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              Consolidamos seus pontos de atenção para revisar antes do envio.
            </p>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16"
      >
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-zinc-900">
            Como funciona
          </h2>
          <ol className="mt-4 grid gap-4 text-sm text-zinc-600 sm:grid-cols-3">
            <li className="rounded-xl bg-zinc-50 p-4">
              Responda às perguntas do pré-check de forma honesta.
            </li>
            <li className="rounded-xl bg-zinc-50 p-4">
              Receba alertas de inconsistência e completude.
            </li>
            <li className="rounded-xl bg-zinc-50 p-4">
              Revise as respostas com base nos alertas.
            </li>
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Benefícios
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600">
              <li>Reduz erros comuns de preenchimento.</li>
              <li>Ajuda a manter consistência entre respostas.</li>
              <li>Deixa claro o que falta antes de enviar.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Limitações
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600">
              <li>Não garante aprovação do visto.</li>
              <li>Não é afiliado ao governo dos EUA.</li>
              <li>Não oferece aconselhamento jurídico.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
