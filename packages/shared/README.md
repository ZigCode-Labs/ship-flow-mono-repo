# `@shipflow/shared`

Shared Zod schemas, TypeScript types, and India-specific validators used by both `@shipflow/api` (NestJS) and `@shipflow/web` (Next.js).

This package is the single source of truth for all field-level validation rules. If a GSTIN regex changes, it changes once here and both apps pick it up at the next build.

---

## Why This Package Exists

Without shared schemas:

- The API validates GSTIN with one regex.
- The frontend has its own copy that may drift.
- A valid frontend submission can fail the API — bad UX and hard to debug.

With shared schemas:

- One regex, enforced in both places.
- `tsc` catches shape mismatches at compile time, not at runtime.
- Frontend forms validate before even sending an HTTP request.

---

## Building

Must be built before either app can run. Output goes to `dist/`.

```bash
# From monorepo root
node_modules/.pnpm/node_modules/.bin/tsc -p packages/shared/tsconfig.json

# Or with the package script (from packages/shared)
pnpm run build

# Watch mode during active schema development
pnpm run dev
```

After editing any file in `src/`, rebuild with the above command, then restart the consuming apps.

---

## Contents

### Schemas (`src/schemas/`)

All schemas are Zod objects. Each file exports:

- A `create*Schema` (full validation)
- An `update*Schema` (`.partial()` of create)
- Inferred TypeScript types (`Create*Dto`, `Update*Dto`)

#### `auth.ts`

```typescript
registerSchema   // z.preprocess normalizes flexible field names before validating
loginSchema      // email + password

type RegisterDto  // { firstName, lastName, email, password }
type LoginDto     // { email, password }
```

The `normalizeAuthPayload` preprocessor accepts nested payloads (`{ data: { firstName } }`, `{ user: { firstName } }`, etc.) and flattens them — useful for flexible frontend form shapes.

#### `domestic-buyer.ts`

```typescript
createDomesticBuyerSchema
updateDomesticBuyerSchema
domesticBuyerIdSchema      // z.string().uuid()
domesticBuyerStatusSchema  // z.enum(['active', 'inactive', 'trash'])

type CreateDomesticBuyerDto
type UpdateDomesticBuyerDto
```

**Business rules encoded:**

| Field                            | Rule                                                                      |
| -------------------------------- | ------------------------------------------------------------------------- |
| `gstin`                          | `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/` — 15-char GST number |
| `panNumber`                      | `/^[A-Z]{5}[0-9]{4}[A-Z]$/` — 10-char PAN                                 |
| `ifscCode`                       | `/^[A-Z]{4}0[A-Z0-9]{6}$/` — 11-char IFSC                                 |
| `pincode`                        | `/^[1-9][0-9]{5}$/` — 6-digit Indian pincode                              |
| `email`                          | standard email format                                                     |
| `gstin`, `panNumber`, `ifscCode` | auto-uppercased on parse                                                  |

#### `delivery-challan.ts`

```typescript
deliveryChallanItemSchema
createDeliveryChallanSchema
updateDeliveryChallanSchema

type CreateDeliveryChallanDto
type UpdateDeliveryChallanDto
```

Fields: challan number, dates, company/customer info, transporter details, line items, financials, status.

#### `domestic-proforma.ts`

```typescript
domesticProformaItemSchema
createDomesticProformaSchema
updateDomesticProformaSchema

type CreateDomesticProformaDto
type UpdateDomesticProformaDto
```

Fields: proforma number, validity dates, seller/buyer GSTIN, line items, discount (`₹` or `%`), GST, grand total.

#### `tax-invoice.ts`

```typescript
taxInvoiceLineItemSchema
createTaxInvoiceSchema
updateTaxInvoiceSchema
updateTaxInvoiceLineItemSchema
filterTaxInvoiceSchema         // for list/search queries

type CreateTaxInvoiceDto
type UpdateTaxInvoiceDto
type FilterTaxInvoiceDto
```

`filterTaxInvoiceSchema` validates query params: `page`, `limit`, `sortBy`, `sortOrder`, `status`, `dateFrom`, `dateTo`, `search`.

Invoice status enum: `draft | sent | paid | overdue | cancelled`

---

### Validators (`src/validators/`)

#### `india.ts`

```typescript
INDIAN_STATES    // readonly tuple of all 36 Indian state/UT names
type IndianState // union type of all state names
```

Used in dropdowns and state field validation across the app.

---

## Using in `apps/api`

```typescript
// apps/api/src/modules/domestic-buyers/domestic-buyers.service.ts
import { CreateDomesticBuyerDto } from '@shipflow/shared';

async create(dto: CreateDomesticBuyerDto) { ... }
```

```typescript
// Controller — validate before business logic
import { createDomesticBuyerSchema } from '@shipflow/shared';

const result = createDomesticBuyerSchema.safeParse(body);
if (!result.success) throw new BadRequestException(...);
```

## Using in `apps/web`

```typescript
// Form with zodResolver
import { createDomesticBuyerSchema, CreateDomesticBuyerDto } from '@shipflow/shared';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<CreateDomesticBuyerDto>({
  resolver: zodResolver(createDomesticBuyerSchema),
});

// India states dropdown
import { INDIAN_STATES } from '@shipflow/shared';
<select>{INDIAN_STATES.map(s => <option key={s}>{s}</option>)}</select>
```

---

## Adding a New Schema

1. Create `src/schemas/your-entity.ts` following the existing pattern:

```typescript
import { z } from 'zod';

export const createYourEntitySchema = z.object({ ... });
export const updateYourEntitySchema = createYourEntitySchema.partial();

export type CreateYourEntityDto = z.infer<typeof createYourEntitySchema>;
export type UpdateYourEntityDto = z.infer<typeof updateYourEntitySchema>;
```

2. Export it from `src/index.ts`:

```typescript
export * from './schemas/your-entity';
```

3. Rebuild the package:

```bash
pnpm --filter @shipflow/shared run build
```

4. Import in the API service and controller, and in the web form component.

---

## Package Exports

```json
{
  ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
  "./validators/india": {
    "types": "./dist/validators/india.d.ts",
    "default": "./dist/validators/india.js"
  }
}
```

The package ships CommonJS (`module: "CommonJS"` in tsconfig) so NestJS can consume it directly. Next.js lists it in `transpilePackages` in `next.config.ts` for Turbopack compatibility.

---

## Why Pre-compiled (Not Raw `.ts` Source)

NestJS compiles its own `src/` with `tsc`. If `@shipflow/shared` exported raw `.ts` files, those files would be pulled into the NestJS compilation context, expanding the TypeScript `rootDir` to the monorepo root and breaking the output directory structure (`dist/apps/api/src/main.js` instead of `dist/main.js`).

Pre-compiling to `dist/*.d.ts` + `dist/*.js` makes the package look like any other npm package to both compilers. TypeScript uses the `.d.ts` declarations for type-checking and the API runtime uses the `.js` output.
