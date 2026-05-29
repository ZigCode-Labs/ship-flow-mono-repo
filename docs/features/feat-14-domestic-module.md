# Feature: Domestic Module

## Title

Domestic Business — Tax Invoices, Proforma, Credit Notes & Delivery Challans (GST)

## Description

The Domestic Module handles all sales within India with GST compliance. Covers Domestic Proforma Invoices (DPI), Tax Invoices with CGST/SGST/IGST breakdown based on buyer state, Credit Notes for returns/corrections, and Delivery Challans. Domestic buyers have their own directory. Document series numbers are configurable in Domestic Settings.

---

## User Flow

```
1. Configure Domestic Settings
   Domestic → Settings
   → Set series prefixes and starting numbers for:
     DI (Domestic Invoice), DPI (Domestic Proforma), CN (Credit Note), DC (Delivery Challan)
   → Save

2. Add Domestic Buyer
   Domestic → Buyers → Add Buyer
   → Fill: Name, Company, GSTIN (15-char GST), State, City, Address, Payment Terms
   → Save → auto-determine GST type (IGST if different state, CGST+SGST if same state)

3. Create Tax Invoice
   Domestic → Tax Invoices → Create New
   → Select Domestic Buyer → auto-fills address, GSTIN, GST type
   → Add line items: item, HSN, quantity, rate
   → GST auto-calculated per line:
     If buyer in same state (Gujarat): CGST 9% + SGST 9%
     If buyer in different state: IGST 18%
   → Totals: Subtotal, GST Amount, Grand Total (+ Total in Words)
   → Save or Generate PDF

4. Create Credit Note
   Domestic → Credit Notes → Create New
   → Link to original Tax Invoice
   → Enter reason: RETURN/DISCOUNT/CORRECTION
   → Adjust line items or amounts
   → GST reversed automatically

5. Create Delivery Challan
   Domestic → Delivery Challans → Create New
   → Link to Tax Invoice or standalone
   → Vehicle number, driver, dispatch time
   → Items and quantities
   → Generate PDF
```

---

## Database Schema (Prisma)

```prisma
model DomesticSettings {
  id                  String    @id @default(uuid())
  organizationId      String    @unique
  diPrefix            String    @default("INV")
  diStartNumber       Int       @default(1)
  dpiPrefix           String    @default("DPI")
  dpiStartNumber      Int       @default(1)
  cnPrefix            String    @default("CN")
  cnStartNumber       Int       @default(1)
  dcPrefix            String    @default("DC")
  dcStartNumber       Int       @default(1)
  gstinNumber         String?   // Org GSTIN
  orgState            String?   // e.g., "GJ" for Gujarat — determines CGST/SGST vs IGST
  defaultGstRate      Decimal   @default(18) @db.Decimal(5, 2)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  organization        Organization @relation(fields: [organizationId], references: [id])
  @@map("domestic_settings")
}

model DomesticBuyer {
  id              String   @id @default(uuid())
  organizationId  String
  contactName     String
  companyName     String?
  email           String?
  phone           String?
  gstin           String?             // 15-char GST identification number
  panNumber       String?
  state           String?             // State code: GJ, MH, DL, etc.
  stateCode       String?             // 24 for Gujarat
  city            String?
  pinCode         String?
  address         String?
  paymentTerms    String?
  creditLimit     Decimal?  @db.Decimal(12, 2)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deletedAt       DateTime?

  organization    Organization  @relation(fields: [organizationId], references: [id])
  taxInvoices     DomesticInvoice[]
  creditNotes     CreditNote[]

  @@index([organizationId])
  @@map("domestic_buyers")
}

model DomesticInvoice {
  id              String        @id @default(uuid())
  organizationId  String
  invoiceNumber   String        @unique   // INV-2025-001
  buyerId         String?
  buyerName       String?
  buyerAddress    String?
  buyerGSTIN      String?
  buyerState      String?
  status          DIStatus      @default(DRAFT)
  invoiceDate     DateTime      @default(now())
  dueDate         DateTime?
  placeOfSupply   String?
  gstType         GSTType       @default(IGST)   // CGST_SGST or IGST

  subtotal        Decimal       @default(0) @db.Decimal(14, 2)
  cgstAmount      Decimal       @default(0) @db.Decimal(12, 2)
  sgstAmount      Decimal       @default(0) @db.Decimal(12, 2)
  igstAmount      Decimal       @default(0) @db.Decimal(12, 2)
  totalGst        Decimal       @default(0) @db.Decimal(12, 2)
  grandTotal      Decimal       @default(0) @db.Decimal(14, 2)
  totalInWords    String?       // "Rupees Forty-Five Thousand Two Hundred Only"

  paymentTerms    String?
  notes           String?
  fileUrl         String?
  paidAmount      Decimal       @default(0) @db.Decimal(14, 2)
  paidAt          DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  deletedAt       DateTime?

  organization    Organization  @relation(fields: [organizationId], references: [id])
  buyer           DomesticBuyer? @relation(fields: [buyerId], references: [id])
  lineItems       DILineItem[]
  creditNotes     CreditNote[]

  @@index([organizationId])
  @@map("domestic_invoices")
}

model DILineItem {
  id           String  @id @default(uuid())
  invoiceId    String
  itemId       String?
  description  String
  hsnCode      String?
  quantity     Int     @default(1)
  unit         String  @default("PCS")
  unitPrice    Decimal @db.Decimal(12, 2)
  amount       Decimal @db.Decimal(14, 2)
  gstRate      Decimal @db.Decimal(5, 2)
  cgstRate     Decimal @default(0) @db.Decimal(5, 2)
  sgstRate     Decimal @default(0) @db.Decimal(5, 2)
  igstRate     Decimal @default(0) @db.Decimal(5, 2)
  cgstAmount   Decimal @default(0) @db.Decimal(12, 2)
  sgstAmount   Decimal @default(0) @db.Decimal(12, 2)
  igstAmount   Decimal @default(0) @db.Decimal(12, 2)
  sortOrder    Int     @default(0)

  invoice      DomesticInvoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  item         Item?           @relation(fields: [itemId], references: [id])

  @@map("di_line_items")
}

model CreditNote {
  id              String    @id @default(uuid())
  organizationId  String
  cnNumber        String    @unique   // CN-2025-001
  invoiceId       String?             // Linked original invoice
  buyerId         String?
  buyerName       String?
  reason          CNReason
  status          CNStatus  @default(DRAFT)
  date            DateTime  @default(now())
  subtotal        Decimal   @default(0) @db.Decimal(14, 2)
  cgstAmount      Decimal   @default(0) @db.Decimal(12, 2)
  sgstAmount      Decimal   @default(0) @db.Decimal(12, 2)
  igstAmount      Decimal   @default(0) @db.Decimal(12, 2)
  totalGst        Decimal   @default(0) @db.Decimal(12, 2)
  grandTotal      Decimal   @default(0) @db.Decimal(14, 2)
  notes           String?
  fileUrl         String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  organization    Organization    @relation(fields: [organizationId], references: [id])
  originalInvoice DomesticInvoice? @relation(fields: [invoiceId], references: [id])
  buyer           DomesticBuyer?  @relation(fields: [buyerId], references: [id])
  lineItems       CNLineItem[]

  @@index([organizationId])
  @@map("credit_notes")
}

model CNLineItem {
  id          String  @id @default(uuid())
  cnId        String
  description String
  hsnCode     String?
  quantity    Int     @default(1)
  unit        String  @default("PCS")
  unitPrice   Decimal @db.Decimal(12, 2)
  amount      Decimal @db.Decimal(14, 2)
  gstRate     Decimal @db.Decimal(5, 2)
  sortOrder   Int     @default(0)

  creditNote  CreditNote @relation(fields: [cnId], references: [id], onDelete: Cascade)
  @@map("cn_line_items")
}

model DeliveryChalllan {
  id              String    @id @default(uuid())
  organizationId  String
  dcNumber        String    @unique   // DC-2025-001
  invoiceId       String?
  buyerName       String?
  buyerAddress    String?
  status          DCStatus  @default(DRAFT)
  date            DateTime  @default(now())
  vehicleNumber   String?
  driverName      String?
  dispatchTime    DateTime?
  deliveryAddress String?
  purpose         String?   // SUPPLY, RETURN, REPAIR, EXHIBITION
  notes           String?
  fileUrl         String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?

  organization    Organization @relation(fields: [organizationId], references: [id])
  lineItems       DCLineItem[]

  @@index([organizationId])
  @@map("delivery_challans")
}

model DCLineItem {
  id          String  @id @default(uuid())
  dcId        String
  description String
  hsnCode     String?
  quantity    Int     @default(1)
  unit        String  @default("PCS")
  sortOrder   Int     @default(0)

  deliveryChalllan DeliveryChalllan @relation(fields: [dcId], references: [id], onDelete: Cascade)
  @@map("dc_line_items")
}

enum GSTType {
  CGST_SGST
  IGST
}

enum DIStatus {
  DRAFT
  SENT
  PARTIALLY_PAID
  PAID
  CANCELLED
}

enum CNReason {
  RETURN
  DISCOUNT
  CORRECTION
  OTHER
}

enum CNStatus {
  DRAFT
  ISSUED
  CANCELLED
}

enum DCStatus {
  DRAFT
  DISPATCHED
  DELIVERED
  CANCELLED
}
```

---

## GST Calculation Logic

```ts
// Determine GST type based on buyer state vs org state
function getGSTType(orgState: string, buyerState: string): GSTType {
  return orgState === buyerState ? GSTType.CGST_SGST : GSTType.IGST;
}

// Calculate per-line-item GST
function calcLineItemGST(amount: number, gstRate: number, gstType: GSTType) {
  if (gstType === GSTType.IGST) {
    return { cgst: 0, sgst: 0, igst: (amount * gstRate) / 100 };
  } else {
    const half = gstRate / 2;
    return { cgst: (amount * half) / 100, sgst: (amount * half) / 100, igst: 0 };
  }
}
```

---

## API Routes (NestJS)

```
# Settings
GET    /api/v1/domestic/settings         → Get domestic settings
PATCH  /api/v1/domestic/settings         → Update settings

# Domestic Buyers
GET    /api/v1/domestic/buyers
POST   /api/v1/domestic/buyers
GET    /api/v1/domestic/buyers/:id
PATCH  /api/v1/domestic/buyers/:id
DELETE /api/v1/domestic/buyers/:id

# Tax Invoices
GET    /api/v1/domestic/invoices
POST   /api/v1/domestic/invoices
GET    /api/v1/domestic/invoices/:id
PATCH  /api/v1/domestic/invoices/:id
DELETE /api/v1/domestic/invoices/:id
POST   /api/v1/domestic/invoices/:id/generate-pdf
POST   /api/v1/domestic/invoices/:id/send-email

# Credit Notes
GET    /api/v1/domestic/credit-notes
POST   /api/v1/domestic/credit-notes
GET    /api/v1/domestic/credit-notes/:id
PATCH  /api/v1/domestic/credit-notes/:id
DELETE /api/v1/domestic/credit-notes/:id
POST   /api/v1/domestic/credit-notes/:id/generate-pdf

# Delivery Challans
GET    /api/v1/domestic/delivery-challans
POST   /api/v1/domestic/delivery-challans
GET    /api/v1/domestic/delivery-challans/:id
PATCH  /api/v1/domestic/delivery-challans/:id
DELETE /api/v1/domestic/delivery-challans/:id
POST   /api/v1/domestic/delivery-challans/:id/generate-pdf
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/domestic.ts

const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const domesticBuyerSchema = z.object({
  contactName: z.string().min(1).max(100),
  companyName: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  gstin: z.string().regex(gstinRegex, 'Invalid GSTIN').optional().or(z.literal('')),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .optional()
    .or(z.literal('')),
  state: z.string().min(1, 'State required'),
  stateCode: z.string().max(3).optional(),
  city: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  paymentTerms: z.string().max(200).optional(),
});

export const diLineItemSchema = z.object({
  itemId: z.string().uuid().optional(),
  description: z.string().min(1).max(500),
  hsnCode: z
    .string()
    .regex(/^[0-9]{4,8}$/)
    .optional()
    .or(z.literal('')),
  quantity: z.number().int().min(1),
  unit: z.string().default('PCS'),
  unitPrice: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0),
  gstRate: z.enum(['0', '5', '12', '18', '28']).transform(Number),
});

export const domesticInvoiceSchema = z.object({
  invoiceDate: z.string().min(1),
  buyerId: z.string().uuid().optional(),
  placeOfSupply: z.string().min(1, 'Place of supply required'),
  lineItems: z.array(diLineItemSchema).min(1),
  paymentTerms: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});
```

---

## LLM Development Prompt

```
Build the Domestic Module for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/domestic/:

1. DomesticModule containing sub-modules: buyers, invoices, credit-notes, delivery-challans, settings

2. GST Calculation Service (shared across invoices and credit notes):
   getGSTType(orgState, buyerState) → CGST_SGST or IGST
   calcLineItemGST(amount, gstRate, gstType) → { cgstAmount, sgstAmount, igstAmount }
   On each save, recalculate all line items and aggregate totals

3. Invoice number generation: use DomesticSettings.diPrefix + financial year + seq
   Same FY-aware logic as PI/CI number generation

4. Total in words: generate INR amount in words
   e.g., 45230.00 → "Rupees Forty-Five Thousand Two Hundred and Thirty Only"
   Use packages/utils/src/number-words.ts (add INR support)

5. Credit Note: on creation from invoice:
   Pre-fill buyer, gstType, and line items from original invoice
   GST amounts are reversed (negative)

6. PDF generation for all 4 document types:
   Tax Invoice: CGST/SGST or IGST columns, "Place of Supply" header, IEC/GSTIN in header
   Credit Note: "CREDIT NOTE" header, reason stated, original invoice reference
   Delivery Challan: vehicle/driver details, no GST amounts (transport document only)

FRONTEND — apps/web/app/(dashboard)/domestic/:

1. /settings/page.tsx: Settings form with 4 series configurations + GST defaults

2. /buyers/page.tsx:
   - Table with GSTIN column, State badge, credit limit
   - GSTIN auto-validation with format feedback
   - State select → auto-determines GST type when creating invoices

3. /invoices/page.tsx: Master-detail layout
   - GST Type indicator: "CGST+SGST" or "IGST" badge shown when buyer is selected
   - Line items table: HSN, Qty, Rate, GST Rate (5/12/18/28%), Amount, GST Amount
   - GST rate selection per line (some items may have different rates)
   - Totals section:
     Subtotal: ₹XX
     CGST (9%): ₹XX  (if same state)
     SGST (9%): ₹XX  (if same state)
     IGST (18%): ₹XX (if different state)
     Grand Total: ₹XX
   - Total in words auto-generated below totals

4. /credit-notes/page.tsx:
   - "Link to Invoice" dropdown → auto-fill buyer + line items
   - Reason dropdown: RETURN / DISCOUNT / CORRECTION / OTHER
   - Amount editable (partial credit note supported)

5. /delivery-challans/page.tsx:
   - Vehicle No, Driver Name, Dispatch Time fields
   - Purpose dropdown: SUPPLY / RETURN / REPAIR / EXHIBITION
   - Items table (no prices — this is a transport document)

Use TanStack Query. Invalidate ["domestic-invoices", orgId] etc. on mutations.
```
