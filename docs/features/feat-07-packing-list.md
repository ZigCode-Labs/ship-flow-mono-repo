# Feature: Packing List

## Title

Packing List — Export Carton & Weight Declaration Document

## Description

The Packing List details how goods are packed for shipment: number of cartons, dimensions, weights (gross and net), CBM per item, and container totals. Auto-fills from the Commercial Invoice / Export Order. Includes declaration text and terms & conditions. Generates a downloadable PDF.

---

## User Flow

```
1. Create Packing List
   Exports → Export Documents → Packing List → Create Now
   → Auto-assigns PL number (e.g., PL-26-27-001)
   → Select Buyer / link to CI → auto-fills buyer, shipping details
   → Line items pre-filled from CI (can override)
   → Each line item: enter Packages (cartons), Gross Weight, Net Weight, Dimensions (L×W×H)
   → CBM per item auto-calculated: (L×W×H/1000000) × Qty
   → Totals: Total Packages, Total Gross/Net Weight, Total CBM
   → Container usage: Select 20FT/40FT/40HC → show utilization %
   → Add Declaration text + Terms & Conditions
   → Save or Generate PDF

2. Download PDF
   PL detail → Download PDF button
```

---

## Database Schema (Prisma)

```prisma
model PackingList {
  id                  String    @id @default(uuid())
  organizationId      String
  plNumber            String    @unique   // PL-26-27-001
  ciId                String?             // Linked CI
  status              PLStatus  @default(DRAFT)
  date                DateTime  @default(now())
  exportersRef        String?
  buyerOrderNo        String?
  buyerOrderDate      DateTime?

  buyerId             String?
  buyerName           String?
  buyerAddress        String?
  consigneeName       String?
  consigneeAddress    String?

  vesselFlightNo      String?
  preCarriageBy       String?
  placeOfReceipt      String?
  portOfLoading       String?
  portOfDischarge     String?
  portOfFinalDest     String?
  countryOfOrigin     String?   @default("India")
  countryOfFinalDest  String?
  termsOfDelivery     String?

  containerNo         String?
  containerSize       String?   // 20FT, 40FT, 40HC
  sealNo              String?

  totalPackages       Int       @default(0)
  totalGrossWeight    Decimal   @default(0) @db.Decimal(12, 3)
  totalNetWeight      Decimal   @default(0) @db.Decimal(12, 3)
  totalCbm            Decimal   @default(0) @db.Decimal(10, 4)
  containerCbm        Decimal?  @db.Decimal(10, 2)  // Max CBM of selected container
  utilizationPct      Decimal?  @db.Decimal(5, 2)

  declaration         String?   @db.Text
  termsConditions     String?   @db.Text
  notes               String?
  fileUrl             String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  organization        Organization @relation(fields: [organizationId], references: [id])
  buyer               ExportBuyer? @relation(fields: [buyerId], references: [id])
  lineItems           PLLineItem[]

  @@index([organizationId])
  @@map("packing_lists")
}

model PLLineItem {
  id           String  @id @default(uuid())
  plId         String
  itemId       String?
  srNo         Int     @default(1)
  productCode  String?
  description  String
  hsnCode      String?
  packages     Int     @default(1)
  unit         String  @default("PCS")
  unitQty      Int     @default(1)
  length       Decimal? @db.Decimal(10, 2)  // CM
  width        Decimal? @db.Decimal(10, 2)  // CM
  height       Decimal? @db.Decimal(10, 2)  // CM
  grossWeight  Decimal  @db.Decimal(10, 3)  // KGS per unit
  netWeight    Decimal  @db.Decimal(10, 3)  // KGS per unit
  cbmPerUnit   Decimal? @db.Decimal(10, 6)  // L×W×H/1,000,000
  totalCbm     Decimal? @db.Decimal(10, 4)
  sortOrder    Int     @default(0)

  packingList  PackingList @relation(fields: [plId], references: [id], onDelete: Cascade)
  item         Item?       @relation(fields: [itemId], references: [id])

  @@map("pl_line_items")
}

enum PLStatus {
  DRAFT
  GENERATED
  SENT
  CANCELLED
}
```

---

## API Routes (NestJS)

```
GET    /api/v1/packing-lists              → List (filter: year, buyer, status)
POST   /api/v1/packing-lists              → Create
GET    /api/v1/packing-lists/:id          → Detail (with line items)
PATCH  /api/v1/packing-lists/:id          → Update
DELETE /api/v1/packing-lists/:id          → Soft delete / Cancel

POST   /api/v1/packing-lists/:id/generate-pdf  → Generate PDF → S3
POST   /api/v1/packing-lists/:id/send-email    → Send via email
PATCH  /api/v1/packing-lists/:id/status        → Update status
```

---

## CBM Calculation Logic

```ts
// Calculated server-side on save
function calcCbm(l: number, w: number, h: number): number {
  return (l * w * h) / 1_000_000;
}

// Container capacities (CBM)
const CONTAINER_CBM = { '20FT': 25, '40FT': 55, '40HC': 67 };

// Recalculate on line item save
lineItems.forEach((item) => {
  item.cbmPerUnit = calcCbm(item.length, item.width, item.height);
  item.totalCbm = item.cbmPerUnit * item.unitQty;
});

totalCbm = sum(lineItems.map((i) => i.totalCbm));
totalPackages = sum(lineItems.map((i) => i.packages));
totalGrossWeight = sum(lineItems.map((i) => i.grossWeight * i.unitQty));
totalNetWeight = sum(lineItems.map((i) => i.netWeight * i.unitQty));

if (containerSize) {
  containerCbm = CONTAINER_CBM[containerSize];
  utilizationPct = (totalCbm / containerCbm) * 100;
}
```

---

## UI Screens / Components

| Screen             | Route                     | Components                                           |
| ------------------ | ------------------------- | ---------------------------------------------------- |
| PL list            | `Exports → Packing Lists` | Left panel: searchable list. Right panel: PL preview |
| PL detail / edit   | Same page, right panel    | `<PackingListForm>`                                  |
| CBM summary widget | Bottom of form            | Container selector + utilization gauge               |

**Form layout:**

```
[ Exporter (auto-filled)  ] [ PL Number & Date    ] [ Exporters Reference ]
[ Buyer Order No & Date   ]                          [ Consignee (If Any)  ]
[ Buyer (dropdown)        ] [ Terms of Delivery   ] [ Country of Origin   ]
[ Pre Carriage By         ] [ Vessel / Flight No  ] [ Container No/Size   ]
[ Port of Loading         ] [ Port of Discharge   ] [ Port of Final Dest  ]
[ Seal No                 ] [ Place of Receipt    ]

Line Items Table:
[ Sr# | Code | Description | HSN | Pkgs | Qty | Unit | L×W×H (cm) | G.Wt | N.Wt | CBM | Total CBM ]
[ + Add Line ]

Totals Bar:
[ Total Packages: XX ] [ Total G.Wt: XX KGS ] [ Total N.Wt: XX KGS ] [ Total CBM: X.XXXX ]
Container: [ 20FT ▼ ] [ Utilization: 78% ████░░░░ ]

[ Declaration (text area)        ] [ Terms & Conditions (text area) ]
[ Signatory Company              ] [ Authorized Signatory Name      ]
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/packing-list.ts

export const plLineItemSchema = z
  .object({
    itemId: z.string().uuid().optional(),
    productCode: z.string().max(50).optional(),
    description: z.string().min(1).max(500),
    hsnCode: z
      .string()
      .regex(/^[0-9]{4,8}$/)
      .optional()
      .or(z.literal('')),
    packages: z.number().int().min(1),
    unitQty: z.number().int().min(1),
    unit: z.string().default('PCS'),
    length: z
      .string()
      .refine((v) => !v || !isNaN(Number(v)))
      .optional(),
    width: z
      .string()
      .refine((v) => !v || !isNaN(Number(v)))
      .optional(),
    height: z
      .string()
      .refine((v) => !v || !isNaN(Number(v)))
      .optional(),
    grossWeight: z
      .string()
      .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Gross weight required'),
    netWeight: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Net weight required'),
  })
  .refine((d) => Number(d.netWeight) <= Number(d.grossWeight), {
    message: 'Net weight cannot exceed gross weight',
    path: ['netWeight'],
  });

export const packingListSchema = z.object({
  date: z.string().min(1, 'Date required'),
  ciId: z.string().uuid().optional(),
  exportersRef: z.string().max(100).optional(),
  buyerOrderNo: z.string().max(100).optional(),
  buyerId: z.string().uuid().optional(),
  vesselFlightNo: z.string().max(100).optional(),
  portOfLoading: z.string().max(100).optional(),
  portOfDischarge: z.string().max(100).optional(),
  containerNo: z.string().max(50).optional(),
  containerSize: z.enum(['20FT', '40FT', '40HC']).optional(),
  sealNo: z.string().max(50).optional(),
  lineItems: z.array(plLineItemSchema).min(1, 'Add at least one line item'),
  declaration: z.string().max(2000).optional(),
  termsConditions: z.string().max(2000).optional(),
  notes: z.string().max(1000).optional(),
});
```

---

## LLM Development Prompt

```
Build the Packing List feature for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/packing-lists/:

1. PackingListsModule with full CRUD
2. PL number auto-generation: PL-YY-YY-SEQ (financial year aware)
3. On create/update — recalculate for each line item:
   cbmPerUnit = (length × width × height) / 1,000,000
   totalCbm   = cbmPerUnit × unitQty
   Then aggregate:
   totalPackages    = sum(packages)
   totalGrossWeight = sum(grossWeight × unitQty)
   totalNetWeight   = sum(netWeight × unitQty)
   totalCbm         = sum(totalCbm per item)
   If containerSize present: containerCbm = {20FT:25, 40FT:55, 40HC:67}[containerSize]
   utilizationPct = (totalCbm / containerCbm) * 100
4. Link to CI: when ciId provided, pre-fill buyer/shipping from CI; import line items from CI
5. PDF generation:
   - Puppeteer + Handlebars template: templates/packing-list.hbs
   - Template shows items table with L×W×H, CBM per row, plus summary totals
   - Container utilization bar at bottom
   - Declaration text and signatory section
   - Upload to S3; return URL
6. All routes org-scoped via OrgContextGuard

FRONTEND — apps/web/app/(dashboard)/exports/packing-lists/:

1. page.tsx: master-detail layout (same pattern as PI/CI)

2. PackingListForm:
   - Shipping fields (3-column grid)
   - Line items table with inline L×W×H inputs
   - CBM column auto-calculates as user types dimensions
   - "Import from CI" button → select CI → populates buyer + all line items
   - Container selector: SegmentedControl (20FT / 40FT / 40HC)
   - Utilization gauge: progress bar showing % used with color coding
     (green < 80%, yellow 80–95%, red > 95%)
   - Declaration and T&C textareas at bottom

3. Real-time totals update as weights/dimensions are changed (no save needed)

4. Actions: Download PDF, Send via Email, Cancel

Use TanStack Query. Invalidate ["packing-lists", orgId] on mutations.
```
