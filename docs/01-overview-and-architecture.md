# ShipFlow — Overview & Architecture

## What is ShipFlow?

ShipFlow (branded as **ExDocs** in the UI — "exports made easy") is a **web-based export management platform** for Small Metal Businesses (SMBs) operating within India. It replaces manual Excel/Word/PDF workflows with a centralized, automated system covering:

- Export documentation (26+ document types)
- Domestic sales & GST invoicing
- Production & job-work management
- Raw material inventory
- Import tracking
- Business intelligence & analytics

---

## Navigation Structure

The top-level navigation bar contains seven modules:

| Tab              | Description                                              |
| ---------------- | -------------------------------------------------------- |
| **Dashboard**    | Overview stats, quick actions, recent activity           |
| **Domestic**     | Indian domestic buyers, GST invoices, delivery challans  |
| **Production**   | Item register, cost sheets, job work, purchase orders    |
| **Inventory**    | Stock dashboard, receipts, issue/adjust stock            |
| **Import**       | International suppliers, import POs, payment milestones  |
| **Exports**      | Export documents (PI, CI, Packing List, B/L, COO, etc.)  |
| **Reports**      | Business intelligence, sales analysis, shipment tracking |
| **Subscription** | Plan management and billing                              |

Additionally, the top-right contains:

- **Find Buyers** — AI-powered buyer discovery
- **User/Org menu** — Profile, Manage Organizations, Team & Roles, Settings

---

## Tech Stack

### Frontend (Web)

| Library                  | Purpose                                 |
| ------------------------ | --------------------------------------- |
| Next.js 16 (App Router)  | SSR, routing, layouts, server actions   |
| TypeScript               | Strict typing end-to-end                |
| shadcn/ui + Tailwind CSS | UI components and utility-first styling |
| TanStack Query           | Server state management, caching        |
| React Hook Form + Zod    | Form handling and validation            |
| Zustand                  | Client state (active org, UI state)     |
| Recharts                 | Analytics charts                        |
| TanStack Table           | Data tables                             |

### Backend (NestJS)

| Library                | Purpose                                |
| ---------------------- | -------------------------------------- |
| NestJS + Express       | HTTP framework with structured modules |
| Prisma ORM             | Database queries, migrations           |
| PostgreSQL (Supabase)  | Primary database                       |
| Redis + BullMQ         | Background jobs (optional)             |
| Passport.js + JWT      | Authentication                         |
| Puppeteer / @react-pdf | Server-side PDF generation             |
| AWS S3 / MinIO         | File storage for PDFs and assets       |
| Zod                    | Input validation                       |

### Python Services (for AI/Complex tasks)

| Library        | Purpose             |
| -------------- | ------------------- |
| FastAPI        | Async API framework |
| Pandas / NumPy | Data transformation |
| Celery         | Background tasks    |

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Clients (Web Only)                     │
│ ┌────────────────────────────────────────────────────┐   │
│ │           ExDocs Web App (Next.js)                 │   │
│ │     Exporter Dashboard + Admin Panel               │   │
│ └──────────────────────────┬─────────────────────────┘   │
└─────────────────────────────┼────────────────────────────┘
                              │ REST API (HTTPS)
                     ┌────────▼────────┐
                     │   NestJS API    │
                     │  (Express adp.) │
                     └────────┬────────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
    ┌─────────────┐   ┌──────────────┐   ┌──────────────┐
    │  PostgreSQL  │   │   AWS S3 /   │   │ Redis+BullMQ │
    │  (Supabase)  │   │    MinIO     │   │  (optional)  │
    └─────────────┘   └──────────────┘   └──────────────┘
```

---

## Core Concept: Export Order as Single Source of Truth

Everything revolves around the **Export Order**:

```
Export Order
     │
     ├──► Documents auto-generated (PI, CI, Packing List, COO, CIPL)
     ├──► CBM calculated automatically (L × W × H × Qty / 1,000,000)
     ├──► Shipment created from same data
     ├──► Invoice generated from same data
     └──► Payment tracked against same order
```

Data is entered **once** and reused everywhere. No re-typing, no copy-pasting.

---

## Monorepo Structure

```
shipflow/
├── apps/
│   ├── web/          # Next.js Web Application
│   └── api/          # NestJS Backend
├── packages/
│   ├── schemas/      # Zod validation schemas
│   ├── types/        # Shared TypeScript types & enums
│   ├── config/       # Design tokens + env config
│   ├── api-client/   # Axios instance + TanStack Query hooks
│   └── utils/        # CBM calc, formatting, doc numbers
└── infra/
    ├── docker/       # docker-compose for local dev
    └── nginx/
```

---

## Deployment

| Component     | Platform                 | Notes                                |
| ------------- | ------------------------ | ------------------------------------ |
| Web (Next.js) | Vercel                   | Zero-config, SSR/SSG, preview on PRs |
| API (NestJS)  | Railway or AWS ECS       | Container deployment, auto-scaling   |
| PostgreSQL    | Supabase                 | Managed PostgreSQL with backups      |
| Redis         | Railway Redis (optional) | For BullMQ                           |
| File Storage  | AWS S3 + CloudFront      | PDFs and company assets              |

---

## Authentication & Security

- **JWT** access tokens (4–6 hour expiry) stored in memory
- **Refresh tokens** (15 days) stored in httpOnly cookies with rotation
- **RBAC**: OWNER, ADMIN, STAFF, SUPER_ADMIN roles
- **Multi-org**: A user can belong to multiple organizations
- **Org isolation**: Every DB query scoped to `organizationId`
- bcrypt password hashing (12 rounds)
- Rate limiting via `@nestjs/throttler`
- Zod validation on all API endpoints

---

## 14-Week Delivery Plan

| Week | Delivery                                   |
| ---- | ------------------------------------------ |
| 1    | Auth (Register + Login + JWT)              |
| 2    | Organization setup + onboarding            |
| 3    | Buyers + Item Register                     |
| 4    | Export Order (create + list)               |
| 5    | CBM Calculator                             |
| 6    | Documents: Proforma Invoice + Packing List |
| 7    | Documents: Commercial Invoice + COO + CIPL |
| 8    | Shipment Management                        |
| 9    | Invoices + Payment Tracking                |
| 10   | Reports + Analytics                        |
| 11   | UI Polish + Full Workflow                  |
| 12   | Testing + Bug Fixes                        |
| 13   | Staging + Feedback                         |
| 14   | Production Deployment                      |
