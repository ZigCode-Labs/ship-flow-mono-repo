# ShipFlow Web — `@shipflow/web`

Next.js 16 App Router frontend. India-focused document management UI — tax invoices, delivery challans, proformas, and buyer CRM. Runs on **port 3000** by default.

---

## Stack

| Technology      | Version | Role                                            |
| --------------- | ------- | ----------------------------------------------- |
| Next.js         | 16.2.2  | App Router, SSR/client routing                  |
| React           | 19      | UI runtime                                      |
| TypeScript      | 5       | Type safety                                     |
| Tailwind CSS    | v4      | Utility-first styling                           |
| shadcn/ui       | —       | Accessible component library (Radix primitives) |
| Zustand         | 5       | Global state (auth, buyers)                     |
| react-hook-form | 7       | Form state + validation                         |
| Zod             | 4       | Schema validation (via `@shipflow/shared`)      |
| lucide-react    | —       | Icons                                           |

---

## Running

```bash
# From monorepo root
pnpm --filter @shipflow/web run dev

# From apps/web directly
cd apps/web
pnpm run dev
```

Starts on `http://localhost:3000`. Requires the API running on port 4000 for data operations.

---

## Environment Variables

Copy `.env example` to `.env.local`:

```bash
cp "apps/web/.env example" apps/web/.env.local
```

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

If not set, the API client defaults to `http://localhost:4000`.

---

## Page Map

```
/                       → redirects to /dashboard or /login
/login                  Login form
/register               Registration form

/dashboard              KPI overview, quick actions
/domestic               Domestic module hub

/domestic/buyers        Buyer list (cards, search, filter by status)
/domestic/buyers/new    Create new buyer form

/domestic/invoices      Tax invoice list (table, filter, search)
/domestic/invoices/new  Create / edit invoice form

/domestic/delivery-challan        Delivery challan list
/domestic/delivery-challan/new    Create / edit form

/domestic/proforma      Proforma list
/domestic/proforma/new-proforma  Create / edit form

/domestic/settings      Document number format settings

/production             Production module (cost sheets, job-work, raw materials, purchase orders)
/exports                Exports module (placeholder)
```

---

## Component Structure

```
src/components/
├── ui/                   Generic primitives (shadcn/ui)
│   ├── button.tsx        card.tsx  dialog.tsx  input.tsx
│   ├── select.tsx        table.tsx  badge.tsx  tabs.tsx
│   └── ... (30+ components)
├── shared/               Layout + navigation
│   ├── app-sidebar.tsx   Main navigation sidebar
│   ├── domestic-sidebar.tsx
│   ├── production-sidebar.tsx
│   ├── page-header.tsx
│   └── detail-layout.tsx
├── dynamic-form/         JSON-driven generic form renderer
│   ├── DynamicForm.tsx   Renders fields from a config JSON
│   └── fields/           DynamicInput, DynamicSelect, DynamicCheckbox, …
├── proforma/             ProformaForm, ProformaInvoiceViewer
├── dashboard/            KpiCard, QuickActions, RecentActivity
└── header/               Top app bar
```

---

## State Management

### `src/store/auth.ts`

Persisted to `localStorage` under key `auth-store`.

```typescript
{
  user: { id, email, firstName, lastName } | null,
  token: string | null,
  isAuthenticated: boolean,
  login(user, token): void,
  logout(): void,
}
```

### `src/store/domesticBuyers.ts`

In-memory list of buyers, loaded on mount.

---

## API Client (`src/lib/api.ts`)

All HTTP calls go through the `api` object:

```typescript
import { api } from '@/lib/api';

// Examples
const invoices = await api.get('/tax-invoices?page=1&limit=10');
const created = await api.post('/tax-invoices', payload);
const updated = await api.patch('/tax-invoices/abc123', patch);
await api.delete('/domestic-buyers/abc123');
```

- Auto-attaches `Authorization: Bearer <token>` from the Zustand auth store.
- Throws a readable `Error` on non-2xx responses (parses JSON error body automatically).
- Base URL from `NEXT_PUBLIC_API_BASE_URL` env var.

---

## Form Validation

Forms use `react-hook-form` + `zodResolver` with schemas from `@shipflow/shared`:

```typescript
import { createDomesticBuyerSchema } from '@shipflow/shared';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({ resolver: zodResolver(createDomesticBuyerSchema) });
```

Since the same schema runs on the API side, the frontend and backend enforce identical rules (GSTIN format, PAN format, IFSC, pincode, etc.) with no duplication.

---

## India-Specific Utilities

`src/lib/india.ts` re-exports from `@shipflow/shared`:

```typescript
import { INDIAN_STATES } from '@/lib/india';
// INDIAN_STATES is a readonly tuple of all 36 state/UT names
```

---

## Dynamic Form System

`src/components/dynamic-form/DynamicForm.tsx` renders forms from a JSON config:

```json
{
  "id": "my-form",
  "fields": [
    { "id": "name", "name": "name", "type": "text", "label": "Name", "required": true },
    { "id": "state", "name": "state", "type": "select", "label": "State", "options": [...] }
  ]
}
```

Used for production-module forms (job-work, purchase orders, raw materials) where the field schema is data-driven. Feature forms (invoices, buyers) use purpose-built React components instead.

---

## Adding a New Page

1. Create `src/app/(dashboard)/your-section/page.tsx`
2. Add the route to the appropriate sidebar config in `src/config/navigation/`
3. Create feature components in `src/components/your-section/`
4. Add API calls via `api.get/post/patch/delete` from `@/lib/api`
5. If the feature has a form with server-validated fields, add the Zod schema to `packages/shared/src/schemas/` and rebuild shared

---

## TypeScript

```bash
# Type-check
node_modules/.bin/tsc --project tsconfig.json --noEmit

# Build
pnpm run build
```

`tsconfig.json` extends `packages/typescript-config/nextjs.json`. The path alias `@shipflow/shared` points to `packages/shared/dist/index.d.ts`.

> Three pre-existing type errors exist in the original codebase (implicit `any` in `.reduce()` callbacks and a `symbol` vs `Symbol` typo in cost-sheet components). These are not introduced by the monorepo migration and do not affect runtime behaviour.
