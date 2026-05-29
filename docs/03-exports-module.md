# Exports Module

## Overview

The Exports module is the core of the platform. It manages all export documentation, items catalog, payment tracking, buyer and agent directories.

**Navigation:** Top nav → "Exports"

---

## Sidebar Navigation

| Section               | Sub-items               | Description                      |
| --------------------- | ----------------------- | -------------------------------- |
| **Overview**          | —                       | Summary of all documents         |
| **Items Catalog**     | —                       | Manage your product catalog      |
| **Export Documents**  | Proforma Invoices       | Pre-shipment quotation documents |
|                       | Commercial Invoices     | Final export invoices            |
|                       | Post-Shipment Documents | Documents for bank submission    |
|                       | Sample Invoices         | Invoices for product samples     |
|                       | Packing Lists           | Export package contents          |
|                       | Bill of Exchange        | D/P and D/A payment instruments  |
|                       | Bill of Lading          | Carrier transport documents      |
|                       | Shipping Instructions   | Instructions for shipping agents |
|                       | Certificates            | Origin & compliance certificates |
| **Payment Tracking**  | —                       | Monitor export payments          |
| **Buyer Details**     | —                       | Manage customer information      |
| **Buying Agents**     | —                       | Manage buyer representatives     |
| **Shipping Agents**   | —                       | Manage logistics partners        |
| **Business Contacts** | —                       | Manage other business contacts   |

---

## Overview Page

The Exports Center Overview shows:

| KPI Card            | Description                                   |
| ------------------- | --------------------------------------------- |
| **Total Documents** | All documents ever created (+% vs last month) |
| **This Month**      | Documents created in current month            |
| **Pending Review**  | Documents awaiting approval/action            |
| **Completed**       | Fully processed documents                     |

Document type breakdown cards:

- Post-Shipment Documents
- Proforma Invoices
- Commercial Invoices
- Sample Invoices
- Packing Lists
- Bill of Lading
- Certificates

A prominent **"Post-Shipment Documents"** quick-access button is shown top-right.

---

## Items Catalog

Manage the export product catalog. Each item can be:

- Created manually with name, description, price, weight, category
- Imported via **Import Excel** (bulk upload)
- Enriched with **AI Item Analysis** (upload image → auto-fill)
- Organized into categories

| Column    | Description                          |
| --------- | ------------------------------------ |
| Image     | Product thumbnail                    |
| Item Code | Auto-generated (e.g., GTS-0001)      |
| Name      | Product description                  |
| Category  | e.g., Metal Handicrafts & Home Décor |
| Price     | Unit price (USD by default)          |
| Weight    | Gross weight in kg                   |
| Status    | Active / Inactive toggle             |
| Barcode   | Product barcode (Pending/Generated)  |

**Toolbar actions:** Import Excel, Bulk Images, Fix Images, Order Qty Analyzer, Delete Selected, Export, + Add Item

---

## Export Documents

### 1. Proforma Invoice (PI)

**Purpose:** Sent to buyer before shipment for approval and payment arrangement.

**Document fields:**

- Exporter details (name, address, IEC, GST)
- PI Number & Date, Exporters Reference
- Buyer Order No & Date
- Buyer details + Currency & Exchange Rate
- Terms of Delivery
- Pre Carriage By, Country of Origin
- Vessel/Flight No, Place of Receipt by Pre-Carrier
- Port of Loading, Port of Discharge, Port of Final Destination
- Description of Goods (line items: Product Code, HSN, Unit Qty, Unit, Price, Amount)
- Bank Details
- Consignment Total, Discount, Grand Total
- Signatory Company, Authorized Signatory Name, Signature

**Actions:** Download PDF, Send via Email, Cancel

**Number format:** `PI-{YY}-{FY}-{SEQ}` e.g., `PI-26-27-001`

---

### 2. Commercial Invoice (CI)

**Purpose:** Final invoice for customs clearance and payment.

All Proforma Invoice fields plus:

- Container No, Seal No, Container Size/Type
- Invoice status badge (Unpaid / Paid)

**Actions:** Edit, Create New, Download PDF, Send via Email, Manage Payments, Cancel Invoice, Delete

**Number format:** `CI-{SEQ}` e.g., `C-001`

---

### 3. Post-Shipment Documents

**Purpose:** Upload and manage shipping documents for bank submission (bank realization).

Linked to a specific Commercial Invoice. Document checklist:

- Commercial Invoice (Signed Original)
- Packing List (Signed Original)
- Bill of Lading / Airway Bill
- Bank Realization Certificate (BRC)
- Insurance Certificate
- Inspection Certificate
- Certificate of Origin
- Courier/AWB Receipt
- Other Supporting Documents

Each document can be uploaded or replaced individually. Status badge: **Complete** when all uploaded.

---

### 4. Sample Invoices

**Purpose:** For customs purposes only — not a commercial invoice. Used when sending product samples.

Additional fields vs standard CI:

- Type of Shipment
- Incoterms (FOB, CIF, EXW)
- Ocean Freight (USD) + Insurance (USD)
- FOB Sub-Total, CIF Grand Total breakdown

**Actions:** Download PDF, Payments, Mark as Sent, Email, Delete

---

### 5. Packing List

**Purpose:** Itemized breakdown of packages — box-by-box detail.

**Document fields:**

- All standard export header fields
- Per-item: Item Code, Description, Case Num, Qty, Unit, Packages, Net Wt, Gross Wt, CBM
- Total Packages, Total Weight & Kgs, Total CBM
- Declaration statement
- Terms & Conditions

**Actions:** Edit, Mark as Sent, Create New, Download PDF, Send via Email, Re-calculate CBM, Delete

---

### 6. Bill of Exchange

**Purpose:** D/P (Documents against Payment) and D/A (Documents against Acceptance) payment instruments.

**Smart Auto-Fill:** Pre-populates fields from existing documents.

**Fields:**

- Reference No, Amount in Figures
- B/L Date, Place of Issue, Date of Issue
- Select Buyer, Pay to the order of
- Sum of amount in words (auto-generated)
- Drawn under, Dated
- Payment Terms & Amount Details
- Drawee & Drawer Information
- Bank Details (Largely Critical)
- Letter of Credit (Optional)
- Signature Details, Legal Requirements

---

### 7. Bill of Lading (Multimodal Transport Document)

**Fields:**

- MTD No, Shipment Reference No
- Consignor, Agent Ref, Agent Ref
- Consignee (To Order), NTO No
- Notify Party
- Place of Acceptance, Port of Loading, Freight Payable at
- Vessel, Port of Discharge, Place of Delivery, No. of Original MTDs
- Blanks and Number / Container No
- Description of goods: packages, net/gross weight, measurement
- Freight details
- Route/Place of Transshipment
- Place & date of issue, Date of issue
- Shipped on Board date
- Original Copies Required (First/Second/Third)

---

### 8. Shipping Instructions

**Purpose:** Instructions given to the shipping agent.

**Sections:**

- Instruction No, Date, Buyer Reference, Export Declaration No
- Exporter/Shipper + Consignee details
- Notify Party, Carrier
- Shipping Details: Method of Dispatch, Type of Shipment, Vessel/Aircraft, Voyage No, Port of Loading, Port of Discharge, Country of Origin, Incoterms, Freight Charges
- Cargo Details: Marks & Numbers, No. of Packages, Description, Gross Weight, Measurements
- Consignment Total (USD), Hazardous Goods, Letter of Credit, Document Instructions, Special Instructions

---

### 9. Certificates (Certificate of Origin)

**Purpose:** Certifies goods are manufactured in India. Required by customs.

**Fields:**

- Exporter details, Export Invoice Number & Date, Letter of Credit No
- Consignee + Buyer (If Not Consignee)
- Method of Dispatch, Type of Shipment
- Vessel/Aircraft, Voyage No
- Port of Loading, Date of Departure
- Port of Discharge, Final Destination
- Marks & Numbers, No. of Packages, Description of Goods, Tariff Code, Gross Weight
- Declaration by Chamber
- Declaration by Exporter
- Place and Date of Issue
- Signatory Company + Name of Authorized Signatory
- Signatures (Chamber stamp + Exporter signature)

---

## Payment Tracking

Record payments received against export invoices.

**Record New Payment dialog fields:**

- Document Type (Commercial Invoice, Sample Invoice, etc.)
- Select Invoice
- Amount Received (USD)
- Received in Bank (INR — actual INR credited)
- Exchange Rate (manual entry, auto-calculates)
- Bank Charges (INR — wire transfer fees)
- Payment Date + Received Date
- Payment Method (Bank Remittance, etc.)
- Bank Reference Number
- Payment Notes

---

## Buyer Details

Directory of international export buyers.

**Add New Buyer form:**

- Upload Business Card (AI auto-fill)
- Contact Name, Company Name, Email, Phone
- Country, Preferred Currency (linked to buyer)
- PIN Code, City (auto-filled), State (auto-filled), Address
- VAT Number
- Shipping Details (Delivery Destination): Shipping Address, Default Port of Discharge, Default Port of Final Destination
- Trade Terms: Incoterms, Terms of Delivery, Country of Final Destination, Terms of Payment
- Active Status toggle
- Notes

---

## Buying Agents

Directory of buyer representatives and commission agents.

**Add Buying Agent form:**

- Upload Business Card (AI auto-fill)
- Name, Company, Email, Phone, Country, PIN Code, City/State, Address
- Contact Person, Designation
- Commission %, Agreement Date, Agreement Expiry Date
- Notes

---

## Shipping Agents

Directory of logistics and freight forwarding partners.

**Add New Shipping Agent form:**

- Upload Business Card
- Contact Name, Company Name, Email, Phone, Country, Address
- License Number (e.g., NVOCC 2025 001)
- Service Types (checkboxes): Sea Freight, Air Freight, Custom Clearance, Inland Transport, Warehousing, Documentation, Freight Forwarding, LCL (Less than Container Load), FCL (Full Container Load)
- Active Status toggle, Notes

---

## Business Contacts

General business contact directory (banks, inspection agencies, etc.).

**Add New Contact form:**

- Upload Business Card
- Name, Company, Email, Phone, Country, Address
- Contact Person, Designation
- Contact Type (Other, Bank, Inspection Agency, etc.)
- Notes
