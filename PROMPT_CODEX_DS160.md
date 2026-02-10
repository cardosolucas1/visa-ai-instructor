# PROMPT PARA CODEX — Criar Formulario DS-160 Dinamico (Next.js + UX profissional)

**Contexto (resuma para o gerador):**  
Crie uma aplicacao Next.js (App Router) em **TypeScript** que implemente um formulario dinamico inspirado no DS-160 (formulario americano de solicitacao de visto). Baseie a ordem das secoes, campos e orientacoes nas instrucoes do guia “Como preencher o formulario DS-160” (Melhores Destinos). Use esse guia para **texto de ajuda**, validacoes comuns (por exemplo: sem acentos em alguns campos), e fluxo — NOTA: use-o apenas como referencia de conteudo. ([Melhores Destinos][1])

**Tech stack e libs obrigatorias**

* Next.js 13+ (App Router)
* TypeScript
* Tailwind CSS (mobile-first, acessivel)
* react-hook-form + zod (validacao + @hookform/resolvers)
* qrcode.react (gerar QR na confirmacao)
* optional: clsx, axios/fetch
* Testes: Jest + React Testing Library (minimo) e Playwright (opcional)

---

## Requisitos funcionais (alto nivel)

1. **Formulario dinamico baseado em JSON schema** (`/schemas/ds160.json`) com `steps[]` e `fields[]`. O frontend renderiza o wizard a partir desse JSON.
2. **Multi-step wizard** (Stepper) com salvamento parcial (localStorage/IndexedDB) e endpoint server-side para rascunho (`/api/forms/draft`).
3. **Campos e secoes** (baseados no guia): Personal Information, Personal Information 2 (nacionalidade, IDs), Travel Information, Travel Companions, Previous U.S. Travel, Address/Phone, Passport/Documentos, U.S. Contact/Stay, Work/Education, Security & Background. Incluir fotos/upload de documentos.
4. **Security question + Application ID flow**: permitir salvar e retomar via Application ID e pergunta de seguranca (mecanismo de rascunho compativel).
5. **Preview / Confirmation**: gerar `confirmation_number` no servidor (UUID-like) apos envio final; mostrar pagina de confirmacao com resumo estilizado e QR/Barcode imprimivel.
6. **Acessibilidade** (WCAG): labels, aria, focus management, keyboard navigation, contrast adequado.
7. **UX**: mobile-first, tooltips de ajuda (por exemplo: “sem acentos”, tamanho de foto), validacao inline, destaque do primeiro erro, spinner em envio, mensagens amigaveis.
8. **Privacidade/Security**: nao logar PII; uploads limitados (5MB), tipos permitidos; endpoint exigindo autenticacao (documentar fallback).
9. **Localizacao**: i18n com PT-BR e EN (JSON files).
10. **Testes**: unit test para schema + smoke test do fluxo.

---

## JSON Schema (exemplo minimo a incluir em `/schemas/ds160.json`)

(O gerador deve criar um JSON inicial completo cobrindo as secoes listadas; abaixo e um exemplo reduzido — gere a versao completa.)

```json
{
  "title": "DS-160 (modelo)",
  "steps": [
    {
      "id": "personal_1",
      "title": "Informacoes Pessoais",
      "fields": [
        {"id":"surname","type":"text","label":"Surnames (Sobrenome)","required":true,"validations":{"noAccents":true}},
        {"id":"given_names","type":"text","label":"Given Names (Primeiro nome)","required":true,"validations":{"noAccents":true}},
        {"id":"full_name_native","type":"text","label":"Nome no alfabeto nativo","required":false}
      ]
    },
    {
      "id": "travel_info",
      "title": "Informacoes de Viagem",
      "fields": [
        {"id":"purpose_of_trip","type":"select","label":"Purpose of Trip","required":true,"options":["B1/B2 - Business & Tourism","Study","Work","Other"]},
        {"id":"have_travel_plans","type":"radio","label":"Ja tem planos especificos?","required":true,"options":["yes","no"]},
        {"id":"intended_arrival","type":"date","label":"Intended Date of Arrival","required":false}
      ]
    }
  ]
}
```

---

## Componentes a gerar (lista)

* `components/form/Stepper.tsx` — controla navegacao por steps, progresso.
* `components/fields/TextInput.tsx`, `Select.tsx`, `RadioGroup.tsx`, `DatePicker.tsx`, `FileUpload.tsx`, `FieldError.tsx`.
* `components/SaveDraftButton.tsx` — salva local + chama `/api/forms/draft`.
* `components/ConfirmationCard.tsx` — mostra summary + QR.
* `lib/schema-loader.ts` — carrega o JSON e converte para zod schema dinamicamente.
* `lib/form-client.ts` — helpers fetch para draft/submit/upload.
* `app/form/[id]/page.tsx` — wrapper do form que carrega schema, rascunho e exibe Stepper.
* `pages/api/forms/draft.ts` — POST/GET para salvar/recuperar rascunho (protecao via token/ID+security question).
* `pages/api/forms/submit.ts` — valida, gera confirmation_number e persiste (mock DB ou exemplo com PostgreSQL).
* `pages/api/upload.ts` — multipart handler para fotos (documentar como trocar storage para S3).

---

## Regras de UX derivadas do artigo (implementar)

* **Sem acentos** em campos pessoais (mostrar tooltip + validacao).
* **Guardar Application ID** e instrucoes de recuperacao (security question): mostrar instrucao clara e passo a passo. ([Melhores Destinos][1])
* **Salvar frequentemente** (auto-save e botao “Save” no final de cada step).
* **Campos condicionais**: ex.: se “Have you made specific travel plans?” == yes → mostrar campos de voo/chegada/partida. ([Melhores Destinos][1])
* **Travel companions**: permitir adicionar multiplos companions com relacao (parent, spouse, child, other).
* **Foto**: mostrar guia de formato e rejeitar uploads invalidos.
* **Reforcar veracidade**: mostrar aviso para responder com precisao — inspirado no guia. ([Melhores Destinos][1])

---

## Validacao & Seguranca

* Gerar Zod schemas a partir do JSON (campos required, formatos, tamanho dos uploads).
* CSRF protection (Next.js built-in or token).
* Rate limiting basico no endpoint de submit.
* Nao salvar/mostrar campos sensiveis em logs.
* Uploads: validar mime types e size < 5MB.

---

## Criterios de aceite (QA)

1. Multi-step wizard renderiza a partir de `/schemas/ds160.json`.
2. Auto-save funciona (local + server draft).
3. Validation: ao submeter com erro, foco vai pro primeiro erro; mensagens uteis.
4. Conditional fields aparecem corretamente (ex.: travel plans yes/no).
5. Uploads aceitos e rejeitados conforme regras.
6. Submissao final chama `/api/forms/submit`, retorna `confirmation_number` e mostra pagina /form/[confirmation_number]/confirmation com QR e botao de impressao.
7. I18n: trocar entre PT-BR e EN atualiza labels e helpers.
8. Testes unitarios cobrem validacao do schema.

---

## Entregaveis (o que o gerador deve devolver)

* Codigo completo dos componentes + paginas (TSX).
* `schemas/ds160.json` completo (todas as secoes do artigo mapeadas).
* Endpoints API (draft, submit, upload) com exemplos de persistencia (in-memory ou Postgres).
* README com instrucoes de setup, ENVs e como testar (incluindo como usar Application ID / security question para retomar).
* Exemplos de testes unitarios (Jest) e instrucoes para rodar Playwright (opcional).

---

## Observacoes finais para o gerador

* Priorize qualidade de codigo, testes e boas praticas (separation of concerns).
* Deixe hooks/abstracoes para integrar autenticacao e armazenamento real posteriormente.
* Inclua comentarios explicativos nas partes criticas (autosave, geracao de confirmation_number, upload).
* Lembre de usar as orientacoes do guia como *conteudo de ajuda*, nao como regras legais — o app e um clone funcional/educacional para facilitar preenchimento (nao envie nada ao governo automaticamente sem validacao humana).

---

[1]: https://www.melhoresdestinos.com.br/como-preencher-formulario-ds-160.html
