# Feature: Proforma Invoice

## Title

Proforma Invoice (PI) — Pre-Shipment Quotation Document

## Description

A Proforma Invoice is the first export document sent to the international buyer before shipment to confirm pricing, terms, and initiate payment. It auto-fills from the organization profile, buyer details, and items catalog. Generates a downloadable/emailable PDF. Can be "converted" to a Commercial Invoice.

---

## User Flow

```
1. Create Proforma Invoice
   Exports → Export Documents → Proforma Invoices → Create Now
   → Auto-assigns PI number (e.g., PI-26-27-001)
   → Select Buyer → auto-fills buyer address, currency, incoterms
   → Fill shipping details (vessel, port of loading/discharge, pre-carriage)
   → Add line items: select from Items Catalog → auto-fills HSN, price, unit
   → Review Bank Details (auto-filled from org profile)
   → Consignment total auto-calculates
   → Add optional Discount
   → Save (Draft) or Save + Generate PDF

2. Convert to Commercial Invoice
   PI list row → "Converted" badge or button → creates CI pre-filled from PI data

3. Download / Send
   PI detail → Download PDF button
   PI detail → Send via Email button → email dialog with recipient, subject, message
```

---

## Database Schema (Prisma)

```prisma
model ProformaInvoice {
  id                  String    @id @default(uuid())
  organizationId      String
  piNumber            String    @unique   // PI-26-27-001
  status              PIStatus  @default(DRAFT)
  date                DateTime  @default(now())
  validUntil          DateTime?
  exportersRef        String?
  buyerOrderNo        String?
  buyerOrderDate      DateTime?
  buyerId             String?
  buyerName           String?             // snapshot
  buyerAddress        String?             // snapshot
  consigneeName       String?
  consigneeAddress    String?
  currency            String    @default("USD")
  exchangeRate        Decimal?  @db.Decimal(10, 4)
  termsOfDelivery     String?
  preCarriageBy       String?
  countryOfOrigin     String?   @default("India")
  countryOfFinalDest  String?
  vesselFlightNo      String?
  placeOfReceipt      String?
  termsOfPayment      String?
  paymentDetails      String?
  portOfLoading       String?
  portOfDischarge     String?
  portOfFinalDest     String?
  descriptionOfGoods  String?
  discountType        String?   // PERCENT or FLAT
  discountValue       Decimal?  @db.Decimal(10, 2)
  discountAmount      Decimal?  @db.Decimal(12, 2)
  subtotal            Decimal   @default(0) @db.Decimal(14, 2)
  totalAmount         Decimal   @default(0) @db.Decimal(14, 2)
  notes               String?
  fileUrl             String?
  convertedToCIId     String?
  sentAt              DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  organization        Organization @relation(fields: [organizationId], references: [id])
  buyer               ExportBuyer? @relation(fields: [buyerId], references: [id])
  lineItems           PILineItem[]

  @@index([organizationId])
  @@map("proforma_invoices")
}

model PILineItem {
  id           String  @id @default(uuid())
  piId         String
  itemId       String?
  productCode  String?
  description  String
  hsnCode      String?
  unitQty      Int     @default(1)
  unit         String  @default("PCS")
  unitPrice    Decimal @db.Decimal(12, 2)
  amount       Decimal @db.Decimal(14, 2)
  sortOrder    Int     @default(0)

  proformaInvoice ProformaInvoice @relation(fields: [piId], references: [id], onDelete: Cascade)
  item            Item?           @relation(fields: [itemId], references: [id])

  @@map("pi_line_items")
}

enum PIStatus {
  DRAFT
  SENT
  CONVERTED
  CANCELLED
}
```

---

## API Routes (NestJS)

```
GET    /api/v1/proforma-invoices              → List (filter: year, buyer, status)
POST   /api/v1/proforma-invoices              → Create
GET    /api/v1/proforma-invoices/:id          → Detail (with line items)
PATCH  /api/v1/proforma-invoices/:id          → Update
DELETE /api/v1/proforma-invoices/:id          → Soft delete / Cancel

POST   /api/v1/proforma-invoices/:id/generate-pdf → Generate PDF → S3 → return URL
POST   /api/v1/proforma-invoices/:id/send-email    → Send PDF via email
POST   /api/v1/proforma-invoices/:id/convert       → Convert to Commercial Invoice
PATCH  /api/v1/proforma-invoices/:id/status        → Update status (SENT, CANCELLED)
```

---

## PI Number Auto-Generation

```ts
// Format: PI-{FY_SHORT}-{SEQ}  e.g., PI-26-27-001
// FY: if current month >= April, FY = currentYear - (currentYear+1 short), else prev
async function generatePINumber(orgId: string, date: Date): Promise<string> {
  const year = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  const fyShort = `${String(year).slice(2)}-${String(year + 1).slice(2)}`;

  const count = await prisma.proformaInvoice.count({
    where: { organizationId: orgId, piNumber: { startsWith: `PI-${fyShort}` } },
  });
  return `PI-${fyShort}-${String(count + 1).padStart(3, '0')}`;
}
```

---

## UI Screens / Components

| Screen            | Route                         | Components                                                                  |
| ----------------- | ----------------------------- | --------------------------------------------------------------------------- |
| PI list           | `Exports → Proforma Invoices` | Left panel: searchable list with year/buyer filter. Right panel: PI preview |
| PI detail / edit  | Same page, right panel        | `<ProformaInvoiceForm>` with live PDF preview                               |
| Send email dialog | Modal                         | To, CC, Subject, Message body, attachment preview                           |

**Form layout (matches actual UI):**

```
[ Exporter (auto-filled) ] [ PI Number & Date ] [ Exporters Reference ]
[ Buyer Order No & Date  ]                       [ Consignee (If Any)  ]
[ Buyer (dropdown)       ] [ Currency & Rate   ] [ Terms of Delivery   ]
[ Pre Carriage By        ] [ Country of Origin ] [ Country of Final Dest]
[ Vessel / Flight No     ] [ Place of Receipt  ] [ Terms of Payment    ]
[ Port of Loading        ] [ Port of Discharge ] [ Port of Final Dest  ]
                    [ Description of Goods (text area)                  ]
[ Line Items Table: Code | Description | HSN | Unit Qty | Unit | Price | Amount ]
[ + Add Line ]
[ Bank Details (auto-filled) ] [ Consignment Total               ]
                               [ Discount (qty stepper + %)       ]
                               [ TOTAL                            ]
[ Signatory Company          ] [ Name of Authorized Signatory     ]
[ Authorized Signature image ]
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/proforma-invoice.ts

export const piLineItemSchema = z.object({
  itemId: z.string().uuid().optional(),
  productCode: z.string().max(50).optional(),
  description: z.string().min(1, 'Description required').max(500),
  hsnCode: z
    .string()
    .regex(/^[0-9]{4,8}$/)
    .optional()
    .or(z.literal('')),
  unitQty: z.number().int().min(1, 'Qty must be at least 1'),
  unit: z.string().default('PCS'),
  unitPrice: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Price required'),
});

export const proformaInvoiceSchema = z.object({
  date: z.string().min(1, 'Date required'),
  validUntil: z.string().optional(),
  exportersRef: z.string().max(100).optional(),
  buyerOrderNo: z.string().max(100).optional(),
  buyerOrderDate: z.string().optional(),
  buyerId: z.string().uuid().optional(),
  consigneeName: z.string().max(200).optional(),
  consigneeAddress: z.string().max(500).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'AED']).default('USD'),
  exchangeRate: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  termsOfDelivery: z.string().max(200).optional(),
  preCarriageBy: z.string().max(100).optional(),
  countryOfOrigin: z.string().default('India'),
  countryOfFinalDest: z.string().max(100).optional(),
  vesselFlightNo: z.string().max(100).optional(),
  placeOfReceipt: z.string().max(100).optional(),
  termsOfPayment: z.string().max(200).optional(),
  portOfLoading: z.string().max(100).optional(),
  portOfDischarge: z.string().max(100).optional(),
  portOfFinalDest: z.string().max(100).optional(),
  descriptionOfGoods: z.string().max(500).optional(),
  lineItems: z.array(piLineItemSchema).min(1, 'Add at least one line item'),
  discountType: z.enum(['PERCENT', 'FLAT']).optional(),
  discountValue: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  notes: z.string().max(1000).optional(),
});
```

---

## PDF Generation

```
POST /api/v1/proforma-invoices/:id/generate-pdf

Server:
1. Fetch PI with all relations (org, buyer, line items)
2. Merge data into Handlebars template: templates/proforma-invoice.hbs
3. Puppeteer: launch headless Chrome → load HTML → page.pdf({ format: 'A4' })
4. Upload buffer to S3: documents/{orgId}/PI/{piId}/PI-{number}-v{version}.pdf
5. Save fileUrl + generatedAt to proforma_invoices table
6. Return { fileUrl, downloadUrl }
```

---

## LLM Development Prompt

```
Build the Proforma Invoice (PI) feature for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/proforma-invoices/:

1. ProformaInvoicesModule with full CRUD
2. PI number auto-generation: financial-year-aware (PI-YY-YY-SEQ), increment per org per FY
3. On create/update: recalculate subtotal = sum(lineItems[unitQty × unitPrice]), apply discount, set totalAmount
4. PDF generation:
   - GET /proforma-invoices/:id/generate-pdf
   - Use Puppeteer to render Handlebars template
   - Template at apps/api/src/modules/proforma-invoices/templates/proforma-invoice.hbs
   - Fetch org data (logo, signature, bank, address, IEC, GST)
   - Fetch buyer data (full address, VAT)
   - Build templateData JSON → render HBS → PDF buffer → S3 upload
   - Return signed S3 URL (15 min expiry for download, or public URL)
5. Convert to CI:
   - POST /proforma-invoices/:id/convert
   - Creates CommercialInvoice record with all PI data pre-filled
   - Sets PI status to CONVERTED, stores convertedToCIId
6. Send email:
   - POST /proforma-invoices/:id/send-email
   - Body: { to, cc?, subject, message }
   - Attaches PDF (generate if not exists), send via SMTP (nodemailer)
   - Update sentAt, status → SENT

FRONTEND — apps/web/app/(dashboard)/exports/proforma-invoices/:

1. page.tsx: master-detail layout
   - Left panel (280px): searchable list, year dropdown, buyer dropdown, "Create Now" button
   - Each list item: buyer name, PI number, date, amount, status badge (Draft/Converted/Sent)
   - Right panel: live PI form + preview

2. PI Form (right panel):
   - All fields from the schema mapped to exact form layout shown in UI
   - Buyer dropdown: on select → auto-fill currency, termsOfDelivery, portOfDischarge
   - Line items: dynamic array (useFieldArray) — "+ Add Line" button, delete row icon
   - Item search: typeahead dropdown in productCode field → fills description, HSN, price
   - Totals: computed in real-time as user types (subtotal, discount, total)
   - Discount: stepper (-/+) for quantity, % or flat toggle
   - Save button at top-right: POST/PATCH → show success toast

3. Actions toolbar (top right):
   - "Cannot Edit" (when status=CONVERTED), "+ Create Now", "↓ Download PDF", "✉ Send via Email", "🚫 Cancel"
   - Download PDF: calls generate-pdf endpoint → shows loading → opens PDF in new tab
   - Send via Email: opens Dialog with To/CC/Subject/Message fields

Use TanStack Query. On PI save: invalidate ["proforma-invoices", orgId].
```
