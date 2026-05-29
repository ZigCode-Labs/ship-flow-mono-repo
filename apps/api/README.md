# ShipFlow API — `@shipflow/api`

NestJS 11 REST API. Handles authentication, document CRUD, and business logic for the ShipFlow platform. Runs on **port 4000** by default.

---

## Stack

| Technology     | Version | Role                                        |
| -------------- | ------- | ------------------------------------------- |
| NestJS         | 11      | HTTP framework, DI, guards                  |
| Prisma         | 7       | ORM + migrations                            |
| PostgreSQL     | any     | Primary database                            |
| Zod            | 4       | Request validation (via `@shipflow/shared`) |
| Passport + JWT | —       | Auth strategy                               |
| argon2         | —       | Password hashing                            |

---

## Running

```bash
# From monorepo root — dev watch mode
pnpm --filter @shipflow/api run dev

# Production build + start
pnpm --filter @shipflow/api run build
pnpm --filter @shipflow/api run start:prod

# From apps/api directly
cd apps/api
pnpm run dev
```

The `dev` script clears stale `.tsbuildinfo` files before starting `nest start --watch`, which prevents incremental cache from skipping compilation after a clean.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ship_flow_dev?schema=public"
JWT_SECRET="your-secret-key"
PORT=4000
NODE_ENV=development
```

---

## API Routes

Base URL: `http://localhost:4000`

All routes except `/auth/*` require `Authorization: Bearer <token>`.

### Auth

| Method | Path             | Body                                       | Description                 |
| ------ | ---------------- | ------------------------------------------ | --------------------------- |
| POST   | `/auth/register` | `{ firstName, lastName, email, password }` | Create account, returns JWT |
| POST   | `/auth/login`    | `{ email, password }`                      | Login, returns JWT          |

### Tax Invoices

| Method | Path                        | Description                            |
| ------ | --------------------------- | -------------------------------------- |
| POST   | `/tax-invoices`             | Create invoice                         |
| GET    | `/tax-invoices`             | List invoices (paginated, filterable)  |
| GET    | `/tax-invoices/next-number` | Get next auto-generated invoice number |
| GET    | `/tax-invoices/trash`       | List soft-deleted invoices             |
| GET    | `/tax-invoices/:id`         | Get single invoice                     |
| PATCH  | `/tax-invoices/:id`         | Update invoice                         |
| DELETE | `/tax-invoices/:id`         | Soft-delete invoice                    |
| POST   | `/tax-invoices/:id/restore` | Restore soft-deleted invoice           |

**Filter query params for `GET /tax-invoices`:**
`search`, `page`, `limit`, `sortBy`, `sortOrder`, `status`, `dateFrom`, `dateTo`

### Delivery Challans

| Method | Path                             | Description                            |
| ------ | -------------------------------- | -------------------------------------- |
| POST   | `/delivery-challans`             | Create challan                         |
| GET    | `/delivery-challans`             | List challans                          |
| GET    | `/delivery-challans/next-number` | Get next auto-generated challan number |
| GET    | `/delivery-challans/:id`         | Get single challan                     |
| PUT    | `/delivery-challans/:id`         | Update challan                         |
| DELETE | `/delivery-challans/:id`         | Delete challan                         |

### Domestic Proformas

| Method | Path                              | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| POST   | `/domestic-proformas`             | Create proforma                |
| GET    | `/domestic-proformas`             | List proformas                 |
| GET    | `/domestic-proformas/next-number` | Get next auto-generated number |
| GET    | `/domestic-proformas/:id`         | Get single proforma            |
| PUT    | `/domestic-proformas/:id`         | Update proforma                |
| DELETE | `/domestic-proformas/:id`         | Delete proforma                |

### Domestic Buyers

| Method | Path                   | Description                         |
| ------ | ---------------------- | ----------------------------------- |
| POST   | `/domestic-buyers`     | Create buyer                        |
| GET    | `/domestic-buyers`     | List buyers                         |
| GET    | `/domestic-buyers/:id` | Get single buyer                    |
| PUT    | `/domestic-buyers/:id` | Full update                         |
| PATCH  | `/domestic-buyers/:id` | Partial update (e.g. status change) |
| DELETE | `/domestic-buyers/:id` | Delete buyer                        |

### Document Settings

| Method | Path                               | Description                      |
| ------ | ---------------------------------- | -------------------------------- |
| GET    | `/document-settings`               | Get all document number settings |
| GET    | `/document-settings/:documentType` | Get settings for one type        |
| PUT    | `/document-settings`               | Update settings (bulk)           |
| PUT    | `/document-settings/:documentType` | Update settings for one type     |

`documentType` values: `TAX_INVOICE`, `DOMESTIC_PROFORMA`, `DELIVERY_CHALLAN`, `CREDIT_NOTE`

---

## Request Validation

All request bodies are validated with Zod schemas from `@shipflow/shared`. The controller calls `schema.safeParse(body)` directly and returns a 400 with structured errors on failure — no class-validator decorators.

```typescript
const result = createTaxInvoiceSchema.safeParse(body);
if (!result.success) {
  throw new BadRequestException({
    message: 'Validation failed',
    errors: result.error.issues,
  });
}
```

---

## Database Migrations

```bash
cd apps/api

# Create a new migration (dev only — auto-detects schema diff)
pnpm exec prisma migrate dev --name add_something

# Apply all pending migrations (CI / production)
pnpm exec prisma migrate deploy

# Regenerate Prisma client after schema change
pnpm exec prisma generate

# Open Prisma Studio (web DB browser)
pnpm exec prisma studio

# Seed the database
pnpm run prisma:seed
```

---

## Source Layout

```
src/
├── main.ts                      App bootstrap, CORS config
├── app.module.ts                Root NestJS module
├── app.controller.ts            GET / health check
├── prisma/
│   ├── prisma.module.ts         Global Prisma module
│   ├── prisma.service.ts        PrismaClient singleton
│   └── seed.ts                  DB seed script
└── modules/
    ├── auth/
    │   ├── auth.controller.ts   POST /auth/register, /auth/login
    │   ├── auth.service.ts      register(), login(), JWT signing
    │   └── auth.schema.ts       re-exports from @shipflow/shared
    ├── tax-invoice/
    │   ├── dto/                 All re-export from @shipflow/shared
    │   ├── tax-invoice.controller.ts
    │   └── tax-invoice.service.ts
    ├── delivery-challan/        (same structure)
    ├── domestic-proforma/       (same structure)
    ├── domestic-buyers/         (same structure)
    └── document-settings/       (same structure)
```

---

## Auto Document Numbering

When a document is created without an explicit number, the service queries `DocumentNumberSetting` for the document type, increments the counter atomically inside a Prisma `$transaction`, and formats it as `{prefix}{zero-padded-number}` (e.g. `INV00042`).

---

## CORS

The API allows cross-origin requests from `http://localhost:3000` and `http://localhost:4000` with credentials. Update `main.ts` for production origins.

---

## TypeScript Build

```bash
# One-shot production build (output to dist/)
pnpm run build

# Type-check only (no emit)
node_modules/.bin/tsc --project tsconfig.json --noEmit
```

`tsconfig.json` extends `packages/typescript-config/nestjs.json`. The path alias `@shipflow/shared` points to `packages/shared/dist/index.d.ts` (pre-compiled declarations) — which is why `packages/shared` must be built before the API.
