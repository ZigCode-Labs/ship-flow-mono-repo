# Feature: Organization Setup & Onboarding

## Last Updated
2026-05-29

## What Changed
- Replaced the single-page monolithic form with a **7-tabbed interface** matching the design reference image.
- Added missing database fields to the `Organization` model.
- Added `GET /auth/me` endpoint for the user profile header card.
- Added `POST /organizations/:id/logo` and `POST /organizations/:id/signature` file upload endpoints.
- Migrated, generated Prisma client, and seeded the database.

---

## Page URL

`http://localhost:9001/onboarding`

This page opens automatically after a successful login when the user has no organization or `onboardingDone === false`.

---

## Page Structure

The page is divided into three main visual areas:

1. **User Profile Card** (top)
2. **Tab Navigation Bar** (below the card)
3. **Tab Content + Save Button** (bottom)

### 1. User Profile Card

Displays the currently logged-in user's information:

| Element | Source |
|---------|--------|
| Avatar (initials) | `firstName[0] + lastName[0]` or `email[0]` |
| Full Name | `firstName + lastName` |
| Email | `email` |
| Verified Badge | `emailVerified` boolean — green if true, orange "Not verified" if false |
| Resend Verification | Button (UI only — no backend action wired yet) |

**API:** `GET /auth/me` → returns `{ id, email, firstName, lastName, emailVerified }`

### 2. Tab Navigation Bar

Seven tabs with **line-style underline** active indicator and **lucide-react** icons:

| Tab | Icon | Route (internal state) |
|-----|------|------------------------|
| **Company** | `Building2` | `company` |
| **Contact** | `Contact` | `contact` |
| **Banking** | `CreditCard` | `banking` |
| **Compliance** | `ShieldCheck` | `compliance` |
| **Email** | `Mail` | `email` |
| **Security** | `Lock` | `security` |
| **Templates** | `FileText` | `templates` |

Uses the existing `<Tabs variant="line">` component from `@shipflow/ui`.

### 3. Tab Content

All tabs are part of a **single React Hook Form**. Data is collected across tabs and submitted in one `POST /organizations` + `PATCH /organizations/:id` call.

---

## Tab: Company

**Fields:**

| Field | DB Column | Required | Validation |
|-------|-----------|----------|------------|
| Company Name | `name` | Yes | min 2, max 200 chars |
| Trade Name | `tradeName` | No | max 200 chars |
| IEC Code | `iecCode` | No | 10 alphanumeric chars |
| GST Number | `gstNumber` | No | Valid GSTIN format |
| PAN Number | `panNumber` | No | Valid PAN format |
| Registration Number | `registrationNumber` | No | max 50 chars **(NEW)** |
| CIN / Company Registration No. | `cinNumber` | No | max 21 chars |
| Corporate Office Address | `addressLine1` | No | textarea, max 255 chars |
| Company Logo | `logoUrl` | No | File upload (JPEG/PNG/WebP, max 2MB) |
| Master Currency | `masterCurrency` | No | Dropdown: USD, EUR, GBP, AED, INR |
| Country of Origin | `countryOfOrigin` | No | max 100 chars |
| Port of Loading | `portOfLoading` | No | max 100 chars |
| Place of Receipt by Pre-Carrier | `placeOfReceipt` | No | max 100 chars |
| Item Code Prefix | `itemCodePrefix` | No | max 10, letters/numbers/hyphens/underscores |
| Number of Digits | `itemCodeDigits` | No | Dropdown: 3–8 digits |

**Live Preview:** Below the item code fields, a preview shows the generated format (e.g., `CEL0001`).

---

## Tab: Contact

**Fields:**

| Field | DB Column | Validation |
|-------|-----------|------------|
| Phone Number | `phone` | min 10, max 15 digits |
| Business Email | `email` | Valid email format |
| Website | `website` | Valid URL format |
| Address Line 2 | `addressLine2` | max 255 chars |
| City | `city` | max 100 chars |
| State | `state` | max 100 chars |
| Pincode | `pincode` | max 10 chars |
| Country | `country` | max 100 chars, defaults to "India" |

---

## Tab: Banking

**Fields:**

| Field | DB Column | Validation |
|-------|-----------|------------|
| Bank Name | `bankName` | min 2 chars |
| Account Number | `bankAccountNo` | min 9, max 18 chars |
| IFSC Code | `bankIFSC` | Valid IFSC format |
| Branch | `bankBranch` | max 100 chars |
| SWIFT Code | `swiftCode` | max 11 chars |
| AD Code | `adCode` | max 50 chars |

---

## Tab: Compliance

**Fields:**

| Field | DB Column | Type |
|-------|-----------|------|
| RCMC Number | `rcmcNumber` | text, max 50 |
| RCMC Expiry | `rcmcExpiry` | date picker |
| DGFT Authorization | `dgftAuth` | text, max 100 |
| DGFT Expiry | `dgftExpiry` | date picker |

---

## Tab: Email

**Fields:**

| Field | DB Column | Validation |
|-------|-----------|------------|
| SMTP Host | `smtpHost` | max 255 chars **(NEW)** |
| SMTP Port | `smtpPort` | number, 1–65535 **(NEW)** |
| From Email | `smtpFromEmail` | valid email **(NEW)** |
| From Name | `smtpFromName` | max 100 chars **(NEW)** |
| Use TLS / SSL | `smtpUseTls` | toggle switch, defaults to `true` **(NEW)** |

---

## Tab: Security

**Fields:**

| Field | DB Column | Validation |
|-------|-----------|------------|
| Authorized Signatory Name | `authorizedSignatoryName` | max 150 chars **(NEW)** |
| Designation | `authorizedSignatoryDesignation` | max 150 chars **(NEW)** |

*Note: Signature/stamp uploads could be added here in the future. Currently only logo upload exists in the Company tab.*

---

## Tab: Templates

**Fields:**

| Field | DB Column | Type |
|-------|-----------|------|
| Default Invoice Terms | `defaultInvoiceTerms` | textarea **(NEW)** |
| Default Proforma Terms | `defaultProformaTerms` | textarea **(NEW)** |

---

## Database Schema Changes

### `User` model — added:

```prisma
emailVerified Boolean @default(false)
```

### `Organization` model — added:

```prisma
registrationNumber String?

smtpHost        String?
smtpPort        Int?
smtpFromEmail   String?
smtpFromName    String?
smtpUseTls      Boolean   @default(true)

authorizedSignatoryName        String?
authorizedSignatoryDesignation String?

defaultInvoiceTerms  String? @db.Text
defaultProformaTerms String? @db.Text
```

**Migration:** `20260528201712_add_onboarding_fields`

---

## API Endpoints

### Auth

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/auth/me` | Returns current user profile (id, email, firstName, lastName, emailVerified) |

### Organizations

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/organizations` | Create org (min: name, tradeName, country) |
| `PATCH`| `/organizations/:id` | Update org with all tab fields + `onboardingDone: true` |
| `POST` | `/organizations/:id/logo` | Upload logo file (multipart/form-data, fieldname: `file`) |
| `POST` | `/organizations/:id/signature` | Upload signature file (multipart/form-data, fieldname: `file`) |

**File Upload:** Saved to `apps/api/uploads/` directory. Served statically at `/uploads/:filename`.

---

## Component Architecture

### File: `apps/web/src/app/onboarding/page.tsx`

| Internal Component | Purpose |
|--------------------|---------|
| `SectionHeader` | Renders a section title + optional description |
| `FieldGrid` | Responsive 2-column grid wrapper for form fields |

### Imports Used

**From `@shipflow/ui`:**
- `Button`, `Separator`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `Avatar`, `AvatarFallback`

**From `@shipflow/ui-forms`:**
- `FormInput`, `FormSelect`, `FormTextarea`, `FormSwitch`, `useZodForm`

**From `lucide-react`:**
- `Building2`, `Contact`, `CreditCard`, `ShieldCheck`, `Mail`, `Lock`, `FileText`, `Pencil`, `Globe`, `Ship`, `MapPin`, `DollarSign`, `ImageIcon`, `Upload`, `RefreshCw`

---

## Form Submission Flow

1. User fills fields across all 7 tabs.
2. Clicks **"Save Profile"** button.
3. Frontend:
   - `POST /organizations` with `{ name, tradeName, country }`
   - `PATCH /organizations/:id` with **all remaining fields** + `onboardingDone: true`
   - If logo file selected: `POST /organizations/:id/logo` with FormData
4. On success:
   - Sets active organization in Zustand store
   - Redirects to `/dashboard`

---

## Zod Validation Schema

Located inline in `apps/web/src/app/onboarding/page.tsx` and mirrored in `apps/api/src/modules/organizations/organizations.schema.ts`.

**Regex patterns used:**
- GSTIN: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`
- IFSC: `/^[A-Z]{4}0[A-Z0-9]{6}$/`
- IEC: `/^[A-Z0-9]{10}$/`
- PAN: `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/`

---

## For AI Agents — How to Modify

### Adding a new field to an existing tab:
1. Add the column to `Organization` in `packages/database/prisma/schema.prisma`.
2. Run `npx prisma migrate dev` in `packages/database`.
3. Add the field to `updateOrgSchema` in `apps/api/src/modules/organizations/organizations.schema.ts`.
4. Add the form field to the appropriate tab section in `apps/web/src/app/onboarding/page.tsx`.
5. Ensure the field is included in the `patchBody` inside `onSubmit`.

### Adding a new tab:
1. Add a new `{ id, label, icon }` object to the tabs array.
2. Add a new `<TabsContent value="newtab">` block below the existing ones.
3. Add tab-specific fields to the Zod schema and default values.

### Changing the save behavior:
The `onSubmit` function in the page component handles the API calls. Currently it does a single create+patch. To implement per-tab auto-save, wrap each tab's fields in a separate form or call `api.patch` on tab blur/change.

---

## Known Limitations / Future Work

1. **Email verification resend** — UI button exists but no backend action is wired.
2. **File upload size limits** — No explicit size validation on the API side (frontend only shows "max 2MB" text).
3. **Signature upload** — API endpoint exists but no UI field in the Security tab yet.
4. **Stamp upload** — Not implemented on frontend or backend.
5. **Document Number Settings** (Templates tab) — The existing `DocumentNumberSetting` table is not yet editable from this page.
6. **SMTP password** — No secure storage mechanism implemented; currently not collected.
