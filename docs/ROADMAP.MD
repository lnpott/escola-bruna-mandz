# Roadmap

## Objetivo

Este documento define o que já foi entregue e o que está planejado para o sistema Escola Bruna Mandz.

O Roadmap não representa datas de entrega, apenas ordem lógica e prioridade.

> Revisão de 16/07/2026 — **4ª revisão**: testes, auditoria Web, acessibilidade CSS, performance CSS, arquivamento painel, limpeza de dados.
> Etapas de referência: `novo_registro.md` 44–72.

---

# Status do Projeto

**Fase:** Em uso ativo — painel administrativo e loja em produção na Vercel/Supabase.

**Onde estamos:** MVP do painel administrativo (Alunos, Professores, Vínculos, Agenda, Aulas/Presença, Financeiro) está funcional e em uso. A Loja está publicada com checkout real via Mercado Pago.

**Próximas melhorias identificadas:** ver seção **Próximas Melhorias**.

---

# ✅ MVP (Versão 1.0) — Concluído

Objetivo: disponibilizar um sistema totalmente funcional para uso interno da Escola Bruna Mandz.

## Infraestrutura
- [x] Configuração do projeto (Vite + Vercel)
- [-] Docker — **não aplicável** (Vercel + Supabase gerenciados); item removido
- [x] Supabase
- [x] Vercel
- [x] Autenticação — senha única de admin (`ADMIN_PASSWORD`), não Supabase Auth
- [ ] Controle de permissões — não implementado (acesso único, sem perfis) → **V2.0**

---

## Dashboard
- [x] Dashboard inicial
- [x] Indicadores (KPIs financeiros)
- [x] Próximas aulas (aulas de hoje, agendadas/realizadas)
- [x] Resumo financeiro
- [x] Alertas (inadimplência, pedidos pendentes, estoque baixo)

---

## Alunos
- [x] Cadastro, edição, consulta, inativação
- [x] Campos: nome, CPF, e-mail, telefone, endereço, instrumento(s), responsável (nome/telefone)
- [x] Matrículas — módulo **Vínculos** (enrollments)
- [x] **Histórico do aluno** — página StudentDetail.tsx (Etapa 53) com aulas, mensalidades e pagamentos

---

## Professores
- [x] Cadastro, edição, consulta
- [x] Especialidades, disponibilidade, valor/aula (`rate_per_class`)
- [x] Agenda — via vínculos + aulas

---

## Agenda
- [x] Calendário — visão mensal estilo Google Calendar (Etapas 46/50)
- [x] Agendamento (Nova Aula), reposição (`make_up`)
- [x] Frequência — presença (attendance)
- [ ] Reagendamento — sem fluxo dedicado
- [ ] Cancelamento — status existe no banco, sem UI dedicada

---

## Financeiro
- [x] Cobranças (mensalidades — geração automática ao criar vínculo ativo via wizard Etapa 61)
- [x] Pagamentos (mensalidades, pagamentos a professores, receitas avulsas)
- [x] Despesas (fixas e variáveis)
- [x] **Relatórios Financeiros** — implementado na Etapa 57 (breakdown + gráfico tendência + PDF)
- [x] **Exportação CSV** — Alunos (Etapa 53) + Receitas Avulsas
- [x] Inadimplência — alerta no Dashboard
- [ ] Fluxo de Caixa — KPIs existem, sem visão temporal dedicada

---

## Loja
- [x] Categorias (roupas, acessórios, kits)
- [x] Produtos com variantes e estoque
- [x] Vendas (pedidos + checkout Mercado Pago PIX/Cartão)
- [ ] Caixa — não há módulo separado do financeiro geral

---

## Configurações
- [ ] Usuários, Perfis, Permissões — não implementado → **V2.0**
- [ ] Dados da escola — não implementado

---

# Versão 1.1

Objetivo: melhorar a produtividade da equipe.

## Dashboard
- [ ] Personalização

## Agenda
- [x] Agenda mensal ✅
- [ ] Busca avançada (filtrar por professor ou aluno)

## Financeiro
- [ ] Parcelamentos
- [x] Relatórios Financeiros ✅ (Etapa 57)
- [x] Exportação CSV ✅ (Alunos + Receitas Avulsas)

## Loja
- [ ] Relatórios de vendas
- [ ] Histórico de estoque

---

# Versão 1.2

Objetivo: automatizar processos.

- [x] Geração automática de cobranças (tuitions) ao criar vínculo ativo ✅
- [x] **Geração automática de pagamento a professor** — `rate_per_class × aulas dadas no mês` ✅ (Etapa 64 — botão ⚡ Gerar Pagamentos)
- [ ] Atualização automática do fluxo de caixa
- [ ] Notificações internas
- [ ] Auditoria de alterações

---

# Versão 2.0

Objetivo: ampliar o sistema.

## Portal do Professor
- Login próprio, agenda, frequência, histórico

## Portal do Aluno
- Login próprio, agenda, financeiro, histórico

---

# Próximas Melhorias (curto prazo)

Com base na auditoria mais recente (15/07/2026), em ordem de prioridade:

| Prioridade | Item | Descrição | Status |
|:----------:|------|-----------|:------:|
| 🔴 1 | **Testes ponta a ponta pós-deploy** | Validar fluxo completo: criar vínculo → mensalidade gerada → aula → presença → agenda | ⚠️ Pendente |
| 🟡 2 | **Agenda: busca avançada** | Filtrar agenda por professor ou aluno | ⏳ Não iniciado |
| 🟢 3 | **Agenda: reagendar/cancelar aula** | UI dedicada para ações em aulas já criadas | ⏳ Não iniciado |
| 🟢 4 | **Financeiro: parcelamentos** | Suporte a parcelamento de mensalidades | ⏳ Não iniciado |
| 🟢 5 | **Loja: relatórios de vendas** | Relatórios de vendas da loja | ⏳ Não iniciado |


## Itens concluídos (removidos da lista de pendências)

| Item | Concluído em |
|------|:------------:|
| Alunos Expandido (guardian fields, CSV, multi-instrumento) | Etapa 53 |
| Relatórios Financeiros (breakdown + PDF) | Etapa 57 |
| Histórico do aluno (StudentDetail.tsx) | Etapa 53 |
| Geração automática de tuitions no wizard | Etapa 61 |
| Agenda Mensal (substituiu visão semanal) | Etapas 46/50 |
| **Pagamento automático a professor** (rate_per_class × aulas) | **Etapa 64 — ⚡ Gerar Pagamentos** |
| **18 testes unitários** (teacherPayments + deleteEnrollment) | Etapa 66 |
| **Auditoria de Design Web** (48 regras Vercel, 20 arquivos revisados) | Etapa 67 |
| **Acessibilidade** (13 `outline:none` → `:focus-visible`) | Etapa 68 |
| **Performance CSS** (53 `transition:all` → props explícitas) | Etapa 69 |
| **Arquivamento painel-x9k2f.html** (movido para backup/) | Etapa 70 |
| **Auditoria commercial/index.html** (0 referências obsoletas) | Etapas 70-71 |
| **Limpeza de dados** (6 alunos → 1, 3 professores → 1) | Etapa 72 |

## Decisões do Usuário (15-16/07/2026)

| Decisão | Resposta |
|---------|:--------:|
| **Pagamento automático a professor** (`rate_per_class × aulas`) | ✅ **Automático** — implementado nas Etapas 64-65 (botão ⚡ Gerar Pagamentos) |
| **Relatório Financeiro atual (Etapa 57)** | ✅ **Atende** — manter formato como está |
| **Exclusão de vínculo: cancelar mensalidades?** | ✅ **Perguntar antes** — sistema pergunta se quer cancelar as mensalidades também |

## Todas as perguntas decididas ✅

Todas as questões em aberto foram respondidas pelo usuário (15-16/07/2026). Nenhuma pendência de decisão restante.

| Decisão | Resposta |
|---------|:--------:|
| **'Turmas' como módulo separado?** | ✅ **Não precisa** — Vínculos + Agenda já cobrem a necessidade |
| **1 aluno + 1 professor para começar?** | ✅ **Sim** — manter Sofia + Bruna, limpar resto |

---

# Ideias Futuras

Estas funcionalidades ainda não possuem prioridade definida.

- Aplicativo mobile
- Integração com WhatsApp
- Integração com e-mail (já existe notificação de pedido via Resend; expandir para outros eventos, ex: mensalidade próxima do vencimento)
- Assinatura digital
- Emissão de certificados
- Emissão de contratos
- Controle de salas
- Controle de instrumentos
- Biblioteca de partituras
- Empréstimo de instrumentos
- Backup automático — **parcialmente implementado**: já existe workflow de backup via GitHub Actions/Artifacts para a Loja (ver `relatorio_auditoria_sistema.md`); avaliar se cobre também os dados do painel financeiro/pedagógico
- Multiempresa
- Multiunidade

---

# Critérios para Novas Funcionalidades

Antes de adicionar uma nova funcionalidade, responder às seguintes perguntas:

1. Resolve um problema real da escola?
2. Pode ser implementada sem aumentar desnecessariamente a complexidade?
3. Impacta outros módulos?
4. Exige alteração no banco de dados?
5. Exige alteração nas permissões?
6. A documentação foi atualizada?

Se qualquer resposta exigir mudanças estruturais, a documentação correspondente deve ser atualizada **junto** com a implementação — nunca marcada como concluída sem conferir o código primeiro (foi exatamente esse o problema desta versão anterior do Roadmap).

---

# Regra do Projeto

A prioridade sempre será:

1. Sistema funcionando.
2. Código limpo.
3. Arquitetura consistente.
4. Novas funcionalidades.

Nenhuma funcionalidade nova deve comprometer a estabilidade do sistema.

Lembrete de manutenção deste documento: antes de marcar qualquer item como concluído, confirmar no código (schema, API ou painel) — não apenas na memória da conversa ou na intenção original.
