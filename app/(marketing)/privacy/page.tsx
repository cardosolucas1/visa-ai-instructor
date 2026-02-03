export default function PrivacyPage() {
  return (
    <div className="bg-zinc-50">
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            MVP
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
            Política de Privacidade
          </h1>
          <p className="mt-3 text-sm text-zinc-600">
            Esta política descreve como coletamos, usamos e protegemos seus
            dados no Visa AI Instructor.
          </p>

          <div className="mt-6 space-y-5 text-sm text-zinc-700">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                1. Dados coletados
              </h2>
              <p className="mt-2">
                Coletamos dados de conta (como e-mail), respostas fornecidas no
                pré-check e metadados técnicos mínimos para segurança e
                funcionamento.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                2. Finalidade de uso
              </h2>
              <p className="mt-2">
                Usamos os dados para avaliar consistência e completude das
                respostas, gerar alertas de risco e melhorar o serviço de forma
                agregada.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                3. IA e limitações
              </h2>
              <p className="mt-2">
                Usamos IA para análise de consistência. A IA pode falhar e não
                substitui orientação profissional. Não oferecemos aconselhamento
                legal ou consultoria de imigração.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                4. Compartilhamento
              </h2>
              <p className="mt-2">
                Compartilhamos dados apenas com provedores essenciais
                (infraestrutura, pagamentos e IA). Não vendemos dados pessoais.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                5. Retenção e deleção
              </h2>
              <p className="mt-2">
                Mantemos dados por até 30 dias, salvo exigências legais. Você
                pode solicitar deleção a qualquer momento.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                6. Não afiliação
              </h2>
              <p className="mt-2">
                Não somos afiliados a governos ou órgãos de imigração.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">7. Contato</h2>
              <p className="mt-2">
                Para dúvidas de privacidade, escreva para
                {" "}
                privacy@exemplo.com.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
