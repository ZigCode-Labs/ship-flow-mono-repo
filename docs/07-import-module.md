# Import Module

## Overview

The Import module manages all **international procurement** — importing goods from overseas suppliers. It tracks item catalogues, purchase orders, landed costs, payment milestones, and post-shipment documentation for imports.

**Navigation:** Top nav → "Import"

---

## Sidebar Navigation

| Section                | Description                              |
| ---------------------- | ---------------------------------------- |
| **Import Settings**    | General · Suppliers · Delivery Locations |
| **Item Register**      | Catalogue of imported goods              |
| **Purchase Orders**    | Import POs & landed cost                 |
| **Payments**           | Import payment milestones                |
| **Post-Shipment Docs** | Upload & manage post-shipment documents  |

---

## Import Settings

### General Settings

Configure code number series for all import documents.

**Code Series Configuration:**

| Document          | Prefix | Digits | Suffix (year auto) | Preview   |
| ----------------- | ------ | ------ | ------------------ | --------- |
| Import Item Code  | IMP    | 5      | E.G. 2026          | IMP-00001 |
| Import PO Code    | IPO    | 5      | E.G. 2026          | IPO-00001 |
| Import Cost Sheet | ICS    | 5      | E.G. 2026          | ICS-00001 |

**Import Defaults:**
| Setting | Default |
|---------|---------|
| Default Currency | USD |
| Default Supplier Country | China |
| Default Shipment Mode | Sea Freight |
| Financial Year | 2025-26 |

---

### Suppliers (International)

Directory of international suppliers/vendors.

**Edit Supplier form:**

- Contact Name, Company Name
- Supplier Type (e.g., Fabric Mill, Component Manufacturer, Trading Company)
- Country, Phone Code + Phone, Email
- City, State/Province, Address

**Import-Specific Details:**

- Supplier Currency (USD, EUR, CNY, etc.)
- Payment Terms (Open Account, LC, TT, etc.)
- Lead Time (days)
- Port of Loading (e.g., Shanghai)
- Trade Terms (FOB, CIF, EXW, etc.)
- Supplier Rating (1–5 stars)
- Bank Details (SWIFT / Account number)

---

### Delivery Locations

Registered delivery addresses for imported goods (factories, warehouses).

---

## Item Register

Catalogue of all items that are imported from overseas.

Each import item has:

- Item code (auto-generated IMP-XXXXX)
- Name, description, unit
- Default supplier
- Price history per supplier
- HS code for customs
- Lead time, MOQ (Minimum Order Quantity)

---

## Purchase Orders (Import POs)

Create and manage international purchase orders.

**New Import PO form:**

### PO Details

- PO Number (auto-generated, e.g., IPO-00001)
- Issue Date, Expected Delivery Date
- Supplier (from International Suppliers list)
- Incoterms (FOB, CIF, EXW, etc.)
- Port of Loading, Port of Discharge
- Currency + Exchange Rate
- Payment Terms

### Line Items

- Import Items from register
- Description, Qty, Unit, Unit Price, Amount

### Landed Cost Calculation

Adds to the FOB price:

- Ocean Freight
- Insurance
- Import Duty (%)
- Customs Clearance charges
- Inland Transport
- **Total Landed Cost per unit**

---

## Payments

Track import payment milestones — typically structured as:

- **Advance Payment** (e.g., 30% before production)
- **Balance Payment** (e.g., 70% before shipment / against BL)
- **TT (Telegraphic Transfer)** tracking

Each payment milestone:

- Linked to Import PO
- Amount, Currency, Exchange Rate
- Payment method (TT, LC, Open Account)
- Bank Reference Number
- Expected Due Date vs Actual Payment Date
- Status (Pending / Paid / Overdue)

---

## Post-Shipment Docs (Import)

Upload and manage documents received from international suppliers after shipment:

- Commercial Invoice (from supplier)
- Packing List
- Bill of Lading / Airway Bill
- Certificate of Origin
- Test/Inspection Reports
- Insurance Certificate
- Other customs documents

Used for customs clearance, bank records, and audit trails.

---

## Key Relationships

| Linked Module             | How                                          |
| ------------------------- | -------------------------------------------- |
| Production → RM Register  | Imported raw materials feed into RM Register |
| Production → RM Purchases | Import POs can link to RM purchase tracking  |
| Reports                   | Import costs feed into landed cost reports   |
| Inventory                 | Received import items can update stock       |
