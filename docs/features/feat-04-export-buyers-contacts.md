# Feature: Export Buyers, Buying Agents, Shipping Agents & Business Contacts

## Title

Export Contacts Directory — Buyers, Buying Agents, Shipping Agents, Business Contacts

## Description

Manages all external contacts for the export business. Export Buyers are international customers for whom documents (PI, CI, Packing List) are generated. Buying Agents are commission-based intermediaries. Shipping Agents are freight forwarders and logistics providers. Business Contacts are general contacts (banks, inspection agencies, etc.). All support business-card AI auto-fill.

---

## User Flow

```
1. Add Buyer
   Exports → Buyer Details → + Add Buyer
   → (Optional) Upload Business Card → AI auto-fills fields
   → Fill: Contact Name, Company, Email, Phone, Country
   → Fill Shipping Details: Default Port of Discharge, Port of Final Destination
   → Fill Trade Terms: Incoterms, Terms of Delivery/Payment
   → Save → Buyer appears in list

2. Use Buyer in Document
   When creating PI/CI → Select Buyer → auto-fills buyer address, VAT, trade terms

3. Add Buying Agent
   Exports → Buying Agents → + Add Agent
   → Fill contact details + Commission %, Agreement dates

4. Add Shipping Agent
   Exports → Shipping Agents → + Add Agent
   → Fill contact details + Service Types checkboxes + License Number

5. Add Business Contact
   Exports → Business Contacts → + Add Contact
   → Fill contact details + Contact Type
```

---

## Database Schema (Prisma)

```prisma
model ExportBuyer {
  id                      String   @id @default(uuid())
  organizationId          String
  contactName             String
  companyName             String?
  email                   String?
  phone                   String?
  country                 String?
  pinCode                 String?
  city                    String?
  state                   String?
  address                 String?
  vatNumber               String?
  preferredCurrency       String   @default("USD")
  // Shipping Details
  shippingAddress         String?
  shippingCity            String?
  shippingState           String?
  shippingCountry         String?
  shippingPostalCode      String?
  defaultPortOfDischarge  String?
  defaultPortOfDestination String?
  // Trade Terms
  incoterms               String?  // FOB, CIF, EXW, DDP
  termsOfDelivery         String?
  countryOfFinalDest      String?
  termsOfPayment          String?
  notes                   String?
  isActive                Boolean  @default(true)
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  deletedAt               DateTime?

  organization            Organization @relation(fields: [organizationId], references: [id])
  exportDocuments         ExportDocument[]

  @@index([organizationId])
  @@map("export_buyers")
}

model BuyingAgent {
  id               String   @id @default(uuid())
  organizationId   String
  name             String
  company          String?
  email            String?
  phone            String?
  country          String?
  pinCode          String?
  city             String?
  state            String?
  address          String?
  contactPerson    String?
  designation      String?
  commissionPct    Decimal? @db.Decimal(5, 2)
  agreementDate    DateTime?
  agreementExpiry  DateTime?
  notes            String?
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  organization     Organization @relation(fields: [organizationId], references: [id])

  @@map("buying_agents")
}

model ShippingAgent {
  id              String   @id @default(uuid())
  organizationId  String
  contactName     String
  companyName     String?
  email           String?
  phone           String?
  country         String?
  pinCode         String?
  city            String?
  state           String?
  address         String?
  licenseNumber   String?
  serviceTypes    String[] // ["SEA_FREIGHT", "AIR_FREIGHT", "CUSTOM_CLEARANCE", ...]
  notes           String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])

  @@map("shipping_agents")
}

model BusinessContact {
  id              String      @id @default(uuid())
  organizationId  String
  name            String
  company         String?
  email           String?
  phone           String?
  country         String?
  pinCode         String?
  city            String?
  state           String?
  address         String?
  contactPerson   String?
  designation     String?
  contactType     ContactType @default(OTHER)
  notes           String?
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])

  @@map("business_contacts")
}

enum ContactType {
  BANK
  INSPECTION_AGENCY
  FREIGHT_FORWARDER
  CUSTOMS_BROKER
  CHAMBER_OF_COMMERCE
  OTHER
}
```

---

## API Routes (NestJS)

```
# Export Buyers
GET    /api/v1/export-buyers                → List (search, status filter)
POST   /api/v1/export-buyers                → Create
GET    /api/v1/export-buyers/:id            → Detail
PATCH  /api/v1/export-buyers/:id            → Update
DELETE /api/v1/export-buyers/:id            → Soft delete

# Buying Agents
GET    /api/v1/buying-agents
POST   /api/v1/buying-agents
GET    /api/v1/buying-agents/:id
PATCH  /api/v1/buying-agents/:id
DELETE /api/v1/buying-agents/:id

# Shipping Agents
GET    /api/v1/shipping-agents
POST   /api/v1/shipping-agents
GET    /api/v1/shipping-agents/:id
PATCH  /api/v1/shipping-agents/:id
DELETE /api/v1/shipping-agents/:id

# Business Contacts
GET    /api/v1/business-contacts
POST   /api/v1/business-contacts
GET    /api/v1/business-contacts/:id
PATCH  /api/v1/business-contacts/:id
DELETE /api/v1/business-contacts/:id

# Shared — AI business card scan (used by all contact forms)
POST   /api/v1/contacts/scan-business-card  → image → extracted contact fields
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/contacts.ts

export const exportBuyerSchema = z.object({
  contactName: z.string().min(1, 'Contact name required').max(100),
  companyName: z.string().max(200).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  country: z.string().min(1, 'Country required'),
  pinCode: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  vatNumber: z.string().max(50).optional(),
  preferredCurrency: z.enum(['USD', 'EUR', 'GBP', 'AED', 'JPY', 'CNY']).default('USD'),
  // Shipping
  defaultPortOfDischarge: z.string().max(100).optional(),
  defaultPortOfDestination: z.string().max(100).optional(),
  // Trade Terms
  incoterms: z.enum(['FOB', 'CIF', 'EXW', 'DDP', 'CFR', 'CPT', 'DAP']).optional(),
  termsOfDelivery: z.string().max(200).optional(),
  termsOfPayment: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
});

export const buyingAgentSchema = z.object({
  name: z.string().min(1).max(100),
  company: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  country: z.string().min(1),
  pinCode: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  contactPerson: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  commissionPct: z
    .string()
    .refine(
      (v) => !v || (!isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100),
      'Commission must be 0–100%',
    )
    .optional(),
  agreementDate: z.string().optional(),
  agreementExpiry: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const shippingAgentSchema = z.object({
  contactName: z.string().min(1).max(100),
  companyName: z.string().max(200).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  country: z.string().min(1),
  pinCode: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  licenseNumber: z.string().max(50).optional(),
  serviceTypes: z
    .array(
      z.enum([
        'SEA_FREIGHT',
        'AIR_FREIGHT',
        'CUSTOM_CLEARANCE',
        'INLAND_TRANSPORT',
        'WAREHOUSING',
        'DOCUMENTATION',
        'FREIGHT_FORWARDING',
        'FCL',
        'LCL',
      ]),
    )
    .min(1, 'Select at least one service type'),
  notes: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
});
```

---

## LLM Development Prompt

```
Build the Export Contacts Directory feature for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/:

1. Create 4 separate modules: export-buyers, buying-agents, shipping-agents, business-contacts
   Each has: Controller, Service, Prisma queries. All endpoints are org-scoped (OrgContextGuard).
2. All list endpoints: support search (name/company/email), isActive filter, pagination.
3. Soft delete: set deletedAt, exclude from all queries by default.
4. AI business card scan:
   - POST /contacts/scan-business-card → multipart image
   - Call Python AI service with image → returns structured JSON: { name, company, email, phone, country, address }
   - Return extracted fields to frontend (user reviews before saving)

FRONTEND — apps/web/app/(dashboard)/exports/:

1. buyer-details/page.tsx:
   - Buyer Directory table: Company, Contact Person, Country, Phone, Status toggle, Actions
   - Header KPI bar: Total Agents (from buying-agents count), Sea Freight / Air Freight agents (from shipping-agents)
   - "Add Buyer" opens large shadcn Dialog (full form with Upload Business Card button at top)
   - "Upload Business Card": opens image upload → POST /contacts/scan-business-card → fills form fields with animation
   - City auto-fills from PIN code via India Post API (for Indian buyers)
   - Tabs inside dialog: Basic Info, Shipping Details, Trade Terms

2. buying-agents/page.tsx: similar pattern with agent-specific fields
3. shipping-agents/page.tsx: includes Service Types checkboxes grid
4. business-contacts/page.tsx: includes Contact Type dropdown

SHARED PATTERN for all contact forms:
- "Upload Business Card" button at top of every Add/Edit dialog
- On image upload: show loading skeleton on all form fields
- When AI response arrives: animate fill each field one by one (200ms delay per field)
- User can override any AI-filled value
- Form validation shows inline errors on blur
- On save: optimistic update to table list

Use TanStack Query hooks from packages/api-client. Cache key: [contactType, orgId].
```
