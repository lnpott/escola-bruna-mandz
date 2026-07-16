# [ARQUIVADO] — ver novo_registro.md

> Este TODO foi arquivado em 12/07/2026. O conteúdo abaixo já foi
> implementado (Etapas 34–39 do `novo_registro.md`): tabela `teachers`,
> vínculo pedagógico via `enrollments`, custos fixos/eventuais em `expenses`
> (`expense_type`). A fonte de verdade de pendências passa a ser
> exclusivamente o `novo_registro.md` — não crie mais arquivos TODO
> separados; registre pendências na seção "Pendências" de cada etapa.

---

# TODO — Professores, mensalidade semanal e custos (fixos/eventuais)

## 1) Banco de dados (Supabase)
- [ ] Atualizar `supabase/financial-schema.sql`:
  - [ ] Criar tabela `teachers` (nome, telefone, especialidade, dias)
  - [ ] Atualizar `tuitions` para conter:
    - [ ] `instrument` (texto)
    - [ ] `duration_week_minutes` (inteiro/número) ou `duration_minutes` (número)
    - [ ] `teacher_id` (FK teachers)
    - [ ] `frequency` / `is_default_one_class_per_week` (boolean) e/ou campos equivalentes
    - [ ] Definir regra: valor e por semana
- [ ] Atualizar `expenses` para separar custos fixos vs eventuais:
  - [ ] Adicionar `expense_type` = 'fixed' | 'eventual' (string/text)
  - [ ] Garantir que eventuais também tenham `paid` e `paid_at` (data real de pagamento), mesmo podendo ser pago em mês diferente


## 2) Backend API
- [ ] Atualizar `api/admin-financial.js` (sem criar novas functions para respeitar o hobby plan):
  - [ ] Adicionar resource: `teachers` (CRUD) dentro do mesmo arquivo
  - [ ] Ajustar `resource=tuitions` (GET/POST/PATCH) para incluir novos campos (instrument/duração/teacher e padrão)
  - [ ] Ajustar `resource=expenses` (GET/POST/PATCH) para filtrar e listar por `expense_type`


## 3) Frontend (painel)
- [ ] Editar `painel-x9k2f.html`:
  - [ ] Adicionar sub-aba **👩‍🏫 Professores** dentro do Financeiro
  - [ ] Criar modal para novo/editar professor (nome, telefone, especialidade, dias)
  - [ ] Atualizar modal/form de **Nova Mensalidade**:
    - [ ] Permitir selecionar professor
    - [ ] Campo instrumento (com opção de padrão se quiser)
    - [ ] Campo duração
    - [ ] Opção padrão: “1 aula por semana” (default) mas permitir sair
  - [ ] Atualizar tabela/linhas de Mensalidades para exibir professor/instrumento/duração
  - [ ] Atualizar **Custos & Investimentos**:
    - [ ] Separar em duas colunas/sections: Custos Fixos e Custos Eventuais
    - [ ] Botão “Marcar pago” continuar funcionando para ambos

## 4) Dados iniciais e validação
- [ ] Rodar SQL no Supabase e garantir migração sem erros
- [ ] Testar no navegador:
  - [ ] Cadastrar professor
  - [ ] Criar mensalidade com professor/instrumento/duração e padrão 1 aula/semana
  - [ ] Criar custo fixo e eventual e marcar como pago
- [ ] Confirmar que resumo/ KPIs do Financeiro continuam coerentes

