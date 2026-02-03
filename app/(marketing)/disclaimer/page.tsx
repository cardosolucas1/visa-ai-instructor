export default function DisclaimerPage() {
  return (
    <div className="bg-zinc-50">
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            MVP
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
            Disclaimer
          </h1>
          <p className="mt-3 text-sm text-zinc-600">
            Leia com atenção antes de usar o serviço.
          </p>

          <div className="mt-6 space-y-5 text-sm text-zinc-700">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                1. Sem aconselhamento legal
              </h2>
              <p className="mt-2">
                O Visa AI Instructor não oferece aconselhamento legal ou
                consultoria de imigração. O conteúdo é informativo e não
                substitui profissionais qualificados.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                2. Sem promessa de aprovação
              </h2>
              <p className="mt-2">
                Não garantimos aprovação de visto. O resultado depende de
                critérios de autoridades competentes.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                3. IA e limitações
              </h2>
              <p className="mt-2">
                A IA pode produzir erros ou inconsistências. Use o serviço como
                apoio e revise suas respostas cuidadosamente.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                4. Não afiliação
              </h2>
              <p className="mt-2">
                Não somos afiliados ao governo dos EUA ou a órgãos oficiais de
                imigração.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                5. Retenção e deleção
              </h2>
              <p className="mt-2">
                Seus dados podem ser retidos por até 30 dias e podem ser
                excluídos mediante solicitação.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">6. Contato</h2>
              <p className="mt-2">
                Para dúvidas, escreva para
                {" "}
                contato@exemplo.com.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
