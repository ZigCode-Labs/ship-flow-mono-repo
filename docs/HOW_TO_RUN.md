# ShipFlow — How to Run

A complete guide for developers and LLMs. Covers first-time setup, daily dev workflow, database operations, and production deployment in the exact order they should be run.

---

## Stack & Packages at a Glance

| Package                      | Name                  | Role                                      |
| ---------------------------- | --------------------- | ----------------------------------------- |
| `apps/api`                   | `@shipflow/api`       | NestJS backend — REST API                 |
| `apps/web`                   | `@shipflow/web`       | Next.js 16 frontend                       |
| `packages/database`          | `@shipflow/database`  | Prisma schema, migrations, seed           |
| `packages/shared`            | `@shipflow/shared`    | Shared Zod validators and types           |
| `packages/api-tests`         | `@shipflow/api-tests` | Vitest integration tests against live API |
| `packages/eslint-config`     | —                     | Shared ESLint config                      |
| `packages/typescript-config` | —                     | Shared tsconfig                           |

> **Reference only (do not develop here):** `ship-flow-api/` and `ship-flow-ui/` are previous-iteration wireframes.

---

## Ports

| Service       | Port     | URL                     |
| ------------- | -------- | ----------------------- |
| API (NestJS)  | **9000** | `http://localhost:9000` |
| Web (Next.js) | **9001** | `http://localhost:9001` |

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** 9.15.0 (`npm install -g pnpm@9.15.0`)
- **PostgreSQL** running locally (default port 5432)

---

## Environment Files

Create these files before running anything. They are never committed.

### 1. `apps/api/.env`

Copy from `apps/api/.env.example`:

```env
# PostgreSQL connection
DATABASE_URL="postgresql://postgres:ShipFlow@DB#2026@localhost:5432/ship_flow_dev?schema=public"

# JWT
JWT_SECRET="super_secret"

# Server
PORT=9000
NODE_ENV=development

# CORS — must match the web dev port
FRONTEND_URL=http://localhost:9001
```

### 2. `apps/web/.env`

Copy from `apps/web/.env example`:

```env
NEXT_PUBLIC_API_URL="http://localhost:9000"
NEXT_PUBLIC_API_BASE_URL="http://localhost:9000"
```

### 3. `packages/database/.env`

Prisma CLI reads this directly for migration commands:

```env
DATABASE_URL="postgresql://postgres:ShipFlow@DB#2026@localhost:5432/ship_flow_dev?schema=public"
```

> The `DATABASE_URL` must be identical in `apps/api/.env` and `packages/database/.env`.

### 4. `packages/api-tests/.env.test`

Used by integration tests:

```env
API_BASE_URL=http://localhost:9000
TEST_EMAIL=test+org@shipflow.dev
TEST_PASSWORD=Test@1234
```

---

## First-Time Setup (run once)

```bash
# 1. Install all dependencies for every workspace
pnpm install

# 2. Build shared packages so apps can import them
#    (database types + shared validators must be compiled first)
pnpm --filter @shipflow/database build
pnpm --filter @shipflow/shared build

# 3. Run the initial migration to create all database tables
pnpm db:migrate:dev

# 4. Generate the Prisma client (also runs automatically inside build)
pnpm db:generate

# 5. (Optional) Seed the database with test data
pnpm db:seed
```

---

## Database Scripts — Order Matters

These live at the **root** and delegate to `packages/database`.

| Order | Script                   | What it does                                                                        | When to run                                                                       |
| ----- | ------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1     | `pnpm db:migrate:dev`    | Creates a new migration file + applies it. Regenerates Prisma client automatically. | After every schema change in `schema.prisma` (dev only)                           |
| 2     | `pnpm db:generate`       | Regenerates Prisma client from the current schema without touching the DB.          | When you pull a branch that has new migrations but don't want to create a new one |
| 3     | `pnpm db:seed`           | Runs `packages/database/src/seed.ts`                                                | After a fresh migration when you need test data                                   |
| —     | `pnpm db:studio`         | Opens Prisma Studio at `http://localhost:5555`                                      | Anytime you want a visual DB browser                                              |
| —     | `pnpm db:migrate:deploy` | Applies pending migrations without prompting. **Production only.**                  | CI/CD deploy step — never run locally against a shared DB                         |

### Underlying package scripts (run directly against `@shipflow/database`)

```bash
pnpm --filter @shipflow/database prisma:migrate:dev    # same as pnpm db:migrate:dev
pnpm --filter @shipflow/database prisma:generate       # same as pnpm db:generate
pnpm --filter @shipflow/database prisma:migrate:deploy # production deploy
pnpm --filter @shipflow/database prisma:seed           # seed only
pnpm --filter @shipflow/database prisma:studio         # studio
```

---

## Daily Development Workflow

### Option A — Start everything at once (Turborepo)

```bash
pnpm dev
```

Turbo starts `apps/api` and `apps/web` in parallel, watching for changes.

### Option B — Start services individually

```bash
# Terminal 1 — API
pnpm dev:api
# or
pnpm --filter @shipflow/api dev

# Terminal 2 — Web
pnpm dev:web
# or
pnpm --filter @shipflow/web dev
```

### What each dev script does

| Service      | Command                | Details                                                                     |
| ------------ | ---------------------- | --------------------------------------------------------------------------- |
| API          | `nest start --watch`   | NestJS with hot-reload via nodemon. Clears old tsbuildinfo before starting. |
| Web          | `next dev --port 9001` | Next.js App Router with HMR.                                                |
| Database pkg | `tsc --watch`          | Recompiles types on change (run if editing the database package itself).    |

---

## Build (Production Artifacts)

```bash
# Build everything (Turbo handles dependency order)
pnpm build

# Build individual packages
pnpm --filter @shipflow/database build   # prisma generate + tsc
pnpm --filter @shipflow/shared build     # tsc
pnpm --filter @shipflow/api build        # nest build → dist/
pnpm --filter @shipflow/web build        # next build → .next/
```

Turbo `build` dependency order (from `turbo.json`):

```
@shipflow/database → @shipflow/shared → @shipflow/api & @shipflow/web
```

---

## Running in Production

### API

```bash
# Build first
pnpm --filter @shipflow/api build

# Start
node apps/api/dist/main.js
# or via package script
pnpm --filter @shipflow/api start:prod
```

Required production env vars for `apps/api/.env`:

```env
NODE_ENV=production
PORT=9000
DATABASE_URL="postgresql://user:pass@host:5432/ship_flow_prod?schema=public"
JWT_SECRET="<long random string — openssl rand -base64 64>"
FRONTEND_URL="https://your-production-domain.com"
```

### Web

```bash
pnpm --filter @shipflow/web build
pnpm --filter @shipflow/web start    # next start (port from env or default 3000)
```

### Database migration in production

Run this in your CI/CD pipeline **before** starting the API:

```bash
pnpm db:migrate:deploy
# or directly:
pnpm --filter @shipflow/database prisma:migrate:deploy
```

`migrate:deploy` applies pending migrations silently — no interactive prompts, no new migration files created.

---

## Testing

### Unit tests (API — Jest)

```bash
pnpm --filter @shipflow/api test           # run once
pnpm --filter @shipflow/api test:watch     # watch mode
pnpm --filter @shipflow/api test:cov       # with coverage
pnpm --filter @shipflow/api test:e2e       # e2e suite
```

### Integration tests (Vitest — hits live API)

Requires API running on port 9000 and `packages/api-tests/.env.test` set up.

```bash
pnpm --filter @shipflow/api-tests test          # run once
pnpm --filter @shipflow/api-tests test:watch    # watch mode
pnpm --filter @shipflow/api-tests test:ui       # vitest UI
pnpm --filter @shipflow/api-tests test:coverage # coverage report
```

### Full test suite (Turbo)

```bash
pnpm test
```

---

## Code Quality

```bash
pnpm lint          # ESLint across all packages (via Turbo)
pnpm type-check    # TypeScript check across all packages
pnpm format        # Prettier format all .ts, .tsx, .js, .json, .md files
```

Pre-commit hooks (Husky + lint-staged) run ESLint + Prettier automatically on staged files.

---

## Debugging the API

```bash
pnpm --filter @shipflow/api start:debug
# Attach a debugger to the Node.js inspector (default port 9229)
```

---

## Quick Reference — Most Common Commands

```bash
# First time
pnpm install && pnpm db:migrate:dev && pnpm db:seed

# Every day
pnpm dev                        # start all

# After pulling schema changes
pnpm db:migrate:dev             # new migration
# OR if migrations already exist but client is stale:
pnpm db:generate

# Before a PR
pnpm lint && pnpm type-check

# Production deploy sequence
pnpm build
pnpm db:migrate:deploy          # apply migrations
node apps/api/dist/main.js      # start API
# serve .next/ with next start or a CDN for web
```
