# Feature: Import Module

## Title

Import Module — International Supplier Management, Import Orders & Payments

## Description

The Import Module manages the import side of the business: tracking international suppliers, creating import purchase orders, managing import payments (with all stages: LC/TT/DP/DA), and handling import post-shipment documents. Mirrors the Export module in structure but for inbound shipments. Import Settings define series numbers (IMP/IPO/ICS).

---

## User Flow

```
1. Configure Import Settings
   Imports → Settings
   → Set series prefixes: IMP (Import PO), IPO (Import Proforma), ICS (Import Cost Sheet)
   → Save

2. Add International Supplier
   Imports → Suppliers → Add Supplier
   → Fill: Company, Contact, Country, Address, Bank SWIFT
   → Import-specific fields: Port of Loading, Lead Time, Supplier Rating (1–5 stars)
   → Payment terms, Trade terms (FOB/CIF/EXW)
   → Save

3. Create Import Purchase Order
   Imports → Import Orders → Create New
   → Select Supplier → auto-fills address, payment terms
   → Add items with quantities, prices, HSN codes
   → Set shipping terms, estimated arrival
   → Generate PDF → send to supplier

4. Track Import Payment
   Imports → Payments → All Stages filter
   → View: ALL / ADVANCE / LC_OPENED / DOCUMENTS_RECEIVED / PAYMENT_MADE
   → Add Payment: amount, stage, bank reference, SWIFT reference

5. Post-Shipment Documents
   Import order detail → Post-Shipment Docs tab
   → Upload: Bill of Lading, Commercial Invoice (from supplier), Packing List, COO, AWB
   → Track status: PENDING → RECEIVED → CLEARED
```

---

## Database Schema (Prisma)

```prisma
model ImportSettings {
  id              String    @id @default(uuid())
  organizationId  String    @unique
  impPrefix       String    @default("IMP")
  impStartNumber  Int       @default(1)
  ipoPrefix       String    @default("IPO")
  ipoStartNumber  Int       @default(1)
  icsPrefix       String    @default("ICS")
  icsStartNumber  Int       @default(1)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])
  @@map("import_settings")
}

model ImportSupplier {
  id                  String    @id @default(uuid())
  organizationId      String
  contactName         String
  companyName         String?
  email               String?
  phone               String?
  country             String?
  city                String?
  state               String?
  address             String?
  vatNumber           String?
  bankSwift           String?
  bankName            String?
  bankAccountNo       String?
  bankIBAN            String?
  bankAddress         String?

  // Import-specific
  defaultPortOfLoading    String?
  defaultPortOfDischarge  String?
  preferredCurrency       String    @default("USD")
  defaultPaymentTerms     String?
  defaultTradeTerms       String?   // FOB, CIF, EXW
  leadTimeDays            Int?
  supplierRating          Int?      // 1–5 (star rating)
  certifications          String[]  // ["ISO9001", "CE", "REACH"]
  productCategories       String[]  // ["Metal Parts", "Electronics"]
  notes                   String?
  isActive                Boolean   @default(true)
  createdAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt
  deletedAt               DateTime?

  organization    Organization    @relation(fields: [organizationId], references: [id])
  importOrders    ImportOrder[]

  @@index([organizationId])
  @@map("import_suppliers")
}

model ImportOrder {
  id              String      @id @default(uuid())
  organizationId  String
  orderNumber     String      @unique   // IMP-26-27-001
  status          ImportOrdStatus @default(DRAFT)
  supplierId      String?
  supplierName    String?
  supplierAddress String?
  orderDate       DateTime    @default(now())
  expectedDate    DateTime?
  actualArrivalDate DateTime?
  currency        String      @default("USD")
  subtotal        Decimal     @default(0) @db.Decimal(14, 2)
  freightCharges  Decimal?    @db.Decimal(12, 2)
  insuranceCharges Decimal?   @db.Decimal(12, 2)
  customsDuty     Decimal?    @db.Decimal(12, 2)
  totalAmount     Decimal     @default(0) @db.Decimal(14, 2)
  portOfLoading   String?
  portOfDischarge String?
  incoterms       String?     // FOB, CIF, EXW, DDP
  paymentTerms    String?
  shippingMode    String?     // SEA, AIR, ROAD
  trackingNumber  String?
  notes           String?
  fileUrl         String?
  sentAt          DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deletedAt       DateTime?

  organization    Organization    @relation(fields: [organizationId], references: [id])
  supplier        ImportSupplier? @relation(fields: [supplierId], references: [id])
  lineItems       ImportOrderItem[]
  payments        ImportPayment[]
  documents       ImportDocument[]

  @@index([organizationId])
  @@map("import_orders")
}

model ImportOrderItem {
  id              String  @id @default(uuid())
  importOrderId   String
  itemId          String?
  description     String
  hsnCode         String?
  orderedQty      Decimal @db.Decimal(10, 3)
  receivedQty     Decimal @default(0) @db.Decimal(10, 3)
  unit            String  @default("PCS")
  unitPrice       Decimal @db.Decimal(12, 2)
  amount          Decimal @db.Decimal(14, 2)
  sortOrder       Int     @default(0)

  importOrder     ImportOrder @relation(fields: [importOrderId], references: [id], onDelete: Cascade)
  item            Item?       @relation(fields: [itemId], references: [id])

  @@map("import_order_items")
}

model ImportPayment {
  id              String    @id @default(uuid())
  importOrderId   String
  paymentStage    ImportPaymentStage
  usdAmount       Decimal   @db.Decimal(14, 2)
  inrEquivalent   Decimal?  @db.Decimal(14, 2)
  exchangeRate    Decimal?  @db.Decimal(10, 4)
  bankCharges     Decimal?  @db.Decimal(12, 2)
  paymentDate     DateTime
  paymentMode     String?   // TT, LC, DP, DA
  bankReference   String?
  swiftReference  String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  importOrder     ImportOrder @relation(fields: [importOrderId], references: [id], onDelete: Cascade)

  @@index([importOrderId])
  @@map("import_payments")
}

model ImportDocument {
  id              String    @id @default(uuid())
  importOrderId   String
  docType         ImportDocType
  label           String
  status          ImportDocStatus @default(PENDING)
  fileUrl         String?
  refNumber       String?
  notes           String?
  receivedAt      DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  importOrder     ImportOrder @relation(fields: [importOrderId], references: [id], onDelete: Cascade)

  @@map("import_documents")
}

enum ImportOrdStatus {
  DRAFT
  SENT
  CONFIRMED
  IN_TRANSIT
  ARRIVED
  PARTIALLY_RECEIVED
  FULLY_RECEIVED
  CLOSED
  CANCELLED
}

enum ImportPaymentStage {
  ADVANCE
  LC_OPENED
  DOCUMENTS_RECEIVED
  PAYMENT_MADE
  PARTIAL_PAYMENT
  FINAL_PAYMENT
}

enum ImportDocType {
  SUPPLIER_INVOICE
  PACKING_LIST
  BILL_OF_LADING
  AIRWAY_BILL
  CERTIFICATE_OF_ORIGIN
  INSPECTION_CERTIFICATE
  CUSTOMS_DECLARATION
  OTHER
}

enum ImportDocStatus {
  PENDING
  RECEIVED
  VERIFIED
  CLEARED
}
```

---

## API Routes (NestJS)

```
# Import Settings
GET    /api/v1/imports/settings           → Get settings
PATCH  /api/v1/imports/settings           → Update settings

# Import Suppliers
GET    /api/v1/imports/suppliers
POST   /api/v1/imports/suppliers
GET    /api/v1/imports/suppliers/:id
PATCH  /api/v1/imports/suppliers/:id
DELETE /api/v1/imports/suppliers/:id

# Import Orders
GET    /api/v1/imports/orders                         → List (filter: status, supplier, date)
POST   /api/v1/imports/orders                         → Create
GET    /api/v1/imports/orders/:id                     → Detail (with items, payments, documents)
PATCH  /api/v1/imports/orders/:id                     → Update
DELETE /api/v1/imports/orders/:id                     → Soft delete
POST   /api/v1/imports/orders/:id/send                → Send to supplier
POST   /api/v1/imports/orders/:id/generate-pdf        → Generate PDF
PATCH  /api/v1/imports/orders/:id/status              → Update status

# Import Payments
GET    /api/v1/imports/payments                       → All payments (filter: stage, mode, date)
GET    /api/v1/imports/orders/:id/payments            → Payments for an order
POST   /api/v1/imports/orders/:id/payments            → Add payment
PATCH  /api/v1/imports/orders/:id/payments/:pid       → Update payment
DELETE /api/v1/imports/orders/:id/payments/:pid       → Delete payment

# Import Documents
GET    /api/v1/imports/orders/:id/documents           → Document checklist
PATCH  /api/v1/imports/orders/:id/documents/:docId    → Update doc status / ref
POST   /api/v1/imports/orders/:id/documents/:docId/upload → Upload file → S3
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/imports.ts

export const importSupplierSchema = z.object({
  contactName: z.string().min(1).max(100),
  companyName: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  country: z.string().min(1, 'Country required'),
  city: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  bankSwift: z.string().max(11).optional(),
  bankName: z.string().max(200).optional(),
  defaultPortOfLoading: z.string().max(100).optional(),
  preferredCurrency: z.enum(['USD', 'EUR', 'GBP', 'AED', 'CNY', 'JPY']).default('USD'),
  defaultTradeTerms: z.enum(['FOB', 'CIF', 'EXW', 'DDP', 'CFR']).optional(),
  leadTimeDays: z.number().int().min(1).optional(),
  supplierRating: z.number().int().min(1).max(5).optional(),
  certifications: z.array(z.string()).optional(),
  notes: z.string().max(1000).optional(),
});

export const importPaymentSchema = z.object({
  paymentStage: z.enum([
    'ADVANCE',
    'LC_OPENED',
    'DOCUMENTS_RECEIVED',
    'PAYMENT_MADE',
    'PARTIAL_PAYMENT',
    'FINAL_PAYMENT',
  ]),
  usdAmount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0),
  inrEquivalent: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  exchangeRate: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  bankCharges: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  paymentDate: z.string().min(1),
  paymentMode: z.enum(['TT', 'LC', 'DP', 'DA']).optional(),
  bankReference: z.string().max(100).optional(),
  swiftReference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});
```

---

## LLM Development Prompt

```
Build the Import Module for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/imports/:

1. ImportsModule with sub-modules: settings, suppliers, orders, payments

2. Import Order number: IMP-YY-YY-SEQ (from ImportSettings.impPrefix)
   On save: subtotal = sum(lineItems), totalAmount = subtotal + freight + insurance + customsDuty

3. Payment tracking:
   - 6 stages: ADVANCE / LC_OPENED / DOCUMENTS_RECEIVED / PAYMENT_MADE / PARTIAL / FINAL
   - Aggregate: totalPaid = sum(payments); balanceDue = totalAmount - totalPaid
   - GET /imports/payments: join all orders with their payments, support filters

4. Document checklist:
   - Auto-create on order confirm: 7 ImportDocument rows (SUPPLIER_INVOICE, PACKING_LIST, etc.)
   - Upload endpoint: S3 upload → update fileUrl, status = RECEIVED
   - When all docs received: update order status

5. Supplier rating: stored as Int 1–5, no complex aggregation needed

6. PDF generation: Puppeteer + Handlebars template for import PO
   - Shows org as buyer, supplier as seller
   - Import-specific fields: port of loading, expected arrival

FRONTEND — apps/web/app/(dashboard)/imports/:

1. /settings/page.tsx: 3 series config forms

2. /suppliers/page.tsx:
   - Table with star rating display, country flag, certifications badges
   - Supplier form: tabbed — Contact | Bank Details | Trade Terms | Certifications

3. /orders/page.tsx: master-detail layout
   - Status timeline: DRAFT → SENT → CONFIRMED → IN_TRANSIT → ARRIVED → RECEIVED
   - Form: supplier, items, shipping terms, expected date
   - Tabs: Details | Payments | Documents

4. Payments page (/imports/payments/):
   - Filter bar: All Stages / ADVANCE / LC_OPENED / DOCUMENTS_RECEIVED / PAYMENT_MADE
   - Payment Mode filter: All / TT / LC / DP / DA
   - Table: Order No. | Supplier | Stage | USD Amount | INR | Exchange Rate | Date | Mode
   - "Add Payment" opens dialog with importPaymentSchema

5. Post-shipment docs (within order detail):
   - 7-document checklist (similar to export PSP)
   - Upload for each doc type
   - Status: PENDING → RECEIVED → VERIFIED → CLEARED

Use TanStack Query. Invalidate ["import-orders", orgId] and ["import-payments"] on mutations.
```
