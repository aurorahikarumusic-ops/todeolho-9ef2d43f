
# 🧓 Modo Avó - Plano de Implementação

## 1. Banco de Dados
- Nova tabela `grandma_suggestions` com campos: `user_id` (avó), `family_id`, `suggestion_type` (tarefa/evento/palpite), `title`, `description`, `status` (pendente/aceito/recusado/ignorado), `response_by`, `response_comment`
- Permitir role "avo" na tabela profiles (já suporta texto livre)

## 2. Autenticação - Login Avó
- Novo formulário `GrandmaLoginForm` na AuthPage, abaixo do botão "Sou a Chefe"
- Botão **"Sou a Avó 👵"** com visual único (tons de lilás/roxo)
- Interface com frases como: *"Na minha época..."*, *"Eu criei 5 filhos sem isso"*
- Role "avo" atribuída no signup

## 3. Dashboard da Avó
- Nova página `AvoDashboard` com visual lilás/roxo
- Formulário para enviar palpites (sugestões de tarefas, conselhos, críticas construtivas)
- Histórico de palpites enviados com status (aceito ✅, recusado ❌, ignorado 🙄)
- **Ranking de Avós** - quem dá mais palpites, quem tem mais aceitos

## 4. Botão Flutuante (Pai e Mãe)
- Botão flutuante "👵 Palpites da Vovó" com badge de contagem
- Ao clicar, abre drawer/modal com lista de sugestões pendentes
- Mãe pode: Aceitar (vira tarefa/evento), Recusar (com comentário sarcástico), Ignorar
- Pai pode: Ver os palpites e reagir com emojis

## 5. Fluxo
```
Avó envia palpite → Notificação no botão flutuante → Mãe aceita/recusa → 
Se aceito: vira tarefa real → Pai executa
Se recusado: Avó recebe feedback sarcástico
```

## 6. Frases Sarcásticas da Avó
- "Na minha época a gente não precisava de app pra criar filho"
- "O pai tá fazendo isso errado, tenho certeza"
- "Vocês já deram comida pro meu neto?"
- "Eu avisei que isso ia acontecer"

## 7. Conexão Familiar
- A avó se conecta à família via código de convite (mesmo sistema existente)
- Pode haver múltiplas avós por família (avó materna + paterna)
