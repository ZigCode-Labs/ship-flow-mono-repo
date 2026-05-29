# User Profile, Organization & Settings

## Overview

User Profile and Settings manage business identity, compliance data, banking information, team access control, and document templates.

**Access:** Click user name (top-right) → User Profile / Manage Organizations / Team & Roles

---

## User Profile

**URL:** User menu → User Profile  
**Purpose:** Manage business information and account settings

The profile page has tabs across the top:

| Tab            | Description                              |
| -------------- | ---------------------------------------- |
| **Company**    | Business registration and identification |
| **Contact**    | Contact details (phone, address)         |
| **Banking**    | Bank account for invoice auto-fill       |
| **Compliance** | IEC, GST, regulatory details             |
| **Email**      | SMTP / email delivery configuration      |
| **Security**   | Password, 2FA settings                   |
| **Templates**  | Document header/footer customization     |

---

### Company Tab

**Company Details:**

- Company Name (e.g., GlobalTech Solutions Private Limited)
- Trade Name (e.g., GlobalTech Trading)
- IEC Code (Importer Exporter Code)
- GST Number
- PAN Number
- Registration Number (CIN)

**Company Logo:**

- Upload PNG or JPG (recommended 500×200px, max 2MB)
- Logo appears on all generated reports and documents

**Master Currency:**

- Default pricing currency for items and documents
- Affects Item Register; existing items retain their original currency

**Shipping Defaults** (auto-filled into PI, CI, and export docs):

- Country of Origin (e.g., India)
- Port of Loading (e.g., JNPT Mumbai, Mundra)
- Place of Receipt by Pre-Carrier (e.g., Ahmedabad ICD, Factory)

**Item Code Settings:**

- Item Code Prefix (e.g., GTS)
- Number of Digits (e.g., 4 digits → GTS-0001)

---

### Banking Tab

Bank details auto-filled into all invoices and export documents:

- Bank Name
- Account Number
- IFSC Code
- Branch Name
- SWIFT Code (for international payments)

---

### Compliance Tab

Regulatory identifiers:

- IEC Code
- GSTIN
- PAN Number
- AD Code (Authorized Dealer Code)
- RCMC Certificate Number + Expiry
- DGFT Authorization

---

### Email Tab

SMTP email configuration for sending documents directly from the platform:

- SMTP Host, Port
- Username, Password
- From Name, From Email
- Test connection button

---

### Security Tab

- Change password
- Enable/disable 2FA (Two-Factor Authentication)
- View active sessions / logout all devices

---

### Templates Tab

Customize document header and footer:

- Header text/HTML
- Footer text/HTML
- Watermark text (for trial accounts)
- Digital signature image upload
- Company stamp image upload

---

## Manage Organizations

**URL:** User menu → Manage Organizations  
**Purpose:** View and manage all export organizations the user belongs to

**Organization card shows:**

- Company name, Organization ID
- Status badges (Trial / Active / Inactive)
- Role badge (Owner / Admin / Member)
- Email + Phone
- Billing cycle (Monthly/Annual)
- Created date
- Trial end date (if on trial)
- Delete option (only for owner)

A user can be a member of multiple organizations and switch between them.

---

## Team & Roles

**URL:** User menu → Team & Roles  
**Purpose:** Manage team members and their permissions

### Team Members Table

| Column  | Description                  |
| ------- | ---------------------------- |
| Name    | Member name or email         |
| Email   | Member email address         |
| Role    | Owner / Admin / Member badge |
| Joined  | Date joined                  |
| Actions | Remove member                |

### Pending Invitations

Shows invitations sent but not yet accepted. Can be cancelled.

### Invite Member

**+ Invite Member** button opens invite dialog:

- Enter email address
- Select role (Admin / Member)
- Send invitation email

### Role Permissions

| Role       | Access Level                                                      |
| ---------- | ----------------------------------------------------------------- |
| **Owner**  | Full access; can delete organization; cannot be removed by others |
| **Admin**  | Can manage team, settings, all documents                          |
| **Member** | Can create and view documents; cannot manage team or settings     |

---

## General Settings (Domestic Document Settings)

Accessible from Domestic → Settings.

Configures number series prefix, digit padding, and starting number for:

- Tax Invoices (DI prefix)
- Domestic Proforma (DPI prefix)
- Credit Notes (CN prefix)
- Delivery Challans (DC prefix)

All number series are financial-year-aware (e.g., DI-26-27-001 for FY 2026-27).

---

## Production Settings

Accessible from Production → Production Settings → General.

Configures code series for:

- Item Register (PRD prefix)
- Purchase Orders (PO prefix)
- RM Purchase Orders (RMPO prefix)
- Job Work Orders (JW prefix)
- Raw Materials Register (RM prefix)
- Cost Sheets (CS prefix)

Also sets defaults:

- Base Currency (INR)
- Default Payment Terms

---

## Import Settings

Accessible from Import → Import Settings → General.

Configures code series for:

- Import Item Code (IMP prefix)
- Import PO Code (IPO prefix)
- Import Cost Sheet (ICS prefix)

Defaults:

- Default Currency (USD)
- Default Supplier Country (China)
- Default Shipment Mode (Sea Freight)
- Financial Year (2025-26)
