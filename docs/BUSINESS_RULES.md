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

## Regra em aberto
- `rate_per_class` existe no cadastro, mas **não** há cálculo automático do que pagar ao professor a partir dele. Pagamento a professor é lançado manualmente (ver módulo Pagamentos a Professores).

---

# Módulo de Vínculos (Enrollments)

## Implementado
- Um vínculo conecta: aluno + professor (opcional) + instrumento + dia da semana + horário + duração + aulas por semana + mensalidade do aluno + **billing_type** (weekly|monthly|full) + total_amount + installments + status (ativo/inativo)
- **⚠️ Geração automática de mensalidade REMOVIDA (ETAPA 43).** Anteriormente, criar um vínculo ativo gerava automaticamente a tuition do mês corrente. A funcionalidade foi removida porque o modelo de cobrança da escola (billing_type misto) não se encaixa em geração automática mensal. Cobranças são criadas manualmente conforme necessidade.

## Em aberto
- Se um vínculo for excluído, mensalidades já geradas automaticamente **não** são canceladas nem excluídas — permanecem como estavam, só perdem a referência ao vínculo (`enrollment_id` vira nulo, via `on delete set null` na FK de `tuitions`... na prática as mensalidades já geradas mantêm o `enrollment_id` até que o vínculo seja de fato removido, e nesse caso a FK aponta para `null`). Isso ainda não foi decidido como regra explícita — é só o comportamento atual do banco.

---

# Módulo de Agenda

## Implementado
- Visão mensal (calendário), derivada dos vínculos ativos + aulas (`lessons`) com dia/horário definidos
- Navegação entre meses, indicador de aulas por dia, clique no dia abre lista completa
- Botão para criar aula avulsa/reposição diretamente pela Agenda

## Regra
- A Agenda **não é uma fonte de dado própria** — é sempre uma visualização derivada de `lessons` (filtrada por intervalo de datas).

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

## Pendente
- Relatórios financeiros consolidados (mencionados no roadmap como "Etapa 40", nunca implementados)
- Rotina de geração mensal em lote (existe um endpoint `generate_monthly_billing`, mas seu escopo/regras completas ainda precisam de revisão e documentação específica)

---

# Módulo Financeiro — Pagamentos a Professores

## Implementado
- CRUD manual: professor, mês de referência, valor, pago/não pago, data de pagamento

## Em aberto (pergunta ainda não respondida pelo usuário)
- Se o pagamento a professor deve ser calculado automaticamente a partir de `rate_per_class × número de aulas dadas no mês`, e se isso deve acontecer junto com a geração da mensalidade do aluno ou separadamente.

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
