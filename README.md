# Visa AI Instructor (MVP)

Micro SaaS B2C de “pré-check” para visto de turismo EUA (B1/B2). O objetivo é ajudar na **consistência**, **completude** e **alertas de risco de preenchimento incorreto** de um formulário, sem prometer aprovação e sem substituir orientação profissional.

## Avisos importantes

- Não garante aprovação de visto.
- Não é afiliado ao governo dos EUA.
- Não oferece aconselhamento jurídico.
- **Regra do produto: nunca ajude a mentir.**

## Escopo do MVP

- Checklist de consistência entre respostas.
- Alertas de risco de incoerências.
- Sugestões de completude (campos faltantes).
- Histórico básico de sessões do usuário.

Fora do escopo no MVP:

- Uploads de documentos.
- Qualquer automação que “preencha” o formulário oficial.
- Decisões finais sobre elegibilidade.

## Arquitetura (planejada)

- **Frontend**: Next.js (App Router).
- **Backend/DB/Auth**: Supabase.
- **Pagamentos**: Mercado Pago.
- **IA**: OpenAI (apenas para análise e geração de alertas/sugestões).

## Política de dados (resumo)

- **Minimização**: coletar apenas o necessário para o pré-check.
- **Sem uploads no MVP**: não coletamos documentos, imagens ou PDFs.
- **Pseudonimização**: quando possível, separar dados pessoais de conteúdo de análise.
- **Transparência**: usuário pode solicitar deleção.

## Retenção e deleção

- Retenção padrão: **30 dias**.
- Deleção sob demanda: mediante solicitação do usuário.
- Backups seguem a mesma política de retenção.

## Variáveis de ambiente (planejadas)

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `LOG_LEVEL`

## Segurança e privacidade

Veja:
- `SECURITY.md`
- `PRIVACY_NOTES.md`

## Threat model (resumo)

Top 10 riscos e mitigação (alto nível):

1. **Injeção de prompt / bypass de regras**: validações de entrada, políticas fixas, filtros.
2. **Vazamento de PII**: minimização, criptografia em trânsito e em repouso.
3. **Exposição de credenciais**: segredos em env vars e vaults, rotação.
4. **Uso indevido da IA**: regras de conteúdo, bloqueios para “mentir”.
5. **Account takeover**: MFA quando aplicável, políticas de senha.
6. **Fraude de pagamento**: webhooks assinados e validação de eventos.
7. **Risco de scraping**: rate limiting e proteção de endpoints.
8. **Erro de interpretação**: mensagens claras e sem promessas de aprovação.
9. **Logs com dados sensíveis**: redaction e níveis de log.
10. **Dependências vulneráveis**: atualizações e varreduras regulares.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## GitHub Actions + Vercel

Este repo ja esta preparado para deploy automatico via GitHub Actions.

1. Crie um projeto na Vercel (importando este repositorio).
2. Defina as variaveis de ambiente do app na Vercel (Settings > Environment Variables).
3. Crie os segredos no GitHub (Settings > Secrets and variables > Actions):
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

Como obter `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`:

```bash
vercel login
vercel link
cat .vercel/project.json
```

O workflow faz:
- Pull Requests: deploy de preview na Vercel com comentario no PR.
- Branch `main`: deploy de producao.
