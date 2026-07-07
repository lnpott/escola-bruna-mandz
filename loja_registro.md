# =====================================================================
# MANUAL DE REGISTRO E CONTINUIDADE DO PROJETO
# LEITURA OBRIGATÓRIA PARA TODO AGENTE (IA OU DESENVOLVEDOR)
# =====================================================================

> **Este documento é a principal fonte de informação do projeto.**
>
> Antes de qualquer alteração no código, banco de dados ou infraestrutura, este arquivo deve ser lido integralmente.
>
> Após qualquer implementação relevante, este arquivo DEVE ser atualizado.

---

# Objetivo

O arquivo `loja_registro.md` é o **Diário Oficial de Desenvolvimento** do projeto Escola Bruna Mandz.

Sua finalidade é garantir que qualquer agente (IA ou desenvolvedor) consiga compreender rapidamente:

- Estado atual do projeto;
- Arquitetura utilizada;
- Tecnologias empregadas;
- Funcionalidades existentes;
- Decisões técnicas tomadas;
- Limitações conhecidas;
- Problemas encontrados;
- Soluções adotadas;
- Próximas implementações planejadas.

Este documento possui prioridade sobre qualquer contexto temporário de conversa.

Sempre considere este arquivo como a referência oficial do projeto.

---

# Regra Principal

**NENHUMA IMPLEMENTAÇÃO É CONSIDERADA CONCLUÍDA SEM SER REGISTRADA NESTE ARQUIVO.**

Toda alteração relevante deve ser documentada.

Isso inclui:

- novas funcionalidades;
- correções;
- refatorações;
- alterações no banco;
- alterações na API;
- alterações na infraestrutura;
- mudanças de arquitetura;
- mudanças de regras de negócio;
- correções de bugs;
- melhorias de desempenho;
- alterações de layout relevantes.

Mesmo pequenas alterações devem possuir registro quando alterarem o comportamento do sistema.

---

# Sobre o Projeto

O projeto consiste em um sistema web completo para gerenciamento da Escola Bruna Mandz.

Atualmente contempla os seguintes módulos:

- Site Institucional;
- Loja Oficial;
- Painel Administrativo;
- Sistema de Pedidos;
- Sistema Financeiro (em desenvolvimento);
- Banco de Dados Supabase;
- API hospedada na Vercel;
- Sistema de autenticação;
- Sistema de auditoria;
- Backups automáticos;
- Documentação técnica.

A filosofia do projeto é extremamente importante.

Sempre priorizar:

- simplicidade;
- rapidez;
- facilidade de uso;
- baixo número de cliques;
- código limpo;
- manutenção simples;
- reutilização de componentes.

Evitar transformar o sistema em um ERP complexo.

Toda decisão deve considerar a rotina diária da secretaria da escola.

---

# Stack Tecnológica

Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

Backend

- Supabase
- PostgreSQL
- Edge Functions (quando necessário)

Infraestrutura

- Vercel
- GitHub
- GitHub Actions

Pagamentos

- Mercado Pago (somente Loja)

---

# Limitações Conhecidas

## Vercel

A aplicação está hospedada na Vercel.

Considerar sempre:

- ambiente Serverless;
- armazenamento temporário;
- processamento limitado;
- evitar tarefas muito longas;
- evitar dependência de arquivos locais.

---

## Supabase

Toda alteração estrutural deve ser realizada preferencialmente através de migrations.

Evitar alterações manuais diretamente no banco.

Sempre preservar:

- integridade dos dados;
- compatibilidade;
- segurança (RLS);
- histórico.

---

# Padrão de Desenvolvimento

Antes de implementar qualquer funcionalidade:

1. Ler este documento completamente;
2. Identificar a última etapa registrada;
3. Verificar pendências existentes;
4. Confirmar se a funcionalidade já não foi implementada;
5. Avaliar impactos em outras áreas do sistema.

Nunca remover funcionalidades sem justificativa registrada.

Nunca apagar registros antigos.

Caso uma funcionalidade seja alterada posteriormente, criar um novo registro explicando a alteração.

---

# Modelo Obrigatório de Registro

Toda implementação deverá seguir o seguinte padrão.

---

## Data

Data da implementação.

Exemplo:

07/07/2026

---

## Horário

Horário da conclusão.

Exemplo:

15:42

---

## Commit

Informar o hash do commit, quando existir.

Caso ainda não tenha sido realizado:

"Pendente".

---

## Agente Responsável

Informar claramente quem realizou a implementação.

Exemplos:

- ChatGPT GPT-5.5
- OpenAI Codex
- Claude
- Gemini
- Desenvolvedor Manual

---

## Etapa

Informar a etapa correspondente.

Exemplo:

Etapa 33

---

## Objetivo

Descrever o objetivo da implementação.

---

## Implementações Realizadas

Listar todas as alterações executadas.

---

## Arquivos Alterados

Relacionar os arquivos modificados.

---

## Banco de Dados

Registrar alterações realizadas.

Exemplos:

- nova tabela;
- nova migration;
- nova policy;
- novos índices;
- alterações em tabelas existentes.

Caso não exista alteração:

"Nenhuma alteração no banco."

---

## Testes

Informar obrigatoriamente.

Exemplos:

✅ Testado manualmente

✅ Testado em produção

⚠ Testado parcialmente

⚠ Não testado

---

## Pendências

Registrar tudo que ficou para implementação futura.

Nunca apagar pendências anteriores.

Caso alguma pendência seja resolvida posteriormente, registrar sua conclusão em uma nova etapa.

---

# Ordem Cronológica

Todos os novos registros deverão ser adicionados **sempre ao final deste documento**.

Nunca inserir registros no meio do histórico.

Nunca reorganizar etapas antigas.

Nunca apagar histórico.

O histórico deve permanecer cronológico durante toda a vida do projeto.

---

# Planejamento

Ao final de cada implementação, registrar também:

- próximos passos;
- melhorias previstas;
- problemas conhecidos;
- limitações encontradas;
- sugestões para etapas futuras.

Assim, qualquer novo agente poderá continuar exatamente do ponto onde o desenvolvimento foi interrompido.

---

# Observação Final

Este documento é considerado o **Livro de Bordo Oficial do Projeto**.

Todo agente que participar do desenvolvimento deve utilizá-lo como principal fonte de contexto antes de iniciar qualquer alteração.

A continuidade e a organização do projeto dependem diretamente da atualização correta deste arquivo.

**Se uma implementação não foi registrada neste documento, considera-se que ela não faz parte oficialmente do projeto.**

Sempre que possível, registrar também o motivo da decisão técnica tomada, e não apenas o que foi implementado. Isso facilita futuras manutenções e evita que decisões importantes sejam revistas sem contexto.