# Source Inventory

Inventory date: 2026-07-13. All inspection was read-only.

## Instructions and requested outcome

- `AGENTS.md` requires reading the pinned Next.js guides in `node_modules/next/dist/docs/` before application code changes.
- `agent_prompt.md` requests a from-scratch Next.js paycheck-budget app, the named stack, five core entities, manual account/paycheck/bill management, a responsive dashboard, and reviewed CSV automation.
- User instruction for this task limits work to `plan/PLAN.md`, `plan/STATUS.md`, and this inventory; no application implementation or push is authorized.

## Repository state

- Branch: `plan/budget-clean-rebuild`, tracking `origin/plan/budget-clean-rebuild`.
- Initial worktree state: clean.
- HEAD: `61dcd5b`; `main` and `origin/main` pointed to the same commit during inspection.
- `node_modules/` and `.next/` are absent.
- The tracked source includes `package-lock.json` but no `prisma/migrations/` directory and no automated test files or test script.

**Evidence:** `git status --short --branch`; `git log -5 --oneline --decorate`; `rg --files`; filesystem inspection; `package.json`.

## Toolchain and configuration

- `package.json` names Next.js 16.2.6, React/React DOM 19.2.4, Prisma 6.19.3, Tailwind CSS v4, shadcn 4.7.0, lucide-react 1.16.0, and Papa Parse 5.5.3.
- Scripts are `dev`, `build`, `start`, and `lint`; there is no test or explicit typecheck script.
- `components.json` configures shadcn's `base-nova` style, React Server Components, Tailwind CSS at `src/app/globals.css`, and lucide icons.
- `prisma.config.ts` reads `DATABASE_URL`, while `prisma/schema.prisma` also contains `file:./dev.db`; runtime resolution has not been tested with installed dependencies.

**Sources:** `package.json`; top-level package metadata in `package-lock.json`; `components.json`; `prisma.config.ts`; `prisma/schema.prisma`.

## Current application surface

Routes and behavior:

- `/`: static dashboard cards and placeholders; it does not query application data. Source: `src/app/page.tsx`.
- `/accounts`: lists accounts and supports create, edit, and destructive delete. Sources: `src/app/accounts/*`; `src/app/actions.ts`.
- `/paychecks`: lists paychecks and bills, creates/deletes them, assigns bills, and toggles paid state. Sources: `src/app/paychecks/*`; `src/app/actions.ts`.
- `/transactions`: lists the 100 most recent transactions. Sources: `src/app/transactions/page.tsx`; `src/app/actions.ts`.
- `/upload`: selects one account, parses CSV headers with hard-coded aliases, previews at most 10 rows, and imports. It does not allow row correction, category selection, or bill matching. Sources: `src/app/upload/*`; `src/app/actions.ts`.
- The sidebar links `/settings`, but no settings route exists in the file inventory. Source: `src/components/app-sidebar.tsx`; `rg --files src/app`.

Shared UI and configuration present:

- Responsive sidebar shell, Geist fonts, shadcn primitives, Tailwind theme variables, a mobile hook, Prisma singleton, and `cn` utility.
- UI primitive files: button, card, checkbox, dialog, dropdown-menu, input, label, select, separator, sheet, sidebar, skeleton, table, tooltip.

**Sources:** `src/app/layout.tsx`; `src/app/globals.css`; `src/components/app-sidebar.tsx`; `src/components/ui/*`; `src/hooks/use-mobile.ts`; `src/lib/*`.

## Current data model and write behavior

- Models: `Account`, `Paycheck`, `Bill`, `Transaction`, and `Category`.
- Currency fields use `Float`; financial dates use `DateTime`; account and transaction types are strings.
- There is no transaction-to-bill relation, import audit entity, categorization-rule entity, or persistent import fingerprint.
- `createTransactions` checks duplicates in application code, inserts rows sequentially, and increments the account balance once per inserted row. The writes are not wrapped in one explicit Prisma transaction.
- Several server actions accept ad hoc TypeScript objects or `any[]`; no shared runtime validation layer is present.
- `test-prisma.ts` is a standalone database-mutating smoke script, not an automated assertion-based test.

**Sources:** `prisma/schema.prisma`; `src/app/actions.ts`; `test-prisma.ts`; `package.json`.

## Tracked SQLite files

Read-only counts captured during planning:

| File | Account | Paycheck | Bill | Transaction | Category |
| --- | ---: | ---: | ---: | ---: | ---: |
| `dev.db` | 0 | 0 | 0 | 0 | 0 |
| `prisma/dev.db` | 4 | 1 | 0 | 348 | 0 |

Both files contain the five current tables and are tracked by Git. They have not been modified. This divergence is why the plan blocks any database reset until retention is decided.

**Evidence:** `git ls-files dev.db prisma/dev.db`; `ls -lh`; read-only `sqlite3` table and count queries.

## Planning implications

- Preserve the populated database until the user chooses fresh-start backup or migration.
- Install exact locked dependencies and read the pinned Next.js guides before code work because local dependencies are absent.
- Replace floating-point and sequential import bookkeeping with approved money conventions and an atomic import design.
- Build the missing category and bill-matching review behavior as first-class import steps rather than extending the current one-screen importer in place.

These are engineering recommendations derived from `agent_prompt.md` and the repository evidence above; they are approval items, not implemented changes.
