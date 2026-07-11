# Roadmap

## Objetivo

Este documento define o que já foi entregue e o que está planejado para o sistema Escola Bruna Mandz.

O Roadmap não representa datas de entrega, apenas ordem lógica e prioridade.

> Revisão de 10/07/2026: a versão anterior estava com **tudo desmarcado** (fase "Planejamento", v0.1.0), mesmo com boa parte do MVP já em produção há várias etapas. Reescrito com base no código real (`painel_registro.md` Etapas 1–42, `docs/proxima-etapa-spec.md`, `TODO_PROGRESS.md`).

---

# Status do Projeto

**Fase:** Em uso ativo — painel administrativo e loja em produção na Vercel/Supabase.

**Onde estamos:** MVP do painel administrativo (Alunos, Professores, Vínculos, Agenda, Aulas/Presença, Financeiro) está funcional e em uso. A Loja está publicada com checkout real via Mercado Pago. Faltam alguns refinamentos pontuais antes de considerar o MVP "fechado" — ver seção **Próximas Melhorias**.

---

# MVP (Versão 1.0)

Objetivo: disponibilizar um sistema totalmente funcional para uso interno da Escola Bruna Mandz.

## Infraestrutura
- [x] Configuração do projeto (Vite + Vercel)
- [ ] Docker — **não aplicável**: o projeto roda sem containers (Vercel + Supabase gerenciados); item removido da meta, não é mais objetivo do MVP
- [x] Supabase
- [x] Vercel
- [x] Autenticação — senha única de admin (`ADMIN_PASSWORD`), não Supabase Auth
- [ ] Controle de permissões — não implementado (acesso único, sem perfis)

---

## Dashboard
- [x] Dashboard inicial
- [x] Indicadores (KPIs financeiros)
- [x] Próximas aulas (aulas de hoje, agendadas/realizadas)
- [x] Resumo financeiro
- [x] Alertas (inadimplência, pedidos pendentes, estoque baixo)

---

## Alunos
- [x] Cadastro
- [x] Edição
- [x] Consulta
- [x] Inativação (`active = false`)
- [x] Matrículas — implementado como módulo **Vínculos** (enrollments), conectando aluno + professor + instrumento + horário
- [ ] Histórico — ainda não existe uma tela dedicada de histórico do aluno (aulas passadas, mensalidades, presença, tudo junto)

---

## Professores
- [x] Cadastro
- [x] Especialidades
- [x] Disponibilidade (dias de atendimento)
- [x] Agenda — via vínculos + aulas

---

## Agenda
- [x] Calendário — visão mensal, estilo Google Calendar
- [x] Agendamento (botão "Nova Aula")
- [ ] Reagendamento — ainda não há fluxo dedicado para reagendar uma aula existente
- [ ] Cancelamento — status `cancelled` existe no schema de `lessons`, mas não há ação de UI dedicada para cancelar
- [x] Reposição — tipo de aula `make_up` já existe no schema e é selecionável
- [x] Frequência — presença (attendance) implementada

---

## Financeiro
- [x] Cobranças (mensalidades — geração automática ao criar vínculo ativo)
- [x] Pagamentos (mensalidades, pagamentos a professores, receitas avulsas)
- [x] Despesas (fixas e variáveis)
- [ ] Fluxo de Caixa — existem KPIs de receita/despesa/saldo no Dashboard, mas não uma visão de fluxo de caixa ao longo do tempo
- [x] Inadimplência — alerta de alunos em atraso no Dashboard

---

## Loja
- [x] Categorias (roupas, acessórios, kits)
- [x] Produtos
- [x] Estoque
- [x] Vendas (pedidos + checkout Mercado Pago)
- [ ] Caixa — não há um módulo de fechamento de caixa da loja separado do financeiro geral

---

## Configurações
- [ ] Usuários — não implementado (só uma senha única)
- [ ] Perfis — não implementado
- [ ] Permissões — não implementado
- [ ] Dados da escola — não há tela de configuração de dados institucionais

---

# Versão 1.1

Objetivo: melhorar a produtividade da equipe.

## Dashboard
- [ ] Mais indicadores
- [ ] Gráficos
- [ ] Personalização

## Agenda
- [x] Agenda semanal — implementada e depois **substituída** pela mensal (decisão do usuário: "semanal assim não adianta")
- [x] Agenda mensal
- [ ] Busca avançada (ex: filtrar agenda por professor ou aluno)

## Financeiro
- [ ] Parcelamentos
- [ ] Relatórios — mencionado como "Etapa 40" em registros antigos, nunca implementado
- [x] Exportação — CSV já existe para Receitas Avulsas; falta para os demais módulos financeiros

## Loja
- [ ] Relatórios de vendas
- [ ] Histórico de estoque

---

# Versão 1.2

Objetivo: automatizar processos.

- [x] Geração automática de cobranças — implementado para mensalidades (tuitions), ao criar vínculo ativo
- [ ] Geração automática de pagamento a professor — `rate_per_class` já existe no cadastro do professor, mas o cálculo `rate_per_class × aulas dadas no mês` ainda não é automático (pergunta em aberto, ver seção abaixo)
- [ ] Atualização automática do fluxo de caixa
- [ ] Notificações internas
- [ ] Auditoria de alterações

---

# Versão 2.0

Objetivo: ampliar o sistema.

## Portal do Professor
- [ ] Login próprio
- [ ] Agenda
- [ ] Frequência
- [ ] Histórico

## Portal do Aluno
- [ ] Login próprio
- [ ] Agenda
- [ ] Financeiro
- [ ] Histórico

## Loja
- [x] Catálogo online
- [x] Pedidos
- [x] Integração com pagamentos

> Nota: os 3 itens de Loja acima já foram entregues antes da Versão 2.0 formalmente começar — a Loja evoluiu em paralelo ao painel administrativo. Mantidos aqui só para referência histórica do plano original.

---

# Próximas Melhorias (curto prazo)

Com base na auditoria mais recente (`docs/proxima-etapa-spec.md`, 10/07/2026) e no `TODO_PROGRESS.md`, o que falta para fechar o ciclo atual, em ordem de prioridade:

| Prioridade | Item | Descrição |
|---|---|---|
| 🔴 1 | **Alunos Expandido** | Adicionar `guardian_name` e `guardian_phone` (responsável) no cadastro e no modal |
| 🟡 2 | **Testes ponta a ponta pós-deploy** | Validar em produção o fluxo completo: criar vínculo → mensalidade gerada → aula → presença → agenda mensal |
| 🟢 3 | **Relatórios Financeiros** | Definir formato (fechamento mensal? por aluno? por professor?) e implementar |
| 🟢 4 | **Pagamento automático a professor** | Decidir se `teacher_payments` deve ser calculado a partir de `rate_per_class × aulas do mês`, e se deve ser gerado junto com a mensalidade do aluno ou separado |
| 🟢 5 | **Reagendamento e cancelamento de aula** | Hoje os status/tipos existem no banco (`cancelled`, `make_up`) mas faltam ações de UI dedicadas para reagendar/cancelar uma aula já criada |
| 🟢 6 | **Histórico do aluno** | Tela única reunindo aulas passadas, presença, mensalidades e status por aluno |

Perguntas ainda em aberto (não decididas pelo usuário — não implementar sem confirmar):
1. Pagamento automático a professor: automático ou continua manual?
2. Formato dos Relatórios Financeiros
3. Exclusão de vínculo: mensalidades já geradas automaticamente devem ser canceladas junto?
4. "Turmas" como módulo separado ainda faz sentido, ou Agenda + Vínculos já cobre essa necessidade?

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
