# Feature: Export Items Catalog

## Title

Export Items Catalog — Product Register for Export Business

## Description

The Items Catalog is the master product register for the export business. Items defined here are reused across Proforma Invoices, Commercial Invoices, Packing Lists, and Inventory. Supports AI-powered image analysis to auto-fill product details, bulk Excel/CSV import, and per-item image management.

---

## User Flow

```
1. Add Item (manual)
   Exports → Items Catalog → + Add Item
   → Fill: Name, Category, Price, Weight, HSN code, Barcode
   → Save → Item code auto-generated (e.g., GTS-0001)

2. Add Item (AI)
   Dashboard → AI Item Analysis
   → Upload product image → AI extracts: name, category, description, weight
   → Review/edit fields → Save

3. Bulk Import
   Items Catalog → Import Excel
   → Download template → Fill → Upload .xlsx/.csv
   → Preview validation errors → Confirm import

4. Edit / Deactivate
   Items Catalog → row actions → Edit icon
   → Edit form → Save
   → Toggle Active/Inactive

5. Use in Document
   When creating PI/CI/Packing List → line item dropdown → search & select item
   → Auto-fills: description, HSN, unit price, weight, dimensions
```

---

## Database Schema (Prisma)

```prisma
model Item {
  id              String   @id @default(uuid())
  organizationId  String
  itemCode        String   @unique  // e.g., GTS-0001 (auto-generated)
  name            String
  description     String?
  category        String?            // e.g., Metal Handicrafts & Home Décor
  hsnCode         String?
  sku             String?
  unit            String   @default("PCS")  // PCS, KGS, MTR, SET, etc.
  unitPrice       Decimal? @db.Decimal(12, 2)
  currency        String   @default("USD")
  grossWeight     Decimal? @db.Decimal(10, 3)  // KGS
  netWeight       Decimal? @db.Decimal(10, 3)
  length          Decimal? @db.Decimal(10, 2)  // CM
  width           Decimal? @db.Decimal(10, 2)  // CM
  height          Decimal? @db.Decimal(10, 2)  // CM
  countryOfOrigin String?  @default("India")
  imageUrl        String?
  barcode         String?
  barcodeStatus   BarcodeStatus @default(PENDING)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  organization    Organization @relation(fields: [organizationId], references: [id])
  exportDocItems  ExportDocumentItem[]
  inventoryItems  InventoryItem[]

  @@index([organizationId])
  @@index([itemCode])
  @@map("items")
}

enum BarcodeStatus {
  PENDING
  GENERATED
  ASSIGNED
}
```

---

## API Routes (NestJS)

```
GET    /api/v1/items                        → List items (paginated, filterable)
POST   /api/v1/items                        → Create item
GET    /api/v1/items/:id                    → Item detail
PATCH  /api/v1/items/:id                    → Update item
DELETE /api/v1/items/:id                    → Soft delete
PATCH  /api/v1/items/:id/status             → Toggle active/inactive

POST   /api/v1/items/bulk-import            → Import from Excel/CSV
GET    /api/v1/items/bulk-import/template   → Download import template

POST   /api/v1/items/:id/image              → Upload product image → S3
POST   /api/v1/items/ai-analyze             → AI auto-fill from image
```

**Query params for GET /items:**

- `search` — name, code, description
- `category` — filter by category
- `status` — active | inactive | all
- `page`, `limit`, `sortBy`, `sortOrder`

---

## UI Screens / Components

| Screen        | Route                     | Components                                                                               |
| ------------- | ------------------------- | ---------------------------------------------------------------------------------------- |
| Items list    | `Exports → Items Catalog` | `<ItemsTable>` with image, code, name, category, price, weight, status, barcode, actions |
| Add/Edit item | Sheet/Dialog              | `<ItemForm>`                                                                             |
| Bulk import   | Modal                     | `<BulkImportDialog>` with template download + file upload                                |
| AI Analyze    | Modal                     | `<AIAnalyzeDialog>` image upload + extracted fields review                               |

**Table toolbar:** Import Excel, Bulk Images, Fix Images, Order Qty Analyzer, Delete Selected, Export, + Add Item

**Table columns:** Image, Item Code, Name, Category, Price, Weight, Status (toggle), Barcode, Actions (view, edit, copy, delete)

**View modes:** List (table), Grid (card), Compact, Wide — 4 view toggle icons

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/item.ts

const unitOptions = ['PCS', 'KGS', 'MTR', 'SET', 'DZ', 'BOX', 'PAIR', 'LTR'] as const;

export const itemSchema = z
  .object({
    name: z.string().min(1, 'Item name required').max(300),
    description: z.string().max(1000).optional(),
    category: z.string().max(100).optional(),
    hsnCode: z
      .string()
      .regex(/^[0-9]{4,8}$/, 'HSN code must be 4–8 digits')
      .optional()
      .or(z.literal('')),
    sku: z.string().max(50).optional(),
    unit: z.enum(unitOptions).default('PCS'),
    unitPrice: z
      .string()
      .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be a valid price')
      .optional(),
    currency: z.enum(['USD', 'EUR', 'GBP', 'AED', 'INR']).default('USD'),
    grossWeight: z
      .string()
      .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), 'Must be a valid weight')
      .optional(),
    netWeight: z
      .string()
      .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), 'Must be a valid weight')
      .optional(),
    length: z
      .string()
      .refine((v) => !v || !isNaN(Number(v)), 'Must be a number')
      .optional(),
    width: z
      .string()
      .refine((v) => !v || !isNaN(Number(v)), 'Must be a number')
      .optional(),
    height: z
      .string()
      .refine((v) => !v || !isNaN(Number(v)), 'Must be a number')
      .optional(),
    countryOfOrigin: z.string().default('India'),
    barcode: z.string().max(50).optional(),
  })
  .refine((d) => !d.grossWeight || !d.netWeight || Number(d.netWeight) <= Number(d.grossWeight), {
    message: 'Net weight cannot exceed gross weight',
    path: ['netWeight'],
  });

export const bulkImportSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= 5 * 1024 * 1024, 'Max 5MB')
    .refine(
      (f) =>
        ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'].includes(
          f.type,
        ),
      'XLSX or CSV only',
    ),
});
```

---

## Item Code Auto-Generation Logic

```ts
// Server-side on item create
async function generateItemCode(orgId: string): Promise<string> {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const prefix = org.itemCodePrefix || slugify(org.name).slice(0, 3).toUpperCase();
  const digits = org.itemCodeDigits || 4;

  const lastItem = await prisma.item.findFirst({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  });

  const seq = lastItem ? parseInt(lastItem.itemCode.replace(prefix + '-', '')) + 1 : 1;

  return `${prefix}-${String(seq).padStart(digits, '0')}`;
}
```

---

## LLM Development Prompt

```
Build the Export Items Catalog feature for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/items/:

1. ItemsModule: ItemsController, ItemsService, Prisma queries
2. Auto-generate item code on create: use org's itemCodePrefix + itemCodeDigits, find last item code for this org, increment
3. Soft delete: never hard delete; filter deletedAt IS NULL in all queries
4. Image upload: POST /items/:id/image → multipart → upload to S3 → save URL
5. Bulk import:
   - GET /items/bulk-import/template → return XLSX template with correct columns
   - POST /items/bulk-import → parse XLSX/CSV using exceljs or papaparse → validate each row → upsert by itemCode → return { success: n, errors: [{ row, message }] }
6. AI analyze endpoint:
   - POST /items/ai-analyze → accept image file → call Python FastAPI /analyze-product with image
   - Python service returns: { name, category, description, estimatedWeight, suggestedHsnCode }
   - Return suggestions to frontend for user review
7. All list endpoints: support pagination (page, limit), search, category filter, status filter

FRONTEND — apps/web/app/(dashboard)/exports/items/:

1. page.tsx: TanStack Table with useItems() query hook
   - Columns: Image, Code, Name, Category, Price, Weight, Status toggle (PATCH /items/:id/status), Barcode badge, Actions menu
   - Toolbar: Search input, Category filter dropdown, View mode switcher (4 modes), Import Excel, + Add Item
   - Infinite scroll or pagination
2. ItemForm (shadcn Sheet, open from "Add Item" or row edit):
   - React Hook Form + itemSchema
   - Image upload section: shows current image, drag-and-drop replacement
   - Currency + price side by side
   - Dimensions (L×W×H cm) in a 3-column grid with CBM preview: L×W×H/1000000
3. BulkImportDialog:
   - Step 1: Download template button
   - Step 2: File upload with dropzone
   - Step 3: Preview table of parsed rows + validation errors highlighted in red
   - Step 4: Confirm → POST → show results toast
4. AIAnalyzeDialog:
   - Image upload (drag & drop)
   - On upload: call POST /items/ai-analyze → show spinning skeleton
   - Review extracted fields in form → user can edit → Save Item

Use TanStack Query for all data fetching. Invalidate ["items", orgId] cache on mutations.
```
