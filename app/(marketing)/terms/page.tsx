export default function TermsPage() {
  return (
    <div className="bg-zinc-50">
      <section className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            MVP
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
            Termos de Uso
          </h1>
          <p className="mt-3 text-sm text-zinc-600">
            Ao usar o Visa AI Instructor, você concorda com estes termos.
          </p>

          <div className="mt-6 space-y-5 text-sm text-zinc-700">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                1. Natureza do serviço
              </h2>
              <p className="mt-2">
                Fornecemos um pré-check de consistência e completude para o
                preenchimento do visto B1/B2. Não garantimos aprovação, não
                oferecemos aconselhamento legal ou consultoria de imigração.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                2. Não afiliação
              </h2>
              <p className="mt-2">
                Não somos afiliados a governos ou órgãos de imigração.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                3. Uso aceitável
              </h2>
              <p className="mt-2">
                Você concorda em fornecer informações verdadeiras e não usar o
                serviço para enganar autoridades. Nunca ajudamos a mentir.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                4. IA e limitações
              </h2>
              <p className="mt-2">
                A IA pode errar e não substitui revisão humana. Você é
                responsável por suas respostas finais.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                5. Retenção e deleção
              </h2>
              <p className="mt-2">
                Retemos dados por até 30 dias. Você pode solicitar deleção a
                qualquer momento.
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-zinc-900">6. Contato</h2>
              <p className="mt-2">
                Para dúvidas sobre os termos, escreva para
                {" "}
                suporte@exemplo.com.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
