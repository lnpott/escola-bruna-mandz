# Regras de Negócio

## Objetivo

Este documento descreve as regras de negócio **já implementadas** no sistema Escola Bruna Mandz, e marca claramente o que ainda está pendente ou em aberto.

> Revisão de 10/07/2026: reescrito porque a versão anterior tinha praticamente tudo como "a definir", mesmo regras que já estavam implementadas e em produção há várias etapas (ex: geração automática de mensalidade, RLS via backend). Ver auditoria completa em `docs/proxima-etapa-spec.md`.

---

# Visão Geral

O sistema administra a escola através de um painel único, protegido por senha (não há perfis de usuário ainda). Módulos reais: Alunos, Professores, Vínculos, Agenda, Aulas/Presença, Mensalidades, Pagamentos a Professores, Receitas Avulsas, Custos & Investimentos, Loja.

---

# Módulo de Alunos

## Implementado
- Cadastro, consulta, edição e inativação (`active = false`) de alunos
- Campos: nome, **CPF**, e-mail, telefone, endereço, instrumento(s)
- Campos de responsável: `guardian_name`, `guardian_cpf`, `guardian_phone` (implementados via migration 046)

## Pendente
- Nenhuma pendência atual para este módulo

---

# Módulo de Professores

## Implementado
- Cadastro, consulta e edição
- Campos: nome, telefone, especialidade, dias de atendimento, valor por aula (`rate_per_class`) — quanto a escola paga ao professor por aula dada

## ⚙️ Implementado (Etapas 64-65)
- `rate_per_class` é usado no **cálculo automático de pagamento a professor**: cada aula `completed` no mês × `rate_per_class` do professor gera um `teacher_payment`.
- Disponível via botão **⚡ Gerar Pagamentos** na aba Pag. Professores, que percorre todos os professores ativos, conta aulas completadas no mês e cria os registros de pagamento automaticamente.
- Pagamentos já existentes para o mesmo professor+mês são ignorados (não duplica).

---

# Módulo de Vínculos (Enrollments)

## Implementado
- Um vínculo conecta: aluno + professor (opcional) + instrumento + dia da semana + horário + duração + aulas por semana + mensalidade do aluno + **billing_type** (weekly|monthly|full) + total_amount + installments + status (ativo/inativo)
- **✅ Geração automática de mensalidade** — implementada via wizard de cadastro de aluno (Etapa 61). Ao criar um enrollment com status `'active'`, a tuition do mês corrente é gerada automaticamente.

## ⚙️ Regra decidida (Etapas 64-65)
- **Ao excluir um vínculo, o sistema PERGUNTA se o usuário deseja cancelar mensalidades pendentes também.**
- Mensalidades já **pagas** NÃO são afetadas (permanecem inalteradas).
- Se o usuário optar por cancelar: mensalidades `pending`/`overdue` do vínculo são marcadas como `cancelled`.
- Se o usuário optar por não cancelar: as mensalidades permanecem como estavam, apenas perdem a referência ao vínculo (`enrollment_id` vai a `null` via `on delete set null`).---
# Módulo de Agenda

## Implementado
- Visão mensal (calendário), derivada dos vínculos ativos + aulas (`lessons`) com dia/horário definidos
- Navegação entre meses, indicador de aulas por dia, clique no dia abre lista completa
- Botão para criar aula avulsa/reposição diretamente pela Agenda

## Regra
- A Agenda **não é uma fonte de dado própria** — é sempre uma visualização derivada de `lessons` (filtrada por intervalo de datas).

## Decisão do usuário (Etapas 64-65)
- **Turmas como módulo separado?** ❌ **Não precisa.** Agenda + Vínculos já cobrem o suficiente.
- A visualização por turma/grupo pode ser feita futuramente como uma camada extra sobre a Agenda, não como módulo independente.

---

# Módulo de Aulas (Lessons) e Presença (Attendance)

## Implementado
- Cadastro de aula: tipo (`regular`, `make_up`, `extra`, `trial`), status (`scheduled`, `completed`, `cancelled`, `make_up`), data, horário, duração
- Registro de presença por aula: `present`, `absent`, `excused`, `late` (com minutos de atraso)
- Uma aula pode ter no máximo um registro de presença por aluno (constraint única)

---

# Módulo Financeiro — Mensalidades

## Implementado
- Mensalidade pode ser gerada automaticamente (via vínculo) ou manualmente (mensalidade avulsa, sem `enrollment_id`)
- Status: `pending`, `paid`, `overdue`, `cancelled`
- Suporta desconto (`discount_amount` + `discount_reason`)

## Concluído
- Relatórios financeiros consolidados — implementado na Etapa 57 (breakdown de receitas/despesas, tendência mensal, exportação PDF)
- Exportação CSV — Alunos (Etapa 53) + Receitas Avulsas

## Pendente
- Rotina de geração mensal em lote de tuitions — existe endpoint `generate_monthly_billing`, mas escopo/revisão pendente

---

# Módulo Financeiro — Pagamentos a Professores

## Implementado
- CRUD manual: professor, mês de referência, valor, pago/não pago, data de pagamento

## ⚙️ Decidido (Etapas 64-65)
- ✅ **Pagamento automático a professor**: calcula `rate_per_class × aulas completadas no mês`.
- O cálculo é **acionado manualmente** pelo usuário (botão ⚡ Gerar Pagamentos), não automático junto com a mensalidade.
- **Por quê?** O usuário pode revisar as aulas dadas antes de gerar os pagamentos, permitindo ajustes (ex: aula cancelada que ainda consta como completed, aula extra não registrada, etc.).

---

# Módulo Financeiro — Receitas Avulsas, Custos e Investimentos

## Implementado
- Receitas avulsas (`payments`) com categoria e aluno relacionado opcional
- Custos (`expenses`) separados em `fixed` (fixo) e `variable` (variável), com status de pagamento
- Investimentos (`investments`) com valor e data de compra

---

# Módulo Loja

## Implementado
- Catálogo de produtos com categorias (`roupas`, `acessorios`, `kits`), variantes (ex: tamanho) e estoque
- Checkout via Mercado Pago: PIX (QR Code real) e Cartão (Payment Brick)
- Webhook do Mercado Pago atualiza status do pedido automaticamente (`pending` → `approved`/`rejected`/etc.)
- Notificação por e-mail de novo pedido (via Resend)
- Sistema de XP (`earned_xp`, `reward_xp`) como gamificação da loja

---

# Usuários e Permissões

## Implementado
- Um único nível de acesso: senha de administrador (`ADMIN_PASSWORD`), sem diferenciação de papel/perfil

## Pendente (roadmap futuro, não confundir com implementado)
- Perfis diferenciados (Administrador / Secretaria / Financeiro / Professor)
- Portal do Professor / Portal do Aluno com login próprio

---

# Integração Entre Módulos — resumo real

```
Aluno
 └─ Vínculo (aluno + professor + instrumento + horário + valor)
      ├─ gera → Mensalidade (mês corrente, automática)
      ├─ origina → Aula (agendada manualmente ou via Agenda)
      │     └─ gera → Presença (por aluno, por aula)
      └─ aparece em → Agenda (visão mensal, derivada)

Professor
 ├─ tem → Vínculos
 └─ recebe → Pagamento a Professor (lançado manualmente, mês a mês)

Loja: Produto → Pedido (independente do restante do sistema, só compartilha o mesmo painel e banco)
```

---

# Como manter este documento útil

Regras só devem sair de "A definir" quando **implementadas e confirmadas no código** — não quando planejadas. Ver `docs/proxima-etapa-spec.md` para o processo real de auditoria usado antes de qualquer nova etapa.
