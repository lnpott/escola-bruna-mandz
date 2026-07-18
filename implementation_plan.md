# Plano de Melhoria — Redesign High-End Fase 2

> Análise completa do estado atual do painel `/app` e roadmap priorizado de melhorias.

---

## Estado Atual: O que foi feito vs. o que resta

### ✅ Concluído (Etapa 92)
| Componente | Status |
|---|---|
| `global.css` — tokens OLED, bezel vars, ease-fluid, botões | ✅ |
| TopBar → Fluid Island pill | ✅ |
| `fadeInUp` com blur cinematográfico | ✅ |
| Dashboard — Bento layout 12 colunas + Double-Bezel | ✅ |
| Students — Tabela + modal com Double-Bezel + Z-axis cascade | ✅ |
| Teachers — Tabela + modal com Double-Bezel + Z-axis cascade | ✅ |

### ❌ Pendente / Problemas detectados
Analisando todos os arquivos CSS e TSX, foram encontrados os seguintes problemas:

---

## Problemas Detectados

### 🔴 Crítico — Inconsistências de Sistema de Design

**1. `login.css` — totalmente fora do sistema de design**
- Usa `#09090b`, `#18181b`, `#27272a`, `#3f3f46` hardcoded (Zinc palette do Tailwind — errado)
- Não usa nenhuma `var()` do design system
- Background `#09090b` ao invés de `var(--bg-base)` = OLED black
- Botão `.login-btn` com `#dc2626` hardcoded, sem transições premium
- A página de login é a **primeira impressão** do painel — está horrível

**2. `teachers.css` — cores hardcoded sobreviventes**
- `background: #18181b` (5 ocorrências) nos day-checkboxes
- `background: #09090b` no input
- `background: #1a0a0a` no checked state
- Mobile responsive usa `background: #18181b` nos cards

**3. `confirm-modal` em `global.css` — sem Double-Bezel**
- `.confirm-modal` ainda tem `background: var(--bg-surface)` + `border` próprios
- Deveria usar `bezel-shell + bezel-core` como todos os outros modais

**4. `admin-card` ainda usa estilo antigo**
- `.admin-card` em `admin.css` usa `background: linear-gradient(135deg, var(--bg-surface), var(--bg-elevated))` + `border: 1px solid var(--border-default)` diretamente
- Deveria migrar para Double-Bezel

**5. `fin-header` em `financial.css`**
- Tem `background: var(--bg-surface); border: 1px solid var(--border-default)` mas sem bezel

**6. `--shadow-xl` faltando em `global.css`**
- O `students.css` e `teachers.css` referenciam `var(--shadow-xl)` no hover das linhas, mas esse token **não existe** no `:root` — vai falhar silenciosamente

**7. `--duration-fluid` no `.topbar-link` transition incorreto**
- `.topbar-link` usa `transition: color var(--duration-fluid) var(--ease-fluid)` = 700ms para mudança de cor ao hover
- É muito lento — o hover de cor deveria ser `duration-fast`

---

### 🟡 Importante — Páginas sem Double-Bezel

**8. `Enrollments.tsx` — tabela e modal sem bezel**
- `enrollments-table-wrapper` sem `bezel-shell`
- `enrollments-modal` sem `bezel-shell`

**9. `Agenda.tsx` — cards de aula sem bezel**
- Cards de eventos sem a arquitetura Double-Bezel
- Células do calendário com background hardcoded

**10. `Financial.tsx` — seção de KPIs sem bento layout**
- KPIs financeiros (`fin-kpi-grid`) usando grid simples
- Cards sem Double-Bezel

**11. `Admin.tsx` — overview cards sem Double-Bezel**
- `admin-card` com background diretamente em vez de bezel-shell

**12. `StudentDetail.tsx` — detail cards sem bezel**
- Cards de stat (`stat-card`?) sem bezel
- Usa `students.css` mas sem nenhuma adição própria do bezel

---

### 🟢 Melhoria — Design System Incompleto

**13. `--shadow-xl` não definido**
- Precisa ser adicionado ao `:root`

**14. Falta `--shadow-glow-white` para botão primário**
- `.btn-primary` (branco) não tem glow no hover
- Botão premium deveria ter `box-shadow: 0 0 20px rgba(255,255,255,0.12)` no hover

**15. Login page sem animação cinematográfica**
- `loginFadeIn` usa `translateY(12px)` simples, sem `filter: blur()`
- Não carrega `Plus Jakarta Sans` (usa import da Google Fonts diferente do resto do app)

**16. TopBar — active indicator inadequado para pill**
- `.topbar-link.active::after` cria underline (`height: 2px; bottom: -1px`) mas num pill redondo isso não faz sentido visual
- Deveria ser um `background` highlight mais intenso ou um dot embaixo do ícone

**17. Toasts — sem glassmorphism**
- `.toast-success` usa `background: var(--color-success)` (sólido verde)
- Premium seria `background: rgba(verde, 0.15); backdrop-filter: blur(12px); border: 1px solid verde`

**18. `bezel-core` com `height: 100%` quebra em contextos flex**
- Em alguns cards, o `height: 100%` do `.bezel-core` pode causar overflow
- Melhor usar `min-height: 0` + `flex: 1`

---

## Plano de Execução Priorizado

### Sprint 1 — Correções Críticas (bugs que vão "quebrar" visualmente)

| # | Ação | Arquivo | Impacto |
|---|---|---|---|
| 1 | Adicionar `--shadow-xl` ao `:root` | `global.css` | Corrige hover das tabelas |
| 2 | Corrigir `topbar-link` transition de cor (fluid→fast) | `global.css` | UX do hover da nav |
| 3 | Corrigir `confirm-modal` para Double-Bezel | `global.css` + `App.tsx` | Consistência visual |
| 4 | Corrigir `bezel-core height: 100%` → `min-height: 0` | `global.css` | Estabilidade de layout |

### Sprint 2 — Login Page (primeira impressão)

| # | Ação | Arquivo | Impacto |
|---|---|---|---|
| 5 | Reescrever `login.css` completo com design tokens | `login.css` | Eliminar todos os `#hex` |
| 6 | Aplicar Double-Bezel no `.login-card` | `login.css` + `Login.tsx` | Look premium |
| 7 | Adicionar `filter: blur()` na animação de entrada | `login.css` | Cinematográfico |
| 8 | Botão login → usar `.btn-primary` global ou reestilizar | `login.css` | Consistência |

### Sprint 3 — Limpeza de cores hardcoded

| # | Ação | Arquivo | Impacto |
|---|---|---|---|
| 9 | Substituir todos os `#18181b`/`#09090b` em `teachers.css` | `teachers.css` | Consistência tokens |
| 10 | Verificar e limpar `admin.css`, `financial.css` | ambos | Token purity |

### Sprint 4 — Double-Bezel nas páginas restantes

| # | Ação | Arquivo | Impacto |
|---|---|---|---|
| 11 | Enrollments — tabela + modal | `Enrollments.tsx` + `enrollments.css` | Consistência |
| 12 | Admin — overview cards | `Admin.tsx` + `admin.css` | Consistência |
| 13 | Financial — header e KPI cards | `Financial.tsx` + `financial.css` | Consistência |
| 14 | StudentDetail — info cards | `StudentDetail.tsx` | Consistência |
| 15 | Agenda — event cards e células | `Agenda.tsx` + `agenda.css` | Consistência |

### Sprint 5 — Polimento Final

| # | Ação | Arquivo | Impacto |
|---|---|---|---|
| 16 | Toasts com glassmorphism | `global.css` | Visual premium |
| 17 | Btn-primary: adicionar glow branco no hover | `global.css` | Physical feel |
| 18 | TopBar active indicator repensado para pill | `global.css` | Coerência visual |
| 19 | Scroll Observer — entrada staggered por seção | `App.tsx` | Sensação viva |

### Sprint 6 — Verificação e Registro

| # | Ação |
|---|---|
| 20 | `npm run build` — verificar 0 erros |
| 21 | `npm test` — todos os testes passando |
| 22 | Registrar Etapa 93 em `novo_registro.md` |

---

## Open Questions

> [!IMPORTANT]
> **Q1 — Agenda:** A Agenda usa um calendário visual complexo (células de dia, semana). Aplicar Double-Bezel nas células individuais pode deixá-la pesada demais visualmente. Prefere:
> - (a) Bezel apenas no container externo do calendário, mantendo células simples
> - (b) Bezel em cada célula de evento (mais rico, mais pesado)

> [!IMPORTANT]
> **Q2 — Escopo do botão Login:** O `.login-btn` pode ser substituído pelo `.btn-primary` global (branco, sem borda). Isso torna o login screen um botão branco num fundo escuro. Preferível visualmente ou quer manter o botão vermelho no login?

> [!NOTE]
> **Q3 — Toasts:** O glassmorphism nos toasts depende de suporte ao `backdrop-filter`. Em alguns sistemas mais antigos pode não funcionar. Quer um fallback sólido ou aceita o risco?

---

## Estimativa de Esforço

| Sprint | Descrição | Arquivos | Esforço estimado |
|---|---|---|---|
| 1 | Correções críticas | `global.css`, `App.tsx` | ~20min |
| 2 | Login page | `login.css`, `Login.tsx` | ~30min |
| 3 | Token cleanup | `teachers.css`, `admin.css` | ~15min |
| 4 | Double-Bezel restantes | 5 TSX + 5 CSS | ~60min |
| 5 | Polimento | `global.css`, `App.tsx` | ~30min |
| 6 | Verificação + doc | `novo_registro.md` | ~15min |
| **Total** | | **~14 arquivos** | **~2h30min** |
