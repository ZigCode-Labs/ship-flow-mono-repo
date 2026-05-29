# Feature: Certificate of Origin

## Title

Certificate of Origin (COO) — Customs Origin Declaration Document

## Description

A Certificate of Origin declares that the goods in a particular shipment were manufactured/produced in a specific country (India). Required by customs authorities of the importing country for tariff assessment and trade agreement benefits. Issued by the Chamber of Commerce or prepared by the exporter. Two sections: Exporter's Declaration and Chamber Certification. Generates a standard Generalized System of Preferences (GSP) format PDF.

---

## User Flow

```
1. Create Certificate of Origin
   Exports → Export Documents → Certificate of Origin → Create Now
   → Auto-assigns COO number (e.g., COO-26-27-001)
   → Select CI → auto-fills exporter, consignee, goods, ports, vessel
   → Fill goods origin declaration
   → Exporter's Declaration: certify goods are of Indian origin
   → Save Draft

2. Chamber Certification
   COO detail → "Send to Chamber" or mark Chamber fields:
   → Chamber Reference Number
   → Chamber Officer Name
   → Certification Date
   → Update status to CERTIFIED

3. Download PDF
   COO detail → Download PDF → standard GSP-format document
```

---

## Database Schema (Prisma)

```prisma
model CertificateOfOrigin {
  id                  String    @id @default(uuid())
  organizationId      String
  cooNumber           String    @unique   // COO-26-27-001
  ciId                String?             // Linked CI
  status              COOStatus @default(DRAFT)
  date                DateTime  @default(now())

  // Exporter (Box 1)
  exporterName        String?
  exporterAddress     String?
  exporterIEC         String?

  // Consignee (Box 2)
  consigneeName       String?
  consigneeAddress    String?

  // Transport details (Box 3/4)
  transportMeans      String?   // Sea, Air, Road
  vesselFlightNo      String?
  portOfLoading       String?
  portOfDischarge     String?
  portOfFinalDest     String?

  // Item details (Box 5-12 per GSP format)
  itemNumber          String?
  tariffNumber        String?   // HS Code
  descriptionOfGoods  String?   @db.Text
  packages            Int?
  grossWeight         Decimal?  @db.Decimal(12, 3)
  netWeight           Decimal?  @db.Decimal(12, 3)
  invoiceNumber       String?
  invoiceDate         DateTime?
  countryOfOrigin     String?   @default("India")
  originCriteria      String?   // WO, P, PSR, etc.

  // Exporter's Declaration
  exporterDeclaration String?   @db.Text
  declarationPlace    String?
  declarationDate     DateTime?

  // Chamber Certification
  chamberName         String?
  chamberReference    String?
  chamberOfficerName  String?
  chamberCertDate     DateTime?
  chamberStampUrl     String?

  notes               String?
  fileUrl             String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  deletedAt           DateTime?

  organization        Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
  @@map("certificates_of_origin")
}

enum COOStatus {
  DRAFT
  SUBMITTED_TO_CHAMBER
  CERTIFIED
  CANCELLED
}
```

---

## API Routes (NestJS)

```
GET    /api/v1/certificates-of-origin              → List (filter: year, buyer, status)
POST   /api/v1/certificates-of-origin              → Create
GET    /api/v1/certificates-of-origin/:id          → Detail
PATCH  /api/v1/certificates-of-origin/:id          → Update
DELETE /api/v1/certificates-of-origin/:id          → Soft delete

POST   /api/v1/certificates-of-origin/:id/generate-pdf  → Generate PDF → S3
PATCH  /api/v1/certificates-of-origin/:id/status        → Update status
POST   /api/v1/certificates-of-origin/:id/certify       → Record chamber certification details
```

---

## Origin Criteria Reference

```ts
// Standard GSP origin criteria codes
const ORIGIN_CRITERIA = {
  WO: 'Wholly obtained or produced in the country of origin',
  P: 'Produced using materials from the country of origin',
  PSR: 'Product-specific rules satisfied (value addition >= 35%)',
  PE: 'Produced in the country from imported materials meeting PE criteria',
};
```

---

## UI Screens / Components

| Screen   | Route                             | Components                               |
| -------- | --------------------------------- | ---------------------------------------- |
| COO list | `Exports → Certificate of Origin` | Master-detail layout                     |
| COO form | Right panel                       | `<CertificateOfOriginForm>` — 2 sections |

**Form layout (GSP format boxes):**

```
CERTIFICATE OF ORIGIN

Box 1 — Exporter:          Box 2 — Consignee:
[ Name (auto-filled)   ]   [ Name (from CI)      ]
[ Address              ]   [ Address             ]
[ IEC Number           ]

Box 3 — Transport:                    Box 4 — For official use
[ Means: Sea/Air/Road ▼ ]             [ Country: India     ]
[ Vessel / Flight No  ]               [ Departure Date     ]
[ Port of Loading     ]
[ Port of Discharge   ]

Box 5-12 — Goods Description:
[ Item No | Marks/Pkgs | Description | HS Code | Origin Criteria | Weight | Invoice No ]
(auto-filled from CI, editable)

Exporter's Declaration:
[ Declaration text (pre-filled):                                   ]
[ "I, the undersigned, hereby declare that the above details and   ]
[  statements are correct, that all goods were produced in India   ]
[  and that they comply with the origin requirements..."           ]
[ Place: ________ ] [ Date: ________ ] [ Signature: ________ ]

Chamber Certification:
[ Status: ○ Draft  ○ Submitted to Chamber  ○ Certified ]
[ Chamber Name ] [ Chamber Reference ] [ Officer Name ] [ Cert Date ]
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/certificate-of-origin.ts

export const cooSchema = z.object({
  date: z.string().min(1, 'Date required'),
  ciId: z.string().uuid().optional(),
  exporterName: z.string().min(1).max(200),
  exporterAddress: z.string().max(500).optional(),
  exporterIEC: z.string().max(20).optional(),
  consigneeName: z.string().min(1).max(200),
  consigneeAddress: z.string().max(500).optional(),
  transportMeans: z.enum(['SEA', 'AIR', 'ROAD', 'MULTIMODAL']).optional(),
  vesselFlightNo: z.string().max(100).optional(),
  portOfLoading: z.string().max(100).optional(),
  portOfDischarge: z.string().max(100).optional(),
  descriptionOfGoods: z.string().min(1, 'Goods description required').max(2000),
  packages: z.number().int().min(1).optional(),
  grossWeight: z
    .string()
    .refine((v) => !v || !isNaN(Number(v)))
    .optional(),
  invoiceNumber: z.string().max(50).optional(),
  countryOfOrigin: z.string().default('India'),
  originCriteria: z.enum(['WO', 'P', 'PSR', 'PE']).optional(),
  exporterDeclaration: z.string().max(2000).optional(),
  declarationPlace: z.string().max(100).optional(),
  declarationDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const cooChambercertifySchema = z.object({
  chamberName: z.string().min(1, 'Chamber name required').max(200),
  chamberReference: z.string().min(1, 'Reference required').max(100),
  chamberOfficerName: z.string().max(100).optional(),
  chamberCertDate: z.string().min(1, 'Certification date required'),
});
```

---

## LLM Development Prompt

```
Build the Certificate of Origin feature for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/certificates-of-origin/:

1. CertificatesOfOriginModule with full CRUD
2. COO number auto-generation: COO-YY-YY-SEQ (financial year aware)
3. Link to CI: auto-populate exporter (from org), consignee (from CI buyer), goods (from CI line items merged), invoice number, ports
4. Default exporter declaration text:
   "I, the undersigned, hereby declare that the above details and statements are correct,
   that all the goods were produced in India and that they comply with the origin requirements
   specified for those goods in the Generalized System of Preferences."
5. Certify endpoint: PATCH /certificates-of-origin/:id/certify
   - Accepts chamber details, sets status to CERTIFIED
6. PDF generation:
   - Puppeteer + Handlebars template: templates/certificate-of-origin.hbs
   - GSP format: standard two-panel layout with numbered boxes
   - Include space for chamber stamp (chamberStampUrl if uploaded, else blank box)
   - Upload to S3; return URL
7. Origin criteria reference: utility function returning description for each code

FRONTEND — apps/web/app/(dashboard)/exports/certificates-of-origin/:

1. page.tsx: master-detail layout

2. CertificateOfOriginForm:
   - "Link CI" dropdown → auto-fill button populates all sections
   - Form follows GSP numbered box layout visually:
     Box 1 (Exporter) | Box 2 (Consignee) — side by side
     Box 3 (Transport) section
     Goods table: Description, HS Code, Origin Criteria select, Weight, Invoice No
   - Origin Criteria: Select with tooltip showing full criterion description
   - Declaration section: pre-filled Textarea, Place + Date + Signature row
   - Chamber Certification section: shown at bottom, initially collapsed
     "Mark as Certified" toggle → reveals chamber fields

3. Status workflow shown as step indicator:
   Draft → Submitted to Chamber → Certified

4. Actions: Download PDF, Mark as Submitted, Mark as Certified, Cancel

Use TanStack Query. Invalidate ["certificates-of-origin", orgId] on mutations.
```
