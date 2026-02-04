# Roadmap curto do MVP (prioridades + ordem sugerida)

## 1) Relatorio “sem IA” (prioridade maxima)
**Objetivo:** relatorio disponivel sempre apos pagamento, exibindo todos os campos e copiando ao clique.  
**Prompt sugerido:**  
"Implementar relatorio sem IA: apos pagamento, gerar um relatorio com todos os campos preenchidos pelo usuario. Exibir os campos em uma lista/cards e permitir copiar o valor ao clicar no campo (feedback visual de 'copiado'). Garantir que o relatorio esteja disponivel mesmo sem integracao com IA."

---

## 2) Pipeline de pos-pagamento (status e geracao)
**Objetivo:** automatizar a transicao de status e criacao do relatorio basico.  
**Prompt sugerido:**  
"Criar pipeline pos-pagamento: quando status do pagamento for aprovado, atualizar a aplicacao para `paid` e gerar o relatorio basico (sem IA) com os dados das respostas. Em seguida, atualizar status para `done` e permitir acesso ao relatorio."

---

## 3) Tela de status + polling
**Objetivo:** consolidar feedback pos-pagamento e garantir redirecionamento correto.  
**Prompt sugerido:**  
"Melhorar a tela `/app/a/[id]/status` com mensagens claras (aguardando confirmacao, processando, concluido, erro) e fallback de polling ate o relatorio estar pronto."

---

## 4) Dashboard e acesso ao relatorio
**Objetivo:** UX completa de pos-pagamento.  
**Prompt sugerido:**  
"Atualizar o dashboard para mostrar status atualizado e CTA para abrir o relatorio quando disponivel. Garantir que o botao 'Ver relatorio' esteja sempre presente quando `done`."

---

## 5) Observabilidade minima
**Objetivo:** facilitar debug e suporte.  
**Prompt sugerido:**  
"Adicionar logs basicos no fluxo de pagamento e geracao de relatorio (com IDs), e mensagens de erro amigaveis ao usuario."

---

## 6) Incremento IA (futuro)
**Objetivo:** enriquecer relatorio com sugestoes.  
**Prompt sugerido:**  
"Integrar OpenAI para gerar alertas/sugestoes e anexar ao relatorio existente, sem substituir o conteudo base."
