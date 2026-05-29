# Feature: Reports & Analytics

## Title

Reports & Analytics — Executive Summary, AI Suggestions, Sales Analysis & Shipment Tracking

## Description

Comprehensive reporting dashboard covering export business performance. Includes: Executive Summary (KPI overview), AI Suggestions (5-category improvement recommendations), Sales Analysis (by period/buyer/product/region), Invoice Aging, Payment Summary, Shipment Tracking (17track integration), Vessel Cut-Off Planner (backward planning timeline), and Export Readiness Dashboard (compliance expiry tracking).

---

## User Flow

```
1. Executive Summary
   Reports → Executive Summary
   → KPI cards: Total Exports (USD), Total Shipments, Active Buyers, Pending Docs
   → Revenue trend chart (monthly, last 12 months)
   → Top 5 buyers by revenue
   → Document generation stats

2. AI Suggestions
   Reports → AI Suggestions
   → 5 sections: Buyer Insights, Product Mix, Seasonal Trends, Pricing Recommendations, Compliance Alerts
   → Each suggestion has: title, description, action button
   → "Dismiss" or "Act on this" per suggestion

3. Sales Analysis
   Reports → Sales by Period/Buyer/Product/Region
   → Filter: Date range, Buyer, Product category
   → Export to CSV/Excel

4. Shipment Tracking
   Reports → Shipment Tracking
   → Track by BL/AWB number via 17track API
   → Shows current location, events timeline, ETA

5. Vessel Cut-Off Planner
   Reports → Vessel Cut-Off Planner
   → Enter: destination, cargo ready date
   → System shows: cut-off dates, sailing dates for next 3 vessels
   → Backward planning: "To ship by [date], documents needed by [date-X], PI needed by [date-Y]"

6. Export Readiness Dashboard
   Reports → Export Readiness
   → IEC expiry, RCMC expiry, DGFT authorization expiry
   → Compliance status: GREEN (valid) / YELLOW (expiring soon) / RED (expired)
```

---

## Database Schema (Prisma)

```prisma
// Most reports are derived from existing data — no additional tables needed
// Except for:

model AISuggestion {
  id              String    @id @default(uuid())
  organizationId  String
  category        AISuggestionCategory
  title           String
  description     String    @db.Text
  actionType      String?   // LINK, TASK, DISMISS
  actionPayload   Json?     // { url, entityId, etc. }
  priority        Int       @default(0)
  isDismissed     Boolean   @default(false)
  generatedAt     DateTime  @default(now())
  dismissedAt     DateTime?
  expiresAt       DateTime?

  organization    Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
  @@map("ai_suggestions")
}

model ShipmentTracking {
  id              String    @id @default(uuid())
  organizationId  String
  trackingNumber  String    // BL or AWB number
  carrier         String?
  trackingData    Json?     // Response from 17track
  lastCheckedAt   DateTime?
  currentStatus   String?
  currentLocation String?
  etaDate         DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
  @@map("shipment_trackings")
}

enum AISuggestionCategory {
  BUYER_INSIGHTS
  PRODUCT_MIX
  SEASONAL_TRENDS
  PRICING_RECOMMENDATIONS
  COMPLIANCE_ALERTS
}
```

---

## Report Queries

```ts
// Executive Summary
interface ExecutiveSummary {
  totalExportValueUSD: number; // sum(CI.totalAmount)
  totalShipments: number; // count(CommercialInvoices with status!=DRAFT)
  activeBuyers: number; // count(distinct buyerId in CIs last 12 months)
  pendingDocuments: number; // count(PI/CI in DRAFT status)
  monthlyRevenue: MonthlyData[]; // sum(CI.totalAmount) grouped by month
  topBuyers: BuyerRevenue[]; // top 5 buyers by total CI value
}

// Invoice Aging
interface InvoiceAging {
  current: number; // Balance due, not yet overdue
  overdue30: number; // 1–30 days overdue
  overdue60: number; // 31–60 days overdue
  overdue90Plus: number; // 90+ days overdue
  invoices: AgingRow[];
}

// Compliance check
interface ComplianceStatus {
  iecExpiry: Date | null; // null = never expires
  rcmcExpiry: Date | null;
  dgftExpiry: Date | null;
  adCodeStatus: string;
  warnings: ComplianceWarning[]; // items expiring within 60 days
}
```

---

## API Routes (NestJS)

```
# Executive Summary
GET    /api/v1/reports/executive-summary            → KPI + monthly trend + top buyers

# AI Suggestions
GET    /api/v1/reports/ai-suggestions               → List suggestions (by category)
POST   /api/v1/reports/ai-suggestions/generate      → Trigger AI suggestion generation
PATCH  /api/v1/reports/ai-suggestions/:id/dismiss   → Dismiss suggestion

# Sales Analysis
GET    /api/v1/reports/sales/by-period              → Revenue by month/quarter/year
GET    /api/v1/reports/sales/by-buyer               → Revenue + order count per buyer
GET    /api/v1/reports/sales/by-product             → Revenue per product/item
GET    /api/v1/reports/sales/by-region              → Revenue per country/region
GET    /api/v1/reports/sales/export-csv             → Export sales data as CSV

# Financial
GET    /api/v1/reports/invoice-aging                → Aging buckets + invoice list
GET    /api/v1/reports/payment-summary              → Payment received vs outstanding

# Shipment Tracking
POST   /api/v1/reports/shipment-tracking/add        → Add tracking number
GET    /api/v1/reports/shipment-tracking            → List all tracked shipments
POST   /api/v1/reports/shipment-tracking/:id/refresh → Refresh from 17track API

# Vessel Cut-Off Planner
POST   /api/v1/reports/vessel-planner               → Calculate backward timeline

# Compliance
GET    /api/v1/reports/compliance                   → Export readiness compliance status
```

---

## Vessel Cut-Off Planner Logic

```ts
// Backward planning: given a cargo ready date and destination, compute document deadlines
interface VesselPlan {
  cargoReadyDate: Date;
  destination: string;
  vessels: VesselOption[];
}

interface VesselOption {
  carrierName: string;
  sailingDate: Date;
  etaDate: Date;
  cargoCutOff: Date; // When cargo must be at port
  documentsCutOff: Date; // When BL/docs must be submitted
  piDeadline: Date; // cargoReadyDate - 5 days (PI must be sent by buyer)
  ciDeadline: Date; // documentsCutOff - 2 days
  plDeadline: Date; // documentsCutOff - 2 days
}

function calculateDeadlines(sailingDate: Date): VesselOption {
  return {
    cargoCutOff: subDays(sailingDate, 3),
    documentsCutOff: subDays(sailingDate, 5),
    ciDeadline: subDays(sailingDate, 7),
    plDeadline: subDays(sailingDate, 7),
    piDeadline: subDays(sailingDate, 14),
  };
}
```

---

## Form Fields & Zod Validations

```ts
// packages/schemas/src/reports.ts

export const salesFilterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  buyerId: z.string().uuid().optional(),
  category: z.string().optional(),
  period: z.enum(['MONTH', 'QUARTER', 'YEAR']).default('MONTH'),
  year: z.number().int().min(2020).max(2030).optional(),
});

export const shipmentTrackSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number required').max(50),
  carrier: z.string().max(100).optional(),
});

export const vesselPlannerSchema = z.object({
  destination: z.string().min(1, 'Destination required').max(100),
  cargoReadyDate: z.string().min(1, 'Cargo ready date required'),
  shippingMode: z.enum(['SEA', 'AIR']).default('SEA'),
});
```

---

## LLM Development Prompt

```
Build the Reports & Analytics module for ExDocs (NestJS + Next.js 16 Turborepo).

BACKEND — apps/api/src/modules/reports/:

1. ReportsModule with ReportsController and specialized services

2. ExecutiveSummaryService:
   - Use Prisma aggregate queries for KPI stats
   - Monthly revenue: GROUP BY DATE_TRUNC('month', date) on commercial_invoices
   - Top buyers: GROUP BY buyerId, order by totalAmount DESC, limit 5

3. SalesAnalysisService:
   - by-buyer: group CI records by buyerId, calculate totalOrders, totalValueUSD
   - by-product: join CI line items with items, group by itemId
   - by-region: group CI records by buyer.country
   - Export CSV: use csv-writer to stream download

4. InvoiceAgingService:
   - For each SENT/PARTIALLY_PAID CI, calculate days since invoiceDate
   - Bucket: current (not yet due), 1-30, 31-60, 60-90, 90+
   - Based on dueDate if set, otherwise invoiceDate + paymentTerms days

5. ShipmentTrackingService:
   - POST /add: store tracking number, trigger background refresh
   - Refresh: call 17track API (track17.net) with API key → parse response → update DB
   - Schedule: cron job to refresh all active shipments every 4 hours

6. VesselPlannerService:
   - POST /vessel-planner: accept destination + cargoReadyDate
   - Lookup sailing schedules (can be manual data or mocked for MVP)
   - Apply backward deadline formula: cargoCutOff = sailing - 3 days, etc.
   - Return array of next 3 vessel options with all deadlines

7. ComplianceService:
   - Fetch org data: iecCode expiry, rcmcExpiry, dgftExpiry
   - Return status per field: VALID / EXPIRING_SOON (< 60 days) / EXPIRED
   - warnings array: fields expiring in next 60 days

8. AI Suggestions:
   - For MVP: generate rule-based suggestions (not actual LLM)
   - Buyer insights: "Buyer X hasn't ordered in 90 days"
   - Product mix: "Item Y appears in 80% of orders — consider bundling"
   - Compliance alerts: same as ComplianceService warnings

FRONTEND — apps/web/app/(dashboard)/reports/:

1. Layout: left sidebar with report categories, or tab bar:
   Executive Summary | AI Suggestions | Sales Analysis | Invoice Aging | Shipment Tracking | Vessel Planner | Export Readiness

2. Executive Summary page:
   - 4 KPI cards (Total Exports USD, Shipments, Active Buyers, Pending Docs)
   - Revenue trend: Recharts BarChart (monthly, last 12 months)
   - Top 5 buyers table (with mini bar for relative share)

3. AI Suggestions page:
   - 5 accordion sections: one per category
   - Each suggestion: title, description, action button (View Details / Create PO / etc.)
   - Dismiss button (X) per suggestion
   - "Refresh Suggestions" button

4. Sales Analysis page:
   - Tabs: By Period | By Buyer | By Product | By Region
   - Each tab: filter bar + Recharts chart + data table
   - "Export CSV" button on each tab

5. Invoice Aging page:
   - 4 colored KPI cards (green/yellow/orange/red for each bucket)
   - Aging bar chart
   - Detail table with sorting by days overdue

6. Shipment Tracking page:
   - "Track New Shipment" button → input BL/AWB number
   - Tracked shipments list with status chips and last update time
   - Expandable row: timeline of tracking events with locations and dates

7. Vessel Cut-Off Planner page:
   - Input form: Destination, Cargo Ready Date, Mode (Sea/Air)
   - "Calculate" button
   - Results: 3 vessel option cards showing:
     Sailing: DD/MM | Cargo Cut-Off: DD/MM | Documents by: DD/MM
     Timeline visual: [PI needed] ─── [CI/PL needed] ─── [Cargo Cut-Off] ─── [Sailing]

8. Export Readiness Dashboard:
   - Compliance table: Field | Value | Expiry | Status (colored badge)
   - Alert section for expiring items

Use TanStack Query with 5-min staleTime for report data.
Use Recharts for all charts. Export CSV via direct download (link to /reports/*/export-csv).
```
