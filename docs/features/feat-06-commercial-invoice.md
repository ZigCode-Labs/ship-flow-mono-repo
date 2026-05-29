# Feature: Commercial Invoice

## Title

Commercial Invoice (CI) — Primary Export Document for Customs & Payment

## Description

The Commercial Invoice is the most critical export document — used by customs authorities for assessment and by banks for payment processing (LC/TT). It can be created from scratch or converted from a Proforma Invoice. Supports container details, Manage Payments sub-screen, and PDF generation. Status lifecycle: DRAFT → SENT → CONVERTED (post-shipment docs generated).

---

## User Flow

```
1. Create Commercial Invoice
   Exports → Export Documents → Commercial Invoices → Create Now
   → Auto-assigns CI number (e.g., CI-26-27-001)
   → Select Buyer → auto-fills buyer address, currency, incoterms
   → Fill shipping details (vessel, BL no., ports, container)
   → Add line items (from Items Catalog or converted from PI)
   → Review Bank Details (auto-filled from org profile)
   → Set payment terms
   → Save Draft or Save + Generate PDF

2. Convert from PI
   PI list → "Convert to CI" button
   → Creates CI with all PI data pre-filled
   → PI status set to CONVERTED

3. Manage Payments
   CI detail → "Manage Payments" tab
   → Add payment record: USD amount, INR received, exchange rate, bank charges, payment date
   → Total paid auto-calculated; balance shown
   → Payment status auto-updates (PARTIAL → PAID)

4. Generate PDF
   CI detail → Download PDF → Puppeteer renders template → S3 → download

5. Send via Email
   CI detail → Send via Email → dialog with To/CC/Subject/Message
```

---

## Database Schema (Prisma)

```prisma
model CommercialInvoice {
  id                  String    @id @default(uuid())
  organizationId      String
  ciNumber            String    @unique   // CI-26-27-001
  status              CIStatus  @default(DRAFT)
  date                DateTime  @default(now())
  exportersRef        String?
  buyerOrderNo        String?
  buyerOrderDate      DateTime?
  piId                String?             // Source PI if converted

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
  portOfLoading       String?
  portOfDischarge     String?
  portOfFinalDest     String?
  billOfLadingNo      String?
  containerNo         String?
  containerSize       String?   // 20FT, 40FT, 40HC
  sealNo              String?
  descriptionOfGoods  String?

  discountType        String?   // PERCENT or FLAT
  discountValue       Decimal?  @db.Decimal(10, 2)
  discountAmount      Decimal?  @db.Decimal(12, 2)
  subtotal            Decimal   @default(0) @db.Decimal(14, 2)
  totalAmount         Decimal   @default(0) @db.Decimal(14, 2)
  paidAmount          Decimal   @default(0) @db.Decimal(14, 2)
  balanceAmount       Decimal   @default(0) @db.Decimal(14, 2)

  notes               String?
  fileUrl             String?
  sentAt              DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  organization        Organization      @relation(fields: [organizationId], references: [id])
  buyer               ExportBuyer?      @relation(fields: [buyerId], references: [id])
  lineItems           CILineItem[]
  payments            CIPayment[]

  @@index([organizationId])
  @@map("commercial_invoices")
}

model CILineItem {
  id           String  @id @default(uuid())
  ciId         String
  itemId       String?
  productCode  String?
  description  String
  hsnCode      String?
  unitQty      Int     @default(1)
  unit         String  @default("PCS")
  unitPrice    Decimal @db.Decimal(12, 2)
  amount       Decimal @db.Decimal(14, 2)
  sortOrder    Int     @default(0)

  commercialInvoice CommercialInvoice @relation(fields: [ciId], references: [id], onDelete: Cascade)
  item              Item?             @relation(fields: [itemId], references: [id])

  @@map("ci_line_items")
}

model CIPayment {
  id              String    @id @default(uuid())
  ciId            String
  usdAmount       Decimal   @db.Decimal(14, 2)
  inrReceived     Decimal?  @db.Decimal(14, 2)
  exchangeRate    Decimal?  @db.Decimal(10, 4)
  bankCharges     Decimal?  @db.Decimal(12, 2)
  paymentDate     DateTime
  paymentMode     String?   // TT, LC, DP, DA
  bankReference   String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  commercialInvoice CommercialInvoice @relation(fields: [ciId], references: [id], onDelete: Cascade)

  @@map("ci_payments")
}

enum CIStatus {
  DRAFT
  SENT
  PARTIALLY_PAID
  PAID
  CANCELLED
}
```

---

## API Routes (NestJS)

```
GET    /api/v1/commercial-invoices              → List (filter: year, buyer, status)
POST   /api/v1/commercial-invoices              → Create
GET    /api/v1/commercial-invoices/:id          → Detail (with line items + payments)
PATCH  /api/v1/commercial-invoices/:id          → Update
DELETE /api/v1/commercial-invoices/:id          → Soft delete / Cancel

POST   /api/v1/commercial-invoices/:id/generate-pdf  → Generate PDF → S3
POST   /api/v1/commercial-invoices/:id/send-email    → Send via email
PATCH  /api/v1/commercial-invoices/:id/status        → Update status

GET    /api/v1/commercial-invoices/:id/payments      → List payments
POST   /api/v1/commercial-invoices/:id/payments      → Add payment
PATCH  /api/v1/commercial-invoices/:id/payments/:pid → Update payment
DELETE /api/v1/commercial-invoices/:id/payments/:pid → Delete payment
```

---

## CI Number Auto-Generation

```ts
// Format: CI-{FY_SHORT}-{SEQ}  e.g., CI-26-27-001
async function generateCINumber(orgId: string, date: Date): Promise<string> {
  const year = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  const fyShort = `${String(year).slice(2)}-${String(year + 1).slice(2)}`;
  const count = await prisma.commercialInvoice.count({
    where: { organizationId: orgId, ciNumber: { startsWith: `CI-${fyShort}` } },
  });
  return `CI-${fyShort}-${String(count + 1).padStart(3, '0')}`;
}
```

---

## UI Screens / Components

| Screen            | Route                           | Components                                                                         |
| ----------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| CI list           | `Exports → Commercial Invoices` | Left panel: searchable list with year/buyer/status filter. Right panel: CI preview |
| CI detail / edit  | Same page, right panel          | `<CommercialInvoiceForm>` — tabs: Details, Line Items, Payments                    |
| Payments tab      | Sub-section                     | Payment table + `<AddPaymentDialog>` with USD/INR/rate/charges                     |
| Send email dialog | Modal                           | To, CC, Subject, Message body                                                      |

**Form layout:**

```
[ Exporter (auto-filled)  ] [ CI Number & Date     ] [ Exporters Reference ]
[ Buyer Order No & Date   ]                           [ Consignee (If Any)  ]
[ Buyer (dropdown)        ] [ Currency & Rate      ] [ Terms of Delivery   ]
[ Pre Carriage By         ] [ Country of Origin    ] [ Country of Final Dest]
[ Vessel / Flight No      ] [ B/L Number           ] [ Container No / Size ]
[ Seal No                 ] [ Port of Loading      ] [ Port of Discharge   ]
[ Port of Final Dest      ] [ Terms of Payment     ] [ Place of Receipt    ]
                    [ Description of Goods (text area)                     ]
[ Line Items Table: Code | Description | HSN | Unit Qty | Unit | Price | Amount ]
[ + Add Line ]
[ Bank Details (auto-filled) ] [ Consignment Total                 ]
                               [ Discount (qty stepper + %)        ]
                               [ TOTAL                             ]
                               [ Balance Due: TOTAL - Paid         ]

Payments Tab:
[ Date | Mode | USD Amount | INR Received | Exchange Rate | Bank Charges | Actions ]
[ + Add Payment ]
[ Total Paid | Balance Due ]
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/commercial-invoice.ts

export const ciLineItemSchema = z.object({
  itemId: z.string().uuid().optional(),
  productCode: z.string().max(50).optional(),
  description: z.string().min(1, 'Description required').max(500),
  hsnCode: z
    .string()
    .regex(/^[0-9]{4,8}$/)
    .optional()
    .or(z.literal('')),
  unitQty: z.number().int().min(1),
  unit: z.string().default('PCS'),
  unitPrice: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Price required'),
});

export const commercialInvoiceSchema = z.object({
  date: z.string().min(1, 'Date required'),
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
  billOfLadingNo: z.string().max(100).optional(),
  containerNo: z.string().max(50).optional(),
  containerSize: z.enum(['20FT', '40FT', '40HC']).optional(),
  sealNo: z.string().max(50).optional(),
  portOfLoading: z.string().max(100).optional(),
  portOfDischarge: z.string().max(100).optional(),
  portOfFinalDest: z.string().max(100).optional(),
  termsOfPayment: z.string().max(200).optional(),
  descriptionOfGoods: z.string().max(500).optional(),
  lineItems: z.array(ciLineItemSchema).min(1, 'Add at least one line item'),
  discountType: z.enum(['PERCENT', 'FLAT']).optional(),
  discountValue: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  notes: z.string().max(1000).optional(),
});

export const ciPaymentSchema = z.object({
  usdAmount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Amount required'),
  inrReceived: z
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
  paymentDate: z.string().min(1, 'Payment date required'),
  paymentMode: z.enum(['TT', 'LC', 'DP', 'DA', 'CASH', 'CHEQUE']).optional(),
  bankReference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});
```

---

## LLM Development Prompt

```
Build the Commercial Invoice (CI) feature for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/commercial-invoices/:

1. CommercialInvoicesModule with full CRUD
2. CI number auto-generation: financial-year-aware (CI-YY-YY-SEQ), per org per FY
3. On create/update: recalculate subtotal, apply discount, compute totalAmount
4. Recalculate paidAmount/balanceAmount after every payment add/update/delete
5. Auto-update CI status: if paidAmount === 0 → DRAFT/SENT, if paidAmount < total → PARTIALLY_PAID, if paidAmount >= total → PAID
6. Convert from PI endpoint: copy all PI fields (buyer, line items, terms) into new CI; mark PI as CONVERTED
7. PDF generation:
   - POST /commercial-invoices/:id/generate-pdf
   - Puppeteer + Handlebars template: templates/commercial-invoice.hbs
   - Fetch org (logo, bank, IEC, GST, signature), buyer, line items
   - Upload to S3: documents/{orgId}/CI/{ciId}/CI-{number}.pdf
   - Return signed URL
8. Send email: POST /commercial-invoices/:id/send-email
   - { to, cc?, subject, message } — attach PDF, send via SMTP (nodemailer)
   - Update sentAt, status → SENT if DRAFT

FRONTEND — apps/web/app/(dashboard)/exports/commercial-invoices/:

1. page.tsx: master-detail layout
   - Left panel (280px): list with year/buyer/status filters, "Create Now" button
   - Each row: buyer name, CI number, date, amount, status badge, payment bar (% paid)
   - Right panel: CI form (tabs: Details, Payments)

2. CI Form (Details tab):
   - All fields from schema in 3-column grid layout
   - Buyer dropdown: on select → auto-fill currency, termsOfDelivery, portOfDischarge
   - Container fields: containerNo, containerSize, sealNo in a row
   - Line items: dynamic array (useFieldArray), item search typeahead
   - Real-time totals: subtotal, discount, total, balance

3. Payments Tab:
   - Table: Date | Mode | USD Amount | INR Received | Rate | Bank Charges | Actions
   - "Add Payment" button → `<AddPaymentDialog>` with ciPaymentSchema
   - Auto-show balance remaining at top: "Balance Due: $1,234.56"
   - Payment mode badges: TT (blue), LC (green), DP/DA (orange)

4. Actions toolbar: Download PDF, Send via Email, Convert from PI indicator, Cancel
   - When status=PAID: show green "PAID" badge, disable editing

Use TanStack Query. Invalidate ["commercial-invoices", orgId] on mutations.
```
