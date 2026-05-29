# ShipFlow

India-focused import/export document management SaaS. Generates and manages tax invoices, delivery challans, domestic proformas, and buyer records — all with GST-compliant validation built in.

---

## Monorepo Layout

```
shipflow/
├── apps/
│   ├── api/          NestJS 11 REST API          → http://localhost:4000
│   └── web/          Next.js 16 frontend          → http://localhost:3000
├── packages/
│   ├── shared/       Zod schemas + India validators (shared by both apps)
│   ├── typescript-config/   Base tsconfig presets
│   └── eslint-config/       Shared ESLint presets
├── turbo.json        Turborepo pipeline
├── pnpm-workspace.yaml
└── package.json      Workspace root
```

---

## Tech Stack

| Layer               | Technology                      |
| ------------------- | ------------------------------- |
| API framework       | NestJS 11                       |
| API validation      | Zod v4 (via `@shipflow/shared`) |
| API auth            | JWT + Passport                  |
| Database            | PostgreSQL via Prisma 7         |
| Frontend framework  | Next.js 16 (App Router)         |
| Frontend language   | TypeScript + React 19           |
| Frontend styling    | Tailwind CSS v4                 |
| Frontend components | shadcn/ui (Radix UI primitives) |
| Frontend state      | Zustand                         |
| Frontend forms      | react-hook-form + Zod           |
| Build system        | Turborepo + pnpm workspaces     |
| Package manager     | pnpm 9                          |

---

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** 9 — `npm install -g pnpm@9`
- **PostgreSQL** running locally (or a connection string)

> **Corepack note:** If you have a global `~/package.json` with `"packageManager": "yarn"`, run pnpm via its full path:
> `node $(which pnpm | xargs dirname)/../lib/node_modules/pnpm/bin/pnpm.cjs`
> or remove the `packageManager` field from `~/package.json`.

---

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Build the shared package

The shared package must be compiled before either app can run. Only needed once, or after editing `packages/shared/src/`:

```bash
node_modules/.pnpm/node_modules/.bin/tsc -p packages/shared/tsconfig.json
```

### 3. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your DATABASE_URL and JWT_SECRET
```

```bash
cp "apps/web/.env example" apps/web/.env.local
# Edit apps/web/.env.local with NEXT_PUBLIC_API_BASE_URL if different from default
```

### 4. Run database migrations

```bash
cd apps/api
pnpm exec prisma migrate deploy
cd ../..
```

### 5. Start both apps

**API** (terminal 1):

```bash
pnpm --filter @shipflow/api run dev
# Starts on http://localhost:4000
```

**Web** (terminal 2):

```bash
pnpm --filter @shipflow/web run dev
# Starts on http://localhost:3000
```

Or with Turbo (both in one terminal):

```bash
turbo dev
```

---

## Available Scripts

Run from the **monorepo root**:

| Command            | Description                            |
| ------------------ | -------------------------------------- |
| `pnpm install`     | Install all workspace dependencies     |
| `turbo dev`        | Start all apps in watch/dev mode       |
| `turbo build`      | Build all packages and apps            |
| `turbo lint`       | Lint all workspaces                    |
| `turbo test`       | Run all test suites                    |
| `turbo type-check` | TypeScript check across all workspaces |

Run for a **specific workspace**:

```bash
pnpm --filter @shipflow/api  run <script>
pnpm --filter @shipflow/web  run <script>
pnpm --filter @shipflow/shared run build
```

---

## Environment Variables

### API (`apps/api/.env`)

| Variable       | Required | Default       | Description                  |
| -------------- | -------- | ------------- | ---------------------------- |
| `DATABASE_URL` | Yes      | —             | PostgreSQL connection string |
| `JWT_SECRET`   | Yes      | —             | Secret key for signing JWTs  |
| `PORT`         | No       | `4000`        | HTTP port                    |
| `NODE_ENV`     | No       | `development` | `development` / `production` |

### Web (`apps/web/.env.local`)

| Variable                   | Required | Default                 | Description            |
| -------------------------- | -------- | ----------------------- | ---------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | No       | `http://localhost:4000` | Base URL for API calls |

---

## Database

Prisma schema lives in `apps/api/prisma/schema.prisma`.

```bash
# Create a new migration after editing the schema
cd apps/api && pnpm exec prisma migrate dev --name <migration-name>

# Apply existing migrations to a fresh DB
cd apps/api && pnpm exec prisma migrate deploy

# Open Prisma Studio (DB GUI)
cd apps/api && pnpm exec prisma studio

# Re-generate the Prisma client after schema changes
cd apps/api && pnpm exec prisma generate
```

---

## Project Docs

| File                                                       | Contents                                   |
| ---------------------------------------------------------- | ------------------------------------------ |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md)                     | System design, data flow, module breakdown |
| [`apps/api/README.md`](./apps/api/README.md)               | API routes, auth, validation, services     |
| [`apps/web/README.md`](./apps/web/README.md)               | Pages, components, state, API client       |
| [`packages/shared/README.md`](./packages/shared/README.md) | Shared schemas and validators reference    |
