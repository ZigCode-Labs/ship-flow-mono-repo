# ShipFlow Monorepo — File Structure Reference

This document details every file that needs to be created, moved, or modified during the migration.

---

## Root Level Files

### `package.json` (NEW)

```json
{
  "name": "shipflow",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "test": "turbo test",
    "type-check": "turbo type-check",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\""
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "^3.4.2"
  },
  "packageManager": "pnpm@9.x.x",
  "engines": {
    "node": ">=20"
  }
}
```

### `pnpm-workspace.yaml` (NEW)

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### `turbo.json` (NEW)

See pipeline definition in `MONOREPO_PLAN.md`.

### `.gitignore` (NEW — combined)

```
node_modules/
dist/
.next/
.env
.env.local
*.log
.DS_Store
coverage/
.turbo/
```

### `.prettierrc` (NEW — root-level, replaces per-app)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

---

## `apps/api/` — NestJS Backend

Migrated from `ship-flow-api/`. Changes required:

### `apps/api/package.json` — MODIFY

```diff
- "name": "ship-flow-api"
+ "name": "@shipflow/api"
  "dependencies": {
+   "@shipflow/shared": "workspace:*"
    ...existing deps
  }
```

### `apps/api/tsconfig.json` — MODIFY

```json
{
  "extends": "../../packages/typescript-config/nestjs.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@shipflow/shared": ["../../packages/shared/src/index.ts"]
    }
  },
  "include": ["src/**/*"]
}
```

### `apps/api/src/modules/auth/auth.schema.ts` — REPLACE with re-export

```typescript
export { registerSchema, loginSchema } from '@shipflow/shared';
export type { RegisterDto, LoginDto } from '@shipflow/shared';
```

### `apps/api/src/modules/domestic-buyers/domestic-buyers.schema.ts` — REPLACE

```typescript
export {
  createDomesticBuyerSchema,
  updateDomesticBuyerSchema,
  domesticBuyerIdSchema,
  domesticBuyerStatusSchema,
} from '@shipflow/shared';
export type { CreateDomesticBuyerDto, UpdateDomesticBuyerDto } from '@shipflow/shared';
```

### `apps/api/src/modules/delivery-challan/delivery-challan.schema.ts` — REPLACE

```typescript
export { createDeliveryChallanSchema, updateDeliveryChallanSchema } from '@shipflow/shared';
export type { CreateDeliveryChallanDto, UpdateDeliveryChallanDto } from '@shipflow/shared';
```

### `apps/api/src/modules/domestic-proforma/domestic-proforma.schema.ts` — REPLACE

```typescript
export { createDomesticProformaSchema, updateDomesticProformaSchema } from '@shipflow/shared';
```

### No changes needed

- `prisma/schema.prisma` — stays as-is (DB is API-private)
- `src/prisma/prisma.service.ts` — stays as-is
- `nest-cli.json` — stays as-is
- `.env` — stays in `apps/api/`

---

## `apps/web/` — Next.js Frontend

Migrated from `ship-flow-ui/`. Changes required:

### `apps/web/package.json` — MODIFY

```diff
- "name": "ship-flow-ui"
+ "name": "@shipflow/web"
  "dependencies": {
+   "@shipflow/shared": "workspace:*",
+   "@shipflow/ui": "workspace:*",   // Phase 2 only
    ...existing deps
  }
```

### `apps/web/tsconfig.json` — MODIFY

```json
{
  "extends": "../../packages/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@shipflow/shared": ["../../packages/shared/src/index.ts"]
    }
  }
}
```

### `apps/web/next.config.ts` — MODIFY

Add `transpilePackages` to allow Turborepo workspace packages:

```typescript
const nextConfig = {
  transpilePackages: ['@shipflow/shared'],
};
```

### `apps/web/src/lib/india.ts` — REPLACE with re-export

```typescript
export * from '@shipflow/shared/validators/india';
```

### No changes needed

- `src/lib/api.ts` — API client stays in web (it's FE-specific)
- `src/store/` — Zustand stores stay in web
- `src/components/ui/` — stays in web (move to `packages/ui` in Phase 2)
- `components.json` — stays in `apps/web/` (shadcn CLI needs it here)
- `.env example` → rename to `.env.example`

---

## `packages/shared/` — Shared Zod Schemas & Types

### Directory tree

```
packages/shared/
├── src/
│   ├── schemas/
│   │   ├── auth.ts               ← from apps/api auth.schema.ts
│   │   ├── domestic-buyer.ts     ← from apps/api domestic-buyers.schema.ts
│   │   ├── delivery-challan.ts   ← from apps/api delivery-challan.schema.ts
│   │   ├── domestic-proforma.ts  ← from apps/api domestic-proforma.schema.ts
│   │   └── tax-invoice.ts        ← from apps/api tax-invoice/dto/*.ts
│   ├── validators/
│   │   └── india.ts              ← from apps/web/src/lib/india.ts
│   └── index.ts                  ← barrel export
├── package.json
└── tsconfig.json
```

### `packages/shared/package.json` (NEW)

```json
{
  "name": "@shipflow/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./validators/india": "./src/validators/india.ts"
  },
  "dependencies": {
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "typescript": "^5.7.3"
  }
}
```

> **Note:** We export raw `.ts` source files directly. Both consumers (NestJS and Next.js) run TypeScript compilers, so no pre-compilation step is needed for the shared package. This keeps the setup simple and avoids a separate `tsc` build for the package.

### `packages/shared/tsconfig.json` (NEW)

```json
{
  "extends": "../typescript-config/base.json",
  "compilerOptions": {
    "noEmit": true
  },
  "include": ["src/**/*"]
}
```

### `packages/shared/src/index.ts` (NEW)

```typescript
export * from './schemas/auth';
export * from './schemas/domestic-buyer';
export * from './schemas/delivery-challan';
export * from './schemas/domestic-proforma';
export * from './schemas/tax-invoice';
export * from './validators/india';
```

---

## `packages/typescript-config/` — Shared TSConfig Presets

### `packages/typescript-config/package.json` (NEW)

```json
{
  "name": "@shipflow/typescript-config",
  "version": "0.0.1",
  "private": true,
  "files": ["base.json", "nextjs.json", "nestjs.json"]
}
```

### `packages/typescript-config/base.json` (NEW)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2023",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true
  }
}
```

### `packages/typescript-config/nestjs.json` (NEW)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "lib": ["ES2023"],
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "noImplicitAny": false,
    "strictBindCallApply": false
  }
}
```

### `packages/typescript-config/nextjs.json` (NEW)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "strict": true
  }
}
```

---

## `packages/eslint-config/` — Shared ESLint

### `packages/eslint-config/package.json` (NEW)

```json
{
  "name": "@shipflow/eslint-config",
  "version": "0.0.1",
  "private": true,
  "main": "./index.js",
  "dependencies": {
    "eslint-config-prettier": "^10.0.1",
    "eslint-plugin-prettier": "^5.2.2"
  }
}
```

### `apps/api/eslint.config.mjs` — SIMPLIFY

Replace the current config to extend `@shipflow/eslint-config/nestjs`.

### `apps/web/eslint.config.mjs` — SIMPLIFY

Replace to extend `@shipflow/eslint-config/nextjs`.

---

## Files to DELETE after migration

| File                              | Reason                           |
| --------------------------------- | -------------------------------- |
| `ship-flow-api/node_modules/`     | Replaced by root hoisted install |
| `ship-flow-ui/node_modules/`      | Replaced by root hoisted install |
| `ship-flow-api/package-lock.json` | Using pnpm now                   |
| `ship-flow-ui/package-lock.json`  | Using pnpm now                   |
| `ship-flow-api/dist/`             | Rebuilt by turbo                 |
| `ship-flow-ui/.next/`             | Rebuilt by turbo                 |
| `ship-flow-api/.prettierrc`       | Moved to root                    |

---

## Git Strategy

```bash
# From the new monorepo root
git init
git commit --allow-empty -m "chore: init monorepo"

# Import api history
git remote add api-origin ./ship-flow-api
git fetch api-origin
git merge -s ours --no-commit api-origin/main
git read-tree --prefix=apps/api/ -u api-origin/main
git commit -m "chore: import ship-flow-api as apps/api"

# Import web history
git remote add web-origin ./ship-flow-ui
git fetch web-origin
git merge -s ours --no-commit web-origin/main
git read-tree --prefix=apps/web/ -u web-origin/main
git commit -m "chore: import ship-flow-ui as apps/web"

# Remove remotes
git remote remove api-origin
git remote remove web-origin
```

This preserves full commit history in each sub-directory. `git log apps/api/` works correctly.
