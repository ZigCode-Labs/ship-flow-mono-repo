# Feature: Production Settings & Items

## Title

Production Module — Settings, Production Item Register & Cost Sheets

## Description

The Production Module manages the manufacturing side of the export business. Production Settings define 6 document series (codes). The Item Register tracks finished goods with Bill of Materials (BOM), dynamic attributes, technical specifications, and production cost sheets. AI auto-fill can populate item details from product images. Each item has a linked 5-section cost sheet (RM Cost, Labour, Overhead, Packing, Finishing).

---

## User Flow

```
1. Configure Production Settings
   Production → Settings
   → Set series prefixes and starting numbers for:
     PRD (Production Orders), PO (Purchase Orders), RMPO (RM Purchase Orders),
     JW (Job Work), RM (Raw Materials), CS (Cost Sheets)
   → Save

2. Add Production Item
   Production → Item Register → Add Item
   → Fill: Item Name, Category, Unit, Item Code (auto-generated)
   → (Optional) Upload product image → AI auto-fill: name, category, specs
   → Fill BOM (Bill of Materials): list of raw materials + qty
   → Fill Dynamic Attributes: custom key-value pairs (e.g., "Finish: Antique Gold")
   → Fill Technical Specifications: dimensions, weight, material
   → Save

3. Create Cost Sheet
   Production → Item Register → [Item] → Cost Sheet
   → Section 1: Raw Material Costs (RM qty × price)
   → Section 2: Labour Costs (per unit: machining, welding, polishing, etc.)
   → Section 3: Overhead Costs (energy, depreciation, rent)
   → Section 4: Packing Material Costs
   → Section 5: Finishing Costs (electroplating, lacquering, etc.)
   → Total Production Cost per unit auto-calculated
   → Profit Margin % → Selling Price suggestion
```

---

## Database Schema (Prisma)

```prisma
model ProductionSettings {
  id              String    @id @default(uuid())
  organizationId  String    @unique
  prdPrefix       String    @default("PRD")
  prdStartNumber  Int       @default(1)
  poPrefix        String    @default("PO")
  poStartNumber   Int       @default(1)
  rmpoPrefix      String    @default("RMPO")
  rmpoStartNumber Int       @default(1)
  jwPrefix        String    @default("JW")
  jwStartNumber   Int       @default(1)
  rmPrefix        String    @default("RM")
  rmStartNumber   Int       @default(1)
  csPrefix        String    @default("CS")
  csStartNumber   Int       @default(1)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])
  @@map("production_settings")
}

model ProductionItem {
  id              String    @id @default(uuid())
  organizationId  String
  itemCode        String    @unique  // PRD-0001 (auto-generated)
  name            String
  description     String?
  category        String?
  unit            String    @default("PCS")
  unitPrice       Decimal?  @db.Decimal(12, 2)
  currency        String    @default("USD")
  imageUrl        String?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  organization    Organization      @relation(fields: [organizationId], references: [id])
  bom             BOMComponent[]
  attributes      ProductionItemAttribute[]
  specifications  ProductionItemSpec[]
  costSheet       CostSheet?
  productionOrders ProductionOrder[]

  @@index([organizationId])
  @@map("production_items")
}

model BOMComponent {
  id              String    @id @default(uuid())
  productionItemId String
  rawMaterialId   String?
  rawMaterialName String               // Snapshot
  description     String?
  quantity        Decimal   @db.Decimal(10, 4)
  unit            String    @default("KGS")
  unitCost        Decimal?  @db.Decimal(12, 2)
  totalCost       Decimal?  @db.Decimal(14, 2)
  sortOrder       Int       @default(0)

  productionItem  ProductionItem @relation(fields: [productionItemId], references: [id], onDelete: Cascade)
  rawMaterial     RawMaterial?   @relation(fields: [rawMaterialId], references: [id])

  @@map("bom_components")
}

model ProductionItemAttribute {
  id              String    @id @default(uuid())
  productionItemId String
  attributeName   String    // e.g., "Finish", "Color", "Grade"
  attributeValue  String    // e.g., "Antique Gold", "Matte Black", "IS2062"
  sortOrder       Int       @default(0)

  productionItem  ProductionItem @relation(fields: [productionItemId], references: [id], onDelete: Cascade)
  @@map("production_item_attributes")
}

model ProductionItemSpec {
  id              String    @id @default(uuid())
  productionItemId String
  specName        String    // e.g., "Height", "Diameter", "Wall Thickness"
  specValue       String    // e.g., "25 CM", "8 MM"
  sortOrder       Int       @default(0)

  productionItem  ProductionItem @relation(fields: [productionItemId], references: [id], onDelete: Cascade)
  @@map("production_item_specs")
}

model CostSheet {
  id              String    @id @default(uuid())
  organizationId  String
  csNumber        String    @unique  // CS-0001
  productionItemId String   @unique
  version         Int       @default(1)

  // Section 1: RM Costs (from BOM)
  rmCostTotal     Decimal   @default(0) @db.Decimal(14, 2)

  // Section 2: Labour Costs
  labourCostTotal Decimal   @default(0) @db.Decimal(12, 2)

  // Section 3: Overhead Costs
  overheadTotal   Decimal   @default(0) @db.Decimal(12, 2)

  // Section 4: Packing Costs
  packingTotal    Decimal   @default(0) @db.Decimal(12, 2)

  // Section 5: Finishing Costs
  finishingTotal  Decimal   @default(0) @db.Decimal(12, 2)

  totalCostPerUnit Decimal  @default(0) @db.Decimal(14, 2)
  profitMarginPct  Decimal? @db.Decimal(5, 2)
  suggestedPrice   Decimal? @db.Decimal(14, 2)

  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  organization    Organization   @relation(fields: [organizationId], references: [id])
  productionItem  ProductionItem @relation(fields: [productionItemId], references: [id])
  labourItems     CSLabourItem[]
  overheadItems   CSOverheadItem[]
  packingItems    CSPackingItem[]
  finishingItems  CSFinishingItem[]

  @@index([organizationId])
  @@map("cost_sheets")
}

model CSLabourItem {
  id          String  @id @default(uuid())
  csId        String
  description String  // e.g., "Welding", "Polishing", "Assembly"
  hours       Decimal? @db.Decimal(8, 2)
  rate        Decimal  @db.Decimal(10, 2)  // per hour or per unit
  amount      Decimal  @db.Decimal(12, 2)
  sortOrder   Int      @default(0)

  costSheet   CostSheet @relation(fields: [csId], references: [id], onDelete: Cascade)
  @@map("cs_labour_items")
}

model CSOverheadItem {
  id          String  @id @default(uuid())
  csId        String
  description String  // e.g., "Energy", "Depreciation", "Factory Rent"
  amount      Decimal @db.Decimal(12, 2)
  sortOrder   Int     @default(0)

  costSheet   CostSheet @relation(fields: [csId], references: [id], onDelete: Cascade)
  @@map("cs_overhead_items")
}

model CSPackingItem {
  id          String  @id @default(uuid())
  csId        String
  description String  // e.g., "Inner Box", "Master Carton", "Bubble Wrap"
  quantity    Decimal @db.Decimal(8, 2)
  unit        String  @default("PCS")
  unitCost    Decimal @db.Decimal(10, 2)
  amount      Decimal @db.Decimal(12, 2)
  sortOrder   Int     @default(0)

  costSheet   CostSheet @relation(fields: [csId], references: [id], onDelete: Cascade)
  @@map("cs_packing_items")
}

model CSFinishingItem {
  id          String  @id @default(uuid())
  csId        String
  description String  // e.g., "Electroplating", "Lacquering", "Powder Coating"
  amount      Decimal @db.Decimal(12, 2)
  sortOrder   Int     @default(0)

  costSheet   CostSheet @relation(fields: [csId], references: [id], onDelete: Cascade)
  @@map("cs_finishing_items")
}
```

---

## API Routes (NestJS)

```
# Production Settings
GET    /api/v1/production/settings        → Get settings
PATCH  /api/v1/production/settings        → Update settings

# Production Items
GET    /api/v1/production/items                     → List (search, category, status)
POST   /api/v1/production/items                     → Create
GET    /api/v1/production/items/:id                 → Detail with BOM + attributes + specs + cost sheet
PATCH  /api/v1/production/items/:id                 → Update
DELETE /api/v1/production/items/:id                 → Soft delete
POST   /api/v1/production/items/:id/image           → Upload product image → S3
POST   /api/v1/production/items/ai-analyze          → AI image → extract item details

# BOM
GET    /api/v1/production/items/:id/bom             → BOM components
POST   /api/v1/production/items/:id/bom             → Add component
PATCH  /api/v1/production/items/:id/bom/:compId     → Update component
DELETE /api/v1/production/items/:id/bom/:compId     → Remove component

# Cost Sheets
GET    /api/v1/production/cost-sheets/:itemId       → Get/create cost sheet for item
PUT    /api/v1/production/cost-sheets/:id           → Full update (all 5 sections)
PATCH  /api/v1/production/cost-sheets/:id/labour    → Update labour items
PATCH  /api/v1/production/cost-sheets/:id/overhead  → Update overhead items
PATCH  /api/v1/production/cost-sheets/:id/packing   → Update packing items
PATCH  /api/v1/production/cost-sheets/:id/finishing → Update finishing items
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/production.ts

export const bomComponentSchema = z.object({
  rawMaterialId: z.string().uuid().optional(),
  rawMaterialName: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0),
  unit: z.string().default('KGS'),
  unitCost: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
});

export const productionItemSchema = z.object({
  name: z.string().min(1).max(300),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  unit: z.string().default('PCS'),
  unitPrice: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'AED', 'INR']).default('USD'),
  bom: z.array(bomComponentSchema).optional(),
  attributes: z
    .array(
      z.object({
        attributeName: z.string().min(1).max(100),
        attributeValue: z.string().min(1).max(200),
      }),
    )
    .optional(),
  specifications: z
    .array(
      z.object({
        specName: z.string().min(1).max(100),
        specValue: z.string().min(1).max(200),
      }),
    )
    .optional(),
});

export const costSheetLabourSchema = z.array(
  z.object({
    description: z.string().min(1).max(200),
    hours: z
      .string()
      .refine((v) => !v || !isNaN(Number(v)))
      .optional(),
    rate: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0),
    amount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0),
  }),
);
```

---

## LLM Development Prompt

```
Build the Production Settings and Items features for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/production/:

1. ProductionModule with sub-modules: settings, items, cost-sheets

2. Production Item code auto-generation:
   prefix from ProductionSettings.prdPrefix + 4-digit seq per org
   e.g., PRD-0001, PRD-0002

3. BOM cost calculation on each save:
   rmCostTotal = sum(bom.quantity × bom.unitCost)

4. Cost sheet total calculation on save:
   totalCostPerUnit = rmCostTotal + labourCostTotal + overheadTotal + packingTotal + finishingTotal
   if profitMarginPct: suggestedPrice = totalCostPerUnit * (1 + profitMarginPct/100)

5. AI image analysis: POST /production/items/ai-analyze
   Accept image → call Python AI service (same pattern as items module)
   Returns: { name, category, description, estimatedWeight, specifications }
   Return suggestions for user review

6. Production item code: from ProductionSettings prefix, increments per org

FRONTEND — apps/web/app/(dashboard)/production/:

1. /settings/page.tsx: 6 series configuration forms + save

2. /items/page.tsx:
   - TanStack Table with columns: Image, Code, Name, Category, Price, Status, Actions
   - Toolbar: Search, Category filter, + Add Item, AI Analyze
   - Row actions: Edit, View Cost Sheet, Copy, Delete

3. Item Form (shadcn Sheet):
   Tabs: Basic Info | BOM | Attributes & Specs | Cost Sheet

   Basic Info tab:
   - Name, Category, Unit, Price, Currency
   - Image upload: drag-and-drop with preview
   - AI Analyze button at top: upload image → fills name/category/description

   BOM tab:
   - Dynamic table: Raw Material (search typeahead), Qty, Unit, Unit Cost, Total
   - + Add Row button
   - RM Cost Total shown at bottom

   Attributes & Specs tab:
   - Two dynamic key-value tables: Attributes and Specifications
   - + Add Row button for each

   Cost Sheet tab:
   - 5 accordion sections:
     Section 1: RM Cost (read-only from BOM total, with drilldown)
     Section 2: Labour (dynamic table: Description, Hours, Rate, Amount)
     Section 3: Overhead (dynamic table: Description, Amount)
     Section 4: Packing Material (dynamic table: Description, Qty, Unit, Cost, Amount)
     Section 5: Finishing (dynamic table: Description, Amount)
   - Summary at bottom:
     RM Cost: ₹XX | Labour: ₹XX | Overhead: ₹XX | Packing: ₹XX | Finishing: ₹XX
     Total Cost/Unit: ₹XX
     Profit Margin: [XX%] → Suggested Price: ₹XX

Use TanStack Query. Invalidate ["production-items", orgId] on mutations.
```
