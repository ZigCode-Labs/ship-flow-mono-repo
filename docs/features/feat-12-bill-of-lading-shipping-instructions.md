# Feature: Bill of Lading & Shipping Instructions

## Title

Bill of Lading / MTD & Shipping Instructions — Carrier and Freight Documents

## Description

The Bill of Lading (B/L) is a legal document issued by the carrier acknowledging receipt of goods for shipment. The Multimodal Transport Document (MTD) covers multi-modal shipments. Shipping Instructions are sent to the freight forwarder/shipping agent with container booking and cargo details. Both share shipping data from the Export Order / CI.

---

## User Flow

```
1. Create Shipping Instructions
   Exports → Export Documents → Shipping Instructions → Create Now
   → Select CI → auto-fills buyer, cargo, ports, vessel
   → Fill: Shipper (org), Consignee, Notify Party
   → Cargo details: description, packages, weight, CBM
   → Container: type, special handling, temperature
   → Freight terms: Prepaid / Collect
   → Submit to Shipping Agent (email)

2. Create Bill of Lading / MTD
   Exports → Export Documents → Bill of Lading → Create Now
   → Select CI + Shipping Instructions → auto-fill all fields
   → BL Number: manually entered (issued by carrier)
   → Fill carrier-specific fields: vessel, voyage, container no., seal no.
   → Choose type: B/L (Sea) or MTD (Multimodal)
   → Download PDF
```

---

## Database Schema (Prisma)

```prisma
model ShippingInstruction {
  id                  String    @id @default(uuid())
  organizationId      String
  siNumber            String    @unique   // SHI-26-27-001
  ciId                String?
  status              SHIStatus @default(DRAFT)
  date                DateTime  @default(now())

  // Parties
  shipperName         String?
  shipperAddress      String?
  consigneeName       String?
  consigneeAddress    String?
  notifyPartyName     String?
  notifyPartyAddress  String?
  alsoNotifyName      String?

  // Vessel / Freight
  carrier             String?
  vesselName          String?
  voyageNo            String?
  portOfLoading       String?
  portOfDischarge     String?
  placeOfDelivery     String?
  freightTerms        String?   // PREPAID or COLLECT
  shippingMark        String?

  // Cargo
  descriptionOfGoods  String?   @db.Text
  packages            Int?
  packageUnit         String?   // CARTONS, PALLETS, BAGS
  grossWeight         Decimal?  @db.Decimal(12, 3)
  netWeight           Decimal?  @db.Decimal(12, 3)
  cbm                 Decimal?  @db.Decimal(10, 4)

  // Container
  containerType       String?   // 20FT, 40FT, 40HC
  containerNo         String?
  specialHandling     String?
  temperatureControl  Boolean   @default(false)
  temperature         String?

  notes               String?
  fileUrl             String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  organization        Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
  @@map("shipping_instructions")
}

model BillOfLading {
  id                  String    @id @default(uuid())
  organizationId      String
  blNumber            String    @unique   // Carrier-issued BL number
  docType             BLDocType @default(BL)  // BL or MTD
  status              BLStatus  @default(DRAFT)
  date                DateTime  @default(now())
  shiNumber           String?             // Linked Shipping Instruction
  ciId                String?             // Linked CI

  // Parties
  shipperName         String?
  shipperAddress      String?
  consigneeName       String?
  consigneeAddress    String?
  notifyPartyName     String?
  notifyPartyAddress  String?

  // Vessel
  carrier             String?
  vesselName          String?
  voyageNo            String?
  portOfLoading       String?
  portOfDischarge     String?
  placeOfDelivery     String?
  onBoardDate         DateTime?

  // Container
  containerNo         String?
  containerSize       String?
  sealNo              String?

  // Cargo
  descriptionOfGoods  String?   @db.Text
  packages            Int?
  grossWeight         Decimal?  @db.Decimal(12, 3)
  netWeight           Decimal?  @db.Decimal(12, 3)
  cbm                 Decimal?  @db.Decimal(10, 4)
  shippingMark        String?
  freightTerms        String?   // PREPAID, COLLECT

  clauses             String?   @db.Text  // Special clauses
  notes               String?
  fileUrl             String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  organization        Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
  @@map("bills_of_lading")
}

enum BLDocType {
  BL
  MTD
}

enum BLStatus {
  DRAFT
  GENERATED
  ISSUED
  SURRENDERED
  CANCELLED
}

enum SHIStatus {
  DRAFT
  SENT
  CONFIRMED
  CANCELLED
}
```

---

## API Routes (NestJS)

```
# Shipping Instructions
GET    /api/v1/shipping-instructions              → List
POST   /api/v1/shipping-instructions              → Create
GET    /api/v1/shipping-instructions/:id          → Detail
PATCH  /api/v1/shipping-instructions/:id          → Update
DELETE /api/v1/shipping-instructions/:id          → Soft delete
POST   /api/v1/shipping-instructions/:id/send     → Send to shipping agent via email
POST   /api/v1/shipping-instructions/:id/generate-pdf → Generate PDF

# Bill of Lading / MTD
GET    /api/v1/bills-of-lading                    → List (filter: type BL/MTD, status)
POST   /api/v1/bills-of-lading                    → Create
GET    /api/v1/bills-of-lading/:id                → Detail
PATCH  /api/v1/bills-of-lading/:id                → Update
DELETE /api/v1/bills-of-lading/:id                → Soft delete
POST   /api/v1/bills-of-lading/:id/generate-pdf   → Generate PDF → S3
POST   /api/v1/bills-of-lading/:id/send-email     → Send via email
PATCH  /api/v1/bills-of-lading/:id/status         → Update status
```

---

## UI Screens / Components

| Screen                     | Route                             | Components                  |
| -------------------------- | --------------------------------- | --------------------------- |
| Shipping Instructions list | `Exports → Shipping Instructions` | Master-detail layout        |
| B/L list                   | `Exports → Bill of Lading`        | Master-detail layout        |
| SHI form                   | Right panel                       | `<ShippingInstructionForm>` |
| B/L form                   | Right panel                       | `<BillOfLadingForm>`        |

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/bill-of-lading.ts

export const shippingInstructionSchema = z.object({
  date: z.string().min(1),
  ciId: z.string().uuid().optional(),
  shipperName: z.string().min(1).max(200),
  consigneeName: z.string().min(1).max(200),
  consigneeAddress: z.string().max(500).optional(),
  notifyPartyName: z.string().max(200).optional(),
  carrier: z.string().max(100).optional(),
  vesselName: z.string().max(100).optional(),
  voyageNo: z.string().max(50).optional(),
  portOfLoading: z.string().max(100).optional(),
  portOfDischarge: z.string().max(100).optional(),
  freightTerms: z.enum(['PREPAID', 'COLLECT']).default('PREPAID'),
  descriptionOfGoods: z.string().max(1000).optional(),
  packages: z.number().int().min(1).optional(),
  packageUnit: z.string().max(50).optional(),
  grossWeight: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  containerType: z.enum(['20FT', '40FT', '40HC']).optional(),
  temperatureControl: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
});

export const billOfLadingSchema = z.object({
  blNumber: z.string().min(1, 'B/L number required').max(100),
  docType: z.enum(['BL', 'MTD']).default('BL'),
  date: z.string().min(1),
  ciId: z.string().uuid().optional(),
  shiNumber: z.string().optional(),
  shipperName: z.string().min(1).max(200),
  consigneeName: z.string().min(1).max(200),
  notifyPartyName: z.string().max(200).optional(),
  carrier: z.string().max(100).optional(),
  vesselName: z.string().min(1, 'Vessel/carrier required').max(100),
  voyageNo: z.string().max(50).optional(),
  portOfLoading: z.string().min(1).max(100),
  portOfDischarge: z.string().min(1).max(100),
  onBoardDate: z.string().optional(),
  containerNo: z.string().max(50).optional(),
  containerSize: z.enum(['20FT', '40FT', '40HC']).optional(),
  sealNo: z.string().max(50).optional(),
  descriptionOfGoods: z.string().max(1000).optional(),
  packages: z.number().int().min(1).optional(),
  grossWeight: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  freightTerms: z.enum(['PREPAID', 'COLLECT']).optional(),
  notes: z.string().max(1000).optional(),
});
```

---

## LLM Development Prompt

```
Build the Bill of Lading and Shipping Instructions features for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/:

1. ShippingInstructionsModule:
   - Full CRUD + generate-pdf + send email to shipping agent
   - SHI number: SHI-YY-YY-SEQ
   - Link to CI: copy buyer, cargo summary, CBM, ports from linked CI
   - Send endpoint: POST /shipping-instructions/:id/send → email PDF to shipping agent
     (shipping agent email from ShippingAgent module)
   - PDF template: templates/shipping-instruction.hbs
     Standard layout: Shipper, Consignee, Notify Party, vessel/voyage, container, cargo description

2. BillsOfLadingModule:
   - Full CRUD + generate-pdf + send-email
   - B/L number is carrier-issued — user enters manually (not auto-generated)
   - Doc type switcher: BL or MTD (Multimodal Transport Document)
     Templates differ:
     BL: "BILL OF LADING" header, "Shipped on Board" clause
     MTD: "MULTIMODAL TRANSPORT DOCUMENT" header, "Received for Shipment" clause
   - Link to SHI: copy all fields from linked Shipping Instruction on import
   - PDF templates: templates/bill-of-lading.hbs and templates/mtd.hbs
   - Upload to S3; return signed URL

FRONTEND:

1. Shipping Instructions page (exports/shipping-instructions/):
   - Master-detail layout
   - Form: Parties block (3 columns: Shipper/Consignee/Notify)
   - Vessel/Freight section
   - Cargo table: description, packages, weight, CBM (auto-from linked CI)
   - Container section with temperature toggle
   - "Send to Agent" button: opens dialog to select agent from ShippingAgents directory + compose email

2. Bill of Lading page (exports/bills-of-lading/):
   - Master-detail layout
   - DocType toggle at top: B/L | MTD (switches PDF template)
   - B/L Number: manual text input (carrier provides this)
   - "Import from Shipping Instruction" button → select SHI → populate all fields
   - On-Board Date picker
   - Clauses textarea for special handling notes

Use TanStack Query. Invalidate caches on mutations.
```
