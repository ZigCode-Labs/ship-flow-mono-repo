# Reports Module

## Overview

The Reports module provides **business intelligence, analytics, and operational dashboards** across all business activities. It is organized into four sections: Overview, Sales Analysis, Financial Reports, and Operations (plus Export Readiness).

**Navigation:** Top nav → "Reports"

---

## Sidebar Navigation

```
Reports
├── Overview
│   ├── Executive Summary ★
│   ├── AI Suggestions
│   └── Activity Log
├── Sales Analysis
│   ├── Sales by Period
│   ├── Sales by Buyer
│   ├── Sales by Product
│   └── Sales by Region
├── Financial Reports
│   ├── Invoice Aging Analysis
│   └── Payment Summary
├── Operations
│   ├── Shipment Tracking
│   ├── Country-wise Exports
│   └── Vessel Cut-Off Planner
└── Export Readiness
    └── Readiness Dashboard
```

Users can mark any report as a **Favorite** for quick access.

---

## Overview Section

### Executive Summary

High-level business overview and key performance indicators.

**KPI Cards:**
| Card | Value |
|------|-------|
| Total Export Value | $100 |
| Outstanding Receivables | $100 (100% pending collection) |
| Collection Rate | 0% |
| Documents Pending | 0 (5 shipped) |

**Top Buyers table:** Buyer name, total invoiced amount, order count

**Payment Status panel:**

- Collected vs Outstanding
- Outstanding by Age buckets: Current, 1–30 days, 31–60 days, 60+ days
- "Needs Attention" section for overdue invoices

**Best Sellers:** Top products by revenue

**Application Overview grid:**
| Metric | Count |
|--------|-------|
| Buyers | Active buyers |
| Agents | Buying agents |
| Items | Registered SKUs |
| Invoices | Commercial invoices |
| Proformas | Proforma invoices |
| Domestic | Domestic invoices |
| Payments | Total payment value |
| Shipments | Total shipments |

---

### AI Suggestions

AI-driven insights and actionable recommendations for the export business.

**Sections:**

1. **Current Business Picture** — Critical analysis of business health (concentration risk, payment collection patterns, etc.)
2. **Buyer & Market Opportunities** — Identifies top markets by opportunity; buyer diversification recommendations
3. **Item & Catalog Improvements** — Catalog completeness, missing details
4. **Growth Recommendations** — Actionable steps (reduce outstanding receivables, expand catalog, attract more buyers, etc.)
5. **Market Intelligence** — Trade fair recommendations, marketing suggestions, competitive landscape analysis

Each suggestion card has:

- AI confidence/priority indicators
- "View Buyers" / "Create Proforma" / "Manage Items" quick-action buttons
- Expandable details

---

### Activity Log

Complete history of all user activities in the organization:

- Document created/updated/deleted
- Buyer/item added
- Payment recorded
- Settings changed
- Login events

---

## Sales Analysis

### Sales by Period

Track sales trends over time with period-by-period analysis.

**Filters:**

- From / To date range
- Display Currency (USD / INR / base currency)

**KPI Cards:**

- Total Sales, Growth %, Avg Invoice Value, Total Invoices

**Monthly Sales Trend:** Horizontal bar chart (color-coded: green=highest, blue=regular, red=lowest month)

**Period Breakdown table:**

| Period     | Amount | Quantity | Avg Price | Invoices | Paid % | Outstanding |
| ---------- | ------ | -------- | --------- | -------- | ------ | ----------- |
| March 2026 | $100   | 1        | $100.00   | 1        | 0%     | $100        |

**Export Excel** button for table data.

---

### Sales by Buyer

Customer performance and sales analysis grouped by buyer.

- Revenue per buyer
- Order count per buyer
- Average invoice value
- Payment rate per buyer

---

### Sales by Product

Product-level sales analysis:

- Revenue per SKU
- Units sold
- Average selling price
- Top/bottom performers

---

### Sales by Region

Geographic sales performance and regional breakdown:

- Country-wise export volumes
- Revenue by destination country
- Market share visualization

---

## Financial Reports

### Invoice Aging Analysis

Track outstanding receivables and collection performance.

- Invoices grouped by age bucket (Current, 1–30, 31–60, 60+ days)
- Outstanding amount per bucket
- Buyer-level drill-down
- Collection rate trends

---

### Payment Summary

Comprehensive payment analytics and collection performance:

- Total invoiced vs collected
- Pending collections
- Payment method breakdown
- Collection timeline

---

## Operations

### Shipment Tracking

Real-time shipment monitoring and delivery status.

**Tracking Service:** Online (17track integration)

**Shipment entry:**

- Container/AWB number
- Carrier/Type (Air, Sea)
- Origin country
- Last updated timestamp
- Pending Sync / Tracking status

**+ Track Shipment** button to add new tracking number.

---

### Country-wise Exports

Export volumes and metrics grouped by destination country:

- Total export value per country
- Shipment count per country
- Top destination markets

---

### Vessel Cut-Off Planner

Plan export logistics with vessel schedules and cut-off times. Works backwards from vessel departure to calculate dispatch deadline.

**Inputs:**

- Terminal (e.g., Mumbai INNSA)
- Cargo Type (General Cargo, Hazardous, etc.)
- Trucking Time (hrs)
- Buffer Time (hrs)

**Views:**

- **Vessel Schedules** — Browse available vessel departures
- **Planning Calculator** — Select a vessel and see backward planning timeline

**Backward Planning Timeline (example):**

| Milestone             | Date/Time            | Note                                     |
| --------------------- | -------------------- | ---------------------------------------- |
| Vessel Departure      | Thu, 9 Apr, 01:45 am | Final deadline                           |
| Container Cut-off     | Tue, 7 Apr, 05:45 am | Last container acceptance                |
| Arrival at Port       | Tue, 7 Apr, 01:45 am | Container delivery (4hr buffer)          |
| Dispatch from Factory | Mon, 6 Apr, 05:45 pm | Start your export journey (8hr trucking) |

**Planning Summary:** "You need to dispatch your general cargo from Mumbai by **Mon, 6 Apr, 05:45 pm** to catch the MSC MUMBAI departing on **Thu, 9 Apr, 01:45 am**. Total lead time: 56 hours (3 days)"

---

## Export Readiness

### Readiness Dashboard

Monitor export compliance status and credential renewal tracking.

**Overall Status indicator:** (e.g., URGENT - RENEWALS REQUIRED)

**Compliance items tracked:**

| Credential         | Description                             | Expiry        | Status                 |
| ------------------ | --------------------------------------- | ------------- | ---------------------- |
| IEC License        | Import Export Code valid and active     | March 2025    | ✅ 180 days left       |
| RCMC Certificate   | Registration-cum-Membership Certificate | December 2024 | ⚠️ 45 days left        |
| DGFT Authorization | Export authorization                    | October 2024  | ❌ Expired 15 days ago |
| Bank Compliance    | Export financing and KYC documentation  | —             | ✅ Current             |
| Port Registration  | Terminal access credentials             | February 2025 | ✅ 120 days left       |

Color coding:

- **Green** — Valid with ample time remaining
- **Yellow/Orange** — Expiring soon (< 60 days)
- **Red** — Expired or critical

---

## Report Features

| Feature                | Description                                   |
| ---------------------- | --------------------------------------------- |
| **My Favorites**       | Save frequently-used reports for quick access |
| **Date Range Filters** | Apply custom date ranges to all reports       |
| **Export to Excel**    | Download tabular data as .xlsx                |
| **Multi-currency**     | View reports in USD, INR, or base currency    |
| **Drill-down**         | Click table rows to see individual invoices   |
