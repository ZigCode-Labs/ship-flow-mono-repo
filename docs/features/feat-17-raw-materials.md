# Feature: Raw Materials

## Title

Raw Materials — Register, Inventory & Purchase Management

## Description

Manages the raw material (RM) side of production: a master register of all raw materials with purchase defaults, current stock levels, and reorder alerts. RM Inventory tracks all 8 movement types (purchase, issue, return, adjustment, etc.). RM Purchases tracks purchase bills from suppliers. Integrates with Production POs and Job Work Orders for automatic stock updates.

---

## User Flow

```
1. Add Raw Material
   Production → Raw Materials → Register → Add Raw Material
   → Fill: Name, Category, Unit, Current Stock, Min Reorder Qty
   → Set Purchase Defaults: Supplier, Unit Price
   → Save → RM Code auto-generated (e.g., RM-0001)

2. Record Stock Movement
   Production → Raw Materials → Inventory → Add Movement
   → Select RM, Movement Type, Qty, Reference
   → Types: PURCHASE, ISSUE_TO_PRODUCTION, RETURN_FROM_PRODUCTION,
             JOB_WORK_DISPATCH, JOB_WORK_RETURN, ADJUSTMENT, OPENING_STOCK, WRITE_OFF
   → Current Stock auto-updated after movement

3. RM Purchases
   Production → Raw Materials → Purchases → Add Purchase
   → Link to Production PO (optional)
   → Fill: Supplier, Invoice No., Date, Items, GST, Total
   → Save → Inventory auto-updated with PURCHASE movement

4. Stock Alerts
   Dashboard / RM Register → items with stock < minReorderQty shown in red
   → "Create PO" quick action from alert
```

---

## Database Schema (Prisma)

```prisma
model RawMaterial {
  id                  String    @id @default(uuid())
  organizationId      String
  rmCode              String    @unique   // RM-0001
  name                String
  description         String?
  category            String?
  unit                String    @default("KGS")
  currentStock        Decimal   @default(0) @db.Decimal(12, 3)
  minReorderQty       Decimal?  @db.Decimal(10, 3)
  reorderPoint        Decimal?  @db.Decimal(10, 3)  // Alert threshold

  // Purchase defaults
  defaultSupplierId   String?
  defaultSupplierName String?
  defaultUnitPrice    Decimal?  @db.Decimal(12, 2)
  defaultCurrency     String    @default("INR")
  leadTimeDays        Int?

  hsnCode             String?
  imageUrl            String?
  isActive            Boolean   @default(true)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  organization        Organization       @relation(fields: [organizationId], references: [id])
  bomComponents       BOMComponent[]
  inventoryMovements  RMInventoryMovement[]
  purchaseLineItems   RMPurchaseLineItem[]
  jobWorkMaterials    JWMaterial[]
  poLineItems         POLineItem[]

  @@index([organizationId])
  @@map("raw_materials")
}

model RMInventoryMovement {
  id              String      @id @default(uuid())
  organizationId  String
  rawMaterialId   String
  movementType    RMMovementType
  quantity        Decimal     @db.Decimal(10, 3)
  direction       String      // IN or OUT
  stockBefore     Decimal     @db.Decimal(12, 3)
  stockAfter      Decimal     @db.Decimal(12, 3)
  referenceType   String?     // PO, JW, PRODUCTION_ORDER, MANUAL
  referenceId     String?     // ID of linked document
  referenceNumber String?     // PO number, JW number etc.
  unitCost        Decimal?    @db.Decimal(12, 2)
  totalCost       Decimal?    @db.Decimal(14, 2)
  notes           String?
  movementDate    DateTime    @default(now())
  createdAt       DateTime    @default(now())

  organization    Organization @relation(fields: [organizationId], references: [id])
  rawMaterial     RawMaterial  @relation(fields: [rawMaterialId], references: [id])

  @@index([organizationId])
  @@index([rawMaterialId])
  @@map("rm_inventory_movements")
}

model RMPurchase {
  id              String    @id @default(uuid())
  organizationId  String
  purchaseNumber  String    @unique  // RMPO-26-27-001
  status          RMPOStatus @default(DRAFT)
  supplierId      String?
  supplierName    String?
  supplierAddress String?
  invoiceNumber   String?
  purchaseDate    DateTime  @default(now())
  currency        String    @default("INR")
  subtotal        Decimal   @default(0) @db.Decimal(14, 2)
  gstAmount       Decimal   @default(0) @db.Decimal(12, 2)
  totalAmount     Decimal   @default(0) @db.Decimal(14, 2)
  linkedPoId      String?   // Link to Production PO if applicable
  notes           String?
  fileUrl         String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  organization    Organization      @relation(fields: [organizationId], references: [id])
  lineItems       RMPurchaseLineItem[]

  @@index([organizationId])
  @@map("rm_purchases")
}

model RMPurchaseLineItem {
  id            String  @id @default(uuid())
  purchaseId    String
  rawMaterialId String?
  description   String
  hsnCode       String?
  quantity      Decimal @db.Decimal(10, 3)
  unit          String  @default("KGS")
  unitPrice     Decimal @db.Decimal(12, 2)
  gstRate       Decimal @default(0) @db.Decimal(5, 2)
  amount        Decimal @db.Decimal(14, 2)
  sortOrder     Int     @default(0)

  purchase      RMPurchase   @relation(fields: [purchaseId], references: [id], onDelete: Cascade)
  rawMaterial   RawMaterial? @relation(fields: [rawMaterialId], references: [id])

  @@map("rm_purchase_line_items")
}

enum RMMovementType {
  PURCHASE
  ISSUE_TO_PRODUCTION
  RETURN_FROM_PRODUCTION
  JOB_WORK_DISPATCH
  JOB_WORK_RETURN
  ADJUSTMENT
  OPENING_STOCK
  WRITE_OFF
}

enum RMPOStatus {
  DRAFT
  CONFIRMED
  RECEIVED
  CANCELLED
}
```

---

## Stock Update Logic

```ts
// Called whenever a movement is created
async function recordMovement(
  rmId: string,
  type: RMMovementType,
  qty: number,
  direction: 'IN' | 'OUT',
  referenceId?: string,
  unitCost?: number,
) {
  const rm = await prisma.rawMaterial.findUnique({ where: { id: rmId } });
  const stockBefore = rm.currentStock;
  const stockAfter = direction === 'IN' ? stockBefore + qty : stockBefore - qty;

  await prisma.$transaction([
    prisma.rMInventoryMovement.create({
      data: {
        rawMaterialId: rmId,
        movementType: type,
        quantity: qty,
        direction,
        stockBefore,
        stockAfter,
        referenceId,
        unitCost,
        totalCost: unitCost ? qty * unitCost : null,
      },
    }),
    prisma.rawMaterial.update({
      where: { id: rmId },
      data: { currentStock: stockAfter },
    }),
  ]);
}
```

---

## API Routes (NestJS)

```
# Raw Material Register
GET    /api/v1/production/raw-materials                   → List (search, category, alert filter)
POST   /api/v1/production/raw-materials                   → Create
GET    /api/v1/production/raw-materials/:id               → Detail + stock summary
PATCH  /api/v1/production/raw-materials/:id               → Update
DELETE /api/v1/production/raw-materials/:id               → Soft delete
GET    /api/v1/production/raw-materials/low-stock         → Items below reorder point

# RM Inventory Movements
GET    /api/v1/production/raw-materials/:id/movements     → Movement history for RM
POST   /api/v1/production/raw-materials/:id/movements     → Manual movement (adjustment/write-off)
GET    /api/v1/production/inventory/movements             → All movements (filter: type, date, RM)

# RM Purchases
GET    /api/v1/production/rm-purchases                    → List
POST   /api/v1/production/rm-purchases                    → Create (auto-creates movements)
GET    /api/v1/production/rm-purchases/:id                → Detail
PATCH  /api/v1/production/rm-purchases/:id                → Update
DELETE /api/v1/production/rm-purchases/:id                → Soft delete
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/raw-materials.ts

export const rawMaterialSchema = z.object({
  name: z.string().min(1).max(300),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  unit: z.enum(['KGS', 'MTR', 'LTR', 'PCS', 'SQM', 'NOS']).default('KGS'),
  currentStock: z
    .string()
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0)
    .default('0'),
  minReorderQty: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  reorderPoint: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  defaultSupplierName: z.string().max(200).optional(),
  defaultUnitPrice: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  hsnCode: z
    .string()
    .regex(/^[0-9]{4,8}$/)
    .optional()
    .or(z.literal('')),
});

export const rmMovementSchema = z.object({
  rawMaterialId: z.string().uuid('RM required'),
  movementType: z.enum([
    'PURCHASE',
    'ISSUE_TO_PRODUCTION',
    'RETURN_FROM_PRODUCTION',
    'JOB_WORK_DISPATCH',
    'JOB_WORK_RETURN',
    'ADJUSTMENT',
    'OPENING_STOCK',
    'WRITE_OFF',
  ]),
  quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0),
  direction: z.enum(['IN', 'OUT']),
  unitCost: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  notes: z.string().max(500).optional(),
  movementDate: z.string().min(1),
});
```

---

## LLM Development Prompt

```
Build the Raw Materials module for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/production/raw-materials/:

1. RawMaterialsService:
   - RM code: use ProductionSettings.rmPrefix + 4-digit seq per org (RM-0001)
   - recordMovement() private method: atomic transaction updating movement table + currentStock
   - Triggered by: manual movement, PO receipt, RM Purchase confirm, JW send/return

2. RMPurchasesService:
   - RMPO number: from ProductionSettings.rmpoPrefix + FY-aware seq
   - On confirm (status = CONFIRMED): for each line item with rawMaterialId
     → call recordMovement(rmId, PURCHASE, qty, IN, referenceId=purchaseId, unitCost)
   - Calculate totals: subtotal, gstAmount, totalAmount

3. Low stock endpoint: GET /raw-materials/low-stock
   → Return RMs where currentStock <= reorderPoint
   → Include percentOf: (currentStock / reorderPoint) * 100

4. Movement history: GET /raw-materials/:id/movements
   → Paginated, ordered by movementDate DESC
   → Include running balance per movement (use stockAfter for this)

FRONTEND:

1. Raw Materials Register page (production/raw-materials/):
   - Table: Code, Name, Category, Unit, Current Stock, Min Reorder, Status
   - Status: green (OK), yellow (Low), red (Critical: stock < 50% of reorder)
   - Filter: "Low Stock Only" toggle
   - "Add RM" → `<RawMaterialForm>` Sheet

2. RawMaterialForm:
   - Basic: Name, Category, Unit, HSN, Description
   - Stock section: Current Stock (number), Min Reorder Qty, Reorder Point
   - Purchase Defaults: Default Supplier (dropdown from contacts), Unit Price, Lead Time Days

3. RM Inventory page (production/inventory/):
   - Tabs: All Movements | By Raw Material
   - Filter: Movement Type, Date Range, RM
   - Table: Date | RM | Type | Qty (IN/OUT) | Stock Before | Stock After | Cost | Reference
   - "Add Manual Movement" → dialog with rmMovementSchema

4. RM Purchases page (production/rm-purchases/):
   - Table with invoice number, supplier, date, total, status
   - Form: same structure as Production PO but for RM purchases specifically
   - On "Confirm Receipt" → auto-creates PURCHASE movements for all RM line items

5. Low Stock Alert Banner: shown at top of production pages when any RM is below reorder point
   Expandable list with "Create PO" quick action

Use TanStack Query. Invalidate ["raw-materials", orgId] and stock levels on movement mutations.
```
