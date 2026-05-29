# Production Module

## Overview

The Production module manages the full manufacturing workflow for small metal businesses — from item registration and cost sheets to supplier purchase orders, outsourced job work, and raw material inventory.

**Navigation:** Top nav → "Production"

---

## Sidebar Navigation

| Section                 | Sub-items          | Description                                |
| ----------------------- | ------------------ | ------------------------------------------ |
| **Production Settings** | General            | Configure code series and defaults         |
|                         | Suppliers          | Manage supplier contacts                   |
|                         | Job Workers        | Manage job worker contacts                 |
|                         | Delivery Locations | Your delivery addresses                    |
|                         | Job Work Types     | Define outsourced work categories          |
| **Item Register**       | —                  | Manage production materials & components   |
| **Cost Sheets**         | —                  | Compute landed cost & export pricing       |
| **Purchase Orders**     | —                  | Create and manage supplier purchase orders |
| **Job Work**            | —                  | Manage outsourced job work orders          |
| **Payments**            | —                  | Record & track production payments         |
| **Raw Materials**       | RM Register        | View and manage raw material items         |
|                         | RM Inventory       | Raw material stock movements & balances    |
|                         | RM Purchases       | Purchase orders for raw materials          |

---

## Production Settings

### General Settings

Configure code series and defaults for all production documents.

**Code Series Configuration:**

| Document               | Code Prefix | Suffix    | Digits | Preview   |
| ---------------------- | ----------- | --------- | ------ | --------- |
| Item Register          | PRD         | E.G. 2526 | 5      | PRD-00001 |
| Purchase Orders (PO)   | PO          | E.G. 2526 | 5      | PO-00001  |
| RM Purchase Orders     | RMPO        | E.G. 2526 | 3      | RMPO-001  |
| Job Work Orders        | JW          | E.G. 2526 | 5      | JW-00001  |
| Raw Materials Register | RM          | E.G. 2526 | 3      | RM-001    |
| Cost Sheets            | CS          | E.G. 2526 | 3      | CS-001    |

**Defaults:**

- Base Currency: INR – Indian Rupee
- Payment Terms (free text)

### Suppliers

Add and manage domestic production suppliers.

**Add New Supplier form:**

- Upload Business Card (AI auto-fill)
- Contact Name, Company Name
- Supplier Type (dropdown)
- Phone, Country, PIN Code, City/State, Address
- Contact Person, Designation
- GSTIN, Email

### Job Workers

Contacts for outsourced job work (e.g., plating, polishing, assembly).

**Add New Job Worker form:**

- Upload Business Card
- Contact Name, Company Name (optional)
- Phone, Country, PIN Code, City/State, Address
- Contact Person, Designation
- GSTIN, Email (optional)
- Type: Job Worker (locked)

### Delivery Locations

Internal factory or warehouse addresses for delivery.

### Job Work Types

Define categories of outsourced work (e.g., Electroplating, Powder Coating, Finishing).

---

## Item Register

Manage production items — finished goods, sub-assemblies, components.

**Import from Main Item:** Sync items from the Export Items Catalog.

**Item detail form sections:**

1. **Basic Details** — Name, Item Code (auto-generated PRD-XXXXX), description, unit of measure, HSN code
2. **Components & Dimensions** — Bill of Materials (BOM); add sub-components with quantities
3. **Spec Files** — Attach drawings, spec sheets
4. **Dynamic Attributes** — Custom key-value properties (e.g., Finish: Gold, Material: Brass)
5. **Item Image** — Upload product photo; **Smart AI Auto Fill** — AI extracts attributes from the image

**Search/Filter:** By name, code, description; filter by All Types

---

## Cost Sheets

Compute landed cost and export pricing per finished product.

**New Cost Sheet form:**

### Header

- Date, Shipping Term (FOB / CIF / Air / Courier)
- Finished Item Name (free text or select from register)
- Batch Quantity, Unit of Measure

### Cost Sections (expandable, each shows running total)

1. **Component-wise Production Cost** — per-component material + labor costs
2. **Quality, Compliance & Risk Costs** — testing, inspection, certification costs
3. **Packaging Costs** — boxes, cartons, labels
4. **Storage & Handling Costs** — warehousing, loading
5. **Shipping & Export Charges (FOB)** — freight, customs, documentation

### Cost Summary

| Row                        | Amount |
| -------------------------- | ------ |
| Total Production Cost      | ₹0     |
| Packaging                  | ₹0     |
| Quality, Compliance & Risk | ₹0     |
| Storage & Handling         | ₹0     |
| Shipping & Export          | ₹0     |
| **TOTAL LANDED COST**      | ₹0     |

### Margin & Pricing (expandable)

- Set desired margin % → auto-calculates export price

### Quick Summary Panel (right sidebar)

Live totals: Production, Packaging, Compliance, Storage, Shipping, Landed Cost, Final Price

**AI Auto-Fill:** Can suggest costs based on item image and category.

---

## Purchase Orders (Supplier POs)

Create and manage purchase orders placed with domestic suppliers.

**New Purchase Order form:**

### PO Details

- PO Number (auto-generated, e.g., PO-00001)
- PO Context (Domestic Purchase / Import Purchase)
- Issue Date, Expected Delivery Date
- Supplier (dropdown from Suppliers list), Supplier GSTIN (auto-filled)
- Supplier Address (auto-filled)
- Delivery Location (dropdown), Currency (INR default)
- Payment Terms (free text)
- Ship To Address (delivery address)
- Notes (prints on PO), Internal Notes (private)

### Line Items

- - Add Item: links to Item Register
- Description, Qty, Unit, Rate, GST %, Amount

### Summary

- Subtotal, GST, Total Tax, Additional Charges, **Grand Total**

---

## Job Work

Manage outsourced manufacturing orders sent to job workers.

**New Job Work Order form:**

### Job Work Details

- Job Work Number (auto-generated, e.g., JW-00001)
- Job Work Type (from Job Work Types list)
- Issue Date, Expected Return Date
- Job Worker (dropdown), Issue Time
- Job Worker Address (auto-filled)
- Remarks

### Issue Lines

Table of items being sent to the job worker:

- Item, Quantity, Unit, Rate, Amount

### Summary

- Subtotal, Overall Discount, **Total Job Work Value**

---

## Payments

Record and track production payments to suppliers and job workers.

---

## Raw Materials

### RM Register

Catalogue of all raw materials used in production.

**Item detail (RM-XXX) sections:**

**Basic Details:**

- Name/Title (e.g., Cotton Fabric, Steel Rod)
- Category (e.g., Fabric, Metal, Chemical)
- Qty on Hand, Unit (PCS, KGS, MTR, etc.)
- Description

**Purchase Defaults:**

- Currency, Standard Rate
- Preferred Supplier (optional)
- HSN Code, GST Rate (%)
- Lead Time (days)

**Inventory & Stock:**

- Qty on Hand, Min Reorder Level, Reorder Quantity
- Storage Location (optional)

**Dynamic Attributes:** Custom key-value (Grade, Origin, Purity, Thickness, etc.)

**Smart AI Auto Fill:** Suggest attributes from photo.

---

### RM Inventory

Stock balances and movement ledger for all raw materials.

**Views:** Movement Ledger | Stock Summary

**Movement Type filters:** All / Opening / Purchase Receipt / Stock In / Stock Out / Adjustment / Job Work / Return

**Add Inventory Movement dialog:**

- Raw Material Item (dropdown)
- Movement Type (Opening Stock, Purchase Receipt, Stock In, Stock Out, Adjustment, Job Work Issue, Return)
- Quantity
- Batch # (optional), Lot # (optional)
- Notes (optional)

---

### RM Purchases

Purchase orders specifically for raw material procurement.

**New RM Purchase Order (RMPO-XXX):**

All standard PO fields (same as Supplier PO) plus:

- Attachments section: Upload quotation, email confirmation, drawings, etc.
- Line Items: RM items from RM Register
- Grand Total with GST breakdown (Subtotal, GST, Total Tax, Additional Charges)
