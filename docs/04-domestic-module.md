# Domestic Module

## Overview

The Domestic module handles all **Indian domestic sales** — GST-compliant invoicing, delivery challans, domestic buyers, and proforma invoices for domestic customers.

**Navigation:** Top nav → "Domestic"

---

## Sidebar Navigation

| Section               | Description                           |
| --------------------- | ------------------------------------- |
| **Settings**          | Number series for domestic documents  |
| **Item Catalog**      | Manage your product catalog           |
| **Domestic Buyers**   | Manage Indian buyers with GST details |
| **Domestic Proforma** | Domestic quotation invoices           |
| **Tax Invoices**      | GST-compliant sales invoices          |
| **Payment Tracking**  | Track export payments                 |
| **Credit Notes**      | GST-compliant credit notes            |
| **Delivery Challans** | Goods movement documents              |

---

## Domestic Document Settings

Configure number series for all domestic documents.

**URL:** Domestic → Settings

> **Note:** Changing a prefix applies to new documents only. Documents already created keep their original numbers.

| Document Type     | Prefix | Digits | Preview       | Purpose                               |
| ----------------- | ------ | ------ | ------------- | ------------------------------------- |
| Tax Invoice       | DI     | 3      | DI-26-27-001  | GST-compliant domestic sales invoices |
| Domestic Proforma | DPI    | 3      | DPI-26-27-001 | Domestic quotation/proforma invoices  |
| Credit Note       | CN     | 3      | CN-26-27-001  | GST credit notes against tax invoices |
| Delivery Challan  | DC     | 3      | DC-26-27-001  | Goods movement documents (no GST)     |

---

## Domestic Buyers

Manage Indian buyers with GST details.

**Search:** By company name, GSTIN, city, state  
**Filter:** All Status / Active / Trash

**Add Domestic Buyer:** Standard buyer form with GSTIN field.

---

## Domestic Proforma

Quotation/proforma invoices for domestic customers (INR).

**New Domestic Proforma form:**

### Proforma Details

- Proforma Number (auto-generated, e.g., DPI-26-27-001)
- Date, Valid Until

### Currency

- USD to INR Exchange Rate (live rate from FrankfurterAPI, refreshable)

### Seller Details

- Company Name (auto-filled from profile)
- GSTIN, State

### Customer Details

- Select Customer (domestic buyer dropdown)
- Customer Name, Customer GSTIN
- Place of Supply (state dropdown)

### Line Items

| Column      | Description       |
| ----------- | ----------------- |
| Item Code   | From item catalog |
| Description | Item description  |
| HSN         | HSN/SAC code      |
| Qty         | Quantity          |
| Rate (₹)    | Price in INR      |
| Amount      | Qty × Rate        |
| GST %       | Tax rate          |
| Total       | Amount + GST      |

### Summary

- Subtotal, Discount (% or flat), Taxable Amount, CGST, SGST, Total Tax, **Grand Total**

### Terms & Notes

- Payment Terms, Reference, Notes

---

## Tax Invoices

GST-compliant sales invoices for domestic transactions.

**New Tax Invoice form:**

All Domestic Proforma fields plus:

- **Invoice Number** (e.g., DI-26-27-001)
- **Invoice Date + Due Date**
- **Bank Details** (auto-filled from profile): Bank Name, Account Number, IFSC Code, Branch

The GST breakdown shows CGST + SGST (intra-state) or IGST (inter-state) based on Place of Supply.

---

## Credit Notes

GST-compliant credit notes raised against existing tax invoices.

- Linked to original Tax Invoice
- Reduces outstanding payable
- Number format: `CN-{FY}-{SEQ}`

---

## Delivery Challans

Goods movement documents — no GST applicable.

**New Delivery Challan form:**

### Header

- DC Number (auto-generated)
- DC Date
- Delivery Type (Supply of Goods, Job Work Return, etc.)

### From (Your Company)

- Auto-filled from organization profile

### To (Buyer)

- Select Buyer, Buyer Name, GSTIN (optional)
- Address, State, Place of Delivery

### Transport Details (Optional)

- Transporter Name
- Vehicle Number
- Expected Delivery Date

### Linked Invoice (Optional)

- Link to an existing tax invoice to copy line items

### Items Table

- Description, Item Code, HSN, Qty, Unit, Rate (₹), Amount

### Summary

- Total Quantity, Grand Total (shown as "Zero Rupees Only" if no value)

### Notes (Optional)

---

## Item Catalog (Domestic)

Shared with Export Items Catalog — the same product master is available in both modules.

---

## Payment Tracking (Domestic)

Track payments received against domestic tax invoices. Similar to export payment tracking but in INR.

---

## Design Notes

- All amounts display in INR (₹)
- Live USD→INR exchange rate is fetched and shown on proforma/invoice forms
- GSTIN fields are validated for format (e.g., 27AABCT1234F1Z5)
- Document number series is financial-year-aware (e.g., 26-27 = FY 2026-27)
