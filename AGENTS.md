# AGENTS.md — Escola de Música Bruna Mandz

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Vite dev server (port 5173), proxies `/api/*` to `localhost:3001` |
| `npm run build` | Vite build → `dist/` (multi-entry: index, app, painel, academic, commercial) |
| `npm test` | `node --test` (Node built-in runner); tests in `tests/` |
| `npm run lint` | ESLint 10 + `eslint-config-prettier` |
| `npm run format` | Prettier: semi, singleQuote, tabWidth 4, trailingComma es5, printWidth 100, LF |

Before `npm run dev`, start the local API: `node server-dev.js` (reads `.env` manually, no dotenv dependency). Requires `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in `.env`.

## Architecture

Two apps, one Vite build:
- **Main site** — `index.html` (vanilla JS, Tailwind CDN, Tone.js CDN). Landing page, piano, quiz, store.
- **React SPA** — `app/index.html` → `app/src/main.tsx` → `App.tsx`. ERP admin (Dashboard, Students, Teachers, Enrollments, Agenda, Financial, Admin). TS path alias `@/*` → `app/src/*`.
- **Legacy admin (archived)** — `painel-x9k2f.html` movido para `backup/`. Não é mais compilado nem acessível por navegação.

API endpoints live in `api/` (Vercel Functions). React app talks through `/api/admin-financial?resource=<name>`. Auth via `x-admin-password` header, stored in `sessionStorage`.

React SPA routes (guarded by auth): `/`, `/dashboard`, `/academico` (Students), `/academico/professores` (Teachers), `/academico/turmas` (Enrollments), `/agenda` (Agenda), `/financeiro` (Financial), `/admin` (Admin). Login at `/app/login`.

Financial API resources: `students`, `teachers`, `enrollments`, `tuitions`, `payments`, `expenses`, `investments`, `teacher_payments`, `lessons`, `attendance`, `summary`, `dashboard`.

## Key conventions

- **Admin auth**: password goes in `sessionStorage` key `admin_password`. Send as `x-admin-password` header. On 401, session is cleared. O classic portal (`painel-x9k2f.html`) foi arquivado em `backup/` — o React SPA é o único frontend autenticado ativo.
- **Supabase**: all access via Service Role Key (bypasses RLS). RLS enabled but zero public policies. Schema SQL in `supabase/schema.sql` + `supabase/financial-schema.sql`. Migrations in `supabase/migrations/`. Apply with `npx supabase db query --linked -f <file>` (requires PAT, not service role key).
- **Store**: `store/` directory — ES modules for cart, checkout, products, payment config. No framework.
- **Vercel rewrites** (in `vercel.json`): `/app/*` → `/app/index.html`; `/comercial`, `/commercial*` → `/commercial/index.html`; `/academico*` → `/academic/index.html`.
- **Service Worker**: caches assets; never caches `/api/*`.
- **Store checkout**: Mercado Pago PIX + Card Payment Brick. Public key from `/api/config`. Backend creates payment via `/api/create-payment`, webhook at `/api/webhook`.
- **Style**: Tailwind via CDN (no npm package). Brand colors: red-600/red-500 primary, zinc-950 background.
- **Security API helpers** (`api/admin-financial.js`): `safeFloat(val, fallback, min)` and `safeInt(val, fallback, min)` replace `parseFloat`/`parseInt` (reject NaN, enforce min). Never leak `err.message` in 500 responses.
- **Branch**: All development now happens directly on `main`. No more feature branches — deploy to Vercel production is automatic on every `git push origin main`. Keep commits small and working.
- **novo_registro.md** is the official dev diary — every implementation must be logged as a new numbered stage at its end.

## Projects not tracked by tsc

TS is used only in the SPA (`app/src/`). `tsconfig.json` has `noEmit: true`, `moduleResolution: bundler`. Vite handles compilation.

## env

Copy `.env.example` → `.env`. Variables needed locally: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`.
