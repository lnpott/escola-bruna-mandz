# Módulos do Sistema

## Objetivo

Este documento descreve os módulos **realmente implementados** no sistema Escola Bruna Mandz, dentro do painel administrativo (React SPA em `/app/`) e da loja pública. O painel clássico (`painel-x9k2f.html`) foi arquivado em `backup/`.

> Revisão de 10/07/2026: reescrito para refletir o que existe no código hoje. A versão anterior descrevia módulos genéricos de planejamento, sem relação com a implementação real (nomes de tabelas incorretos, funcionalidades listadas como "a definir" que já estão prontas há várias etapas).

---

# Estrutura Geral (abas do painel)

```
Dashboard
Agenda
Alunos
Professores
Financeiro
  ├── Vínculos
  ├── Aulas (+ Presença)
  ├── Receitas Avulsas
  ├── Custos
  └── Investimentos
Loja
  ├── Pedidos
  └── Produtos
```

> ⚠️ **Mudanças recentes (jul/2026):**
> - **Alunos** e **Professores** foram movidos para abas principais (não são mais sub-abas do Financeiro)
> - **Mensalidades** e **Pagto Professores** foram removidos como sub-abas autônomas (cobranças são gerenciadas via perfil do aluno)
> - **Custos** e **Investimentos** foram separados em sub-abas distintas
> - **Loja** virou aba principal com sub-abas Pedidos e Produtos

Não há aba de "Configurações", "Portal do Professor" ou "Portal do Aluno" — esses são itens de roadmap futuro, não módulos existentes (ver `ROADMAP.MD`).

---

# Dashboard

## Objetivo
Visão geral rápida da operação da escola e da loja.

## O que mostra hoje
- KPIs financeiros: receita, despesas, saldo, pendências, alunos em atraso
- Aulas de hoje (agendadas / realizadas)
- Alertas: inadimplência, pedidos pendentes, estoque baixo
- Pedidos recentes da loja
- Produtos com estoque baixo

---

# Alunos

## Objetivo
Cadastro e gestão dos alunos.

## Campos reais (tabela `students`)
- Nome, **CPF**, e-mail, telefone, endereço, instrumento(s), ativo/inativo
- Responsável: `guardian_name`, `guardian_cpf`, `guardian_phone` (para alunos menores)
- *CPF e campos de responsável adicionados via migrations 045 e 046*

## Integrações reais
- **Vínculos**: um aluno pode ter um ou mais vínculos (um por instrumento/professor)
- **Mensalidades**: geradas a partir do vínculo, referenciam `student_id`

---

# Professores

## Objetivo
Cadastro e gestão dos professores.

## Campos reais (tabela `teachers`)
- Nome, **CPF**, e-mail, telefone, especialidade, dias de atendimento (`days_of_week`, texto — convertido de `text[]` para `text` na migration 045), valor por aula (`rate_per_class`) — quanto a escola paga ao professor, não quanto o aluno paga
- **Ativo/inativo** (`active boolean`, adicionado na migration 045)

## Integrações reais
- **Vínculos**: um professor pode ter vários vínculos com alunos diferentes
- **Pagamentos a Professores**: lançados manualmente por mês, sem cálculo automático a partir de `rate_per_class` ainda (pendente, ver `BUSINESS_RULES.md`)

---

# Vínculos (Enrollments)

## Objetivo
É o módulo central que conecta aluno + professor + instrumento + horário + valor da mensalidade. Existe justamente para não duplicar dado pedagógico em outras tabelas.

## Campos reais (tabela `enrollments`)
- `student_id`, `teacher_id`, `instrument`, `day_of_week`, `class_time`, `duration_minutes`, `classes_per_week`, `monthly_fee`, **`billing_type`** (monthly|weekly|full), **`total_amount`**, **`installments`**, `status` (active/inactive), `notes`

> `billing_type`, `total_amount` e `installments` foram adicionados na migration 043 para suportar modelo de cobrança misto (semanal/mensal/completo).

## Regra de negócio real
⚠️ **Geração automática de mensalidade foi REMOVIDA na ETAPA 43.** Anteriormente, ao criar um vínculo ativo o sistema gerava automaticamente a tuition do mês corrente. Após a introdução do `billing_type`, o usuário confirmou que mensalidade "não é por mês e não tem automática", então a geração automática foi removida.

## Criação de aulas
O modal de Nova Aula (na Agenda ou na aba Aulas) permite selecionar **Aluno**, **Professor** e **Instrumento** separadamente (3 selects, substituindo o dropdown único de enrollment_id). O instrumento é filtrado dinamicamente conforme a especialidade do professor selecionado (matching exato, com fallback para as próprias especialidades do professor).

A API (`handleLessons POST`) aceita tanto `enrollment_id` (vínculo existente) quanto os campos diretos `student_id` + `teacher_id` + `instrument`. Na prática, o frontend sempre envia os campos diretos.

> A coluna `enrollment_id` na tabela `lessons` foi tornado **nullable** (migration 047) para suportar aulas avulsas sem vínculo.

## Integrações reais
- **Agenda**: a visão mensal é derivada dos vínculos ativos com dia/horário definidos
- **Mensalidades**: cada vínculo pode gerar mensalidades mês a mês
- **Aulas**: cada vínculo pode ter aulas individuais agendadas (`lessons`)

---

# Agenda

## Objetivo
Visualização mensal (estilo calendário) das aulas da escola.

## Funcionalidades reais
- Grade mensal com navegação entre meses e botão "Hoje"
- Cada dia mostra até 3 aulas (horário + nome do aluno), com "+N mais" se houver mais
- Clique no dia abre modal com a lista completa de aulas e permite marcar presença
- Botão "Nova Aula" para agendar aula avulsa/reposição (modal com selects separados de Aluno, Professor e Instrumento)

## Origem dos dados
A agenda **não tem tabela própria** — é uma visualização sobre `lessons` (filtrando por intervalo de datas do mês).

---

# Aulas (Lessons) + Presença (Attendance)

## Objetivo
Registrar aulas individuais (regulares, reposição, extra, aula experimental) e a presença de cada aluno.

## Campos reais (tabela `lessons`)
- `enrollment_id`, `student_id`, `teacher_id`, `instrument`, `date`, `start_time`, `end_time`, `duration_minutes`, `lesson_type` (`regular` | `make_up` | `extra` | `trial`), `status` (`scheduled` | `completed` | `cancelled` | `make_up`)

## Campos reais (tabela `attendance`)
- `lesson_id`, `student_id`, `status` (`present` | `absent` | `excused` | `late`), `late_minutes`, `notes`

---

# Mensalidades (Tuitions)

## Objetivo
Cobrança mensal do aluno.

## Campos reais (tabela `tuitions`)
- `student_id`, `enrollment_id` (opcional — pode existir mensalidade avulsa sem vínculo), `reference_month`, `amount`, `discount_amount`, `discount_reason`, `due_date`, `status` (`pending`|`paid`|`overdue`|`cancelled`), `payment_method`, `paid_at`, `notes`

## Regra real
⚠️ **Geração automática foi removida na ETAPA 43.** Anteriormente, ao criar um vínculo ativo o sistema gerava automaticamente a tuition do mês corrente. O modelo de cobrança foi alterado para `billing_type` misto (weekly/monthly/full) e o usuário confirmou que mensalidade "não é por mês e não tem automática". As cobranças são criadas manualmente conforme necessidade.

Também podem ser criadas mensalidades avulsas (sem vínculo) para receitas eventuais.

---

# Pagamentos a Professores (Teacher Payments)

## Objetivo
Registrar quanto foi pago a cada professor, por mês.

## Campos reais (tabela `teacher_payments`)
- `teacher_id`, `reference_month`, `amount`, `paid`, `paid_at`, `notes`

## Estado real
CRUD manual — **não há** cálculo automático a partir de `rate_per_class × aulas dadas no mês` ainda. Isso é uma pergunta em aberto (ver `proxima-etapa-spec.md`, seção 6).

---

# Receitas Avulsas (Payments) e Custos & Investimentos (Expenses/Investments)

## Objetivo
Registrar receitas fora da mensalidade, custos fixos/variáveis e investimentos da escola.

## Campos reais
- `payments`: categoria, valor, aluno relacionado (opcional)
- `expenses`: `expense_type` (`fixed`|`variable`), categoria, valor, vencimento, pago/não pago
- `investments`: valor, data de compra, descrição

---

# Loja

## Objetivo
Venda de produtos (camisetas, acessórios, kits) com checkout via Mercado Pago (PIX e Cartão), servindo mais como ferramenta de conversão/confiança do que como receita principal.

## Campos reais (tabela `products`)
- Nome, descrição, preço, estoque, categoria (`roupas`|`acessorios`|`kits`), badge, imagem, XP de recompensa, variantes (tamanho, jsonb)

## Campos reais (tabela `orders`)
- Status (`pending`|`approved`|`rejected`|`cancelled`|`refunded`), método (`pix`|`card`|`manual`), dados do cliente, itens (snapshot em jsonb), total, dados do pagamento no Mercado Pago

## Integrações reais
- Webhook do Mercado Pago atualiza o status do pedido automaticamente
- E-mail de notificação de novo pedido via Resend

---

# Regras Gerais dos Módulos

- Cada módulo (`resource=` na API) tem sua própria função `handleX` dentro de `admin-financial.js` (ou arquivo próprio, no caso da Loja).
- Novo módulo financeiro/pedagógico **não** deve virar uma nova Serverless Function — deve entrar como novo `resource=` em `admin-financial.js`, por causa do limite de functions da Vercel.
- Nenhum módulo acessa o Supabase diretamente do frontend.

---

# Evolução

Módulos futuros (não implementados, apenas planejados) estão documentados em `ROADMAP.MD` — por exemplo, Portal do Professor, Portal do Aluno e Configurações/Permissões. Nenhuma funcionalidade deve ser considerada existente apenas por estar listada lá.
