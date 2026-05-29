# Feature: Bill of Exchange

## Title

Bill of Exchange — Documentary Credit Instrument (D/P and D/A)

## Description

A Bill of Exchange (BoE) is a financial instrument directing the buyer to pay a specified amount either on demand (D/P — Documents against Payment) or on a future date (D/A — Documents against Acceptance). Used under documentary collection method. Features "Smart Auto-Fill" that populates fields from the linked Commercial Invoice. The document must be precisely formatted for bank acceptance.

---

## User Flow

```
1. Create Bill of Exchange
   Exports → Export Documents → Bill of Exchange → Create Now
   → Auto-assigns BoE number (e.g., BOE-26-27-001)
   → Select CI → Smart Auto-Fill populates:
     drawee (buyer), amount in words & figures, payment terms, port details
   → Select Instrument Type: D/P (on sight) or D/A (on acceptance, select tenor)
   → Review and edit all fields
   → Save or Generate PDF

2. D/P vs D/A
   D/P (Documents against Payment):
   → Amount payable at sight
   → "PAY TO THE ORDER OF [Bank Name] THE SUM OF [amount in words]"

   D/A (Documents against Acceptance):
   → Tenor: 30/60/90 days after sight
   → "PAY AT 90 DAYS AFTER SIGHT TO THE ORDER OF..."

3. Download / Send
   BoE detail → Download PDF
```

---

## Database Schema (Prisma)

```prisma
model BillOfExchange {
  id                  String    @id @default(uuid())
  organizationId      String
  boeNumber           String    @unique   // BOE-26-27-001
  ciId                String?             // Linked CI
  status              BOEStatus @default(DRAFT)
  date                DateTime  @default(now())
  instrumentType      String    @default("DP")  // DP or DA
  tenorDays           Int?                // For DA: 30, 60, 90 days

  // Drawer (Exporter)
  drawerName          String?
  drawerAddress       String?

  // Drawee (Buyer)
  draweeName          String?
  draweeAddress       String?

  // Payee (Bank)
  payeeBankName       String?
  payeeBankAddress    String?

  // Amount
  currency            String    @default("USD")
  amountFigures       Decimal   @db.Decimal(14, 2)
  amountWords         String?   // auto-generated: "US Dollars Forty-Five Thousand Only"

  // Reference details
  ciNumber            String?
  billOfLadingNo      String?
  portOfLoading       String?
  portOfDischarge     String?
  exportersRef        String?

  // Payment clause
  paymentClause       String?   @db.Text  // Full legal text

  notes               String?
  fileUrl             String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  organization        Organization      @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
  @@map("bills_of_exchange")
}

enum BOEStatus {
  DRAFT
  GENERATED
  SUBMITTED
  ACCEPTED
  PAID
  DISHONOURED
  CANCELLED
}
```

---

## API Routes (NestJS)

```
GET    /api/v1/bills-of-exchange              → List (filter: year, buyer, status, type)
POST   /api/v1/bills-of-exchange              → Create
GET    /api/v1/bills-of-exchange/:id          → Detail
PATCH  /api/v1/bills-of-exchange/:id          → Update
DELETE /api/v1/bills-of-exchange/:id          → Soft delete

POST   /api/v1/bills-of-exchange/:id/generate-pdf  → Generate PDF → S3
POST   /api/v1/bills-of-exchange/:id/send-email    → Send via email
PATCH  /api/v1/bills-of-exchange/:id/status        → Update status

GET    /api/v1/bills-of-exchange/auto-fill/:ciId   → Smart auto-fill from CI data
```

---

## Smart Auto-Fill Logic

```ts
// GET /bills-of-exchange/auto-fill/:ciId
// Returns pre-filled BoE data from the CI

async function autoFillFromCI(ciId: string) {
  const ci = await prisma.commercialInvoice.findUnique({
    where: { id: ciId },
    include: { buyer: true, organization: true },
  });

  return {
    ciNumber:       ci.ciNumber,
    currency:       ci.currency,
    amountFigures:  ci.totalAmount,
    amountWords:    numberToWords(ci.totalAmount, ci.currency),
    drawerName:     ci.organization.name,
    drawerAddress:  formatAddress(ci.organization),
    draweeName:     ci.buyer?.companyName || ci.buyerName,
    draweeAddress:  ci.buyer?.address || ci.buyerAddress,
    payeeBankName:  ci.organization.bankName,
    billOfLadingNo: ci.billOfLadingNo,
    portOfLoading:  ci.portOfLoading,
    portOfDischarge: ci.portOfDischarge,
    exportersRef:   ci.exportersRef,
  };
}

// Number to words: 45230.00 → "US Dollars Forty-Five Thousand Two Hundred and Thirty Only"
function numberToWords(amount: Decimal, currency: string): string { ... }
```

---

## Payment Clause Templates

```ts
const PAYMENT_CLAUSES = {
  DP: (payee: string) => `AT SIGHT PAY TO THE ORDER OF ${payee} THE SUM OF`,
  DA: (payee: string, tenor: number) =>
    `AT ${tenor} DAYS AFTER SIGHT PAY TO THE ORDER OF ${payee} THE SUM OF`,
};
```

---

## UI Screens / Components

| Screen   | Route                        | Components             |
| -------- | ---------------------------- | ---------------------- |
| BoE list | `Exports → Bill of Exchange` | Master-detail layout   |
| BoE form | Right panel                  | `<BillOfExchangeForm>` |

**Form layout:**

```
[ BILL OF EXCHANGE ]                        [ BOE No: BOE-26-27-001 ]
                                            [ Date: 01/01/2026 ]

[ Link CI: [CI-26-27-012 ▼] ] [Smart Auto-Fill ✨ ]

Instrument Type: [ ● D/P (At Sight)   ○ D/A (At Tenor) ]
                 [                     Tenor: [90 ▼] Days After Sight ]

DRAWER (Exporter):                     DRAWEE (Buyer):
[ Company Name (auto-filled)    ]      [ Company Name (auto-filled) ]
[ Address (auto-filled)         ]      [ Address (auto-filled)      ]

PAYEE BANK:
[ Bank Name (from org profile)  ]
[ Bank Address                  ]

AMOUNT:
[ Currency: USD ▼ ] [ Amount in Figures: $45,230.00 (auto-filled from CI) ]
[ Amount in Words: "US Dollars Forty-Five Thousand..." (auto-generated) ]

PAYMENT CLAUSE (auto-generated, editable):
[ "AT SIGHT PAY TO THE ORDER OF [Bank Name] THE SUM OF USD 45,230.00" ]

Reference Details:
[ CI Number ] [ B/L Number ] [ Port of Loading ] [ Port of Discharge ]
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/bill-of-exchange.ts

export const billOfExchangeSchema = z
  .object({
    ciId: z.string().uuid().optional(),
    date: z.string().min(1, 'Date required'),
    instrumentType: z.enum(['DP', 'DA']).default('DP'),
    tenorDays: z
      .number()
      .int()
      .refine((v) => [30, 60, 90].includes(v))
      .optional(),

    drawerName: z.string().min(1, 'Drawer name required').max(200),
    drawerAddress: z.string().max(500).optional(),
    draweeName: z.string().min(1, 'Drawee name required').max(200),
    draweeAddress: z.string().max(500).optional(),
    payeeBankName: z.string().min(1, 'Payee bank required').max(200),
    payeeBankAddress: z.string().max(500).optional(),

    currency: z.enum(['USD', 'EUR', 'GBP', 'AED']).default('USD'),
    amountFigures: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Amount required'),
    amountWords: z.string().max(500).optional(),

    ciNumber: z.string().max(50).optional(),
    billOfLadingNo: z.string().max(100).optional(),
    portOfLoading: z.string().max(100).optional(),
    portOfDischarge: z.string().max(100).optional(),
    paymentClause: z.string().max(1000).optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((d) => d.instrumentType === 'DP' || (d.instrumentType === 'DA' && d.tenorDays), {
    message: 'Tenor days required for D/A instrument',
    path: ['tenorDays'],
  });
```

---

## LLM Development Prompt

```
Build the Bill of Exchange feature for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/bills-of-exchange/:

1. BillsOfExchangeModule with full CRUD
2. BOE number auto-generation: BOE-YY-YY-SEQ (financial year aware)
3. Smart Auto-Fill endpoint:
   GET /bills-of-exchange/auto-fill/:ciId
   → Fetch CI + organization + buyer
   → Return pre-filled BoE fields (drawer, drawee, payee bank, amount, ports, CI/BL numbers)
4. Number to words conversion:
   - Implement numberToWords(amount, currency) utility in packages/utils/src/number-words.ts
   - Handle USD, EUR, GBP, AED with proper English word representation
   - e.g., 45230.50 → "US Dollars Forty-Five Thousand Two Hundred Thirty and Cents Fifty Only"
5. Payment clause auto-generation on save:
   DP: "AT SIGHT PAY TO THE ORDER OF {payeeBankName} THE SUM OF {currency} {amountFigures} ({amountWords})"
   DA: "AT {tenorDays} DAYS AFTER SIGHT PAY TO THE ORDER OF {payeeBankName} THE SUM OF..."
6. PDF generation:
   - Puppeteer + Handlebars template: templates/bill-of-exchange.hbs
   - Must follow standard BoE format: drawer top-right, drawee block, payment clause prominent
   - Upload to S3; return signed URL

FRONTEND — apps/web/app/(dashboard)/exports/bills-of-exchange/:

1. page.tsx: master-detail layout (same pattern)

2. BillOfExchangeForm:
   - "Link CI" dropdown at top → on select → click "Smart Auto-Fill ✨" button
     → calls auto-fill endpoint → fills all fields with transition animation
   - Instrument Type: RadioGroup (D/P at sight / D/A at tenor)
   - D/A tenor: Select (30 / 60 / 90 days) — shown only when DA is selected
   - Amount in figures: number input
   - Amount in words: auto-generated when amount changes (via debounced onBlur)
   - Payment clause: pre-generated text in Textarea — user can edit

3. Auto-fill animation: when Smart Auto-Fill response arrives, animate each field fill with 100ms stagger

4. Actions: Download PDF, Send via Email, Status update (SUBMITTED/ACCEPTED/PAID/DISHONOURED)

Use TanStack Query. Invalidate ["bills-of-exchange", orgId] on mutations.
```
