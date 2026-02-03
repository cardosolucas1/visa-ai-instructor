# Segurança

Este documento descreve práticas e compromissos de segurança do MVP.

## Escopo

- Aplicação web (Next.js).
- Backend/DB/Auth (Supabase).
- Integração com pagamentos (Mercado Pago).
- Integração com IA (OpenAI).

## Regras do produto

- **Nunca ajude a mentir.**
- Não há promessa de aprovação.
- Não há aconselhamento jurídico.

## Boas práticas planejadas

- HTTPS em todas as rotas.
- Segredos apenas em variáveis de ambiente.
- Criptografia em trânsito e em repouso.
- Controle de acesso por papéis (RBAC).
- Logs com redaction de PII.
- Rate limiting e proteção contra abuso.

## Threat model (Top 10)

1. **Injeção de prompt / bypass de regras**  
   Mitigação: validação de entrada, guardrails fixos e testes de jailbreak.
2. **Vazamento de PII**  
   Mitigação: minimização de coleta, criptografia, acesso mínimo.
3. **Exposição de credenciais**  
   Mitigação: secrets em env, rotação e acesso restrito.
4. **Uso indevido da IA para fraude**  
   Mitigação: políticas de conteúdo, bloqueios e auditoria.
5. **Account takeover**  
   Mitigação: MFA opcional, políticas de senha, detecção de anomalias.
6. **Fraude de pagamento**  
   Mitigação: verificação de webhooks assinados e reconciliamento.
7. **Raspagem de dados / scraping**  
   Mitigação: rate limiting, bot detection e limites de sessão.
8. **Erros de interpretação do usuário**  
   Mitigação: linguagem clara, alertas e ausência de promessas.
9. **Logs com dados sensíveis**  
   Mitigação: redaction e retenção curta.
10. **Dependências vulneráveis**  
    Mitigação: atualização frequente e scanners de dependência.

## Reporte de vulnerabilidades

Se você encontrar uma falha de segurança, por favor reporte de forma responsável.  
Canal sugerido: `security@exemplo.com` (substituir quando houver endereço real).

## SLA de resposta (planejado)

- Confirmação do recebimento: até 72h.
- Avaliação inicial: até 7 dias úteis.

# Segurança

Este documento descreve práticas e compromissos de segurança do MVP.

## Escopo

- Aplicação web (Next.js).
- Backend/DB/Auth (Supabase).
- Integração com pagamentos (Mercado Pago).
- Integração com IA (OpenAI).

## Regras do produto

- **Nunca ajude a mentir.**
- Não há promessa de aprovação.
- Não há aconselhamento jurídico.

## Boas práticas planejadas

- HTTPS em todas as rotas.
- Segredos apenas em variáveis de ambiente.
- Criptografia em trânsito e em repouso.
- Controle de acesso por papéis (RBAC).
- Logs com redaction de PII.
- Rate limiting e proteção contra abuso.

## Threat model (Top 10)

1. **Injeção de prompt / bypass de regras**  
   Mitigação: validação de entrada, guardrails fixos e testes de jailbreak.
2. **Vazamento de PII**  
   Mitigação: minimização de coleta, criptografia, acesso mínimo.
3. **Exposição de credenciais**  
   Mitigação: secrets em env, rotação e acesso restrito.
4. **Uso indevido da IA para fraude**  
   Mitigação: políticas de conteúdo, bloqueios e auditoria.
5. **Account takeover**  
   Mitigação: MFA opcional, políticas de senha, detecção de anomalias.
6. **Fraude de pagamento**  
   Mitigação: verificação de webhooks assinados e reconciliamento.
7. **Raspagem de dados / scraping**  
   Mitigação: rate limiting, bot detection e limites de sessão.
8. **Erros de interpretação do usuário**  
   Mitigação: linguagem clara, alertas e ausência de promessas.
9. **Logs com dados sensíveis**  
   Mitigação: redaction e retenção curta.
10. **Dependências vulneráveis**  
    Mitigação: atualização frequente e scanners de dependência.

## Reporte de vulnerabilidades

Se você encontrar uma falha de segurança, por favor reporte de forma responsável.  
Canal sugerido: `amiggoviagens@gmail.com` (substituir quando houver endereço real).

## SLA de resposta (planejado)

- Confirmação do recebimento: até 72h.
- Avaliação inicial: até 7 dias úteis.

