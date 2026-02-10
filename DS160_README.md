# DS-160 dinamico (MVP)

Este modulo adiciona um formulario DS-160 dinamico em `/form/[id]`.

## Como acessar

1. Gere um ID qualquer (UUID ou texto curto).
2. Acesse: `http://localhost:3000/form/<id>`

## Fluxo

- Wizard multi-step renderizado por `schemas/ds160.json`.
- Auto-save em localStorage (`ds160-draft:<id>`).
- Botao "Salvar rascunho" envia para `/api/forms/draft`.
- Envio final chama `/api/forms/submit` e gera `confirmation_number`.
- Confirmacao em `/form/[confirmation_number]/confirmation` com QR e resumo copiavel.

## Endpoints

- `POST /api/forms/draft` salva rascunho.
- `GET /api/forms/draft?id=...&securityAnswer=...` recupera rascunho.
- `POST /api/forms/submit` valida e gera confirmacao.
- `POST /api/upload` faz upload (mock) e valida tamanho/tipo.

## Observacoes

- O armazenamento de rascunho/confirmacao esta em memoria (serverless). Troque para DB quando necessario.
- Os uploads retornam apenas metadados; integre com storage real (S3, Supabase) depois.
- O schema suporta campos condicionais e repeatable.
