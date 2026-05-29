# Document Settings Feature: Complete Implementation Guide

**Date:** April 16-17, 2026  
**Feature:** Document Number Settings (Domestic Documents)  
**Scope:** Backend (NestJS + Prisma) + Frontend (Next.js) Integration

---

## Table of Contents

1.  [Overview](#overview)
2.  [Database Layer (Prisma)](#database-layer-prisma)
3.  [Backend Layer (NestJS)](#backend-layer-nestjs)
4.  [Frontend Layer (Next.js)](#frontend-layer-nextjs)
5.  [Integration Flow](#integration-flow)
6.  [Common Issues & Solutions](#common-issues--solutions)

---

## Overview

### What We Built

A complete CRUD system for managing document number settings (prefix, digits, starting number) for 4 domestic document types:

- Tax Invoice
- Domestic Proforma
- Credit Note
- Delivery Challan

### Architecture Flow

```
User Input (React Form)    ↓Frontend State (React useState)    ↓HTTP Request (fetch API)    ↓NestJS Controller    ↓Zod Validation    ↓Prisma Service    ↓PostgreSQL Database
```

---

## Database Layer (Prisma)

### Step 1: Define the Enum

**File:** `prisma/schema.prisma`

```prisma
enum DocumentType {  TAX_INVOICE  DOMESTIC_PROFORMA  CREDIT_NOTE  DELIVERY_CHALLAN}
```

**Why:** Enums enforce type safety at the database level. Only these 4 values are allowed.

**When:** Run after schema changes to regenerate Prisma client.

---

### Step 2: Define the Model

```prisma
model DocumentNumberSetting {  id             String       @id @default(uuid())  documentType   DocumentType @unique  prefix         String       @db.VarChar(10)  digits         Int          @default(5)  startingNumber Int          @default(1)  createdAt      DateTime     @default(now())  updatedAt      DateTime     @updatedAt  @@map("document_number_settings")}
```

**Line-by-line explanation:**

Line

Code

Why

How

1

`model DocumentNumberSetting`

PascalCase model name (Prisma convention)

Defines table structure

2

`id String @id @default(uuid())`

UUID as primary key for global uniqueness

Auto-generated on insert

3

`documentType DocumentType @unique`

One row per document type enforced

Prevents duplicate document types

4

`prefix String @db.VarChar(10)`

Limit matches Zod validation (max 10 chars)

Database-level constraint

5

`digits Int @default(5)`

Default matches UI default (5 digits)

Zero-padding length

6

`startingNumber Int @default(1)`

Start numbering from 1

First invoice number

7

`createdAt DateTime @default(now())`

Audit trail

Auto-set on creation

8

`updatedAt DateTime @updatedAt`

Track modifications

Auto-updates on change

9

`@@map("document_number_settings")`

Snake_case table name convention

Maps to actual DB table

**When to use:**

- `@id`: Primary key column
- `@unique`: Enforce uniqueness (one setting per document type)
- `@default()`: Auto-set values
- `@updatedAt`: Auto-update timestamp

---

### Step 3: Generate Migration

**Command:**

```bash
npx prisma migrate dev --name add_document_number_settings
```

**Why:** Creates SQL migration file and applies it to database.

**What happens:**

1.  Prisma compares current schema vs database
2.  Generates SQL migration (e.g., `CREATE TABLE document_number_settings...`)
3.  Applies migration to PostgreSQL
4.  Generates new Prisma Client types

---

### Step 4: Seed Default Data

**File:** `src/prisma/seed.ts`

```typescript
import 'dotenv/config'; // Load .env fileimport { PrismaClient, DocumentType } from '../../generated/prisma/client';const prisma = new PrismaClient();async function main() {  const defaults = [    { documentType: DocumentType.TAX_INVOICE, prefix: 'INV', digits: 5, startingNumber: 1 },    { documentType: DocumentType.DOMESTIC_PROFORMA, prefix: 'PRO', digits: 5, startingNumber: 1 },    { documentType: DocumentType.CREDIT_NOTE, prefix: 'CRN', digits: 5, startingNumber: 1 },    { documentType: DocumentType.DELIVERY_CHALLAN, prefix: 'DC', digits: 5, startingNumber: 1 },  ];  for (const data of defaults) {    try {      await prisma.documentNumberSetting.upsert({        where: { documentType: data.documentType },        update: {},  // Don't update if exists        create: data,  // Insert if doesn't exist      });    } catch (error) {      console.error(`Failed to seed ${data.documentType}:`, error);      throw error;    }  }  console.log('Seeded document number settings');}main()  .catch(console.error)  .finally(() => prisma.$disconnect());
```

**Key method: `upsert()`**

```typescript
prisma.documentNumberSetting.upsert({  where: { documentType: data.documentType },  // Find by unique field  update: {},  // If found: update these fields (empty = no update)  create: data,  // If not found: create this record})
```

**Why upsert:** Idempotent seeding - run multiple times without creating duplicates.

**Run command:**

```bash
npm run prisma:seed
```

---

## Backend Layer (NestJS)

### File Structure

```
src/modules/document-settings/├── document-settings.schema.ts      # Zod validation schemas├── document-settings.service.ts     # Business logic + DB operations├── document-settings.controller.ts  # HTTP routes└── document-settings.module.ts      # NestJS module
```

---

### Step 1: Zod Validation Schema

**File:** `document-settings.schema.ts`

```typescript
import { z } from 'zod'; // Reusable base schema for each settingexport const documentNumberSettingSchema = z.object({  prefix: z    .string()    .min(1, 'Prefix is required')    .max(10, 'Prefix too long')    .regex(/^[A-Z0-9]+$/, 'Letters and numbers only, no spaces'),  digits: z    .number()    .int('Must be a whole number')    .min(2, 'Minimum 2 digits')    .max(6, 'Maximum 6 digits'),  startingNumber: z    .number()    .int('Must be a whole number')    .min(1, 'Minimum 1'),});// Schema for upsert (includes documentType)export const upsertSettingSchema = z.object({  documentType: z.enum([    'TAX_INVOICE',    'DOMESTIC_PROFORMA',    'CREDIT_NOTE',    'DELIVERY_CHALLAN',  ]),  prefix: documentNumberSettingSchema.shape.prefix,  digits: documentNumberSettingSchema.shape.digits,  startingNumber: documentNumberSettingSchema.shape.startingNumber,});// Infer TypeScript types from schemasexport type UpsertSettingDto = z.infer<typeof upsertSettingSchema>;
```

**Why Zod:**

- Runtime validation (catches bad data before DB)
- Type inference (`z.infer<>` generates TypeScript types)
- Better error messages than class-validator

**Validation rules explained:**

- `.min(1)`: Required field
- `.max(10)`: Max length matches DB `VarChar(10)`
- `.regex(/^[A-Z0-9]+$/)`: Only uppercase letters and numbers
- `.int()`: No decimals
- `.min(2).max(6)`: Digits between 2-6

---

### Step 2: Service Layer

**File:** `document-settings.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';import { PrismaService } from '../../prisma/prisma.service';import { UpsertSettingDto } from './document-settings.schema';@Injectable()export class DocumentSettingsService {  private readonly logger = new Logger(DocumentSettingsService.name);  constructor(private readonly prisma: PrismaService) {}  // READ all settings  async findAll() {    return this.prisma.documentNumberSetting.findMany({      orderBy: { documentType: 'asc' },  // Sort alphabetically    });  }  // READ single setting  async findByType(documentType: string) {    return this.prisma.documentNumberSetting.findUnique({      where: { documentType },  // Find by unique field    });  }  // CREATE or UPDATE single  async upsert(dto: UpsertSettingDto) {    return this.prisma.documentNumberSetting.upsert({      where: { documentType: dto.documentType },      update: {  // If exists: update these fields        prefix: dto.prefix,        digits: dto.digits,        startingNumber: dto.startingNumber,      },      create: {  // If not exists: create new        documentType: dto.documentType,        prefix: dto.prefix,        digits: dto.digits,        startingNumber: dto.startingNumber,      },    });  }  // CREATE or UPDATE multiple (batch)  async upsertMany(settings: UpsertSettingDto[]) {    const results = await this.prisma.$transaction(      // Run all upserts in a single database transaction      settings.map((dto) =>        this.prisma.documentNumberSetting.upsert({          where: { documentType: dto.documentType },          update: {            prefix: dto.prefix,            digits: dto.digits,            startingNumber: dto.startingNumber,          },          create: {            documentType: dto.documentType,            prefix: dto.prefix,            digits: dto.digits,            startingNumber: dto.startingNumber,          },        }),      ),    );    return results;  }}
```

**Key concepts:**

Method

Purpose

Example Use

`findMany()`

Get all records

Page load - populate all 4 cards

`findUnique()`

Get one by unique field

Load specific document type

`upsert()`

Create or update

Save changes for one document

`$transaction()`

Batch operations atomically

Save all 4 settings at once

**Why transaction:** If any upsert fails, all changes roll back. No partial saves.

---

### Step 3: Controller Layer

**File:** `document-settings.controller.ts`

```typescript
import {  Controller,  Get,  Put,  Body,  HttpCode,  HttpStatus,  BadRequestException,} from '@nestjs/common';import { DocumentSettingsService } from './document-settings.service';import { upsertSettingSchema, UpsertSettingDto } from './document-settings.schema';import { z } from 'zod';@Controller('document-settings')  // Base route: /document-settingsexport class DocumentSettingsController {  constructor(    private readonly documentSettingsService: DocumentSettingsService,  ) {}  // GET /document-settings - Get all settings  @Get()  @HttpCode(HttpStatus.OK)  findAll() {    return this.documentSettingsService.findAll();  }  // GET /document-settings/:documentType - Get one setting  @Get(':documentType')  @HttpCode(HttpStatus.OK)  findByType(documentType: string) {    return this.documentSettingsService.findByType(documentType);  }  // PUT /document-settings - Batch update all settings  @Put()  @HttpCode(HttpStatus.OK)  upsertMany(@Body() body: unknown) {    // Validate with Zod    const schema = z.array(upsertSettingSchema);    const result = schema.safeParse(body);        if (!result.success) {      throw new BadRequestException({        message: 'Validation failed',        errors: result.error.errors,      });    }        return this.documentSettingsService.upsertMany(result.data);  }  // PUT /document-settings/:documentType - Update one setting  @Put(':documentType')  @HttpCode(HttpStatus.OK)  upsert(@Body() body: unknown) {    const result = upsertSettingSchema.safeParse(body);        if (!result.success) {      throw new BadRequestException({        message: 'Validation failed',        errors: result.error.errors,      });    }        return this.documentSettingsService.upsert(result.data);  }}
```

**HTTP Routes Explained:**

Method

Route

Purpose

Request Body

GET

`/document-settings`

Get all 4 settings

None

GET

`/document-settings/TAX_INVOICE`

Get one setting

None

PUT

`/document-settings`

Save all 4 at once

Array of 4 settings

PUT

`/document-settings/TAX_INVOICE`

Save one

Single setting object

**Validation example:**

```typescript
// Bad request (prefix too long)[  { documentType: "TAX_INVOICE", prefix: "VERYLONGPREFIX", digits: 5, startingNumber: 1 }]// Returns: 400 Bad Request with validation errors
```

---

### Step 4: Register Module

**File:** `src/app.module.ts`

```typescript
import { DocumentSettingsModule } from './modules/document-settings/document-settings.module';@Module({  imports: [    ConfigModule.forRoot({ isGlobal: true }),    PrismaModule,    AuthModule,    DocumentSettingsModule,  // <-- Add this  ],  controllers: [AppController],  providers: [AppService],})export class AppModule {}
```

**Why:** NestJS needs to know about the module to wire up routes and dependencies.

---

### Step 5: Enable CORS

**File:** `src/main.ts`

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:4000', 'http://localhost:3000'],
    credentials: true,
  });
  const port = process.env.PORT ?? 4000;
  await app.listen(port);
}
```

**Why:** Browser blocks requests to different origins without CORS headers.

---

## Frontend Layer (Next.js)

### File Structure

```
src/app/(dashboard)/domestic/settings/├── page.tsx                     # Main settings page└── components/    └── DocumentSettingsCard.tsx # Individual document card
```

---

### Step 1: Environment Variable

**File:** `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Why `NEXT_PUBLIC_`:** Next.js only exposes env vars with this prefix to the browser.

**Important:** Must restart dev server after changing env vars.

---

### Step 2: Main Settings Page

**File:** `page.tsx` (simplified key parts)

```typescript
'use client'; // Types matching backendconst API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";// Default values before API loadsconst DEFAULTS = {  TAX_INVOICE: { prefix: "INV", digits: 5, startingNumber: 1 },  DOMESTIC_PROFORMA: { prefix: "PRO", digits: 5, startingNumber: 1 },  CREDIT_NOTE: { prefix: "CRN", digits: 5, startingNumber: 1 },  DELIVERY_CHALLAN: { prefix: "DC", digits: 5, startingNumber: 1 },};export default function DomesticSettingsPage() {  // State for each document type  const [taxInvoice, setTaxInvoice] = useState(DEFAULTS.TAX_INVOICE);  const [domesticProforma, setDomesticProforma] = useState(DEFAULTS.DOMESTIC_PROFORMA);  // ... etc  // FETCH on mount  useEffect(() => {    async function fetchSettings() {      try {        const res = await fetch(`${API_URL}/document-settings`);        if (!res.ok) throw new Error(`HTTP ${res.status}`);                const data = await res.json();  // Array of 4 settings                // Update state for each document type        data.forEach((record) => {          const settings = {            prefix: record.prefix,            digits: record.digits,            startingNumber: record.startingNumber,          };                    switch (record.documentType) {            case "TAX_INVOICE": setTaxInvoice(settings); break;            case "DOMESTIC_PROFORMA": setDomesticProforma(settings); break;            // ... etc          }        });      } catch (err) {        console.error("Fetch error:", err);        toast.error("Failed to load settings");      }    }        fetchSettings();  }, []);  // Empty deps = run once on mount  // SAVE handler  const handleSave = async () => {    const payload = [      { ...taxInvoice, documentType: "TAX_INVOICE" },      { ...domesticProforma, documentType: "DOMESTIC_PROFORMA" },      { ...creditNote, documentType: "CREDIT_NOTE" },      { ...deliveryChallan, documentType: "DELIVERY_CHALLAN" },    ];        const res = await fetch(`${API_URL}/document-settings`, {      method: "PUT",      headers: { "Content-Type": "application/json" },      body: JSON.stringify(payload),    });        if (!res.ok) throw new Error("Save failed");    toast.success("Settings saved");  };  return (    <div>      <DocumentSettingsCard        title="Tax Invoice"        initialValues={taxInvoice}        onSubmit={setTaxInvoice}  // Updates parent state      />      {/* ... other cards */}      <Button onClick={handleSave}>Save Changes</Button>    </div>  );}
```

**Data flow:**

1.  Page loads → fetch GET → populate 4 state variables
2.  Pass state to cards as `initialValues`
3.  Card calls `onSubmit` on every change → updates parent state
4.  Click Save → PUT all 4 states to API

---

### Step 3: Document Settings Card

**File:** `components/DocumentSettingsCard.tsx`

```typescript
"use client";import { useForm } from "react-hook-form";import { zodResolver } from "@hookform/resolvers/zod";import { z } from "zod";const schema = z.object({  prefix: z.string()    .min(1, "Required")    .max(10, "Max 10 chars")    .regex(/^[A-Z0-9]+$/, "Letters/numbers only"),  digits: z.number().int().min(2).max(6),  startingNumber: z.number().int().min(1),});export function DocumentSettingsCard({  title,  initialValues,  onSubmit,}) {  const { register, watch, reset, trigger } = useForm({    resolver: zodResolver(schema),    defaultValues: initialValues,    mode: "onChange",  });  // Sync parent values to form (on API load)  useEffect(() => {    reset(initialValues);  }, [initialValues, reset]);  // Sync form values to parent (on user type)  const watchedValues = watch();  const prevRef = useRef(initialValues);    useEffect(() => {    if (watchedValues !== prevRef.current) {      prevRef.current = watchedValues;      onSubmit(watchedValues);  // Update parent state    }  }, [watchedValues, onSubmit]);  return (    <Card>      <form>        <Input {...register("prefix")} placeholder="INV" />        <Input {...register("digits")} type="number" />        <Input {...register("startingNumber")} type="number" />      </form>    </Card>  );}
```

**Critical patterns:**

Pattern

Why

Implementation

`useForm`

Form state management

react-hook-form library

`zodResolver`

Validation

Links Zod schema to form

`watch()`

Track all changes

Returns current form values

`reset()`

Sync external → form

Updates form when API loads

`useEffect` + `onSubmit()`

Sync form → parent

Keeps parent state updated

`mode: "onChange"`

Validate while typing

Real-time validation

**Why two `useEffect`s:**

1.  First: Parent (API) → Child (Form) — `reset(initialValues)`
2.  Second: Child (Form) → Parent (State) — `onSubmit(watchedValues)`

Without both, data doesn't flow bidirectionally.

---

## Integration Flow

### Complete Data Flow Example

**Scenario:** User changes Tax Invoice prefix from "INV" to "TEST"

```
1. USER TYPES in Tax Invoice prefix input   ↓2. react-hook-form updates internal state   ↓3. useEffect detects change (watchedValues changed)   ↓4. calls onSubmit({ prefix: "TEST", digits: 5, startingNumber: 1 })   ↓5. Parent setTaxInvoice() updates React state   ↓6. UI re-renders with new preview: "TEST-26-27-00001"   ↓7. USER CLICKS "Save Changes"   ↓8. handleSave() sends PUT to /document-settings   Body: [     { documentType: "TAX_INVOICE", prefix: "TEST", ... },     { documentType: "DOMESTIC_PROFORMA", prefix: "PRO", ... },     ...   ]   ↓9. NestJS controller receives request   ↓10. Zod validates payload    ↓11. Service calls prisma.$transaction(upsert × 4)    ↓12. PostgreSQL updates rows    ↓13. Response: 200 OK with updated records    ↓14. Frontend shows "Settings saved" toast
```

---

## Common Issues & Solutions

### Issue 1: Form doesn't update when API loads

**Symptom:** Page shows defaults (INV, PRO) instead of DB values.

**Cause:** `useForm` only uses `defaultValues` on initial mount.

**Solution:** Add `useEffect` with `reset()`:

```typescript
useEffect(() => {
  reset(initialValues);
}, [initialValues, reset]);
```

---

### Issue 2: Save doesn't persist changes

**Symptom:** After refresh, values revert to old ones.

**Cause:** Parent state not updated when user types (only form internal state changes).

**Solution:** Add sync from form to parent:

```typescript
useEffect(() => {  if (watchedValues changed) {    onSubmit(watchedValues);  }}, [watchedValues, onSubmit]);
```

---

### Issue 3: CORS error in browser

**Symptom:** `Failed to fetch` or CORS error in console.

**Cause:** API doesn't allow frontend origin.

**Solution:** Enable CORS in `main.ts`:

```typescript
app.enableCors({ origin: ['http://localhost:3000'], credentials: true });
```

---

### Issue 4: Env var not working

**Symptom:** API calls go to wrong URL.

**Cause:** `NEXT_PUBLIC_API_URL` not set or dev server not restarted.

**Solution:**

1.  Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:4000`
2.  **Restart** Next.js dev server
3.  Verify with `console.log(process.env.NEXT_PUBLIC_API_URL)`

---

### Issue 5: Validation fails on save

**Symptom:** 400 Bad Request with Zod errors.

**Cause:** Frontend allows lowercase but Zod requires uppercase.

**Solution:** Add uppercase transform:

```typescript
<Input   {...register("prefix", {     onChange: (e) => e.target.value.toUpperCase()  })} />
```

---

## Quick Reference: Commands

```bash
# Start APIcd ship-flow-api && npm run start:dev# Start Frontendcd ship-flow-ui && npm run dev# Seed Databasecd ship-flow-api && npm run prisma:seed# View Databasenpx prisma studio# Test APIcurl http://localhost:4000/document-settings
```

---

## Summary

Component

Technology

Key Files

Database

PostgreSQL + Prisma

`schema.prisma`, `seed.ts`

Backend

NestJS

`*.controller.ts`, `*.service.ts`, `*.schema.ts`

Frontend

Next.js + React Hook Form

`page.tsx`, `DocumentSettingsCard.tsx`

Validation

Zod

Schemas in both frontend and backend

**End-to-end:** Database → Prisma → Service → Controller → HTTP → Fetch → React State → Form → User

---

_Generated: April 17, 2026_
