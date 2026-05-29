# ShipFlow — Development Rules

Coding conventions for both apps and the shared package. Applies to humans and LLMs working on this codebase.

---

## General

- TypeScript everywhere. No `any` without an explicit comment explaining why.
- No runtime safety nets for inputs that can't reach the function in the wrong shape — validate only at system boundaries (HTTP request bodies, user form input).
- No comments that describe what the code does. Only comments that explain a non-obvious constraint, workaround, or invariant.
- No unused exports, dead code, commented-out blocks, or backwards-compat shims.
- Icons: `lucide-react` only. Do not add another icon library.

---

## Shared Package (`packages/shared`)

**This package is the single source of truth for all validation logic.**

1. All Zod schemas go in `packages/shared/src/schemas/`. One file per entity.
2. Every schema file exports:
   - `create*Schema` — full validation
   - `update*Schema` — `createSchema.partial()`
   - `Create*Dto` and `Update*Dto` — inferred types via `z.infer<>`
3. After editing any file in `packages/shared/src/`, rebuild before consuming apps can pick it up:
   ```bash
   pnpm --filter @shipflow/shared run build
   ```
4. Do not duplicate validation logic in the API or web app. If a rule needs to change, change it in `packages/shared` only.
5. Do not import raw `.ts` source from `packages/shared` in either app — always import from the compiled `dist/` via the `@shipflow/shared` workspace alias.

---

## API (`apps/api`)

### Structure

```
src/modules/{feature}/
├── {feature}.controller.ts   HTTP endpoints
├── {feature}.service.ts      Business logic
├── {feature}.module.ts       NestJS module wiring
└── {feature}.schema.ts       re-exports from @shipflow/shared
```

### Validation

- All request bodies are parsed with `schema.safeParse(body)` at the top of every controller method. Never pass raw request bodies to service methods.
- Throw `BadRequestException({ message: 'Validation failed', errors: result.error.issues })` on parse failure.
- No `class-validator` decorators. Zod is the only validation mechanism.

### Services

- Services receive typed DTOs only — never `Request` objects or raw JSON.
- All database calls go through `this.prisma` — never import PrismaClient directly.
- Use Prisma `$transaction` for any operation that must be atomic (e.g., auto-number generation).

### Auth

- All routes except `/auth/*` are protected by the Passport JWT guard. Apply `@UseGuards(JwtAuthGuard)` at the controller or module level.
- JWT payload shape: `{ sub: userId, email }`. Access via `@GetUser()` decorator.

### Auto Document Numbering

- Never generate document numbers in application code. Use the `DocumentNumberSetting` service, which atomically increments the counter inside a `$transaction`.

### Build

- Never set `incremental: true` in `tsconfig.json` — it causes stale tsbuildinfo to skip emission after `dist/` is wiped.
- The dev script clears tsbuildinfo files before starting: `rm -f tsconfig.tsbuildinfo tsconfig.build.tsbuildinfo && nest start --watch`

---

## Web App (`apps/web`)

### File Locations

| What                            | Where                                       |
| ------------------------------- | ------------------------------------------- |
| Pages                           | `src/app/(dashboard)/your-section/page.tsx` |
| Generic UI primitives           | `src/components/ui/`                        |
| Domain-specific components      | `src/components/{feature}/`                 |
| Shared layout (sidebar, header) | `src/components/shared/`                    |
| Utility functions               | `src/lib/`                                  |
| Zustand stores                  | `src/store/`                                |
| Custom hooks                    | `src/hooks/`                                |
| Navigation config               | `src/config/navigation/`                    |

### API Calls

- All HTTP calls go through `src/lib/api.ts`: `api.get()`, `api.post()`, `api.patch()`, `api.delete()`.
- Never use raw `fetch()` or `axios` directly — the `api` wrapper handles auth tokens and error parsing.
- Never call the API from a server component — this app uses the API client in client components only.

### Forms

- Use `react-hook-form` with `zodResolver` from `@hookform/resolvers/zod`.
- Use schemas from `@shipflow/shared` — never write inline Zod schemas in form components.
- Set `aria-invalid` on inputs to trigger the red validation state — this is how the Input component shows errors.

```tsx
<Input {...register('gstin')} aria-invalid={!!errors.gstin} />;
{
  errors.gstin && <p className="text-sm text-red-500">{errors.gstin.message}</p>;
}
```

### State Management

- Global state lives in Zustand stores in `src/store/`. Keep each store single-purpose.
- The auth store (`auth.ts`) is persisted to `localStorage` under key `auth-store`. Do not read auth state from anywhere else.
- Local UI state (open/closed, loading, selected row) belongs in component `useState`, not a Zustand store.

### Components

- Check `src/components/ui/` before building a new component. shadcn/ui has 30+ primitives.
- Use `cva()` for components with multiple visual variants. Never use ternary-based class selection for variants.
- All class composition goes through `cn()` (`clsx` + `tailwind-merge`). Never string concatenation.
- Every component that accepts custom classes must accept a `className` prop and pass it through `cn()`.
- Functional components only. Arrow function style:
  ```tsx
  const MyComponent = ({ prop }: Props) => { ... }
  // or the explicit function style used by shadcn components:
  function MyComponent({ prop }: Props) { ... }
  ```

### Styling

- Tailwind utility classes only. No CSS modules, no inline `style={{}}` unless Tailwind cannot express it.
- Use semantic color tokens (`bg-background`, `text-foreground`, `border-border`) not hardcoded colors.
- Exception: components that intentionally break from the semantic palette (e.g., `bg-blue-600` in the button) are intentional and should remain literal.
- Responsive: use `sm:`, `md:`, `lg:` prefixes. Never write CSS that only works at one viewport width.
- Imports: `@/` prefix maps to `src/`. Always use `@/` — never relative imports that traverse upward.

### India-Specific Values

- Import `INDIAN_STATES` from `@/lib/india` (which re-exports from `@shipflow/shared`).
- Never hardcode a list of Indian states, GSTIN regex, PAN regex, IFSC regex, or pincode regex. They all live in `packages/shared`.

---

## Monorepo Rules

### Adding a Dependency

- Never install to the workspace root unless it's a devDependency used by turbo/pnpm tooling itself.
- Install to the specific app: `pnpm --filter @shipflow/api add <package>` or `pnpm --filter @shipflow/web add <package>`.
- pnpm strict isolation: if you import a package, it must be in that app's `package.json`. Transitive availability is not guaranteed.

### Build Order

Turborepo enforces this via `"dependsOn": ["^build"]`:

```
packages/shared  →  apps/api
                 →  apps/web
```

`packages/shared` must be built before either app. Run once after install:

```bash
pnpm --filter @shipflow/shared run build
```

After that, `turbo build` handles ordering automatically.

### Prisma

- Prisma schema lives in `apps/api/prisma/schema.prisma`. It is private to the API — never import Prisma types or client in `apps/web`.
- Always regenerate the client after schema changes: `pnpm exec prisma generate` (from `apps/api`).
- Use `prisma migrate dev` in development, `prisma migrate deploy` in CI/production.

### Environment Variables

- API secrets: `apps/api/.env` — never commit this file.
- Frontend public vars: `apps/web/.env.local` — never commit this file.
- No shared secrets at the workspace root.

---

## What Not to Do

- Do not add error handling for scenarios that can't occur. Trust TypeScript types and Zod-validated inputs inside the service layer.
- Do not add feature flags, backwards-compat shims, or `// TODO: remove` stubs — just change the code.
- Do not design for hypothetical future requirements. Implement what is asked, no more.
- Do not create intermediate planning documents, analysis files, or decision records during development — use the conversation and PR description.
- Do not push to the remote or create PRs without explicit user confirmation.
- Do not modify `.env` files without explicit user approval.
- Do not install new npm packages without explicit user approval.
