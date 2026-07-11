# Atualizações Diversas (CPFs, Menus, Correções)

Este plano aborda as correções solicitadas para o painel de alunos, professores, agenda e correções de bugs.

## Proposed Changes

### 1. Campos de CPF (Banco de Dados e Interface)
- **Banco de Dados:** Criar uma *migration* (`045-add-cpf.sql`) para adicionar as colunas `cpf` e `guardian_cpf` na tabela `students`, e a coluna `cpf` na tabela `teachers`.
- **API (`admin-financial.js`):** Atualizar os endpoints de salvar/editar Alunos e Professores para aceitarem e gravarem esses novos campos.
- **Frontend (`painel-x9k2f.html`):** 
  - Inserir os campos de CPF (Aluno e Responsável) no formulário de Novo Aluno.
  - Inserir campo de CPF no formulário de Novo Professor.
  - Adicionar as colunas de CPF nas tabelas de visualização (substituindo a coluna ID).

### 2. Ocultar IDs
- Remover as colunas de `ID` de todas as tabelas (Alunos, Professores, Vínculos, Aulas, Mensalidades, etc.), já que são apenas para controle interno e poluem a visão.

### 3. Reestruturação do Menu Professores
- O menu **Professores** sairá de dentro de Financeiro e ganhará uma **Aba Principal** dedicada, posicionada ao lado da aba de Alunos.

### 4. Correção do Formulário de Aulas / Vínculos (Bug de Matrícula)
- **Problema:** A tela de "Novo Vínculo" estava quebrando ao abrir (erro `Cannot set properties of null`) porque os campos de horário e dia da semana foram removidos do HTML no passado, mas o JavaScript continuou tentando manipulá-los.
- **Solução:** Remover essas referências mortas do JavaScript (`class_time`, `day_of_week`, etc.) da tela de matrícula. A definição de horários será feita diretamente no momento de criar uma **Aula** (menu Agenda/Aulas), não no vínculo geral.
- Renomear o título do modal de "Novo Vínculo" para "Nova Matrícula/Aula", ajustando a lógica de instrumentos para que liste dinamicamente se o professor tocar mais de um.

### 5. Ajuste de Horários (Segundos)
- Remover a precisão de segundos (`:00`) na listagem de horários pela interface. Sempre formataremos para horas e minutos curtos (ex: `14:30`).

## Open Questions

> [!WARNING]
> Os campos de CPF (`cpf` e `guardian_cpf`) devem ser obrigatórios no cadastro do aluno/professor, ou podem ser deixados em branco (opcionais)?

> [!IMPORTANT]
> Em relação aos horários, você deseja que os campos de Dia/Horário sejam reinseridos no Vínculo do aluno, ou manteremos o padrão atual onde o vínculo é só financeiro/pedagógico e a **Aula** (dia e hora reais) é marcada avulsa na aba de Aulas/Agenda?

## Verification Plan

### Manual Verification
- Acessar o sistema, verificar se a aba "Professores" está visível no topo.
- Cadastrar um novo Aluno preenchendo os campos de CPF e verificar se salvam.
- Abrir o modal de cadastro/edição na aba Alunos e confirmar que ele abre perfeitamente sem o erro `TypeError`.
- Verificar se as tabelas perderam a coluna "ID".
