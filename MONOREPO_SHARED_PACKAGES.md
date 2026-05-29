# ShipFlow — Shared Package Inventory

This document lists every piece of code that should move to `packages/shared`, with the exact reason it belongs there.

---

## Why Share Schemas?

Both `apps/api` and `apps/web` use **Zod `^4.3.6`**. The API validates incoming requests with Zod schemas. The frontend can import the same schemas to:

1. Validate form data **before** sending to the API (instant UX feedback, zero duplication).
2. Derive TypeScript types (`z.infer<typeof schema>`) once and use them in both apps.
3. Enforce consistent business rules (e.g., GSTIN regex) in exactly one place.

---

## Schema Inventory

### `packages/shared/src/schemas/auth.ts`

**Source:** `apps/api/src/modules/auth/auth.schema.ts`

**Exports:**

```typescript
export const registerSchema         // z.ZodEffects
export const loginSchema            // z.ZodEffects
export type RegisterDto             // { firstName, lastName, email, password }
export type LoginDto                // { email, password }
```

**Why shared:**
The `normalizeAuthPayload` preprocessor is valuable for FE too — it normalises flexible field names before validation. The FE register/login forms use the same field contract.

---

### `packages/shared/src/schemas/domestic-buyer.ts`

**Source:** `apps/api/src/modules/domestic-buyers/domestic-buyers.schema.ts`

**Exports:**

```typescript
export const createDomesticBuyerSchema
export const updateDomesticBuyerSchema
export const domesticBuyerIdSchema
export const domesticBuyerStatusSchema   // z.enum(['active','inactive','trash'])
export type CreateDomesticBuyerDto
export type UpdateDomesticBuyerDto
```

**Why shared:**
`DomesticBuyerForm.tsx` currently has its own validation logic. Replacing it with `createDomesticBuyerSchema` from the shared package gives identical GSTIN, PAN, IFSC, and pincode validation on both sides.

**Business rules encoded (keep single source of truth):**

- GSTIN: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/`
- PAN: `/^[A-Z]{5}[0-9]{4}[A-Z]$/`
- IFSC: `/^[A-Z]{4}0[A-Z0-9]{6}$/`
- Pincode: `/^[1-9][0-9]{5}$/`

---

### `packages/shared/src/schemas/delivery-challan.ts`

**Source:** `apps/api/src/modules/delivery-challan/delivery-challan.schema.ts`

**Exports:**

```typescript
export const deliveryChallanItemSchema
export const createDeliveryChallanSchema
export const updateDeliveryChallanSchema
export type CreateDeliveryChallanDto
export type UpdateDeliveryChallanDto
```

**Why shared:**
`DeliveryChallanForm.tsx` in the FE mirrors this schema. Sharing removes the risk of the FE accepting a payload the API rejects.

---

### `packages/shared/src/schemas/domestic-proforma.ts`

**Source:** `apps/api/src/modules/domestic-proforma/domestic-proforma.schema.ts`

**Exports:**

```typescript
export const createDomesticProformaSchema
export const updateDomesticProformaSchema
export type CreateDomesticProformaDto
export type UpdateDomesticProformaDto
```

**Why shared:**
`ProformaForm.tsx` and the new-proforma page both need this schema for form validation.

---

### `packages/shared/src/schemas/tax-invoice.ts`

**Source:** `apps/api/src/modules/tax-invoice/dto/*.ts`

**Exports:**

```typescript
export const createTaxInvoiceSchema     // from create-tax-invoice.dto.ts
export const updateTaxInvoiceSchema     // from update-tax-invoice.dto.ts
export const filterTaxInvoiceSchema     // from filter-tax-invoice.dto.ts
export type CreateTaxInvoiceDto
export type UpdateTaxInvoiceDto
export type FilterTaxInvoiceDto
```

**Why shared:**
`InvoiceForm.tsx` needs the create schema. `InvoiceList` filtering can use `filterTaxInvoiceSchema` to validate URL query params.

---

## Validator Inventory

### `packages/shared/src/validators/india.ts`

**Source:** `apps/web/src/lib/india.ts`

**Contents (typical):**

- Indian states list with codes
- GST rate slabs
- HSN code helpers
- Any other India-specific lookups

**Why shared:**
The API also needs state names and GST rates for document calculations. Keeping this in `shared` avoids duplication and lets both apps stay in sync if new states/GST slabs are added.

---

## What Does NOT Move to Shared

| Code                                                              | Stays In             | Reason                                                       |
| ----------------------------------------------------------------- | -------------------- | ------------------------------------------------------------ |
| `src/lib/api.ts` (FE fetch wrapper)                               | `apps/web`           | Browser-only, uses `localStorage`; meaningless on the server |
| `src/store/auth.ts` (Zustand)                                     | `apps/web`           | React state — no use in NestJS                               |
| `src/components/ui/*` (shadcn)                                    | `apps/web` (Phase 1) | React components; not needed in API                          |
| `prisma/schema.prisma`                                            | `apps/api`           | DB schema is private to the API layer                        |
| `src/prisma/prisma.service.ts`                                    | `apps/api`           | NestJS-specific                                              |
| NestJS modules (`*.module.ts`, `*.controller.ts`, `*.service.ts`) | `apps/api`           | Framework-bound                                              |
| Next.js pages & layouts                                           | `apps/web`           | Next.js App Router specific                                  |
| Navigation config (`src/config/navigation/`)                      | `apps/web`           | FE routing only                                              |
| `src/hooks/`                                                      | `apps/web`           | React hooks                                                  |

---

## Dependency Versioning — No Conflicts

Both apps already use identical versions for shared dependencies:

| Package      | `apps/api` version | `apps/web` version | Shared?               |
| ------------ | ------------------ | ------------------ | --------------------- |
| `zod`        | `^4.3.6`           | `^4.3.6`           | YES — single copy     |
| `typescript` | `^5.7.3`           | `^5`               | YES — hoist `^5.7.3`  |
| `dotenv`     | `^17.4.0`          | `^17.4.2`          | YES — hoist `^17.4.2` |
| `prettier`   | `^3.4.2`           | —                  | Move to root only     |

Versions to hoist to root `devDependencies`: `typescript`, `prettier`.
`zod` stays as a dep of `packages/shared` (both apps consume it via the shared package).

---

## Type Sharing — Before vs After

### Before (duplicated types)

```
apps/api/src/modules/delivery-challan/delivery-challan.schema.ts
  → export type CreateDeliveryChallanDto

apps/web/src/app/(dashboard)/domestic/delivery-challan/types/index.ts
  → (manual re-declaration of the same shape — drift risk)
```

### After (single source)

```
packages/shared/src/schemas/delivery-challan.ts
  → export type CreateDeliveryChallanDto

apps/api:  import { CreateDeliveryChallanDto } from '@shipflow/shared'
apps/web:  import { CreateDeliveryChallanDto } from '@shipflow/shared'
```

The FE `types/index.ts` files in each feature folder become re-exports or are deleted entirely once they reference `@shipflow/shared`.

---

## Import Examples After Migration

### In NestJS service

```typescript
// apps/api/src/modules/delivery-challan/delivery-challan.service.ts
import { CreateDeliveryChallanDto } from '@shipflow/shared';
```

### In Next.js form

```typescript
// apps/web/src/app/(dashboard)/domestic/delivery-challan/components/DeliveryChallanForm.tsx
import { createDeliveryChallanSchema, CreateDeliveryChallanDto } from '@shipflow/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm<CreateDeliveryChallanDto>({
  resolver: zodResolver(createDeliveryChallanSchema),
});
```

This is the core value of the monorepo: **one schema, zero drift**.
