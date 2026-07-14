# Plan: Paycheck Budget Clean Rebuild

## Goal

Rebuild the local `paycheck-budget` application as a reliable Next.js App Router app for accounts, paychecks, bills, transactions, and reviewed CSV imports, without carrying forward the current feature implementation by default.

**Sources:** `agent_prompt.md`; `plan/artifacts/source-inventory.md`.

## Originating intent

- Pair on the implementation one validated phase at a time, beginning only after this plan is approved.
- Keep the requested stack: Next.js App Router, React 19, Tailwind CSS v4, shadcn/ui, lucide-react, SQLite, Prisma, and Papa Parse.
- Make bank-statement import the primary workflow: map CSV columns, suggest categories and unpaid-bill matches, let the user correct every row, then save.
- Do not push without a separate, exact approval.

**Source:** `agent_prompt.md`.

## Recommended architecture

- Treat the rebuild as a replacement of the feature code while retaining Git history. Reuse project configuration and generated UI primitives only after checking them against the installed versions.
- Use Server Components for reads, small Client Components for forms and the import review grid, and validated server-side mutations for writes.
- Parse the raw CSV in the browser with Papa Parse. Send normalized candidate rows to the server for validation and suggestions; do not write transactions until the user confirms the review.
- Store money as integer cents rather than floating-point values. Store financial dates as validated `YYYY-MM-DD` date-only values and timestamps separately.
- Keep account balance derivable from an opening balance plus transactions so an interrupted import cannot leave a manually maintained balance out of sync.
- Extend the five requested entities with only two supporting concepts: `ImportBatch` for audit/idempotency and `CategorizationRule` for transparent payee rules. Link a paid bill to its confirmed transaction.
- Assume single-user, local-only use for the first rebuild. Any network deployment is blocked until authentication, persistent database hosting, backup, and bank-data handling are designed.

These are recommendations to approve in Phase 1, not claims that the current application already behaves this way.

**Sources:** `agent_prompt.md`; `package.json`; `prisma/schema.prisma`; `src/app/actions.ts`; `src/app/upload/csv-upload-form.tsx`; `plan/artifacts/source-inventory.md`.

## CSV import flow

1. Select an account and CSV file.
2. Parse headers and rows locally. Detect common Date, Amount or Debit/Credit, and Payee fields, but require manual column mapping when detection is missing or ambiguous.
3. Normalize dates, signed cents, and payee text. Show row-level errors instead of silently dropping invalid rows.
4. Ask the server for duplicate checks, category suggestions, and unpaid-bill suggestions. Suggestions include a reason and remain editable.
5. Review all rows with filters for invalid, duplicate, uncategorized, and unmatched entries. Allow edits or exclusion; no transaction has been written yet.
6. On confirmation, revalidate on the server and use one Prisma transaction to create the import batch and transactions and apply approved bill matches. A unique import fingerprint makes retries idempotent.
7. Show imported, skipped, and failed counts and refresh accounts, transactions, bills, and dashboard data.

**Sources:** import requirements in `agent_prompt.md`; current limitations in `src/app/upload/csv-upload-form.tsx` and `src/app/actions.ts`; current schema in `prisma/schema.prisma`.

## Approval gates

1. **Data:** `prisma/dev.db` currently contains records while root `dev.db` is empty. Choose either a fresh database with a verified, uncommitted backup, or an explicit data migration. No database reset is allowed before this choice.
2. **Runtime:** confirm the first release is local-only. A deployable multi-user application needs a different persistence and security plan.
3. **Domain conventions:** confirm cents storage, date-only strings, and signed balances/transactions before the schema is replaced.

**Source:** `plan/artifacts/source-inventory.md`.

## Folder structure

- `plan/PLAN.md` - durable scope, architecture, phases, and gates.
- `plan/STATUS.md` - current phase, immediate next action, and resumable findings.
- `plan/artifacts/source-inventory.md` - evidence from the existing repository.
- `plan/artifacts/decisions.md` - created in Phase 1 for approved choices.
- `plan/artifacts/validation.md` - created and updated with phase validation evidence.

**Source:** plan-skill structure and this plan's execution needs.

## Phase rules

- Start each session with `plan/STATUS.md`, then read only the active phase and linked artifacts.
- Before edits, verify branch/status and state the intended files. Preserve unrelated work.
- Read the relevant pinned Next.js guide under `node_modules/next/dist/docs/` before changing Next.js code.
- Keep each phase to fewer than 10 edited files or split it before implementation.
- Run the phase tests, record concise evidence, update `STATUS.md`, and commit the validated phase on the current non-protected branch.
- Pause after every phase. Never push without the user's exact approval for that push.

**Sources:** `AGENTS.md`; user-provided repository instructions; plan skill; current branch evidence in `plan/artifacts/source-inventory.md`.

## Phases

### Phase 1: Approve decisions and protect data

**Objective:** Resolve the three approval gates and create a safe baseline before application changes.

**Inputs:** This plan, `plan/STATUS.md`, `plan/artifacts/source-inventory.md`, both tracked SQLite files, and `package-lock.json`.

**Steps:**

1. Record the approved local/deployment scope and money/date/sign conventions in `plan/artifacts/decisions.md`.
2. Choose fresh-start or migrate-existing-data. If fresh, make a user-approved uncommitted backup of `prisma/dev.db`, record its checksum and row counts, and verify it can be opened.
3. Run `npm ci`; locate and read the relevant Next.js 16.2.6 App Router, Server/Client Component, mutation, caching, and error-handling guides before later code edits.
4. Run the existing lint/build commands only as a baseline and record failures without fixing feature code in this phase.

**Tests:** Backup verification when applicable; database row-count check; dependency install succeeds; baseline commands and framework-guide paths are recorded.

**Outputs:** `plan/artifacts/decisions.md`, initial `plan/artifacts/validation.md`, and an optional uncommitted database backup outside tracked source.

**Sources:** `AGENTS.md`; `agent_prompt.md`; `package.json`; `package-lock.json`; `plan/artifacts/source-inventory.md`.

**On completion:** Update `STATUS.md` with Phase 1 complete and Phase 2 current, then pause for context reset.

### Phase 2: Rebuild the foundation and database

**Objective:** Establish the clean toolchain, test harness, schema, migration, and shared domain validation.

**Inputs:** Approved decisions and the pinned framework notes from Phase 1.

**Steps:**

1. Add only the required test/typecheck scripts and dependencies.
2. Replace the Prisma schema using the approved money/date conventions and the requested five entities plus `ImportBatch` and `CategorizationRule`.
3. Create a baseline migration against one verified SQLite path; do not keep two active database files.
4. Add shared money, date, validation, and Prisma helpers with focused unit tests.

**Tests:** Prisma format/validate and migration smoke test; unit tests; lint; typecheck; production build.

**Outputs:** Rebuilt persistence foundation, migration, shared domain utilities, and validation evidence.

**Sources:** `agent_prompt.md`; `prisma/schema.prisma`; `prisma.config.ts`; `src/lib/prisma.ts`; Phase 1 decisions and framework notes.

**On completion:** Update `STATUS.md` with Phase 2 complete and Phase 3 current, then pause for context reset.

### Phase 3: Build the shell and manual workflows

**Objective:** Deliver the responsive sidebar shell and working manual management for accounts, categories, paychecks, and bills.

**Inputs:** Phase 2 schema and shared validation.

**Steps:**

1. Rebuild the application layout, navigation, global theme, loading state, and error state.
2. Implement validated account and category reads/mutations/forms.
3. Implement validated paycheck and bill reads/mutations/forms, including expected versus actual income, bill assignment, editing, and paid state.
4. Split this phase before implementation if the proposed edit list exceeds nine files.

**Tests:** Unit/server mutation tests; empty/error/success UI states; keyboard and mobile navigation check; lint; typecheck; build.

**Outputs:** Responsive application shell and complete requested manual workflows.

**Sources:** `agent_prompt.md`; current route/UI inventory in `plan/artifacts/source-inventory.md`; Phase 1 pinned Next.js notes.

**On completion:** Update `STATUS.md` with Phase 3 complete and Phase 4 current, then pause for context reset.

### Phase 4: Build CSV parsing and review

**Objective:** Turn bank CSV files into a correct, editable preview without database writes.

**Inputs:** Accounts/categories/bills from Phase 3 and the approved CSV flow above.

**Steps:**

1. Implement pure header detection, explicit column mapping, amount/date/payee normalization, and row validation.
2. Add small sanitized fixtures for single-amount and debit/credit formats, malformed rows, ambiguous dates, and duplicate-looking rows.
3. Build the account/file step, mapping step, and full review grid with editable/excludable rows and clear errors.
4. Enforce documented file/row limits and avoid retaining raw CSV contents after the review session.

**Tests:** Parser/normalizer fixture tests; no-write assertion before confirmation; review-grid interaction tests; lint; typecheck; build.

**Outputs:** A safe parse-and-review workflow with no import commit yet.

**Sources:** `agent_prompt.md`; `src/app/upload/csv-upload-form.tsx`; Phase 1 decisions and pinned Next.js notes.

**On completion:** Update `STATUS.md` with Phase 4 complete and Phase 5 current, then pause for context reset.

### Phase 5: Add automation and atomic import

**Objective:** Suggest categories and unpaid-bill matches, then commit approved rows safely and idempotently.

**Inputs:** Phase 4 canonical rows; Phase 2 schema; Phase 3 categories and bills.

**Steps:**

1. Implement deterministic payee normalization and ordered categorization rules; show the matched rule and allow override.
2. Suggest bills only for expense rows using amount, due-date proximity, and payee similarity. Never silently accept ties or low-confidence candidates.
3. Implement duplicate fingerprints and a single server-side Prisma transaction for `ImportBatch`, transactions, and approved bill links.
4. Revalidate account ownership, row values, category IDs, bill eligibility, and fingerprints at commit time; report inserted/skipped counts.

**Tests:** Categorization/matching tables; duplicate/retry tests; transaction rollback test; concurrent duplicate test; corrected-review import test; lint; typecheck; build.

**Outputs:** Complete reviewed import workflow with deterministic automation and atomic persistence.

**Sources:** `agent_prompt.md`; `src/app/actions.ts`; `src/app/upload/csv-upload-form.tsx`; `prisma/schema.prisma`; Phase 1 decisions.

**On completion:** Update `STATUS.md` with Phase 5 complete and Phase 6 current, then pause for context reset.

### Phase 6: Finish dashboard and acceptance validation

**Objective:** Connect real data to the dashboard and transaction views, then verify the rebuild end to end.

**Inputs:** All completed vertical slices and validation evidence.

**Steps:**

1. Build real account balance, next-paycheck, upcoming-bill, left-to-spend, and recent-transaction queries and UI.
2. Complete transaction browsing and category/bill visibility with useful empty/loading/error states.
3. Run the acceptance path: fresh setup, manual CRUD, both CSV shapes, correction review, duplicate re-import, bill match, and dashboard reconciliation.
4. Check responsive layout, keyboard access, validation failures, sensitive-data logging, database backup/restore, lint, tests, typecheck, and production build.
5. Record remaining limitations and request separate approval before any push or PR work.

**Tests:** Full acceptance matrix passes and derived account totals reconcile with opening balances plus imported transactions.

**Outputs:** Finished local clean rebuild, final `plan/artifacts/validation.md`, and updated repository documentation.

**Sources:** `agent_prompt.md`; Phase 1 decisions; outputs and validation artifacts from Phases 2-5.

**On completion:** Update `STATUS.md` with Phase 6 complete, record any remaining unverified items, then pause for final review.

