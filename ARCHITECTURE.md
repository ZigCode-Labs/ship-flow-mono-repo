# ShipFlow — Architecture

## Overview

ShipFlow is a two-tier web application: a NestJS REST API backed by PostgreSQL, and a Next.js App Router frontend. Both live in a Turborepo pnpm monorepo. Validation logic is shared between them through a compiled `@shipflow/shared` package so the frontend and backend can never drift apart on field rules.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React 19)                       │
│                                                                 │
│  Next.js 16 App Router  ──  Zustand store  ──  react-hook-form │
│  Tailwind v4 + shadcn/ui                                        │
│                    │                                            │
│                    │  @shipflow/shared (Zod schemas)            │
│                    │  validates forms before API call           │
└────────────────────┼────────────────────────────────────────────┘
                     │ HTTP/JSON  Bearer JWT
                     │ http://localhost:4000
┌────────────────────┼────────────────────────────────────────────┐
│                 NestJS 11 API                                   │
│                                                                 │
│  Controller → Zod parse (@shipflow/shared) → Service → Prisma  │
│                                                                 │
│  Passport JWT guard on all routes except /auth/*               │
└────────────────────┼────────────────────────────────────────────┘
                     │ Prisma Client (generated)
┌────────────────────┼────────────────────────────────────────────┐
│              PostgreSQL                                         │
│  Users · DocumentNumberSettings · TaxInvoices                  │
│  DeliveryChallans · DomesticProformas · DomesticBuyers         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Monorepo & Build Pipeline

```
packages/shared  ──build──▶  packages/shared/dist/
       │                              │
       │ workspace:*                  │ (imported as external package)
       ▼                              ▼
  apps/api                       apps/web
  (nest build)                   (next build)
```

Turborepo `turbo.json` enforces this order via `"dependsOn": ["^build"]`: packages always build before apps.

---

## Package Responsibilities

### `@shipflow/api` — `apps/api/`

NestJS application. Owns:

- HTTP request handling (controllers)
- Business logic (services)
- Data persistence (Prisma)
- JWT authentication (Passport)
- Zod validation (re-exported from `@shipflow/shared`)

**Module structure:**

```
src/
├── main.ts                      Bootstrap, CORS, port binding
├── app.module.ts                Root module wiring
├── prisma/                      PrismaService (singleton DB client)
└── modules/
    ├── auth/                    Register, login, JWT guard
    ├── tax-invoice/             CRUD + soft-delete + pagination
    ├── delivery-challan/        CRUD + auto-number
    ├── domestic-proforma/       CRUD + auto-number
    ├── domestic-buyers/         CRUD + status lifecycle
    └── document-settings/       Per-document number format config
```

### `@shipflow/web` — `apps/web/`

Next.js 16 App Router application. Owns:

- All UI pages and layouts
- Client-side state (Zustand auth store, buyer store)
- Form handling (react-hook-form + zodResolver)
- API communication (`src/lib/api.ts` fetch wrapper)

**Route groups:**

```
src/app/
├── (main)/                      Landing / root redirect
├── login/                       Login page
├── register/                    Registration page
└── (dashboard)/
    ├── dashboard/               Overview / KPIs
    ├── domestic/
    │   ├── buyers/              Domestic buyer list + CRUD
    │   ├── invoices/            Tax invoice list + CRUD
    │   ├── delivery-challan/    Delivery challan list + CRUD
    │   ├── proforma/            Domestic proforma list + CRUD
    │   └── settings/            Document number format settings
    ├── production/              Production module (cost sheets, job-work, etc.)
    └── exports/                 Export module (placeholder)
```

### `@shipflow/shared` — `packages/shared/`

Pure TypeScript library. Compiled to `dist/` (CommonJS) before either app runs.

Contains:

- **Zod schemas** — canonical validation rules for every entity
- **TypeScript types** — inferred from schemas via `z.infer<>`
- **India validators** — `INDIAN_STATES` list, future GST/PAN/GSTIN helpers

Both apps import from `@shipflow/shared` via the pnpm workspace symlink. The shared package is the single source of truth for all field-level validation rules.

---

## Authentication Flow

```
POST /auth/register  →  Zod validate  →  argon2 hash password  →  DB insert
POST /auth/login     →  Zod validate  →  argon2 verify         →  sign JWT

All other routes: Passport JwtStrategy reads Bearer token from Authorization header
                  → verifies signature with JWT_SECRET
                  → attaches user to request
```

JWT payload: `{ sub: userId, email }`

---

## Validation Architecture

The key design decision: validation schemas live in `@shipflow/shared`, not in the individual apps.

```
packages/shared/src/schemas/domestic-buyer.ts
  ├── createDomesticBuyerSchema    (GSTIN regex, PAN regex, IFSC regex, pincode regex)
  └── updateDomesticBuyerSchema    (.partial() of create)

apps/api/src/modules/domestic-buyers/domestic-buyers.schema.ts
  └── re-exports from @shipflow/shared   ← NestJS controllers use this

apps/web/.../buyers/components/DomesticBuyerForm.tsx
  └── import { createDomesticBuyerSchema } from '@shipflow/shared'
      └── zodResolver(createDomesticBuyerSchema)  ← form uses same rules
```

This means:

- A frontend form will catch GSTIN format errors before the HTTP request is sent.
- If the API schema changes, `tsc` will fail in the web app at compile time — not at runtime.

---

## Database Schema

```
User
  id · email · password · firstName · lastName · createdAt · updatedAt

DocumentNumberSetting  (one row per DocumentType enum value)
  documentType (TAX_INVOICE | DOMESTIC_PROFORMA | CREDIT_NOTE | DELIVERY_CHALLAN)
  prefix · digits · startingNumber

TaxInvoice  ──has many──▶  TaxInvoiceLineItem
  invoiceNumber · invoiceDate · dueDate · exchangeRate
  companyName · gstin · state
  customerId · customerName · customerGstin · placeOfSupply
  bank fields · payment/reference/notes
  subtotal · discount · taxableAmount · igst · totalTax · grandTotal
  status (draft | sent | paid | overdue | cancelled)
  deletedAt (soft delete)

DeliveryChallan  ──has many──▶  DeliveryChallanItem
  challanNumber · challanDate · deliveryType
  company/customer fields · transporter · vehicle
  financials · status

DomesticProforma  ──has many──▶  DomesticProformaItem
  proformaNumber · date · validUntil
  seller/customer/supply fields
  discount · financials · status

DomesticBuyer
  companyName · tradeName · gstin (unique) · panNumber
  address · city · state · pincode
  contact fields · bank fields
  status (active | inactive | trash)
```

---

## API Client (Frontend)

`apps/web/src/lib/api.ts` — thin wrapper over `fetch`:

```typescript
api.get('/tax-invoices');
api.post('/tax-invoices', payload);
api.patch('/tax-invoices/:id', payload);
api.delete('/tax-invoices/:id');
```

- Automatically reads the JWT token from Zustand's persisted `auth-store` in `localStorage`.
- Appends `Authorization: Bearer <token>` header on every request.
- Throws a readable error string on non-2xx responses.
- Base URL: `NEXT_PUBLIC_API_BASE_URL` env var (defaults to `http://localhost:4000`).

---

## State Management

Zustand stores in `apps/web/src/store/`:

| Store               | Key state                          | Persistence                   |
| ------------------- | ---------------------------------- | ----------------------------- |
| `auth.ts`           | `user`, `token`, `isAuthenticated` | `localStorage` (`auth-store`) |
| `domesticBuyers.ts` | buyers list, loading/error         | Session only                  |

---

## TypeScript Config Inheritance

```
packages/typescript-config/base.json      (target ES2023, strictNullChecks, skipLibCheck)
      │
      ├──▶  nestjs.json   (+ CommonJS, emitDecoratorMetadata, experimentalDecorators)
      │         └──▶  apps/api/tsconfig.json
      │
      └──▶  nextjs.json   (+ dom, esnext, moduleResolution bundler, jsx react-jsx)
                └──▶  apps/web/tsconfig.json
```

---

## Key Design Decisions

| Decision                    | Choice                                 | Reason                                                                                                                       |
| --------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Shared schemas pre-compiled | `composite: true`, exports `dist/`     | NestJS `tsc` cannot include raw `.ts` source files from outside its `rootDir`; pre-compiled `.d.ts` avoids rootDir expansion |
| Shared schemas location     | `packages/shared`                      | Single source of truth — FE/BE cannot drift on validation rules                                                              |
| Prisma in `apps/api` only   | Not in shared                          | DB schema is private to the API layer; frontend never talks to DB directly                                                   |
| `.env` per app              | `apps/api/.env`, `apps/web/.env.local` | Each app has different secrets; no shared secrets at root                                                                    |
| pnpm workspaces             | pnpm 9                                 | Efficient deduplication, first-class workspace protocol, best Turborepo support                                              |
