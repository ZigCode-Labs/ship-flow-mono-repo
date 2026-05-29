# Feature: Export Payment Tracking

## Title

Export Payment Tracking — USD Receivables with INR Bank Realization

## Description

Tracks payment receipts against Commercial Invoices. Each payment record captures the USD amount invoiced, INR amount actually received in the bank, exchange rate applied, and bank charges deducted. Supports payment modes (TT, LC, DP, DA). Shows outstanding balance and payment history per CI. Summary view across all invoices shows total outstanding in USD and INR equivalent.

---

## User Flow

```
1. View Payment Summary
   Exports → Payment Tracking
   → Table: all CIs with payment status (UNPAID / PARTIAL / PAID)
   → Filter: Year, Buyer, Status (All / Outstanding / Paid)
   → KPI bar: Total Invoiced, Total Received (USD), Total INR Received, Outstanding

2. Add Payment Against CI
   Payment list → CI row → "Add Payment" OR
   CI detail → Payments tab → Add Payment
   → Fill: USD Amount, INR Received, Exchange Rate, Bank Charges, Payment Date, Mode, Bank Reference
   → Save → balance recalculated; CI status auto-updated

3. Edit / Delete Payment
   Payment row → Edit icon → update fields
   Payment row → Delete → confirm → recalculate balance

4. Export Report
   Payments page → Export CSV → download all payment data
```

---

## Database Schema (Prisma)

```prisma
// CIPayment is defined in feat-06-commercial-invoice.md
// This feature adds a summary view on top of CIPayment

// For reference — the model used:
model CIPayment {
  id              String    @id @default(uuid())
  ciId            String
  usdAmount       Decimal   @db.Decimal(14, 2)
  inrReceived     Decimal?  @db.Decimal(14, 2)
  exchangeRate    Decimal?  @db.Decimal(10, 4)
  bankCharges     Decimal?  @db.Decimal(12, 2)
  netInrReceived  Decimal?  @db.Decimal(14, 2)   // inrReceived - bankCharges
  paymentDate     DateTime
  paymentMode     String?   // TT, LC, DP, DA
  bankReference   String?
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  commercialInvoice CommercialInvoice @relation(fields: [ciId], references: [id], onDelete: Cascade)

  @@index([ciId])
  @@map("ci_payments")
}
```

---

## API Routes (NestJS)

```
# Payment summary / list
GET    /api/v1/payments                              → List all CIs with payment status
GET    /api/v1/payments/summary                      → KPI totals (invoiced, received, outstanding)
GET    /api/v1/payments/export-csv                   → Download CSV

# Per-CI payment records (reuses CI payment sub-routes)
GET    /api/v1/commercial-invoices/:id/payments      → List payments for CI
POST   /api/v1/commercial-invoices/:id/payments      → Add payment
PATCH  /api/v1/commercial-invoices/:id/payments/:pid → Update payment
DELETE /api/v1/commercial-invoices/:id/payments/:pid → Delete payment
```

---

## KPI Summary Calculation

```ts
// GET /api/v1/payments/summary
interface PaymentSummary {
  totalInvoicedUSD: number; // sum(CI.totalAmount)
  totalReceivedUSD: number; // sum(CIPayment.usdAmount)
  totalOutstandingUSD: number; // totalInvoicedUSD - totalReceivedUSD
  totalInrReceived: number; // sum(CIPayment.inrReceived - bankCharges)
  paidCount: number; // count(CI where status=PAID)
  partialCount: number; // count(CI where status=PARTIALLY_PAID)
  unpaidCount: number; // count(CI where status=DRAFT or SENT)
}
```

---

## UI Screens / Components

| Screen           | Route                | Components              |
| ---------------- | -------------------- | ----------------------- |
| Payment list     | `Exports → Payments` | `<PaymentTrackingPage>` |
| Add/Edit payment | Dialog               | `<AddPaymentDialog>`    |

**Page layout:**

```
KPI Bar:
[ Total Invoiced: $45,230 ] [ Received: $38,400 ] [ Outstanding: $6,830 ] [ INR Received: ₹32,14,000 ]

Filters: [ Year ▼ ] [ Buyer ▼ ] [ Status: All ▼ ] [ Export CSV ]

Table:
┌──────────────┬───────────────┬──────────┬──────────────┬──────────────┬───────────────┬────────────┬─────────┐
│ CI Number    │ Buyer         │ Date     │ Invoice (USD) │ Paid (USD)   │ Balance (USD) │ Status     │ Actions │
├──────────────┼───────────────┼──────────┼──────────────┼──────────────┼───────────────┼────────────┼─────────┤
│ CI-26-27-001 │ ABC Intl      │ 01/01/26 │ $5,230.00    │ $5,230.00    │ $0.00         │ ✅ PAID    │ View    │
│ CI-26-27-002 │ XYZ Corp      │ 15/01/26 │ $3,800.00    │ $2,000.00    │ $1,800.00     │ 🟡 PARTIAL │ View +Pay│
│ CI-26-27-003 │ Global Trade  │ 01/02/26 │ $5,000.00    │ $0.00        │ $5,000.00     │ 🔴 UNPAID  │ Add Pay │
└──────────────┴───────────────┴──────────┴──────────────┴──────────────┴───────────────┴────────────┴─────────┘

Clicking a row expands payment history:
  Payment #1: 10/01/26 | TT | $3,000 | INR ₹2,52,000 | Rate: 84.00 | Charges: ₹500
  Payment #2: 14/01/26 | TT | $2,000 | INR ₹1,68,200 | Rate: 84.10 | Charges: ₹300
  [ + Add Payment ]
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/payment.ts

export const ciPaymentSchema = z.object({
  usdAmount: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'USD amount required'),
  inrReceived: z
    .string()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0))
    .optional(),
  exchangeRate: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  bankCharges: z
    .string()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0))
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
Build the Export Payment Tracking feature for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/payments/:

1. PaymentsModule (summary view + aggregations)
   The core CRUD lives in CommercialInvoicesModule; this module provides:
   - GET /payments → paginated list of all CIs with their paidAmount/balanceAmount
   - GET /payments/summary → aggregate KPIs (use Prisma aggregate queries)
   - GET /payments/export-csv → generate and stream CSV using csv-writer or similar

2. On CIPayment create/update/delete:
   Service recalculates CI totals:
     paidAmount    = sum(all payments for this CI)
     balanceAmount = totalAmount - paidAmount
     netInrReceived = inrReceived - (bankCharges ?? 0)
   Update CI.status:
     if paidAmount === 0: keep as-is (DRAFT/SENT)
     if 0 < paidAmount < totalAmount: PARTIALLY_PAID
     if paidAmount >= totalAmount: PAID
3. Summary endpoint uses Prisma groupBy + aggregate for performance

FRONTEND — apps/web/app/(dashboard)/exports/payments/:

1. page.tsx: Payment tracking page
   - KPI bar at top (4 cards): Total Invoiced, Received, Outstanding, INR Received
   - Filters: Year dropdown, Buyer dropdown, Status filter (radio: All / Outstanding / Paid)
   - "Export CSV" button (downloads via GET /payments/export-csv)

2. Expandable table:
   - Each row shows CI summary: number, buyer, date, invoice amount, paid, balance, status badge
   - Click row → expands inline to show payment history table:
       Date | Mode | USD Amount | INR Received | Exchange Rate | Bank Charges | Actions (edit/delete)
   - "Add Payment" inline button → opens `<AddPaymentDialog>` (ciPaymentSchema)

3. AddPaymentDialog:
   - Fields: Payment Date (DatePicker), Mode (Select), USD Amount, INR Received, Exchange Rate, Bank Charges, Bank Reference, Notes
   - Auto-calculate: Net INR = INR Received - Bank Charges (show read-only)
   - On submit: optimistic update to CI paidAmount and status badge

4. Status badge colors: PAID (green), PARTIALLY_PAID (amber), SENT (blue), DRAFT (gray)

Use TanStack Query. Invalidate ["commercial-invoices", orgId] and ["payments-summary"] on payment mutations.
```
