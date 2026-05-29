# ShipFlow — Developer Guide

A monorepo for the ShipFlow import/export SaaS. NestJS 11 API + Next.js 16 frontend, built with Turborepo and pnpm workspaces.

---

## Table of Contents

1. [Repo Structure](#repo-structure)
2. [First-Time Setup](#first-time-setup)
3. [Running the App](#running-the-app)
4. [Packages](#packages)
5. [API Architecture](#api-architecture)
6. [Authentication Flow](#authentication-flow)
7. [Database Conventions](#database-conventions)
8. [Error Handling](#error-handling)
9. [Adding a New Module](#adding-a-new-module)
10. [Code Conventions](#code-conventions)
11. [What Changed (Session Log)](#what-changed-session-log)

---

## Repo Structure

```
shipflow/
├── apps/
│   ├── api/          NestJS 11 backend   (port 6000)
│   └── web/          Next.js 16 frontend (port 6100)
├── packages/
│   ├── database/     Prisma schema, migrations, PrismaService/Module
│   ├── shared/       Zod validation schemas & Indian validators (GSTIN, PAN)
│   ├── eslint-config/
│   └── typescript-config/
├── .env.example      All required environment variables
├── turbo.json        Turborepo task pipeline
└── pnpm-workspace.yaml
```

---

## First-Time Setup

```bash
# 1. Copy env file and fill in values
cp .env.example apps/api/.env

# 2. Install all dependencies
pnpm install

# 3. Generate Prisma client
pnpm --filter @shipflow/database prisma:generate

# 4. Run database migrations
pnpm --filter @shipflow/database prisma:migrate:dev

# 5. Seed the database (document number settings + sample data)
pnpm --filter @shipflow/database prisma:seed

# 6. Build shared packages before starting dev
pnpm build --filter @shipflow/shared --filter @shipflow/database
```

### Required environment variables

| Variable              | Used by           | Description                         |
| --------------------- | ----------------- | ----------------------------------- |
| `DATABASE_URL`        | packages/database | PostgreSQL connection string        |
| `JWT_SECRET`          | apps/api          | Signs access tokens (1 hour expiry) |
| `JWT_REFRESH_SECRET`  | apps/api          | Signs refresh tokens (7 day expiry) |
| `PORT`                | apps/api          | API server port (default `6000`)    |
| `NEXT_PUBLIC_API_URL` | apps/web          | Browser-visible API URL             |

Generate secure secrets with: `openssl rand -base64 64`

---

## Running the App

```bash
# Run everything in parallel
pnpm dev

# Or individually
pnpm --filter @shipflow/api dev
pnpm --filter @shipflow/web dev

# Prisma Studio (visual DB browser)
pnpm --filter @shipflow/database prisma:studio
```

---

## Packages

### `@shipflow/database`

Contains all database infrastructure — nothing database-related lives in `apps/api`.

| Path                    | Purpose                                                                  |
| ----------------------- | ------------------------------------------------------------------------ |
| `prisma/schema.prisma`  | Single source of truth for DB schema                                     |
| `prisma/migrations/`    | All migration history (never skip!)                                      |
| `prisma.config.ts`      | Prisma CLI configuration                                                 |
| `src/prisma.service.ts` | NestJS injectable PrismaClient                                           |
| `src/prisma.module.ts`  | Global NestJS module (`@Global()`)                                       |
| `src/seed.ts`           | Seed script for development data                                         |
| `src/index.ts`          | Re-exports everything from @prisma/client + PrismaService + PrismaModule |

`PrismaModule` is `@Global()` — **never re-import it** in individual feature modules.

After changing the schema, always run:

```bash
pnpm --filter @shipflow/database prisma:migrate:dev --name describe_your_change
pnpm --filter @shipflow/database prisma:generate
```

### `@shipflow/shared`

Zod schemas and Indian tax validators shared between API and web.

```ts
// Available exports
import { registerSchema, loginSchema } from '@shipflow/shared';
import { createTaxInvoiceSchema } from '@shipflow/shared';
import { createDomesticProformaSchema } from '@shipflow/shared';
import { createDeliveryChallanSchema } from '@shipflow/shared';
import { createDomesticBuyerSchema } from '@shipflow/shared';
import { validateGSTIN, validatePAN } from '@shipflow/shared/validators/india';
```

Reuse these schemas in both the API (controllers) and web (forms). Do not duplicate validation logic.

---

## API Architecture

### Module structure

Each business domain lives in `src/modules/<name>/`:

```
modules/tax-invoice/
├── tax-invoice.module.ts      Wires controller + service
├── tax-invoice.controller.ts  HTTP layer — parse body with Zod, call service
├── tax-invoice.service.ts     Business logic — all Prisma queries go here
├── tax-invoice.schema.ts      (or dto/) Zod schemas for this module
└── *.spec.ts                  Tests
```

### Rules for modules

- **Controllers** only parse requests, validate with Zod, and call services. No Prisma, no business logic.
- **Services** contain all logic. Inject `PrismaService` via constructor — it's globally available.
- **Never import `PrismaModule`** in a feature module. It's already globally registered.

### Global infrastructure

| File                                              | Purpose                                                 |
| ------------------------------------------------- | ------------------------------------------------------- |
| `src/common/filters/http-exception.filter.ts`     | Unified error response shape for all routes             |
| `src/common/guards/jwt-auth.guard.ts`             | Global guard — every route protected by default         |
| `src/common/decorators/public.decorator.ts`       | `@Public()` — marks a route as no-auth-required         |
| `src/common/decorators/current-user.decorator.ts` | `@CurrentUser()` — injects `{ userId, email }` from JWT |
| `src/modules/auth/strategies/jwt.strategy.ts`     | Passport JWT strategy (validates Bearer token)          |

---

## Authentication Flow

### Tokens

| Token         | Expiry | Secret               | Purpose                                                 |
| ------------- | ------ | -------------------- | ------------------------------------------------------- |
| Access token  | 1 hour | `JWT_SECRET`         | Sent in `Authorization: Bearer` header on every request |
| Refresh token | 7 days | `JWT_REFRESH_SECRET` | Used only to issue new access tokens                    |

The refresh token is stored as an argon2 hash in `User.refreshToken`. On logout it is set to `null`, invalidating the token immediately.

### Endpoints

```
POST /auth/register     — public, create account
POST /auth/login        — public, returns { user, accessToken, refreshToken }
POST /auth/refresh      — public, body: { refreshToken } → returns { accessToken, refreshToken }
POST /auth/logout       — protected, clears stored refresh token
```

### Protecting / unprotecting routes

Every route is protected by `JwtAuthGuard` by default. To make a route public:

```ts
import { Public } from '../../common/decorators/public.decorator';

@Public()
@Get('health')
health() { return { ok: true }; }
```

### Getting the current user in a controller

```ts
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@Get('profile')
getProfile(@CurrentUser() user: JwtUser) {
  // user.userId, user.email
}
```

---

## Database Conventions

### Migrations

- **Always create a migration for every schema change** — never edit an existing migration.
- Name migrations descriptively: `add_refresh_token`, `add_buyer_relation_to_invoice`.
- Run from the database package: `pnpm --filter @shipflow/database prisma:migrate:dev --name <name>`

### Models

- Use `@@map("snake_case_plural")` for all table names (see existing models for examples).
- Use `onDelete: Cascade` on all line-item relations.
- Add `deletedAt DateTime?` for soft deletes — already in place for `TaxInvoice`. Apply it to other models as needed.
- All PKs are `String @id @default(uuid())`.

### Soft deletes

`TaxInvoice` uses soft delete (`deletedAt` field). When querying, always add `where: { deletedAt: null }` to exclude deleted records. Use `update({ data: { deletedAt: new Date() } })` instead of `delete()`.

---

## Error Handling

All errors pass through `AllExceptionsFilter` and return this shape:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...],
  "timestamp": "2026-05-26T10:00:00.000Z",
  "path": "/auth/login"
}
```

- Throw NestJS exceptions (`BadRequestException`, `NotFoundException`, `UnauthorizedException`) from services and controllers — the filter catches them.
- Internal server errors (5xx) log the full exception but return a generic `"Internal server error"` message to the client.
- Never use `@Res()` in controllers — it bypasses the global exception filter.

---

## Adding a New Module

1. Create `src/modules/<name>/` with the files above.
2. Register it in `app.module.ts` imports.
3. Add the Prisma model to `packages/database/prisma/schema.prisma`.
4. Run `prisma:migrate:dev` + `prisma:generate`.
5. Add Zod schemas to `@shipflow/shared` if the web needs them too.

Example skeleton:

```ts
// name.module.ts
@Module({
  controllers: [NameController],
  providers: [NameService],
})
export class NameModule {}

// name.service.ts — PrismaService is globally injected, no need to import PrismaModule
@Injectable()
export class NameService {
  constructor(private readonly prisma: PrismaService) {}
}
```

---

## Code Conventions

### Validation

Use Zod schemas for all request validation in controllers:

```ts
const result = mySchema.safeParse(body);
if (!result.success) {
  throw new BadRequestException({ message: 'Validation failed', errors: result.error.issues });
}
```

### Document numbering

All documents use the `DocumentNumberSetting` table for auto-incrementing numbers. The pattern is:
`<prefix>-<FY>-<padded number>` e.g. `DI-26-27-00001`

Always use a `$transaction` when creating a document:

1. Read the current setting.
2. Calculate the document number.
3. Increment the setting.
4. Create the document.

This prevents duplicate numbers under concurrent requests.

### Financial year helper

Fiscal year runs April → March. A helper used across multiple services:

```ts
function getCurrentFY() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const fyStart = month >= 4 ? year : year - 1;
  const fyEnd = fyStart + 1;
  return `${String(fyStart).slice(-2)}-${String(fyEnd).slice(-2)}`;
}
```

Consider extracting this into `@shipflow/shared` to avoid repetition across services.

---

## Pre-commit Hooks

Husky runs `lint-staged` on every commit:

- TypeScript/TSX files: `eslint --fix` → `prettier --write`
- Other files: `prettier --write`

After `pnpm install`, Husky sets up git hooks automatically via the `prepare` script.

---

## What Changed (Session Log)

### Monorepo restructure — database package

- Created `packages/database` (`@shipflow/database`) containing:
  - `prisma/schema.prisma` + `prisma/migrations/` (moved from `apps/api`)
  - `src/prisma.service.ts`, `src/prisma.module.ts` (moved)
  - `src/seed.ts` (moved)
  - `src/index.ts` re-exports `PrismaService`, `PrismaModule`, and everything from `@prisma/client`
- `apps/api` now depends on `@shipflow/database` instead of having Prisma directly.
- `apps/api` Prisma scripts (`prisma:seed`, `prisma:migrate:*`, `prisma:studio`) delegate to `packages/database` via `pnpm --filter`.

### Auth improvements

- **Removed `@Res()`** from auth controller — all errors now go through the global exception filter.
- **JWT refresh tokens**: `POST /auth/refresh` accepts `{ refreshToken }`, verifies it, and returns new tokens. Refresh token is stored as an argon2 hash in `User.refreshToken` (`20260526000000_add_refresh_token` migration).
- **Access token expiry** changed from `1d` → `1h` (now that refresh tokens exist).
- **`POST /auth/logout`** clears the stored refresh token — requires a valid access token.

### Global security

- **`JwtStrategy`** (Passport) added — validates `Authorization: Bearer <token>` on every request.
- **`JwtAuthGuard`** registered globally via `APP_GUARD` — all routes are protected by default.
- **`@Public()`** decorator marks individual routes or controllers as open (no auth required). Used on `/auth/register`, `/auth/login`, `/auth/refresh`.
- **`@CurrentUser()`** decorator injects `{ userId, email }` from the JWT payload.

### Error handling

- **`AllExceptionsFilter`** registered globally — all errors return `{ statusCode, message, errors?, timestamp, path }`.
- Internal 5xx errors are logged server-side but return a generic message to clients.

### Redundant imports removed

- `PrismaModule` is `@Global()` — removed its redundant `imports` from `AuthModule` and `DocumentSettingsModule`.

### Tooling

- **Turborepo**: added `prisma:generate`, `prisma:migrate:dev`, `prisma:migrate:deploy`, `prisma:seed` as known tasks.
- **`packages/database` build** now runs `prisma generate` automatically before `tsc`.
- **Husky + lint-staged** added to root — pre-commit hook runs ESLint + Prettier on staged files.
- **`.env.example`** added at monorepo root documenting all required environment variables.
