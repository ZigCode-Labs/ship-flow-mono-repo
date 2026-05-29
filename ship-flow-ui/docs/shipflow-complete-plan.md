# 🚀 ShipFlow — Complete Project Plan

### Team of 2 | Frontend (FE) + Backend (BE) | 14 Weeks | 60+ Screens

---

## 👥 HOW YOUR TEAM IS DIVIDED

```
YOU (or teammate)          YOUR TEAMMATE─────────────────          ──────────────────FRONTEND (FE)              BACKEND (BE)Next.js + shadcn/ui        NestJS + PrismaTanStack Query             PostgreSQL (Supabase)React Hook Form + Zod      AWS S3 + BullMQRecharts / TanStack Table  Passport JWT + AuthZustand + Axios            Puppeteer PDF gen
```

### 🔑 Golden Rule

> **BE builds the API first → FE connects to it.**Both work on the SAME feature in the same week — never on different modules.This keeps you in sync and avoids blocked work.

---

## 📁 PROJECT STRUCTURE — WHO OWNS WHAT FILE

```
shipflow/├── apps/│   ├── web/                        ← FE OWNS THIS ENTIRELY│   │   ├── app/│   │   │   ├── (auth)/             ← FE│   │   │   │   ├── login/│   │   │   │   ├── register/│   │   │   │   └── forgot-password/│   │   │   ├── (dashboard)/        ← FE│   │   │   │   ├── layout.tsx         (sidebar, header)│   │   │   │   ├── page.tsx           (dashboard home)│   │   │   │   ├── onboarding/│   │   │   │   ├── organization/│   │   │   │   ├── buyers/│   │   │   │   ├── items/│   │   │   │   ├── export-orders/│   │   │   │   ├── documents/│   │   │   │   ├── shipments/│   │   │   │   ├── invoices/│   │   │   │   ├── payments/│   │   │   │   └── reports/│   │   └── components/             ← FE│   │       ├── layout/│   │       ├── forms/│   │       ├── documents/│   │       ├── tables/│   │       └── ui/│   ││   └── api/                        ← BE OWNS THIS ENTIRELY│       └── src/│           ├── auth/               ← BE│           ├── users/              ← BE│           ├── organizations/      ← BE│           ├── buyers/             ← BE│           ├── items/              ← BE│           ├── export-orders/      ← BE│           ├── documents/          ← BE│           ├── shipments/          ← BE│           ├── invoices/           ← BE│           ├── payments/           ← BE│           ├── reports/            ← BE│           └── pdf/                ← BE│├── packages/│   ├── schemas/                    ← BOTH (discuss & write together)│   ├── types/                      ← BOTH│   ├── api-client/                 ← FE writes, BE reviews│   ├── utils/                      ← BOTH│   └── config/                     ← BE sets up
```

---

## 🗓️ 14-WEEK PLAN — WEEK BY WEEK

---

### ✅ WEEK 1 — Project Setup + Auth (Login/Register)

**Screens this week: 3** (Login, Register, Forgot Password)

#### 📅 DAY 1 (Monday) — Monorepo Setup

Who

Task

Details

**BE**

Init monorepo

`pnpm init`, Turborepo config, `apps/api` NestJS setup

**BE**

DB setup

Supabase project create, `.env` config, Prisma init

**FE**

Init frontend

`apps/web` Next.js 16 setup, shadcn/ui init, Tailwind config

**FE**

Layout shell

Top navbar component (Dashboard/Domestic/Production/Inventory/Import/Exports/Reports/Subscription tabs)

**BOTH**

`packages/` setup

Create `schemas/`, `types/`, `utils/` packages

#### 📅 DAY 2 (Tuesday) — Auth Backend

Who

Task

**BE**

Prisma schema — `User`, `Organization`, `Session` models

**BE**

Auth module — register endpoint `POST /auth/register`

**BE**

Auth module — login endpoint `POST /auth/login` (JWT + refresh token)

**BE**

Password hashing with bcrypt

**FE**

Auth layout — centered card layout for login/register pages

#### 📅 DAY 3 (Wednesday) — Auth Frontend

Who

Task

**FE**

Login page — email/password form, React Hook Form + Zod validation

**FE**

Register page — name, email, password, company name fields

**FE**

Forgot password page — email input form

**BE**

Forgot password endpoint + email service setup

**BE**

JWT guard middleware, refresh token endpoint

#### 📅 DAY 4 (Thursday) — Connect + Test

Who

Task

**FE**

Axios instance setup in `packages/api-client`

**FE**

Auth store (Zustand) — store JWT, user info, org info

**FE**

Connect login/register to API, handle errors

**BE**

Swagger docs for auth endpoints

**BOTH**

Test full login/register flow end to end

#### 📅 DAY 5 (Friday) — Polish + Buffer

Who

Task

**FE**

Route protection — redirect to login if no token

**FE**

Toast notifications for auth errors

**BE**

Rate limiting on auth endpoints (@nestjs/throttler)

**BOTH**

Fix bugs, review code, Linear ticket updates

---

### ✅ WEEK 2 — Organization Setup + User Profile

**Screens this week: 4** (User Profile, Manage Organizations, Team & Roles, Onboarding)

#### 📅 DAY 1 (Monday)

Who

Task

**BE**

Prisma schema — `Organization` fields (IEC, GST, PAN, logo, currency, shipping defaults)

**BE**

Organizations CRUD endpoints

**FE**

Dashboard layout — sidebar + top navbar + breadcrumb component

**FE**

Sidebar with all nav items (matches ExDocs sidebar pattern)

#### 📅 DAY 2 (Tuesday)

Who

Task

**BE**

`GET /organization/me` — fetch current org

**BE**

`PATCH /organization` — update org settings

**BE**

S3 setup — logo upload endpoint

**FE**

User Profile page — tabs (Company, Contact, Banking, Compliance, Email, Security, Templates)

#### 📅 DAY 3 (Wednesday)

Who

Task

**FE**

Company tab — IEC, GST, PAN, logo upload, master currency, shipping defaults, item code settings

**FE**

Banking tab — bank name, account number, IFSC, SWIFT

**BE**

Team members endpoints — invite, list, remove, role change

**BE**

Email invite service (send invite email)

#### 📅 DAY 4 (Thursday)

Who

Task

**FE**

Manage Organizations page — org card with trial/active status

**FE**

Team & Roles page — members table, pending invitations, invite modal

**BE**

Onboarding wizard endpoints

**FE**

Onboarding flow — first-time org setup wizard

#### 📅 DAY 5 (Friday)

Who

Task

**FE**

Subscription page — 3 plan cards (Basic/Advanced/Professional), usage/limits bars, monthly/yearly toggle

**BE**

Subscription status endpoint

**BOTH**

Test all week 2 flows, fix bugs

---

### ✅ WEEK 3 — Buyers + Items Catalog

**Screens this week: 6** (Buyer Details, Buying Agents, Shipping Agents, Business Contacts, Items Catalog, Item Detail)

#### 📅 DAY 1 (Monday)

Who

Task

**BE**

Prisma schema — `Buyer`, `BuyingAgent`, `ShippingAgent`, `BusinessContact` models

**BE**

Buyers CRUD — `GET /buyers`, `POST /buyers`, `PATCH /buyers/:id`, `DELETE /buyers/:id`

**FE**

Buyer Details page — directory with stats, search & filter

#### 📅 DAY 2 (Tuesday)

Who

Task

**FE**

Add New Buyer modal — contact, company, email, phone, country, PIN auto-fill, shipping address, trade terms, incoterms, payment terms, upload business card

**BE**

Buying agents endpoints

**FE**

Buying Agents page + Add Buying Agent modal (commission %, agreement dates)

#### 📅 DAY 3 (Wednesday)

Who

Task

**BE**

Shipping agents endpoints

**FE**

Shipping Agents page + Add Shipping Agent modal (service types checkboxes: Sea Freight, Air Freight, Custom Clearance, Inland Transport, Warehousing, Documentation, Freight Forwarding, FCL, LCL)

**BE**

Business contacts endpoints

**FE**

Business Contacts page + Add New Contact modal

#### 📅 DAY 4 (Thursday)

Who

Task

**BE**

Prisma schema — `Item` model (code, name, category, price, weight, HSN, status, barcode, images)

**BE**

Items CRUD endpoints + bulk import endpoint

**FE**

Items Catalog page (Exports) — table with image, code, name, category, price, weight, status, barcode

**FE**

Import Excel, Bulk Images, Fix Images, Order Qty Analyzer buttons

#### 📅 DAY 5 (Friday)

Who

Task

**FE**

Item Detail page — edit form with categories, HSN code, price, weight, status, description, image upload

**BE**

S3 item image upload

**BOTH**

Test all buyer and item flows

---

### ✅ WEEK 4 — Export Orders (Core Feature)

**Screens this week: 5** (Exports Overview, Export Orders list, Create Order, Order Detail, CBM calculator)

#### 📅 DAY 1 (Monday)

Who

Task

**BE**

Prisma schema — `ExportOrder` model (the CORE entity — buyer ref, items, amounts, shipment mode, status)

**BE**

`POST /export-orders` — create order with line items

**BE**

Auto-generate order number (prefix + series)

**FE**

Exports Overview page — document type cards with counts

#### 📅 DAY 2 (Tuesday)

Who

Task

**BE**

`GET /export-orders` — list with filters (status, buyer, date range)

**BE**

`GET /export-orders/:id` — full order detail

**FE**

Export Orders list page — table with order no, buyer, date, value, status, actions

#### 📅 DAY 3 (Wednesday)

Who

Task

**FE**

Create Export Order page — buyer select, line items (product code, description, HSN, unit qty, unit, price, amount), bank details, signatory

**BE**

`PATCH /export-orders/:id` — update order

**FE**

Order Detail page — all fields view with edit capability

#### 📅 DAY 4 (Thursday)

Who

Task

**BE**

CBM calculation service — `L × W × H × Qty / 1,000,000` auto-calc on item save

**BE**

Container fitting logic (20FT / 40FT / 40HC)

**FE**

CBM calculator tab on order detail — breakdown table, container selector, space utilization %

#### 📅 DAY 5 (Friday)

Who

Task

**BE**

Export orders status transitions (Draft → Confirmed → Shipped → Completed)

**FE**

Status badges, order filters, search

**BOTH**

Test create order → CBM auto-calc flow

---

### ✅ WEEK 5 — Domestic Module

**Screens this week: 8** (Domestic Settings, Item Catalog, Domestic Buyers, Domestic Proforma, Tax Invoices, Payment Tracking, Credit Notes, Delivery Challans)

#### 📅 DAY 1 (Monday)

Who

Task

**BE**

Prisma schema — `DomesticSettings`, `DomesticBuyer`, `DomesticProforma`, `TaxInvoice`, `CreditNote`, `DeliveryChallan` models

**BE**

Domestic settings endpoints (number series config)

**FE**

Domestic Settings page — code series for Tax Invoice, Proforma, Credit Note, Delivery Challan

**FE**

Domestic sidebar layout (sub-navigation)

#### 📅 DAY 2 (Tuesday)

Who

Task

**BE**

Domestic buyers CRUD

**FE**

Domestic Buyers page — search, filter, Active/Trash tabs

**BE**

Domestic proforma endpoints + auto-number generation

**FE**

Domestic Proforma form — seller/customer details, USD→INR live rate, line items, GST, grand total

#### 📅 DAY 3 (Wednesday)

Who

Task

**BE**

Tax invoice endpoints + GST calculation service

**FE**

Tax Invoice form — invoice details, bank details, line items with GST %, due date

**BE**

Live exchange rate API integration (Frankfurt API)

**FE**

USD→INR exchange rate widget with Live toggle and Refresh

#### 📅 DAY 4 (Thursday)

Who

Task

**BE**

Credit notes endpoints

**FE**

Credit Notes list/create

**BE**

Delivery challans endpoints

**FE**

Delivery Challan form — header, from/to details, transport details, linked invoice, items table, summary

#### 📅 DAY 5 (Friday)

Who

Task

**BE**

Payment tracking endpoints (domestic)

**FE**

Payment Tracking page + Record New Payment modal

**BOTH**

Test full domestic workflow

---

### ✅ WEEK 6 — Document Generation Part 1 (Proforma Invoice + Packing List)

**Screens this week: 2** (Proforma Invoice, Packing List)

#### 📅 DAY 1 (Monday)

Who

Task

**BE**

Puppeteer + Handlebars setup in NestJS

**BE**

Proforma Invoice PDF template (HTML/Handlebars) — matches ExDocs design exactly

**FE**

Proforma Invoice page — left list panel (search, year filter, buyer filter) + right document view

#### 📅 DAY 2 (Tuesday)

Who

Task

**BE**

`POST /documents/proforma/:orderId/generate` — generate PDF, upload to S3, return URL

**FE**

Proforma Invoice document renderer — all fields: exporter, proforma no, date, buyer, currency, pre-carriage, vessel, ports, goods description, line items, bank details, totals, signatory, authorized signature

#### 📅 DAY 3 (Wednesday)

Who

Task

**BE**

Packing List PDF template — item code, description, dimensions (L×W×H), case/carton qty, total qty, packages, net/gross weight, CBM auto-calc

**FE**

Packing List page — left list panel + right document view with all packing fields

#### 📅 DAY 4 (Thursday)

Who

Task

**BE**

Document versioning — track version number, status (DRAFT/FINAL/CANCELLED)

**BE**

S3 signed URL generation for PDF download

**FE**

Download PDF button, Send via Email button, Cancel/Edit buttons in header

**FE**

Convert to Commercial Invoice button on Proforma

#### 📅 DAY 5 (Friday)

Who

Task

**FE**

Document list panel — search invoices, year filter, buyer filter, converted/draft badges

**BOTH**

End-to-end test: create order → generate Proforma PDF → download

---

### ✅ WEEK 7 — Document Generation Part 2

**Screens this week: 6** (Commercial Invoice, Sample Invoice, Bill of Exchange, Bill of Lading, Shipping Instructions, Certificate of Origin)

#### 📅 DAY 1 (Monday)

Who

Task

**BE**

Commercial Invoice PDF template (adds Container No, Seal No vs Proforma)

**FE**

Commercial Invoice page — split view, same as proforma + extra fields (container no, seal no)

**BE**

Sample Invoice PDF template — "FOR CUSTOMS PURPOSES ONLY" header, Incoterms, ocean freight, insurance, CIF grand total

#### 📅 DAY 2 (Tuesday)

Who

Task

**FE**

Sample Invoice page — full form with Incoterms 2020, ocean freight (USD), insurance (USD), FOB sub-total, CIF grand total

**BE**

Bill of Exchange PDF template — reference no, amount in figures & words, drawee/drawer info, bank details, L/C, legal requirements, dual signatures

**FE**

Bill of Exchange page — Smart Auto-Fill from commercial invoice, generate reference number

#### 📅 DAY 3 (Wednesday)

Who

Task

**BE**

Bill of Lading / Shipping Instructions PDF templates

**FE**

Bill of Lading page — multimodal transport document, consignee, notify party, vessel, ports, container, marks & numbers, shipped on board

**FE**

Shipping Instructions page — shipping details, cargo details, consignment total, letter of credit, special instructions

#### 📅 DAY 4 (Thursday)

Who

Task

**BE**

Certificate of Origin PDF template — dual declaration (by chamber + by exporter), dual signature blocks

**FE**

Certificate of Origin page — exporter, consignee, buyer, dispatch method, vessel, ports, goods description, tariff code

**BE**

Post-Shipment Documents — document checklist tracker in DB

#### 📅 DAY 5 (Friday)

Who

Task

**FE**

Post-Shipment Documents page — commercial invoice list + checklist (Signed CI, Packing List, BOL, BRC, Insurance Cert, Inspection Cert, COO, Courier/AWB Receipt, Other) with upload/replace for each

**BE**

Post-shipment document upload to S3, download all as zip

**BOTH**

Test all 6 document types generate correctly

---

### ✅ WEEK 8 — Production Module

**Screens this week: 10** (Production Settings, Item Register, Item Detail, Cost Sheets, Purchase Orders, Job Work, RM Register, RM Inventory, RM Purchases, Payments)

#### 📅 DAY 1 (Monday)

Who

Task

**BE**

Prisma schema — `ProductionItem`, `CostSheet`, `PurchaseOrder`, `JobWork`, `RawMaterial`, `RMInventoryMovement` models

**BE**

Production settings endpoints (code series: PRD, PO, JW, RM, CS)

**FE**

Production Settings page — General tab (code series config with prefix, suffix, digits, preview)

**FE**

Production sidebar layout

#### 📅 DAY 2 (Tuesday)

Who

Task

**BE**

Production Item Register CRUD

**BE**

Suppliers, Job Workers, Delivery Locations, Job Work Types endpoints

**FE**

Item Register list page

**FE**

Item Detail page — Basic Details, Components & Dimensions (Add Component), Spec Files, Dynamic Attributes (Add Attribute), image upload + Smart AI Auto Fill

#### 📅 DAY 3 (Wednesday)

Who

Task

**BE**

Cost sheets endpoints with calculation logic (production + packaging + quality + storage + shipping → landed cost → margin → final price)

**FE**

Cost Sheet form — FOB/CIF/Air/Courier shipping term toggle, component-wise production cost, quality & compliance, packaging, storage & handling, shipping & export charges, cost summary, margin & pricing

**FE**

Quick Summary sidebar (Production, Packaging, Compliance, Storage, Shipping, Landed Cost, Final Price)

#### 📅 DAY 4 (Thursday)

Who

Task

**BE**

Purchase Orders endpoints (production + RM)

**FE**

Purchase Orders form — PO details, supplier select with GSTIN auto-fill, delivery location, currency, payment terms, ship-to address, notes, attachments upload, line items

**BE**

Job Work endpoints

**FE**

Job Work Order form — job work details, worker select with address auto-fill, issue lines, subtotal, discount, total value

#### 📅 DAY 5 (Friday)

Who

Task

**BE**

RM Register CRUD + RM Inventory movement service

**FE**

RM Register item detail — basic details, purchase defaults (currency, standard rate, preferred supplier, HSN, GST rate, lead time), inventory & stock (qty on hand, min reorder level, reorder qty, storage location), dynamic attributes

**FE**

RM Inventory page — Movement Ledger + Stock Summary tabs, Add Inventory Movement modal (item, movement type, qty, batch #, lot #, notes)

**FE**

RM Purchases form — RMPO details, same structure as PO

---

### ✅ WEEK 9 — Import Module

**Screens this week: 5** (Import Settings, International Suppliers, Delivery Locations, Item Register, Purchase Orders)

#### 📅 DAY 1 (Monday)

Who

Task

**BE**

Prisma schema — `ImportItem`, `ImportPurchaseOrder`, `ImportSupplier`, `ImportCostSheet` models

**BE**

Import settings endpoints

**FE**

Import Settings page — code series config (IMP, IPO, ICS codes) + defaults (currency, supplier country, shipment mode, financial year)

#### 📅 DAY 2 (Tuesday)

Who

Task

**BE**

International Suppliers CRUD (different from production suppliers — has supplier currency, payment terms, lead time, port of loading, trade terms, rating, bank SWIFT details)

**FE**

International Suppliers page + Edit Supplier modal

#### 📅 DAY 3 (Wednesday)

Who

Task

**BE**

Import Item Register endpoints

**FE**

Import Item Register page

**BE**

Import Delivery Locations endpoints

**FE**

Import Delivery Locations page + Add Location modal

#### 📅 DAY 4 (Thursday)

Who

Task

**BE**

Import Purchase Orders endpoints

**FE**

Import Purchase Orders page

**BE**

Import Payments (milestone-based payment tracking)

**FE**

Import Payments page

#### 📅 DAY 5 (Friday)

Who

Task

**BE**

Import Post-Shipment Docs endpoints

**FE**

Import Post-Shipment Docs page

**BOTH**

Test full import flow

---

### ✅ WEEK 10 — Inventory Module

**Screens this week: 7** (Stock Dashboard, Register, Receipts, Receive/Issue/Adjust Stock, Opening Stock, Locations)

#### 📅 DAY 1 (Monday)

Who

Task

**BE**

Prisma schema — `StockEntry`, `StockMovement`, `InventoryLocation` models

**BE**

Stock dashboard endpoints (total items, in-stock, out-of-stock counts)

**FE**

Inventory top navigation tabs (Stock Dashboard, Stock Register, Receipts, Receive Stock, Issue Stock, Adjust Stock, Opening Stock, Locations)

**FE**

Stock Dashboard — stats cards, search, sort, empty state

#### 📅 DAY 2 (Tuesday)

Who

Task

**BE**

Stock Register + Receipts endpoints

**FE**

Stock Register page, Receipts page

**BE**

Receive Stock, Issue Stock, Adjust Stock endpoints

**FE**

Receive Stock form, Issue Stock form

#### 📅 DAY 3 (Wednesday)

Who

Task

**FE**

Adjust Stock form, Opening Stock setup page

**BE**

Opening Stock endpoint, Locations endpoints

**FE**

Locations management page

**BOTH**

Test all inventory flows

#### 📅 DAY 4–5 (Thu–Fri)

Who

Task

**BOTH**

Buffer — catch up on any delayed items, fix bugs, refactor

---

### ✅ WEEK 11 — Reports + Analytics

**Screens this week: 14** (All Reports screens)

#### 📅 DAY 1 (Monday) — Overview Reports

Who

Task

**BE**

Reports module — Executive Summary query (total export value, outstanding, collection rate, top buyers, payment status by age, best sellers, application overview counts)

**FE**

Executive Summary page — 4 KPI cards, top buyers bar, payment status with aging buckets, best sellers, application overview 8-card grid

**BE**

Activity Log endpoint — paginated, filterable by type (Documents/Items)

#### 📅 DAY 2 (Tuesday) — Sales Analysis

Who

Task

**BE**

Sales by Period query (date range, currency, monthly totals, period breakdown)

**FE**

Sales by Period — date filter, currency selector, 4 KPI cards, monthly bar chart (Recharts), period breakdown table with Export Excel

**BE**

Sales by Buyer query (buyer performance, account summary)

**FE**

Sales by Buyer — buyer type tabs, buyer selector, performance chart, breakdown table, detailed account info (Account Summary/Invoices/Payments/Documents tabs)

#### 📅 DAY 3 (Wednesday) — More Sales + Financial

Who

Task

**BE**

Sales by Product query + Sales by Region query

**FE**

Sales by Product page — product selector, performance chart, breakdown, product analysis tabs

**FE**

Sales by Region page — region selector, regional performance chart, breakdown table

**BE**

Invoice Aging Analysis query (aging buckets: current, 1-30, 31-60, 61-90, 91-180, 180+ days)

#### 📅 DAY 4 (Thursday) — Operations + Readiness

Who

Task

**FE**

Invoice Aging Analysis page — filters, 4 KPI cards, aging distribution bar chart, invoice details table

**FE**

Payment Summary page

**BE**

Shipment tracking integration (17track API or similar)

**FE**

Shipment Tracking page — tracking list + Add Shipment modal (tracking no, carrier auto-detect, shipment type)

#### 📅 DAY 5 (Friday) — Vessel + Readiness

Who

Task

**BE**

Country-wise Export Operations query

**FE**

Country-wise Export Operations page — export value/shipments, date range, country filter, export activity by destination table

**BE**

Vessel Cut-Off Planner — vessel schedule API integration (JNPT/Mumbai)

**FE**

Vessel Cut-Off Planner — Vessel Schedules tab (table with arrival, departure, cut-off times) + Planning Calculator tab (backward timeline: Dispatch → Port → Cut-off → Departure)

**FE**

Export Readiness Dashboard — compliance status list (IEC, RCMC, DGFT, Bank, Port) with expiry dates and urgency color coding

---

### ✅ WEEK 12 — AI Features + Dashboard Completion

**Screens this week: 3** (AI Suggestions, Dashboard polish, Activity Log)

#### 📅 DAY 1–2

Who

Task

**BE**

AI Suggestions endpoint — analyze business data, return: current business picture, buyer concentration risk, item catalog quality, growth recommendations, market intelligence

**FE**

AI Suggestions page — Business Picture, Buyer & Market Opportunities, Item & Catalog Improvements, Growth Recommendations, Market Intelligence (Trade Fairs, Marketing Suggestions, Competitive Landscape)

#### 📅 DAY 3–4

Who

Task

**FE**

Dashboard Home final polish — Quick Actions grid (AI Item Analysis, Bulk Import Items, Create Commercial Invoice, Create Packing List, Sample Invoice, Payment History), Recent Activity feed

**BE**

Activity Log service — write activity on every create/update/delete

**FE**

Activity Log page — search, filter (All/Documents/Items), activity cards with type tags and timestamps

#### 📅 DAY 5

Who

Task

**BOTH**

Test all Reports, fix any data accuracy issues

---

### ✅ WEEK 13 — UI Polish + Full Workflow Testing

**No new screens — polish all 60+**

#### FE Tasks (all 5 days)

- Loading skeleton loaders on all list pages
- Empty states on all list pages (with icon + message + CTA button)
- Toast notifications for all create/update/delete actions
- Form error messages — inline validation messages
- Breadcrumb navigation on all inner pages
- Responsive layout check (tablet breakpoints)
- 2FA prompt banner on dashboard
- Trial banner ("7 days left in your trial — PDFs are watermarked")
- Document status badges (Draft, Converted, Paid, Unpaid, Overdue, Cancelled)
- Consistent spacing, font sizes, colors across all modules

#### BE Tasks (all 5 days)

- API error messages — consistent error format across all endpoints
- Input validation on all endpoints with Zod
- Organization isolation — ensure all queries filter by orgId
- Performance — add DB indexes for frequently queried fields
- PDF watermark for trial accounts
- Swagger documentation complete for all endpoints
- Security audit — RBAC check on all protected routes

---

### ✅ WEEK 14 — Bug Fixes + Staging + Production Deploy

#### 📅 DAY 1–2 — Bug Fixes

Who

Task

**FE**

Fix all UI bugs found during week 13 testing

**BE**

Fix all API bugs, edge cases (empty org data in PDFs, zero CBM, etc.)

#### 📅 DAY 3 — Staging Deploy

Who

Task

**BE**

Deploy NestJS API to Railway/ECS (staging)

**BE**

Supabase staging environment setup

**FE**

Deploy Next.js to Vercel (staging URL)

#### 📅 DAY 4 — Staging Testing

Who

Task

**BOTH**

Full end-to-end test on staging: Register → Org setup → Add buyer → Add items → Create export order → Generate all docs → Record payment → View reports

#### 📅 DAY 5 — Production Deploy

Who

Task

**BE**

Production DB setup (Supabase prod), S3 prod bucket

**BE**

Deploy API to production, set env vars

**FE**

Deploy to Vercel prod domain

**BOTH**

Final smoke test, monitoring setup (Sentry)

---

## 📊 TIMELINE SUMMARY

Week

Module

Screens

FE Focus

BE Focus

1

Auth

3

Login, Register, Forgot Password

JWT, bcrypt, refresh tokens

2

Org + Account

4

User Profile, Manage Org, Team & Roles, Onboarding

Org CRUD, Team management

3

Buyers + Items

6

Buyer Details, Agents, Contacts, Items Catalog

Buyer/Item CRUD, S3 image upload

4

Export Orders

5

Exports Overview, Orders, CBM Calculator

Export Order model, CBM service

5

Domestic

8

All 8 domestic screens

GST calc, exchange rate API

6

Docs Part 1

2

Proforma + Packing List views

Puppeteer PDF gen, S3 storage

7

Docs Part 2

6

Commercial, Sample, BOE, BOL, SI, COO

6 PDF templates

8

Production

10

All production screens

Production module endpoints

9

Import

5

All import screens

Import module endpoints

10

Inventory

7

All inventory screens

Stock movement service

11

Reports

14

All 14 report screens + charts

All report queries, tracking APIs

12

AI + Dashboard

3

AI Suggestions, Activity Log, Dashboard

AI analysis service

13

Polish

All 60+

UX polish, empty states, loaders

Security, performance, validation

14

Deploy

—

Vercel staging + prod

Railway/ECS + Supabase deploy

### 📈 Screens Per Week

```
Week 1:  ███ 3 screensWeek 2:  ████ 4 screensWeek 3:  ██████ 6 screensWeek 4:  █████ 5 screensWeek 5:  ████████ 8 screensWeek 6:  ██ 2 screens (heavy backend — PDF gen)Week 7:  ██████ 6 screens (heavy backend — 6 PDF templates)Week 8:  ██████████ 10 screensWeek 9:  █████ 5 screensWeek 10: ███████ 7 screensWeek 11: ██████████████ 14 screensWeek 12: ███ 3 screensWeek 13: Polish (no new screens)Week 14: Deploy
```

### 📅 Screens Per Day (Average)

- **Total Screens:** 60+
- **Build Weeks (1–12):** 12 weeks × 5 days = 60 working days
- **Average:** ~1 screen per day per person
- **Heavy weeks (8, 11):** 2 screens/day
- **Light weeks (6, 7):** 0.5 screens/day (complex PDF work)

---

## 🎫 LINEAR SETUP — HOW TO CREATE TICKETS

### Epic Structure

Create 1 Epic per module:

```
Epic 1: 🔐 AuthenticationEpic 2: 🏢 Organization & AccountEpic 3: 👥 Buyers & ContactsEpic 4: 📦 Export OrdersEpic 5: 🏪 Domestic ModuleEpic 6: 📄 Document GenerationEpic 7: ⚙️ Production ModuleEpic 8: 📥 Import ModuleEpic 9: 📦 Inventory ModuleEpic 10: 📊 Reports & AnalyticsEpic 11: 🤖 AI FeaturesEpic 12: 🚀 Deployment
```

### Ticket Format (write every ticket like this)

```
Title:   [FE] Login Page — Form + ValidationLabel:   frontend / Week 1Points:  2Assignee: (FE person)Description:- Email + password fields- React Hook Form + Zod schema validation- Error messages inline- "Remember me" checkbox- Redirect to dashboard on success- Link to Register and Forgot PasswordAcceptance Criteria:✅ Form validates email format✅ Shows error if password < 8 chars✅ Shows API error toast on wrong credentials✅ Redirects to /dashboard on success✅ Token stored in Zustand store
```

### Ticket Labels to Use

Label

Color

Used For

`frontend`

Blue

All FE tasks

`backend`

Green

All BE tasks

`design`

Purple

UI polish tasks

`bug`

Red

Bug fixes

`blocked`

Orange

Waiting on something

`api-ready`

Teal

BE finished, FE can connect

### Weekly Linear Workflow

```
Monday:    BE creates API tickets for the week           FE creates UI tickets for the weekTuesday–Thursday: BuildFriday:    BE marks tickets "api-ready"           FE connects and marks "done"           Both write next week's tickets
```

---

## 🔄 RULES FOR PARALLEL WORK (How to Never Block Each Other)

### Rule 1 — Contract First

Every Monday morning, BE and FE agree on the API contract:

```typescript
// Agree on this shape BEFORE building// Example for Week 3 Buyers:GET /buyersResponse: {  data: [{    id: string    contactName: string    companyName: string    email: string    phone: string    country: string    status: 'ACTIVE' | 'INACTIVE'    createdAt: string  }]  total: number}
```

### Rule 2 — FE Uses Mock Data While BE Builds

```typescript
// FE starts building UI with mock dataconst MOCK_BUYERS = [  { id: '1', contactName: 'John Doe', companyName: 'Global Tech', ... }]// Later replace with: const { data } = useQuery(() => fetchBuyers())
```

### Rule 3 — Shared Types Package

Both use `packages/types` — never define the same type twice:

```typescript
// packages/types/src/buyer.ts — BOTH use thisexport type Buyer = {  id: string  contactName: string  companyName: string  email: string  country: string  status: 'ACTIVE' | 'INACTIVE'}
```

### Rule 4 — Git Branch Strategy

```
main          ← production onlystaging       ← staging deploydev           ← integration branchfeature/be-auth-login     ← BE branchfeature/fe-auth-login     ← FE branch
```

Merge into `dev` daily. Never push directly to `main`.

### Rule 5 — Daily Sync (15 min standup)

```
Every day at 10 AM:1. What did I finish yesterday?2. What am I doing today?3. Am I blocked by anything?
```

---

## 🚦 WHERE TO START TODAY (Day 1 Checklist)

### Both do this together (2–3 hours):

- Create GitHub repo with monorepo structure
- Init Turborepo: `npx create-turbo@latest shipflow`
- Set up `apps/api` (NestJS): `nest new api`
- Set up `apps/web` (Next.js): `npx create-next-app web`
- Create Supabase project → copy DATABASE_URL
- Create `.env` files for both apps
- Push to GitHub, set up `dev` and `staging` branches

### BE does (remaining time):

- `prisma init` → write first schema (User + Organization models)
- `prisma migrate dev --name init`
- Create NestJS Auth module skeleton
- Set up @nestjs/jwt and passport-local

### FE does (remaining time):

- Install shadcn/ui: `npx shadcn-ui@latest init`
- Install core deps: TanStack Query, React Hook Form, Zod, Zustand, Axios, date-fns, lucide-react
- Create top navbar component (matches ExDocs — Dashboard | Domestic | Production | Inventory | Import | Exports | Reports | Subscription)
- Create sidebar component shell

### Create these Linear tickets today:

```
[BE] Monorepo Setup — Turborepo + pnpm workspaces[BE] Database Setup — Supabase + Prisma init[BE] Prisma Schema v1 — User + Organization[BE] Auth Module — Register endpoint[BE] Auth Module — Login + JWT[FE] Next.js Setup — shadcn/ui + Tailwind[FE] Top Navbar Component[FE] Sidebar Component Shell[FE] Auth Layout[FE] Login Page[FE] Register Page[FE] Forgot Password Page
```

---

## ⚠️ CRITICAL THINGS TO REMEMBER

1.  **Org Isolation** — Every DB query MUST filter by `organizationId`. Never return another org's data.
2.  **PDF Watermark** — Trial accounts get "ExDocs Trial" watermark on all PDFs.
3.  **CBM Auto-Calc** — Fires automatically when any order item is saved. Never manual.
4.  **Number Series** — Every document type has its own prefix + auto-increment. Configurable by user.
5.  **Exchange Rate** — USD→INR pulls live from Frankfurt API. Always show "last updated" time.
6.  **Signature Upload** — Authorized signature (image) auto-fills from user profile into all documents.
7.  **Smart Auto-Fill** — Bill of Exchange pulls all data from the linked Commercial Invoice.
8.  **Business Card Upload** — AI reads business card image and fills contact form fields.
9.  **Dual Signatures in COO** — Both "Declaration by Chamber" and "Declaration by Exporter" sections.
10. **Post-Shipment Docs** — Each commercial invoice has its own checklist of 9 document types to upload.

---

_Last updated: April 2026 | Team: 2 Developers | Target: 14 Weeks to Production_
