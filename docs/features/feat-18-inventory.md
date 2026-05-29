# Feature: Inventory Module

## Title

Inventory — Stock Dashboard, Register, Receipts, Issues, Adjustments & Locations

## Description

The Inventory Module manages finished goods stock across multiple warehouse locations. Provides 7 tabs: Stock Dashboard (KPI overview), Stock Register (current stock per item), Receipts (stock received), Receive Stock (manual receipt), Issue Stock (dispatch to orders/production), Adjust Stock (corrections), and Locations (warehouse setup). All movements create an audit trail.

---

## User Flow

```
1. Setup Locations
   Inventory → Locations → Add Location
   → Name: "Main Warehouse", "Showroom", "Export Godown"
   → Save

2. Receive Stock
   Inventory → Receive Stock → New Receipt
   → Select Item → Enter Qty, Location, Cost
   → Movement type: PURCHASE / PRODUCTION / TRANSFER
   → Save → Stock updated

3. Issue Stock
   Inventory → Issue Stock → New Issue
   → Select Item (shows available stock per location)
   → Enter Qty, Location, Channel (Export Order / Domestic / Sample)
   → Reason: ORDER_FULFILLMENT / SAMPLE / TRANSFER
   → Save → Stock deducted

4. Adjust Stock
   Inventory → Adjust Stock → New Adjustment
   → Select Item and Location
   → Direction: INCREASE or DECREASE
   → Reason: DAMAGED / FOUND / CORRECTION / WRITE_OFF
   → Enter Qty and Notes
   → Save

5. View Stock Register
   Inventory → Stock Register
   → Table: Item | Location | Current Qty | Reserved | Available | Unit Cost
   → Filter by location, category

6. Stock Dashboard
   Inventory → Dashboard
   → KPI: Total SKUs, Total Stock Value, Low Stock Items, Out of Stock
   → Movement chart (last 30 days)
```

---

## Database Schema (Prisma)

```prisma
model StockLocation {
  id              String    @id @default(uuid())
  organizationId  String
  name            String
  description     String?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  organization    Organization   @relation(fields: [organizationId], references: [id])
  stockLedgers    StockLedger[]
  movements       InventoryMovement[]

  @@unique([organizationId, name])
  @@map("stock_locations")
}

model StockLedger {
  id              String    @id @default(uuid())
  organizationId  String
  itemId          String
  locationId      String
  currentQty      Decimal   @default(0) @db.Decimal(12, 3)
  reservedQty     Decimal   @default(0) @db.Decimal(12, 3)
  availableQty    Decimal   @default(0) @db.Decimal(12, 3)
  avgCost         Decimal?  @db.Decimal(12, 2)  // Weighted average cost
  totalValue      Decimal?  @db.Decimal(14, 2)  // currentQty × avgCost
  updatedAt       DateTime  @updatedAt

  organization    Organization  @relation(fields: [organizationId], references: [id])
  item            Item          @relation(fields: [itemId], references: [id])
  location        StockLocation @relation(fields: [locationId], references: [id])

  @@unique([itemId, locationId])
  @@index([organizationId])
  @@map("stock_ledgers")
}

model InventoryMovement {
  id              String          @id @default(uuid())
  organizationId  String
  itemId          String
  locationId      String
  movementType    InvMovementType
  direction       String          // IN or OUT
  quantity        Decimal         @db.Decimal(12, 3)
  stockBefore     Decimal         @db.Decimal(12, 3)
  stockAfter      Decimal         @db.Decimal(12, 3)
  unitCost        Decimal?        @db.Decimal(12, 2)
  totalValue      Decimal?        @db.Decimal(14, 2)
  channel         String?         // EXPORT, DOMESTIC, SAMPLE, INTERNAL
  reason          String?
  referenceType   String?         // CI, PRODUCTION_ORDER, ADJUSTMENT
  referenceId     String?
  referenceNumber String?
  notes           String?
  movementDate    DateTime        @default(now())
  createdAt       DateTime        @default(now())
  createdBy       String?         // userId

  organization    Organization  @relation(fields: [organizationId], references: [id])
  item            Item          @relation(fields: [itemId], references: [id])
  location        StockLocation @relation(fields: [locationId], references: [id])

  @@index([organizationId])
  @@index([itemId])
  @@map("inventory_movements")
}

enum InvMovementType {
  PURCHASE_RECEIPT      // Received from supplier
  PRODUCTION_RECEIPT    // Received from production
  TRANSFER_IN           // Received from another location
  MANUAL_RECEIPT        // Manual stock entry

  EXPORT_ISSUE          // Issued for export order
  DOMESTIC_ISSUE        // Issued for domestic order
  SAMPLE_ISSUE          // Issued as sample
  TRANSFER_OUT          // Transferred to another location
  ADJUSTMENT_INCREASE   // Stock count correction (up)
  ADJUSTMENT_DECREASE   // Stock count correction (down)
  DAMAGED               // Written off as damaged
  WRITE_OFF             // Written off (expired, lost)
  OPENING_STOCK         // Opening balance entry
}
```

---

## API Routes (NestJS)

```
# Locations
GET    /api/v1/inventory/locations                    → List locations
POST   /api/v1/inventory/locations                    → Create location
PATCH  /api/v1/inventory/locations/:id                → Update
DELETE /api/v1/inventory/locations/:id                → Delete (if no stock)

# Stock Register (read-only view of StockLedger)
GET    /api/v1/inventory/stock                        → Stock register (filter: location, category, search)
GET    /api/v1/inventory/stock/:itemId                → Stock detail per item (all locations)
GET    /api/v1/inventory/stock/low-stock              → Items below threshold

# Movements
GET    /api/v1/inventory/movements                    → All movements (filter: type, date, item, location)
POST   /api/v1/inventory/receive                      → Record receipt (IN movement)
POST   /api/v1/inventory/issue                        → Record issue (OUT movement)
POST   /api/v1/inventory/adjust                       → Record adjustment

# Dashboard stats
GET    /api/v1/inventory/dashboard                    → KPI stats + summary
```

---

## Stock Update Logic

```ts
// Atomic transaction: create movement + update StockLedger
async function createMovement(data: CreateMovementDto) {
  const ledger = await prisma.stockLedger.findUnique({
    where: { itemId_locationId: { itemId: data.itemId, locationId: data.locationId } },
  });

  const stockBefore = ledger?.currentQty ?? 0;
  const stockAfter =
    data.direction === 'IN' ? stockBefore + data.quantity : stockBefore - data.quantity;

  if (stockAfter < 0) throw new BadRequestException('Insufficient stock');

  // Weighted average cost update for IN movements
  let newAvgCost = ledger?.avgCost;
  if (data.direction === 'IN' && data.unitCost) {
    const totalQtyBefore = stockBefore;
    const totalValueBefore = (ledger?.avgCost ?? 0) * totalQtyBefore;
    const newValue = data.quantity * data.unitCost;
    newAvgCost = (totalValueBefore + newValue) / (totalQtyBefore + data.quantity);
  }

  return await prisma.$transaction([
    prisma.inventoryMovement.create({ data: { ...data, stockBefore, stockAfter } }),
    prisma.stockLedger.upsert({
      where: { itemId_locationId: { itemId: data.itemId, locationId: data.locationId } },
      update: {
        currentQty: stockAfter,
        availableQty: stockAfter, // minus reservations
        avgCost: newAvgCost,
        totalValue: newAvgCost ? stockAfter * newAvgCost : null,
      },
      create: {
        organizationId: data.organizationId,
        itemId: data.itemId,
        locationId: data.locationId,
        currentQty: stockAfter,
        availableQty: stockAfter,
        avgCost: data.unitCost,
      },
    }),
  ]);
}
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/inventory.ts

export const receiveStockSchema = z.object({
  itemId: z.string().uuid('Item required'),
  locationId: z.string().uuid('Location required'),
  quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Qty > 0 required'),
  unitCost: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  movementType: z.enum([
    'PURCHASE_RECEIPT',
    'PRODUCTION_RECEIPT',
    'MANUAL_RECEIPT',
    'OPENING_STOCK',
  ]),
  referenceNumber: z.string().max(100).optional(),
  movementDate: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export const issueStockSchema = z.object({
  itemId: z.string().uuid('Item required'),
  locationId: z.string().uuid('Location required'),
  quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0),
  movementType: z.enum(['EXPORT_ISSUE', 'DOMESTIC_ISSUE', 'SAMPLE_ISSUE', 'TRANSFER_OUT']),
  channel: z.enum(['EXPORT', 'DOMESTIC', 'SAMPLE', 'INTERNAL']).optional(),
  referenceNumber: z.string().max(100).optional(),
  movementDate: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export const adjustStockSchema = z.object({
  itemId: z.string().uuid('Item required'),
  locationId: z.string().uuid('Location required'),
  direction: z.enum(['INCREASE', 'DECREASE']),
  quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0),
  reason: z.enum(['DAMAGED', 'FOUND', 'CORRECTION', 'WRITE_OFF', 'OTHER']),
  movementDate: z.string().min(1),
  notes: z.string().max(500).optional(),
});
```

---

## LLM Development Prompt

```
Build the Inventory Module for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/inventory/:

1. InventoryModule with LocationsService, StockService, MovementsService

2. createMovement() private atomic method (used by all 3 entry points):
   - Upsert StockLedger with updated currentQty
   - Create InventoryMovement record with stockBefore/stockAfter
   - For IN movements: update avgCost using weighted average
   - Throw if OUT movement would result in negative stock

3. Dashboard stats: GET /inventory/dashboard
   - totalSKUs: count(distinct itemId in StockLedger where qty > 0)
   - totalStockValue: sum(currentQty × avgCost)
   - lowStockItems: count items below their threshold (join with items table for threshold)
   - outOfStockItems: count(currentQty = 0)
   - movementsLast30Days: movement count grouped by day for chart

4. Stock register: paginated list of StockLedger joined with Item and Location
   - Support multi-location view: one row per item-location combo
   - OR consolidated view: aggregate across all locations per item

5. Low stock: join Item.minOrderQty (threshold stored on item) with StockLedger
   Return items where currentQty < minOrderQty

FRONTEND — apps/web/app/(dashboard)/inventory/:

1. Layout: 7-tab navigation at top (Dashboard | Stock Register | Receipts | Receive Stock | Issue Stock | Adjust Stock | Locations)

2. Dashboard tab:
   - 4 KPI cards: Total SKUs, Stock Value, Low Stock, Out of Stock
   - Movement trend chart (last 30 days, IN vs OUT bars using Recharts)
   - Low stock alert list (top 5)

3. Stock Register tab:
   - TanStack Table: Item, Code, Location, Current Qty, Reserved, Available, Avg Cost, Total Value
   - Location filter: "All Locations" or specific location
   - Category filter, search

4. Receive Stock tab (form, not table):
   - Item search (typeahead)
   - Location select (dropdown from locations)
   - Quantity input
   - Unit Cost input
   - Movement Type: PURCHASE_RECEIPT / PRODUCTION_RECEIPT / MANUAL_RECEIPT / OPENING_STOCK
   - Reference Number (optional)
   - Date picker
   - "Record Receipt" button → POST /inventory/receive

5. Issue Stock tab (form):
   - Item search → shows "Available: XX PCS at [Location]" hint
   - Location select (filtered to locations with stock)
   - Quantity input (max = available qty shown)
   - Movement Type: EXPORT_ISSUE / DOMESTIC_ISSUE / SAMPLE_ISSUE / TRANSFER_OUT
   - Channel, Reference, Date
   - "Record Issue" button

6. Adjust Stock tab (form):
   - Item + Location
   - Direction toggle: INCREASE ↑ / DECREASE ↓
   - Quantity
   - Reason select
   - Notes
   - Current Stock shown: "Current: 45 PCS → After: 40 PCS" preview

7. Locations tab:
   - Table: Name, Description, Items Stored, Total Value, Status
   - "Add Location" button

Use TanStack Query. Invalidate ["inventory-stock", orgId] and ["inventory-movements", orgId] on mutations.
```
