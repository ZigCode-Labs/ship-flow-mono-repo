# ShipFlow / ExDocs — Feature Documentation

Documentation generated from UI screenshots and architecture files.

## Documents

| #   | File                                                       | Description                                                                 |
| --- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| 01  | [Overview & Architecture](01-overview-and-architecture.md) | Platform overview, tech stack, monorepo structure, auth                     |
| 02  | [Dashboard](02-dashboard.md)                               | Landing page, KPI cards, quick actions, recent activity                     |
| 03  | [Exports Module](03-exports-module.md)                     | All export documents (PI, CI, Packing List, B/L, COO, etc.), buyers, agents |
| 04  | [Domestic Module](04-domestic-module.md)                   | GST invoices, domestic proforma, credit notes, delivery challans            |
| 05  | [Production Module](05-production-module.md)               | Item register, cost sheets, purchase orders, job work, raw materials        |
| 06  | [Inventory Module](06-inventory-module.md)                 | Stock dashboard, receive/issue/adjust stock, locations                      |
| 07  | [Import Module](07-import-module.md)                       | International suppliers, import POs, landed cost, payments                  |
| 08  | [Reports Module](08-reports-module.md)                     | Business intelligence, AI suggestions, sales analysis, shipment tracking    |
| 09  | [User Profile & Settings](09-user-profile-and-settings.md) | Company profile, banking, compliance, team & roles, document settings       |
| 10  | [Subscription Plans](10-subscription-plans.md)             | Basic / Advanced / Professional tiers, pricing, feature matrix              |

## Feature Development Docs (`/features/`)

21 detailed feature files with Prisma schema, API routes, UI screens, Zod validations, and LLM prompts.

| #   | File                                                                                               | Description                                                             |
| --- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 01  | [Authentication](features/feat-01-auth.md)                                                         | JWT auth, 2FA, refresh tokens, RBAC                                     |
| 02  | [Organization Onboarding](features/feat-02-organization-onboarding.md)                             | 6-step wizard, IEC/GST/bank, logo/signature                             |
| 03  | [Export Items Catalog](features/feat-03-export-items-catalog.md)                                   | Product register, bulk import, AI image analysis                        |
| 04  | [Export Buyers & Contacts](features/feat-04-export-buyers-contacts.md)                             | Buyers, buying agents, shipping agents, business contacts               |
| 05  | [Proforma Invoice](features/feat-05-proforma-invoice.md)                                           | PI with FY-aware numbering, PDF, email, convert to CI                   |
| 06  | [Commercial Invoice](features/feat-06-commercial-invoice.md)                                       | CI with container fields, payment tracking (USD/INR)                    |
| 07  | [Packing List](features/feat-07-packing-list.md)                                                   | CBM auto-calculation, container utilization, PDF                        |
| 08  | [Sample Invoice](features/feat-08-sample-invoice.md)                                               | Customs-purpose document, FOB/CIF breakdown                             |
| 09  | [Post-Shipment Docs](features/feat-09-post-shipment-docs.md)                                       | 9-document bank submission checklist                                    |
| 10  | [Export Payment Tracking](features/feat-10-export-payment-tracking.md)                             | USD receivables, INR bank realization, aging                            |
| 11  | [Bill of Exchange](features/feat-11-bill-of-exchange.md)                                           | D/P and D/A instruments, smart auto-fill, number-to-words               |
| 12  | [Bill of Lading & Shipping Instructions](features/feat-12-bill-of-lading-shipping-instructions.md) | B/L, MTD, shipping instructions to agent                                |
| 13  | [Certificate of Origin](features/feat-13-certificate-of-origin.md)                                 | GSP format, chamber certification, origin criteria                      |
| 14  | [Domestic Module](features/feat-14-domestic-module.md)                                             | Tax invoices (CGST/SGST/IGST), credit notes, delivery challans          |
| 15  | [Production Settings & Items](features/feat-15-production-settings-items.md)                       | BOM, dynamic attributes, 5-section cost sheets                          |
| 16  | [Purchase Orders & Job Work](features/feat-16-purchase-orders-job-work.md)                         | Production POs, job work orders, receive goods                          |
| 17  | [Raw Materials](features/feat-17-raw-materials.md)                                                 | RM register, 8 movement types, RM purchases                             |
| 18  | [Inventory](features/feat-18-inventory.md)                                                         | 7-tab inventory: dashboard, register, receive, issue, adjust, locations |
| 19  | [Import Module](features/feat-19-import-module.md)                                                 | International suppliers, import orders, payment stages                  |
| 20  | [Reports & Analytics](features/feat-20-reports-analytics.md)                                       | Executive summary, AI suggestions, vessel cut-off planner, 17track      |
| 21  | [Subscription](features/feat-21-subscription.md)                                                   | Plan tiers, Razorpay integration, module access guard                   |

## Module Map

```
ExDocs Platform
├── Dashboard          → Quick overview + shortcuts
├── Domestic           → Indian GST invoicing
├── Production         → Manufacturing & cost management
├── Inventory          → Finished goods stock
├── Import             → International procurement
├── Exports            → Export documentation (core)
├── Reports            → Analytics & BI
└── Subscription       → Plan management
```

## Source Images

All documentation was derived from UI screenshots in `/images/`:

- `exdocs-images/` — Full app screenshots (45 screens)
- `Inventory-Module/` — Inventory-specific screens
- `Production-module/` — Production-specific screens
- `Reports-Module/` — Reports-specific screens
- `domestic-module/` — Domestic-specific screens
- `imports-module/` — Import-specific screens
- `shipflow-architecture.md` — Full technical architecture document
