# Feature: Production Purchase Orders & Job Work

## Title

Production Purchase Orders & Job Work Orders

## Description

Production Purchase Orders track procurement of raw materials or finished goods from suppliers for production. Job Work Orders are outsourced manufacturing tasks sent to external contractors (job workers). Both link to production items and raw materials. Supports status tracking (PENDING → IN_PROGRESS → COMPLETED) and PDF generation.

---

## User Flow

```
1. Create Production Purchase Order
   Production → Purchase Orders → Create New
   → Auto-assigns PO number (e.g., PO-26-27-001)
   → Select Supplier → auto-fills address, payment terms
   → Add line items: raw materials or items from production register
   → Set delivery date, payment terms
   → Save or Send to Supplier

2. Receive Against PO
   PO detail → "Receive Goods" → enter received quantities
   → Inventory updated automatically
   → PO status: PARTIALLY_RECEIVED or FULLY_RECEIVED

3. Create Job Work Order
   Production → Job Work → Create New
   → Auto-assigns JW number (e.g., JW-26-27-001)
   → Select Job Worker (from contacts / suppliers)
   → Define work: description, items to be processed
   → Specify materials sent out to job worker
   → Set expected completion date
   → Save or Send

4. Complete Job Work
   JW detail → "Mark as Complete" → enter received quantities
   → Update stock with finished goods received from job worker
```

---

## Database Schema (Prisma)

```prisma
model ProductionPurchaseOrder {
  id              String    @id @default(uuid())
  organizationId  String
  poNumber        String    @unique   // PO-26-27-001
  status          POStatus  @default(DRAFT)
  supplierId      String?
  supplierName    String?
  supplierAddress String?
  orderDate       DateTime  @default(now())
  expectedDate    DateTime?
  currency        String    @default("INR")
  subtotal        Decimal   @default(0) @db.Decimal(14, 2)
  gstAmount       Decimal   @default(0) @db.Decimal(12, 2)
  totalAmount     Decimal   @default(0) @db.Decimal(14, 2)
  paymentTerms    String?
  deliveryAddress String?
  notes           String?
  fileUrl         String?
  sentAt          DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  organization    Organization   @relation(fields: [organizationId], references: [id])
  lineItems       POLineItem[]

  @@index([organizationId])
  @@map("production_purchase_orders")
}

model POLineItem {
  id              String  @id @default(uuid())
  poId            String
  rawMaterialId   String?
  productionItemId String?
  description     String
  hsnCode         String?
  orderedQty      Decimal @db.Decimal(10, 3)
  receivedQty     Decimal @default(0) @db.Decimal(10, 3)
  unit            String  @default("KGS")
  unitPrice       Decimal @db.Decimal(12, 2)
  gstRate         Decimal @default(0) @db.Decimal(5, 2)
  amount          Decimal @db.Decimal(14, 2)
  sortOrder       Int     @default(0)

  purchaseOrder   ProductionPurchaseOrder @relation(fields: [poId], references: [id], onDelete: Cascade)
  rawMaterial     RawMaterial?            @relation(fields: [rawMaterialId], references: [id])

  @@map("po_line_items")
}

model JobWorkOrder {
  id              String    @id @default(uuid())
  organizationId  String
  jwNumber        String    @unique   // JW-26-27-001
  status          JWStatus  @default(DRAFT)
  jobWorkerId     String?
  jobWorkerName   String?
  jobWorkerAddress String?
  orderDate       DateTime  @default(now())
  expectedDate    DateTime?
  completedDate   DateTime?
  workDescription String?   @db.Text
  currency        String    @default("INR")
  labourCharges   Decimal   @default(0) @db.Decimal(12, 2)
  notes           String?
  fileUrl         String?
  sentAt          DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  organization    Organization   @relation(fields: [organizationId], references: [id])
  materials       JWMaterial[]
  outputItems     JWOutputItem[]

  @@index([organizationId])
  @@map("job_work_orders")
}

model JWMaterial {
  id              String  @id @default(uuid())
  jwId            String
  rawMaterialId   String?
  description     String
  sentQty         Decimal @db.Decimal(10, 3)
  receivedQty     Decimal @default(0) @db.Decimal(10, 3)
  unit            String  @default("KGS")
  sortOrder       Int     @default(0)

  jobWorkOrder    JobWorkOrder @relation(fields: [jwId], references: [id], onDelete: Cascade)
  rawMaterial     RawMaterial? @relation(fields: [rawMaterialId], references: [id])

  @@map("jw_materials")
}

model JWOutputItem {
  id              String  @id @default(uuid())
  jwId            String
  productionItemId String?
  description     String
  expectedQty     Decimal @db.Decimal(10, 3)
  receivedQty     Decimal @default(0) @db.Decimal(10, 3)
  unit            String  @default("PCS")
  sortOrder       Int     @default(0)

  jobWorkOrder    JobWorkOrder   @relation(fields: [jwId], references: [id], onDelete: Cascade)
  productionItem  ProductionItem? @relation(fields: [productionItemId], references: [id])

  @@map("jw_output_items")
}

enum POStatus {
  DRAFT
  SENT
  PARTIALLY_RECEIVED
  FULLY_RECEIVED
  CANCELLED
}

enum JWStatus {
  DRAFT
  SENT
  IN_PROGRESS
  PARTIALLY_RECEIVED
  COMPLETED
  CANCELLED
}
```

---

## API Routes (NestJS)

```
# Production Purchase Orders
GET    /api/v1/production/purchase-orders              → List (filter: status, supplier, date)
POST   /api/v1/production/purchase-orders              → Create
GET    /api/v1/production/purchase-orders/:id          → Detail (with line items)
PATCH  /api/v1/production/purchase-orders/:id          → Update
DELETE /api/v1/production/purchase-orders/:id          → Soft delete
POST   /api/v1/production/purchase-orders/:id/send     → Send to supplier
POST   /api/v1/production/purchase-orders/:id/receive  → Record goods received
POST   /api/v1/production/purchase-orders/:id/generate-pdf → Generate PDF

# Job Work Orders
GET    /api/v1/production/job-work                     → List (filter: status, job worker)
POST   /api/v1/production/job-work                     → Create
GET    /api/v1/production/job-work/:id                 → Detail
PATCH  /api/v1/production/job-work/:id                 → Update
DELETE /api/v1/production/job-work/:id                 → Soft delete
POST   /api/v1/production/job-work/:id/send            → Send to job worker
POST   /api/v1/production/job-work/:id/complete        → Mark as complete + record received
POST   /api/v1/production/job-work/:id/generate-pdf    → Generate PDF
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/production-orders.ts

export const poLineItemSchema = z.object({
  rawMaterialId: z.string().uuid().optional(),
  productionItemId: z.string().uuid().optional(),
  description: z.string().min(1).max(500),
  hsnCode: z
    .string()
    .regex(/^[0-9]{4,8}$/)
    .optional()
    .or(z.literal('')),
  orderedQty: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0),
  unit: z.string().default('KGS'),
  unitPrice: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0),
  gstRate: z.enum(['0', '5', '12', '18', '28']).transform(Number).default('18'),
});

export const productionPOSchema = z.object({
  supplierId: z.string().uuid().optional(),
  supplierName: z.string().min(1, 'Supplier required').max(200),
  orderDate: z.string().min(1),
  expectedDate: z.string().optional(),
  currency: z.enum(['INR', 'USD', 'EUR']).default('INR'),
  paymentTerms: z.string().max(200).optional(),
  lineItems: z.array(poLineItemSchema).min(1, 'Add at least one item'),
  notes: z.string().max(1000).optional(),
});

export const jobWorkOrderSchema = z.object({
  jobWorkerName: z.string().min(1).max(200),
  orderDate: z.string().min(1),
  expectedDate: z.string().optional(),
  workDescription: z.string().max(2000).optional(),
  materials: z.array(
    z.object({
      rawMaterialId: z.string().uuid().optional(),
      description: z.string().min(1).max(500),
      sentQty: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0),
      unit: z.string().default('KGS'),
    }),
  ),
  outputItems: z
    .array(
      z.object({
        productionItemId: z.string().uuid().optional(),
        description: z.string().min(1).max(500),
        expectedQty: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0),
        unit: z.string().default('PCS'),
      }),
    )
    .min(1),
  labourCharges: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  notes: z.string().max(1000).optional(),
});
```

---

## LLM Development Prompt

```
Build Production Purchase Orders and Job Work Orders for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/production/:

1. ProductionPurchaseOrdersService:
   - PO number: PO-YY-YY-SEQ (FY-aware, from ProductionSettings.poPrefix)
   - On save: subtotal = sum(qty × price), gstAmount = sum(qty × price × gstRate/100), totalAmount = subtotal + gstAmount
   - Receive goods endpoint: POST /purchase-orders/:id/receive
     Body: { lineItems: [{ lineItemId, receivedQty }] }
     → Update POLineItem.receivedQty
     → If all orderedQty === receivedQty: status = FULLY_RECEIVED
     → If partial: status = PARTIALLY_RECEIVED
     → Create RMInventoryMovement records (type: PURCHASE_RECEIPT) for each raw material line item
   - Send email: generate PDF attachment, send via SMTP

2. JobWorkOrdersService:
   - JW number: JW-YY-YY-SEQ (FY-aware, from ProductionSettings.jwPrefix)
   - Complete endpoint: POST /job-work/:id/complete
     Body: { receivedItems: [{ outputItemId, receivedQty }], completedDate }
     → Update JWOutputItem.receivedQty
     → Create inventory movement: PRODUCTION_RECEIPT for each output item (add to finished goods)
     → Create RM movement: JOB_WORK_DISPATCH for materials sent out (deduct from RM stock)
     → Set status to COMPLETED

FRONTEND:

1. Purchase Orders page (production/purchase-orders/):
   - Table: PO No., Supplier, Date, Expected, Total, Status (DRAFT/SENT/PARTIAL/RECEIVED)
   - "Create New" button → `<ProductionPOForm>` in Sheet
   - Form: Supplier select (from contacts), order date, expected date
   - Line items: raw material search typeahead, qty, unit, price, GST rate
   - Totals: Subtotal, GST, Grand Total (INR)
   - "Receive Goods" button on SENT orders → opens dialog with actual received quantities per line

2. Job Work Orders page (production/job-work/):
   - Table: JW No., Job Worker, Description, Expected Date, Status
   - Form: Two sections — Materials Sent Out + Expected Output Items
   - Materials sent: raw material search, qty, unit
   - Output items: production item search, expected qty, unit
   - Labour charges field
   - "Mark Complete" button → dialog showing received vs expected per item

Use TanStack Query. Invalidate ["production-purchase-orders", orgId] and ["raw-materials-stock"] on receive mutations.
```
