# ShipFlow Monorepo Migration Plan

## Overview

Migrate two standalone repos into a single **Turborepo** monorepo:

| Current Repo    | New Location | Stack                                               |
| --------------- | ------------ | --------------------------------------------------- |
| `ship-flow-api` | `apps/api`   | NestJS 11 · Prisma 7 · PostgreSQL · Zod             |
| `ship-flow-ui`  | `apps/web`   | Next.js 16 · React 19 · Tailwind v4 · Zustand · Zod |

Extracted shared packages live in `packages/` and are consumed by both apps.

---

## Why Turborepo

- **Incremental builds & caching** — `turbo build` only rebuilds what changed. Critical once the shared packages grow.
- **Parallel task execution** — `dev`, `lint`, `test`, `build` run concurrently across all workspaces.
- **Single `node_modules` hoisting** via pnpm workspaces — no duplicate `zod`, `typescript`, etc.
- **Pipeline declarations** — explicit dependency graph ensures `packages/*` build before `apps/*`.

---

## Target Monorepo Structure

```
shipflow/                          ← repo root
├── turbo.json                     ← pipeline config
├── package.json                   ← root workspace (pnpm)
├── pnpm-workspace.yaml
├── .gitignore
│
├── apps/
│   ├── api/                       ← NestJS backend (from ship-flow-api)
│   │   ├── src/
│   │   ├── prisma/
│   │   ├── package.json           ← name: "@shipflow/api"
│   │   ├── tsconfig.json          ← extends ../../packages/typescript-config/nestjs.json
│   │   └── nest-cli.json
│   │
│   └── web/                       ← Next.js frontend (from ship-flow-ui)
│       ├── src/
│       ├── package.json           ← name: "@shipflow/web"
│       ├── tsconfig.json          ← extends ../../packages/typescript-config/nextjs.json
│       └── next.config.ts
│
└── packages/
    ├── shared/                    ← Zod schemas + TS types (shareable between api & web)
    │   ├── src/
    │   │   ├── schemas/           ← auth, buyer, invoice, challan, proforma schemas
    │   │   ├── types/             ← inferred TS types exported from schemas
    │   │   ├── validators/        ← GSTIN, PAN, IFSC, pincode, email helpers
    │   │   └── index.ts
    │   ├── package.json           ← name: "@shipflow/shared"
    │   └── tsconfig.json
    │
    ├── ui/                        ← shadcn/ui component library (optional Phase 2)
    │   ├── src/components/ui/     ← button, card, dialog, table … from web
    │   ├── package.json           ← name: "@shipflow/ui"
    │   └── tsconfig.json
    │
    ├── typescript-config/         ← base tsconfig presets
    │   ├── base.json
    │   ├── nextjs.json
    │   └── nestjs.json
    │
    └── eslint-config/             ← shared ESLint rules
        ├── index.js
        └── package.json           ← name: "@shipflow/eslint-config"
```

---

## Migration Phases

### Phase 1 — Scaffold Monorepo Root (1–2 h)

1. Create root `package.json` with `"workspaces": ["apps/*","packages/*"]`.
2. Create `pnpm-workspace.yaml`.
3. Create `turbo.json` with pipeline for `build`, `dev`, `lint`, `test`.
4. Add root `.gitignore` (combine both existing ignores).
5. Initialise a single git repo at root (`git init`); import histories via `git subtree add` or copy-and-commit.

### Phase 2 — Move Apps (2–3 h)

1. Copy `ship-flow-api/` → `apps/api/`; update `package.json` name to `@shipflow/api`.
2. Copy `ship-flow-ui/` → `apps/web/`; update `package.json` name to `@shipflow/web`.
3. Remove per-app `node_modules` and `package-lock.json`.
4. Run `pnpm install` at repo root — confirm hoisting resolves all deps.
5. Verify both apps start (`turbo dev`).

### Phase 3 — Create `packages/shared` (3–4 h)

Extract all Zod schemas that are currently **duplicated or referenced cross-app**:

| Schema File                   | Current Location                          | Move To                                            |
| ----------------------------- | ----------------------------------------- | -------------------------------------------------- |
| `auth.schema.ts`              | `apps/api/src/modules/auth/`              | `packages/shared/src/schemas/auth.ts`              |
| `domestic-buyers.schema.ts`   | `apps/api/src/modules/domestic-buyers/`   | `packages/shared/src/schemas/domestic-buyer.ts`    |
| `delivery-challan.schema.ts`  | `apps/api/src/modules/delivery-challan/`  | `packages/shared/src/schemas/delivery-challan.ts`  |
| `domestic-proforma.schema.ts` | `apps/api/src/modules/domestic-proforma/` | `packages/shared/src/schemas/domestic-proforma.ts` |
| `tax-invoice` DTOs            | `apps/api/src/modules/tax-invoice/dto/`   | `packages/shared/src/schemas/tax-invoice.ts`       |
| India helpers                 | `apps/web/src/lib/india.ts`               | `packages/shared/src/validators/india.ts`          |

After moving: replace originals with `export * from '@shipflow/shared'` re-exports.

### Phase 4 — Create `packages/typescript-config` (30 min)

1. `base.json` — strict, no emit, skipLibCheck, path aliases.
2. `nextjs.json` — extends base, adds `dom`, `jsx: react-jsx`, Next plugin.
3. `nestjs.json` — extends base, adds `CommonJS`, decorators, `emitDecoratorMetadata`.

### Phase 5 — Create `packages/eslint-config` (30 min)

Combine both apps' ESLint configs into shared presets (`nextjs`, `nestjs`). Each app's `eslint.config.mjs` imports the preset.

### Phase 6 — (Optional) `packages/ui` (4–6 h)

Extract `apps/web/src/components/ui/*` into a standalone package so components can theoretically be used from other apps. Only do this if a second consumer (e.g., an admin app) is planned.

---

## Turborepo Pipeline (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    }
  }
}
```

`^build` means: build all workspace dependencies first. So `packages/shared` always compiles before `apps/api` or `apps/web` reference it.

---

## Package Manager

Use **pnpm** (recommended with Turborepo):

- Efficient disk usage via hard-linked `node_modules`.
- First-class workspace protocol: `"@shipflow/shared": "workspace:*"`.
- Required: `pnpm >= 9`.

---

## Key Decisions & Trade-offs

| Decision                     | Chosen               | Rationale                                                              |
| ---------------------------- | -------------------- | ---------------------------------------------------------------------- |
| Package manager              | pnpm                 | Best Turborepo support, disk-efficient                                 |
| Shared schemas               | `packages/shared`    | Single source of truth for validation; FE can validate before API call |
| UI components in own package | Phase 2 only         | Premature now; add when second consumer exists                         |
| Git history                  | Preserve via subtree | Blame/log stay intact                                                  |
| Prisma in monorepo           | Stays in `apps/api`  | DB schema is API-private; no FE access                                 |
| `.env` files                 | Per-app              | Each app keeps its own; root `.env` for shared CI vars only            |

---

## Risks & Mitigations

| Risk                                                                       | Mitigation                                                                                                |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Tailwind v4 + Next.js 16 path resolution changes with workspace symlinks   | Test `pnpm dev` immediately after move; use `transpilePackages` in `next.config.ts` for `@shipflow/*`     |
| NestJS `emitDecoratorMetadata` — must be per-app tsconfig, not shared base | Keep decorator flags only in `nestjs.json` preset                                                         |
| Prisma generates client in `node_modules` at root                          | Set `output` in `schema.prisma` to `../../node_modules/.prisma/client` or keep local `postinstall` script |
| shadcn CLI assumes component paths relative to app root                    | Run `shadcn` from `apps/web/`; keep `components.json` there                                               |
| CI/CD — existing pipelines target specific dirs                            | Update pipelines to use `turbo build --filter=@shipflow/api` etc.                                         |

---

## Immediate Next Steps (in order)

1. **Read** `MONOREPO_STRUCTURE.md` for detailed file-by-file breakdown.
2. **Read** `MONOREPO_SHARED_PACKAGES.md` for the exact shared code inventory.
3. Run `pnpm create turbo@latest` in a scratch dir to preview the scaffold.
4. Execute Phase 1–3 (the critical path); Phases 4–5 are housekeeping.
