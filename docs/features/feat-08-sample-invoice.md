# Feature: Sample Invoice

## Title

Sample Invoice — Customs-Purpose Document for Sample Shipments

## Description

A Sample Invoice is issued for sample shipments sent to buyers before a commercial order. It is marked "FOR CUSTOMS PURPOSES ONLY" and includes a FOB/CIF value breakdown. Used to clear customs for non-commercial goods. Shares the same form structure as the Commercial Invoice but with a "SAMPLE INVOICE" header and no payment tracking.

---

## User Flow

```
1. Create Sample Invoice
   Exports → Export Documents → Sample Invoice → Create Now
   → Auto-assigns SI number (e.g., SI-26-27-001)
   → Select Buyer → auto-fills details
   → Fill shipping details
   → Add line items with unit price (for customs reference)
   → FOB Value auto-calculated from line items
   → Enter Freight and Insurance for CIF calculation
   → CIF Value = FOB + Freight + Insurance
   → "FOR CUSTOMS PURPOSES ONLY" declaration auto-added
   → Save or Generate PDF

2. Download PDF
   SI detail → Download PDF
```

---

## Database Schema (Prisma)

```prisma
model SampleInvoice {
  id                  String    @id @default(uuid())
  organizationId      String
  siNumber            String    @unique   // SI-26-27-001
  status              SIStatus  @default(DRAFT)
  date                DateTime  @default(now())
  exportersRef        String?
  buyerOrderNo        String?

  buyerId             String?
  buyerName           String?
  buyerAddress        String?
  consigneeName       String?
  consigneeAddress    String?

  currency            String    @default("USD")
  exchangeRate        Decimal?  @db.Decimal(10, 4)
  termsOfDelivery     String?
  preCarriageBy       String?
  countryOfOrigin     String?   @default("India")
  vesselFlightNo      String?
  portOfLoading       String?
  portOfDischarge     String?
  portOfFinalDest     String?
  descriptionOfGoods  String?

  // FOB/CIF breakdown
  fobValue            Decimal   @default(0) @db.Decimal(14, 2)
  freightCharges      Decimal?  @db.Decimal(12, 2)
  insuranceCharges    Decimal?  @db.Decimal(12, 2)
  cifValue            Decimal   @default(0) @db.Decimal(14, 2)

  declaration         String?   @db.Text
  notes               String?
  fileUrl             String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  organization        Organization @relation(fields: [organizationId], references: [id])
  buyer               ExportBuyer? @relation(fields: [buyerId], references: [id])
  lineItems           SILineItem[]

  @@index([organizationId])
  @@map("sample_invoices")
}

model SILineItem {
  id           String  @id @default(uuid())
  siId         String
  itemId       String?
  productCode  String?
  description  String
  hsnCode      String?
  unitQty      Int     @default(1)
  unit         String  @default("PCS")
  unitPrice    Decimal @db.Decimal(12, 2)
  amount       Decimal @db.Decimal(14, 2)
  sortOrder    Int     @default(0)

  sampleInvoice SampleInvoice @relation(fields: [siId], references: [id], onDelete: Cascade)
  item          Item?         @relation(fields: [itemId], references: [id])

  @@map("si_line_items")
}

enum SIStatus {
  DRAFT
  GENERATED
  SENT
  CANCELLED
}
```

---

## API Routes (NestJS)

```
GET    /api/v1/sample-invoices              → List (filter: year, buyer, status)
POST   /api/v1/sample-invoices              → Create
GET    /api/v1/sample-invoices/:id          → Detail (with line items)
PATCH  /api/v1/sample-invoices/:id          → Update
DELETE /api/v1/sample-invoices/:id          → Soft delete

POST   /api/v1/sample-invoices/:id/generate-pdf  → Generate PDF → S3
POST   /api/v1/sample-invoices/:id/send-email    → Send via email
PATCH  /api/v1/sample-invoices/:id/status        → Update status
```

---

## FOB / CIF Calculation Logic

```ts
// Server-side recalculation on save
fobValue = sum(lineItems.map((i) => i.amount));
cifValue = fobValue + (freightCharges ?? 0) + (insuranceCharges ?? 0);
```

---

## UI Screens / Components

| Screen    | Route                       | Components            |
| --------- | --------------------------- | --------------------- |
| SI list   | `Exports → Sample Invoices` | Master-detail layout  |
| SI detail | Right panel                 | `<SampleInvoiceForm>` |

**Form layout:**

```
[ SAMPLE INVOICE — FOR CUSTOMS PURPOSES ONLY ]   ← auto-header text

[ Exporter (auto-filled)  ] [ SI Number & Date    ] [ Exporters Reference ]
[ Buyer Order No          ]                          [ Consignee (If Any)  ]
[ Buyer (dropdown)        ] [ Currency & Rate      ] [ Terms of Delivery   ]
[ Pre Carriage By         ] [ Country of Origin    ] [ Vessel / Flight No  ]
[ Port of Loading         ] [ Port of Discharge    ] [ Port of Final Dest  ]
                    [ Description of Goods (text area) ]

Line Items:
[ Code | Description | HSN | Qty | Unit | Unit Price | Amount ]
[ + Add Line ]

FOB / CIF Calculation:
[ FOB Value (auto-calc) ] [ Freight Charges ] [ Insurance Charges ]
[ CIF Value (auto-calc) ]

[ Declaration (pre-filled: "FOR CUSTOMS PURPOSES ONLY — NOT FOR SALE") ]
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/sample-invoice.ts

export const siLineItemSchema = z.object({
  itemId: z.string().uuid().optional(),
  productCode: z.string().max(50).optional(),
  description: z.string().min(1).max(500),
  hsnCode: z
    .string()
    .regex(/^[0-9]{4,8}$/)
    .optional()
    .or(z.literal('')),
  unitQty: z.number().int().min(1),
  unit: z.string().default('PCS'),
  unitPrice: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Price required'),
});

export const sampleInvoiceSchema = z.object({
  date: z.string().min(1),
  buyerId: z.string().uuid().optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'AED']).default('USD'),
  exchangeRate: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  termsOfDelivery: z.string().max(200).optional(),
  portOfLoading: z.string().max(100).optional(),
  portOfDischarge: z.string().max(100).optional(),
  vesselFlightNo: z.string().max(100).optional(),
  countryOfOrigin: z.string().default('India'),
  descriptionOfGoods: z.string().max(500).optional(),
  lineItems: z.array(siLineItemSchema).min(1, 'Add at least one line item'),
  freightCharges: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  insuranceCharges: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  declaration: z.string().max(2000).optional(),
  notes: z.string().max(1000).optional(),
});
```

---

## LLM Development Prompt

```
Build the Sample Invoice feature for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/sample-invoices/:

1. SampleInvoicesModule with full CRUD
2. SI number auto-generation: SI-YY-YY-SEQ (financial year aware)
3. On create/update:
   fobValue = sum(lineItems[unitQty × unitPrice])
   cifValue = fobValue + freightCharges + insuranceCharges
4. Default declaration: "THIS IS A SAMPLE INVOICE FOR CUSTOMS PURPOSES ONLY. THE GOODS DESCRIBED HEREIN ARE NOT FOR SALE."
5. PDF generation: Puppeteer + Handlebars template
   - Header: "SAMPLE INVOICE" in large text
   - Footer: "FOR CUSTOMS PURPOSES ONLY" watermark / bold declaration
   - Show FOB/CIF breakdown table at bottom
   - All standard org/buyer/shipping fields
   - Upload to S3; return signed URL
6. Send email endpoint: attach PDF, send via SMTP

FRONTEND — apps/web/app/(dashboard)/exports/sample-invoices/:

1. page.tsx: master-detail layout (same pattern as PI/CI)

2. SampleInvoiceForm:
   - All standard shipping fields in 3-column grid
   - Line items table with item search typeahead
   - FOB/CIF section at bottom:
     - FOB Value: read-only, auto-computed from line items
     - Freight Charges: editable number input
     - Insurance Charges: editable number input
     - CIF Value: read-only, auto-computed
   - Declaration textarea: pre-filled with default sample text, user can edit
   - Document header note: info banner "This document will be generated with 'FOR CUSTOMS PURPOSES ONLY' header"

3. Actions: Download PDF, Send via Email, Cancel

Use TanStack Query. Invalidate ["sample-invoices", orgId] on mutations.
```
