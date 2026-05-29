# ShipFlow API — Postman Testing Guide

## Prerequisites

| Item         | Value                                                |
| ------------ | ---------------------------------------------------- |
| API base URL | `http://localhost:9000`                              |
| Content-Type | `application/json` (set globally)                    |
| Auth method  | Bearer Token (auto-injected via Collection Variable) |

---

## 1. Collection Setup

1. Open Postman → **New Collection** → name it `ShipFlow API`
2. On the **Variables** tab add these collection variables:

| Variable      | Initial Value           | Current Value                        |
| ------------- | ----------------------- | ------------------------------------ |
| `baseUrl`     | `http://localhost:9000` | `http://localhost:9000`              |
| `accessToken` | _(blank)_               | _(auto-filled by login script)_      |
| `orgId`       | _(blank)_               | _(auto-filled by create-org script)_ |

3. On the **Authorization** tab → Type: **Bearer Token** → Token: `{{accessToken}}`

All requests inherit this authorization automatically.

---

## 2. Auth Endpoints

### 2.1 Register

```
POST {{baseUrl}}/auth/register
```

**Body:**

```json
{
  "firstName": "Test",
  "lastName": "Exporter",
  "email": "test+org@shipflow.dev",
  "password": "Test@1234"
}
```

**Expected:** `201 Created`

```json
{ "message": "User registered successfully", "user": { "id": "...", "email": "..." } }
```

**Error cases:**

- `400` — email already in use
- `400` — invalid email format
- `400` — password too short (min 6 chars)

---

### 2.2 Login ⭐ (run this first — saves token)

```
POST {{baseUrl}}/auth/login
```

**Body:**

```json
{
  "email": "test+org@shipflow.dev",
  "password": "Test@1234"
}
```

**Expected:** `200 OK`

```json
{
  "user": { "id": "uuid", "email": "test+org@shipflow.dev" },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Tests tab — paste this to auto-save the token:**

```js
const json = pm.response.json();
pm.collectionVariables.set('accessToken', json.accessToken);
console.log('Token saved:', json.accessToken?.slice(0, 20) + '...');
```

**Error cases:**

- `401` — wrong password
- `401` — email not found

---

### 2.3 Refresh Token

```
POST {{baseUrl}}/auth/refresh
```

**Body:**

```json
{ "refreshToken": "eyJ..." }
```

**Expected:** `200 OK` — new `accessToken` + `refreshToken`

---

### 2.4 Logout

```
POST {{baseUrl}}/auth/logout
```

_(Requires Bearer token — inherited from collection)_

**Expected:** `200 OK` — `{ "message": "Logged out successfully" }`

---

## 3. Organization Endpoints

> All org endpoints require a valid `Authorization: Bearer {{accessToken}}` header.

---

### 3.1 Create Organization ⭐

```
POST {{baseUrl}}/organizations
```

**Body:**

```json
{
  "name": "Acme Exports Pvt Ltd",
  "tradeName": "Acme",
  "country": "India"
}
```

**Expected:** `201 Created`

```json
{
  "id": "uuid",
  "name": "Acme Exports Pvt Ltd",
  "slug": "acme-exports-pvt-ltd",
  "tradeName": "Acme",
  "country": "India",
  "onboardingDone": false,
  "members": [{ "role": "OWNER", "userId": "..." }]
}
```

**Tests tab — save orgId:**

```js
const json = pm.response.json();
pm.collectionVariables.set('orgId', json.id);
console.log('Org created:', json.id);
```

**Error cases:**

- `400` — name shorter than 2 chars
- `401` — missing / expired token

---

### 3.2 List All Organizations

```
GET {{baseUrl}}/organizations
```

**Expected:** `200 OK` — array of orgs the user belongs to

```json
[
  {
    "id": "{{orgId}}",
    "name": "Acme Exports Pvt Ltd",
    "slug": "acme-exports-pvt-ltd",
    "onboardingDone": false,
    "members": [{ "role": "OWNER" }]
  }
]
```

---

### 3.3 Get Single Organization

```
GET {{baseUrl}}/organizations/{{orgId}}
```

**Expected:** `200 OK` — full org object including members with user details

```json
{
  "id": "{{orgId}}",
  "name": "Acme Exports Pvt Ltd",
  "members": [{ "role": "OWNER", "user": { "id": "...", "email": "test+org@shipflow.dev" } }]
}
```

**Error cases:**

- `404` — org not found or user not a member
- `400` — invalid UUID

---

### 3.4 Update — Compliance Details

```
PATCH {{baseUrl}}/organizations/{{orgId}}
```

**Body:**

```json
{
  "iecCode": "AACE012345",
  "gstNumber": "27AABCU9603R1ZM",
  "panNumber": "AABCU9603R",
  "cinNumber": "U74999MH2020PTC123456",
  "addressLine1": "12 Export House, BKC",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400051",
  "phone": "9876543210",
  "email": "exports@acme.example.com"
}
```

**Validation rules:**
| Field | Format | Example |
|-------|--------|---------|
| `iecCode` | `[A-Z0-9]{10}` exactly | `AACE012345` |
| `gstNumber` | Standard 15-char GSTIN | `27AABCU9603R1ZM` |
| `panNumber` | `[A-Z]{5}[0-9]{4}[A-Z]` | `AABCU9603R` |
| `cinNumber` | max 21 chars | `U74999MH2020PTC123456` |
| `phone` | 10–15 chars | `9876543210` |

**Error cases:**

- `400` — invalid GSTIN: `{ "message": "Validation failed", "errors": [...] }`
- `400` — invalid IEC
- `403` — user not a member of this org

---

### 3.5 Update — Bank Details

```
PATCH {{baseUrl}}/organizations/{{orgId}}
```

**Body:**

```json
{
  "bankName": "HDFC Bank",
  "bankAccountNo": "50200012345678",
  "bankIFSC": "HDFC0001234",
  "bankBranch": "BKC Mumbai",
  "swiftCode": "HDFCINBBXXX"
}
```

**Validation rules:**
| Field | Format | Example |
|-------|--------|---------|
| `bankAccountNo` | 9–18 digits | `50200012345678` |
| `bankIFSC` | `[A-Z]{4}0[A-Z0-9]{6}` | `HDFC0001234` |
| `swiftCode` | max 11 chars | `HDFCINBBXXX` |

---

### 3.6 Update — Shipping Defaults

```
PATCH {{baseUrl}}/organizations/{{orgId}}
```

**Body:**

```json
{
  "countryOfOrigin": "India",
  "portOfLoading": "INMUN - Mundra",
  "placeOfReceipt": "Ahmedabad ICD",
  "masterCurrency": "USD"
}
```

`masterCurrency` must be one of: `USD` | `EUR` | `GBP` | `AED` | `INR`

---

### 3.7 Update — Item Code Settings

```
PATCH {{baseUrl}}/organizations/{{orgId}}
```

**Body:**

```json
{
  "itemCodePrefix": "ACM",
  "itemCodeDigits": 5
}
```

- `itemCodePrefix`: uppercase letters, numbers, `-`, `_` only; max 10 chars
- `itemCodeDigits`: integer 3–8

**Preview:** `ACM00000`

---

### 3.8 Complete Onboarding

```
PATCH {{baseUrl}}/organizations/{{orgId}}
```

**Body:**

```json
{ "onboardingDone": true }
```

**Expected:** `200 OK` — `"onboardingDone": true` in response

---

### 3.9 List Members

```
GET {{baseUrl}}/organizations/{{orgId}}/members
```

**Expected:** `200 OK`

```json
[
  {
    "id": "member-uuid",
    "role": "OWNER",
    "joinedAt": "2026-05-27T...",
    "user": { "id": "user-uuid", "email": "test+org@shipflow.dev", "firstName": "Test" }
  }
]
```

**Error cases:** `403` — user not a member

---

### 3.10 Change Member Role

```
PATCH {{baseUrl}}/organizations/{{orgId}}/members/:userId
```

**Body:**

```json
{ "role": "ADMIN" }
```

`role` must be one of: `OWNER` | `ADMIN` | `MEMBER`

> Only OWNER can change roles.

---

### 3.11 Remove Member

```
DELETE {{baseUrl}}/organizations/{{orgId}}/members/:userId
```

> Only OWNER can remove members. Returns `200 OK`.

---

### 3.12 Delete Organization (Soft)

```
DELETE {{baseUrl}}/organizations/{{orgId}}
```

**Expected:** `200 OK` — org no longer appears in list queries

> Only the OWNER can delete. Returns `403` for any other role.

---

## 4. Typical Test Flow (Run in Order)

```
1. POST /auth/register       → create account
2. POST /auth/login          → get token (save to {{accessToken}})
3. POST /organizations       → create org (save to {{orgId}})
4. GET  /organizations       → confirm org in list
5. GET  /organizations/{{orgId}}   → inspect details
6. PATCH /organizations/{{orgId}}  (compliance) → add IEC / GST / PAN
7. PATCH /organizations/{{orgId}}  (bank)       → add bank details
8. PATCH /organizations/{{orgId}}  (shipping)   → set shipping defaults
9. PATCH /organizations/{{orgId}}  (item code)  → configure item codes
10. PATCH /organizations/{{orgId}} {"onboardingDone": true}
11. GET  /organizations/{{orgId}}/members → inspect members
12. DELETE /organizations/{{orgId}}        → cleanup
```

---

## 5. Common Error Responses

```json
// 400 Validation error
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "path": ["gstNumber"], "message": "Invalid GSTIN format" }
  ]
}

// 401 Unauthorized
{ "statusCode": 401, "message": "Unauthorized" }

// 403 Forbidden
{ "statusCode": 403, "message": "Owner access required" }

// 404 Not found
{ "statusCode": 404, "message": "Organization not found" }
```

---

## 6. Environment Variables Quick Reference

| Variable      | Source                 | Example                       |
| ------------- | ---------------------- | ----------------------------- |
| `baseUrl`     | Manual                 | `http://localhost:9000`       |
| `accessToken` | Login test script      | `eyJhbGciOiJIUzI1NiJ...`      |
| `orgId`       | Create-org test script | `3f2504e0-4f89-11d3-9a0c-...` |

---

## 7. Import as Postman Collection (JSON)

Save the following as `shipflow-collection.json` and import via **File → Import**:

```json
{
  "info": {
    "name": "ShipFlow API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:9000" },
    { "key": "accessToken", "value": "" },
    { "key": "orgId", "value": "" }
  ],
  "auth": { "type": "bearer", "bearer": [{ "key": "token", "value": "{{accessToken}}" }] },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/register",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\"firstName\":\"Test\",\"lastName\":\"Exporter\",\"email\":\"test+org@shipflow.dev\",\"password\":\"Test@1234\"}"
            }
          }
        },
        {
          "name": "Login",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const j=pm.response.json();pm.collectionVariables.set('accessToken',j.accessToken);"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login",
            "header": [{ "key": "Content-Type", "value": "application/json" }],
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test+org@shipflow.dev\",\"password\":\"Test@1234\"}"
            }
          }
        },
        {
          "name": "Logout",
          "request": { "method": "POST", "url": "{{baseUrl}}/auth/logout" }
        }
      ]
    },
    {
      "name": "Organizations",
      "item": [
        {
          "name": "Create Org",
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const j=pm.response.json();if(j.id)pm.collectionVariables.set('orgId',j.id);"
                ]
              }
            }
          ],
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/organizations",
            "body": {
              "mode": "raw",
              "raw": "{\"name\":\"Acme Exports Pvt Ltd\",\"tradeName\":\"Acme\",\"country\":\"India\"}"
            }
          }
        },
        {
          "name": "List Orgs",
          "request": { "method": "GET", "url": "{{baseUrl}}/organizations" }
        },
        {
          "name": "Get Org",
          "request": { "method": "GET", "url": "{{baseUrl}}/organizations/{{orgId}}" }
        },
        {
          "name": "Update — Compliance",
          "request": {
            "method": "PATCH",
            "url": "{{baseUrl}}/organizations/{{orgId}}",
            "body": {
              "mode": "raw",
              "raw": "{\"iecCode\":\"AACE012345\",\"gstNumber\":\"27AABCU9603R1ZM\",\"panNumber\":\"AABCU9603R\"}"
            }
          }
        },
        {
          "name": "Update — Bank",
          "request": {
            "method": "PATCH",
            "url": "{{baseUrl}}/organizations/{{orgId}}",
            "body": {
              "mode": "raw",
              "raw": "{\"bankName\":\"HDFC Bank\",\"bankAccountNo\":\"50200012345678\",\"bankIFSC\":\"HDFC0001234\",\"swiftCode\":\"HDFCINBBXXX\"}"
            }
          }
        },
        {
          "name": "Update — Shipping",
          "request": {
            "method": "PATCH",
            "url": "{{baseUrl}}/organizations/{{orgId}}",
            "body": {
              "mode": "raw",
              "raw": "{\"countryOfOrigin\":\"India\",\"portOfLoading\":\"INMUN - Mundra\",\"masterCurrency\":\"USD\"}"
            }
          }
        },
        {
          "name": "Update — Item Codes",
          "request": {
            "method": "PATCH",
            "url": "{{baseUrl}}/organizations/{{orgId}}",
            "body": { "mode": "raw", "raw": "{\"itemCodePrefix\":\"ACM\",\"itemCodeDigits\":5}" }
          }
        },
        {
          "name": "Complete Onboarding",
          "request": {
            "method": "PATCH",
            "url": "{{baseUrl}}/organizations/{{orgId}}",
            "body": { "mode": "raw", "raw": "{\"onboardingDone\":true}" }
          }
        },
        {
          "name": "List Members",
          "request": { "method": "GET", "url": "{{baseUrl}}/organizations/{{orgId}}/members" }
        },
        {
          "name": "Delete Org",
          "request": { "method": "DELETE", "url": "{{baseUrl}}/organizations/{{orgId}}" }
        }
      ]
    }
  ]
}
```
