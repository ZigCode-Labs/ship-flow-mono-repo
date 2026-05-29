# Feature: Post-Shipment Documents

## Title

Post-Shipment Documents — Bank Submission Package (9-Document Checklist)

## Description

After a shipment departs, the exporter must submit a set of post-shipment documents to their bank to realize payment (especially under LC terms). These 9 documents form a checklist linked to a Commercial Invoice. Each document can be uploaded (from external sources) or generated within the system. Status tracking shows which documents are pending, uploaded, or submitted.

---

## User Flow

```
1. Open Post-Shipment Docs
   CI detail → "Post-Shipment Docs" button
   OR Exports → Post-Shipment Documents → select CI

2. Document Checklist
   → 9-document checklist auto-created when CI is finalized:
   1. Commercial Invoice (CI) — linked
   2. Packing List (PL) — linked
   3. Bill of Lading / Airway Bill
   4. Certificate of Origin (COO)
   5. Shipping Bill (ICEGATE)
   6. Bank Realization Certificate / e-BRC
   7. Exchange Control Declaration (ECD/SDF)
   8. Inspection Certificate
   9. Insurance Certificate

3. Per-Document Actions
   → "Upload" — attach PDF/image from local
   → "Download/View" — open linked generated doc
   → "Mark as Submitted to Bank" — toggle status
   → Notes field — add reference number, comments

4. Bank Submission Package
   → "Submit to Bank" button → marks all checked docs as SUBMITTED
   → Generates cover letter PDF with document list
   → Update CI status tracking
```

---

## Database Schema (Prisma)

```prisma
model PostShipmentPackage {
  id                  String    @id @default(uuid())
  organizationId      String
  packageNumber       String    @unique   // PSP-26-27-001
  ciId                String    @unique   // One package per CI
  status              PSPStatus @default(PENDING)
  submittedAt         DateTime?
  bankReference       String?
  notes               String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  organization        Organization      @relation(fields: [organizationId], references: [id])
  commercialInvoice   CommercialInvoice @relation(fields: [ciId], references: [id])
  documents           PSPDocument[]

  @@index([organizationId])
  @@map("post_shipment_packages")
}

model PSPDocument {
  id            String      @id @default(uuid())
  packageId     String
  docType       PSPDocType
  label         String                    // Human-readable name
  status        PSPDocStatus @default(PENDING)
  fileUrl       String?                   // Uploaded file or generated doc URL
  linkedDocId   String?                   // Link to CommercialInvoice/PackingList id
  refNumber     String?                   // e.g., BL no., shipping bill no.
  notes         String?
  submittedAt   DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  package       PostShipmentPackage @relation(fields: [packageId], references: [id], onDelete: Cascade)

  @@map("psp_documents")
}

enum PSPDocType {
  COMMERCIAL_INVOICE
  PACKING_LIST
  BILL_OF_LADING
  CERTIFICATE_OF_ORIGIN
  SHIPPING_BILL
  EBRC
  ECD_SDF
  INSPECTION_CERTIFICATE
  INSURANCE_CERTIFICATE
}

enum PSPDocStatus {
  PENDING
  UPLOADED
  LINKED
  SUBMITTED
  WAIVED
}

enum PSPStatus {
  PENDING
  IN_PROGRESS
  SUBMITTED
  COMPLETED
}
```

---

## API Routes (NestJS)

```
GET    /api/v1/post-shipment                        → List packages (filter: CI, status, year)
POST   /api/v1/post-shipment                        → Create package (linked to CI)
GET    /api/v1/post-shipment/:id                    → Package detail with all 9 docs

PATCH  /api/v1/post-shipment/:id/documents/:docId   → Update doc status / upload file / add ref
POST   /api/v1/post-shipment/:id/documents/:docId/upload  → Upload file → S3
DELETE /api/v1/post-shipment/:id/documents/:docId/file    → Remove uploaded file

POST   /api/v1/post-shipment/:id/submit             → Mark full package as SUBMITTED to bank
POST   /api/v1/post-shipment/:id/cover-letter       → Generate cover letter PDF
```

---

## UI Screens / Components

| Screen     | Route                          | Components                                              |
| ---------- | ------------------------------ | ------------------------------------------------------- |
| PSP list   | `Exports → Post-Shipment Docs` | Table: CI number, buyer, date, docs ready/total, status |
| PSP detail | `/exports/post-shipment/:id`   | `<PostShipmentChecklist>` — 9 rows + actions            |

**Checklist UI:**

```
Post-Shipment Package: PSP-26-27-001
Linked to: CI-26-27-012  |  Buyer: ABC International  |  Status: IN_PROGRESS

┌─────────────────────────────────────────────────────────────────────────────────┐
│ #  │ Document                    │ Status     │ Ref No.    │ Actions            │
├────┼─────────────────────────────┼────────────┼────────────┼────────────────────┤
│ 1  │ Commercial Invoice          │ ✅ Linked  │ CI-26-001  │ [View]             │
│ 2  │ Packing List                │ ✅ Linked  │ PL-26-001  │ [View]             │
│ 3  │ Bill of Lading              │ 📎 Uploaded│ BL-12345   │ [View] [Replace]   │
│ 4  │ Certificate of Origin       │ ⏳ Pending │            │ [Upload] [Generate]│
│ 5  │ Shipping Bill (ICEGATE)     │ 📎 Uploaded│ SB-678901  │ [View] [Replace]   │
│ 6  │ e-BRC / Bank Realization    │ ⏳ Pending │            │ [Upload]           │
│ 7  │ ECD / SDF                   │ ⏳ Pending │            │ [Upload]           │
│ 8  │ Inspection Certificate      │ 🚫 Waived  │            │ [Unwaive]          │
│ 9  │ Insurance Certificate       │ ⏳ Pending │            │ [Upload]           │
└────┴─────────────────────────────┴────────────┴────────────┴────────────────────┘

Progress: 4/9 ready    [ Submit to Bank ]  [ Generate Cover Letter ]
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/post-shipment.ts

export const pspDocUpdateSchema = z.object({
  status: z.enum(['PENDING', 'UPLOADED', 'LINKED', 'SUBMITTED', 'WAIVED']),
  refNumber: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  submittedAt: z.string().optional(),
});

export const pspSubmitSchema = z.object({
  bankReference: z.string().max(100).optional(),
  submittedAt: z.string().min(1, 'Submission date required'),
  notes: z.string().max(500).optional(),
});

export const createPSPSchema = z.object({
  ciId: z.string().uuid('Valid CI ID required'),
  notes: z.string().max(500).optional(),
});
```

---

## LLM Development Prompt

```
Build the Post-Shipment Documents feature for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/post-shipment/:

1. PostShipmentModule with CRUD
2. On create (POST /post-shipment with ciId):
   - Auto-create PostShipmentPackage record
   - Auto-create all 9 PSPDocument rows with docType and label
   - Auto-link COMMERCIAL_INVOICE and PACKING_LIST docs by finding linked CI/PL records
   - Return package with all 9 docs populated
3. Package number: PSP-YY-YY-SEQ (financial year aware)
4. PATCH /post-shipment/:id/documents/:docId:
   - Update status, refNumber, notes, submittedAt
5. POST /post-shipment/:id/documents/:docId/upload:
   - Accept multipart file (PDF/image, max 10MB)
   - Upload to S3: documents/{orgId}/PSP/{packageId}/{docType}.pdf
   - Update fileUrl on PSPDocument, set status to UPLOADED
6. POST /post-shipment/:id/submit:
   - Mark all non-WAIVED docs as SUBMITTED
   - Set package status to SUBMITTED, set submittedAt
7. POST /post-shipment/:id/cover-letter:
   - Puppeteer + Handlebars: generate cover letter listing all 9 docs with status and ref numbers
   - Upload to S3; return URL

FRONTEND — apps/web/app/(dashboard)/exports/post-shipment/:

1. page.tsx: Table listing all packages
   - Columns: Package No., CI No., Buyer, Date, Docs Ready (4/9 badge), Status, Actions
   - "New Package" opens dialog to select CI

2. [id]/page.tsx: Checklist view
   - 9-row table with status chip, ref number input, notes
   - Per-row actions:
     - If docType = COMMERCIAL_INVOICE/PACKING_LIST and linked doc exists: show "View" button
     - For all others: "Upload" (opens file picker) or "Replace" if already uploaded
     - "Waive" toggle for optional documents (Inspection, Insurance)
   - Inline ref number editing (click to edit, press Enter to save)
   - Progress bar: X/9 documents ready
   - "Submit to Bank" button: opens confirmation dialog → calls submit endpoint
   - "Generate Cover Letter" button: downloads PDF

3. Upload flow:
   - Click Upload → native file picker → POST to upload endpoint → optimistic update to UPLOADED
   - Show spinner on row during upload

Use TanStack Query. Invalidate ["post-shipment", packageId] on mutations.
```
