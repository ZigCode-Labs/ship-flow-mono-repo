# ShipFlow — Claude Rules

## Ports

| Service             | Port     |
| ------------------- | -------- |
| API (`apps/api`)    | **9000** |
| Web UI (`apps/web`) | **9001** |

- API runs on `http://localhost:9000` — set via `PORT=9000` in `apps/api/.env`
- Web UI runs on `http://localhost:9001` — Next.js dev/start scripts use `-p 9001`
- CORS is configured via `FRONTEND_URL=http://localhost:9001` in `apps/api/.env`

When adding new services, document their port here and update the relevant `.env` / `.env.example` files.

## Project Structure

```
shipflow/
├── apps/
│   ├── api/         # Active NestJS backend — develop here
│   └── web/         # Active Next.js frontend — develop here
├── packages/        # Shared packages (database, email, shared, etc.)
├── ship-flow-api/   # REFERENCE ONLY — do not develop here
└── ship-flow-ui/    # REFERENCE ONLY — do not develop here
```

## Reference Folders (`ship-flow-api/`, `ship-flow-ui/`)

These are **previous-iteration wireframe projects**, kept as visual/structural reference only.

Rules:

- **Never develop inside** `ship-flow-api/` or `ship-flow-ui/`.
- **Never import from** these folders into `apps/` or `packages/`.
- If a screen, component, or module from the reference is needed, **copy it** into the appropriate `apps/` location and rewrite it properly — do not use it as-is.
- Treat copied code as a wireframe/sketch: add full TypeScript types, proper state management, error handling, loading states, and API integration before considering it done.
- The reference UI is not production-ready — layouts and logic may be incomplete or inconsistent.

## Active Development (`apps/`)

All new features, bug fixes, and modules go in `apps/api` and `apps/web`.

### Frontend (`apps/web`)

- API calls go through `src/lib/api.ts` — never use raw `fetch` or `axios`
- Global state lives in Zustand (`src/store/`) — keep stores small and single-purpose
- Use absolute imports with the `@/` prefix (maps to `src/`)
- Components must include: loading states, error states, and empty states
- Every form must have Zod validation via `react-hook-form` + `@hookform/resolvers`
- Follow responsive design with Tailwind's `sm:` / `md:` / `lg:` prefixes

### Backend (`apps/api`)

- Follow NestJS module structure — one module per domain
- Validate all inputs with class-validator DTOs
- Never expose raw database errors to the client

## Component & Package Import Rules

Always import from the shared packages before reaching for local files or third-party primitives directly.

### Decision tree — where to put a component

```
Need a component?
│
├─ Already in @shipflow/ui?          → import from "@shipflow/ui"
├─ Already in @shipflow/ui-forms?    → import from "@shipflow/ui-forms"
├─ Already in @shipflow/ui-table?    → import from "@shipflow/ui-table"
│
├─ Not in any package yet:
│   ├─ Is it a generic primitive or layout piece that any future app could reuse?
│   │   → Add it to packages/ui, then import from "@shipflow/ui"
│   │
│   └─ Is it specific to ShipFlow's domain logic / a single screen?
│       → Build it in apps/web/src/components/<feature>/
```

### Package contents at a glance

| Package              | What lives here                                                                                                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@shipflow/ui`       | shadcn/Radix primitives (Button, Card, Sidebar, Dialog, …), shared layout shells (AppSidebar, DetailLayout, PageHeader, …Sidebars), `cn` utility, `useIsMobile` hook, navigation types |
| `@shipflow/ui-forms` | React Hook Form + Zod powered field components and form wrappers                                                                                                                       |
| `@shipflow/ui-table` | TanStack Table-based data-table components                                                                                                                                             |

### Rules

1. **Always check the packages first.** Before writing a new component, grep `@shipflow/ui`, `@shipflow/ui-forms`, and `@shipflow/ui-table` for what you need.
2. **Import from the package, not from `@/components/ui/`** when the same component exists in `@shipflow/ui`. Prefer `import { Button } from "@shipflow/ui"` over `import { Button } from "@/components/ui/button"`.
3. **Add to `packages/ui` when:** the component is a generic UI primitive or shared layout piece with no ShipFlow-specific domain logic, and it would be useful in any future project.
4. **Keep in `apps/web` when:** the component is tightly coupled to ShipFlow domain data, a specific page, or business logic — it does not belong in a generic library.
5. **Never duplicate.** If you add a component to `packages/ui`, remove or replace the copy in `apps/web/src/components/ui/` with an import from the package.
6. **Update `packages/ui/src/index.ts`** whenever you add a new file to the package so it is re-exported from the barrel.

## Environment Files

- `apps/api/.env` — local API config (not committed)
- `apps/api/.env.example` — template, keep in sync with `.env`
- `apps/web/.env` — local UI config (not committed)
- `apps/web/.env example` — template for UI env vars

## Key Conventions

- Never skip lint or type-check steps
- Never install new dependencies without user approval
- Never modify `.env` files without asking first
