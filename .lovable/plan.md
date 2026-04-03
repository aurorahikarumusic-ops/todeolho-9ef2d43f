
## Fase 1 — Banco de Dados e Infraestrutura
- Adicionar tabela `families` (mae_id, pai_id, invite_code)
- Adicionar tabela `task_approvals` para fluxo de aprovação
- Adicionar tabela `monthly_challenges` para desafios do mês
- Criar RLS policies baseadas em role (mãe cria tarefas/eventos, pai executa)
- Habilitar Realtime nas tabelas principais

## Fase 2 — Sistema de Conexão Familiar
- Fluxo de convite: mãe gera código de 6 dígitos
- Tela de entrada de código para o pai
- Compartilhamento via WhatsApp com mensagem pré-preenchida
- Banner persistente se pai ainda não entrou

## Fase 3 — Onboarding da Mãe (6 telas)
- Confirmação de papel, perfil, convite, filho, primeira tarefa, boas-vindas

## Fase 4 — Dashboard da Mãe
- Header rosa com saudação empoderada e stats do pai
- Cards de resumo (tarefas, resgates, avaliação)
- Ações rápidas (nova tarefa, evento, ranking)
- Resumo semanal compartilhável

## Fase 5 — Tarefas (visão da mãe)
- Criar tarefas com urgência, prova foto, pontos
- Tabs: Pendentes, Aguardando aprovação, Concluídas, Resgatadas
- Fluxo de aprovação/reprovação com comentário
- Botão "Eu Resolvi" (resgate)

## Fase 6 — Agenda (visão da mãe)
- Calendário com eventos criados pela mãe
- Check-in do pai com foto
- Status de presença (verde/laranja/cinza)

## Fase 7 — Avaliação Semanal + Gamificação da Mãe
- Tela de rating semanal (1-5 estrelas)
- Badges exclusivos da mãe
- Desafio mensal
- Relatório mensal

## Fase 8 — Navegação e Visual
- Bottom nav diferente por role
- Cores rosa para mãe, verde para pai
- Tokens CSS para temas por role

**Nota:** Cada fase será implementada e testada antes de avançar. Vou começar pela Fase 1 (banco de dados) pois todas as outras dependem dela.
