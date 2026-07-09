# Roadmap

## Objetivo

Este documento define a evolução planejada do sistema.

Ele serve como referência para organização do desenvolvimento, definição de prioridades e acompanhamento das versões.

O Roadmap não representa datas de entrega, apenas a ordem lógica de implementação.

---

# Status do Projeto

**Versão Atual:** 0.1.0

**Fase:** Planejamento

---

# MVP (Versão 1.0)

Objetivo: disponibilizar um sistema totalmente funcional para uso interno da Escola Bruna Mandz.

## Infraestrutura

- [ ] Configuração do projeto
- [ ] Docker
- [ ] Supabase
- [ ] Vercel
- [ ] Autenticação
- [ ] Controle de permissões

---

## Dashboard

- [ ] Dashboard inicial
- [ ] Indicadores
- [ ] Próximas aulas
- [ ] Resumo financeiro
- [ ] Alertas

---

## Alunos

- [ ] Cadastro
- [ ] Edição
- [ ] Consulta
- [ ] Inativação
- [ ] Matrículas
- [ ] Histórico

---

## Professores

- [ ] Cadastro
- [ ] Especialidades
- [ ] Disponibilidade
- [ ] Agenda

---

## Agenda

- [ ] Calendário
- [ ] Agendamento
- [ ] Reagendamento
- [ ] Cancelamento
- [ ] Reposição
- [ ] Frequência

---

## Financeiro

- [ ] Cobranças
- [ ] Pagamentos
- [ ] Despesas
- [ ] Fluxo de Caixa
- [ ] Inadimplência

---

## Loja

- [ ] Categorias
- [ ] Produtos
- [ ] Estoque
- [ ] Vendas
- [ ] Caixa

---

## Configurações

- [ ] Usuários
- [ ] Perfis
- [ ] Permissões
- [ ] Dados da escola

---

# Versão 1.1

Objetivo: melhorar a produtividade da equipe.

## Dashboard

- [ ] Mais indicadores
- [ ] Gráficos
- [ ] Personalização

---

## Agenda

- [ ] Agenda semanal
- [ ] Agenda mensal
- [ ] Busca avançada

---

## Financeiro

- [ ] Parcelamentos
- [ ] Relatórios
- [ ] Exportação

---

## Loja

- [ ] Relatórios de vendas
- [ ] Histórico de estoque

---

# Versão 1.2

Objetivo: automatizar processos.

- [ ] Geração automática de cobranças
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

---

## Portal do Aluno

- [ ] Login próprio
- [ ] Agenda
- [ ] Financeiro
- [ ] Histórico

---

## Loja

- [ ] Catálogo online
- [ ] Pedidos
- [ ] Integração com pagamentos

---

# Ideias Futuras

Estas funcionalidades ainda não possuem prioridade definida.

- Aplicativo mobile
- Integração com WhatsApp
- Integração com e-mail
- Assinatura digital
- Emissão de certificados
- Emissão de contratos
- Controle de salas
- Controle de instrumentos
- Biblioteca de partituras
- Empréstimo de instrumentos
- Backup automático
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

Se qualquer resposta exigir mudanças estruturais, a documentação correspondente deve ser atualizada antes da implementação.

---

# Regra do Projeto

A prioridade sempre será:

1. Sistema funcionando.
2. Código limpo.
3. Arquitetura consistente.
4. Novas funcionalidades.

Nenhuma funcionalidade nova deve comprometer a estabilidade do sistema.