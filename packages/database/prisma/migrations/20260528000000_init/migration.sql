-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TAX_INVOICE', 'DOMESTIC_PROFORMA', 'CREDIT_NOTE', 'DELIVERY_CHALLAN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshToken" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tradeName" TEXT,
    "iecCode" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "cinNumber" TEXT,
    "adCode" TEXT,
    "rcmcNumber" TEXT,
    "rcmcExpiry" TIMESTAMP(3),
    "dgftAuth" TEXT,
    "dgftExpiry" TIMESTAMP(3),
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "signatureUrl" TEXT,
    "stampUrl" TEXT,
    "bankName" TEXT,
    "bankAccountNo" TEXT,
    "bankIFSC" TEXT,
    "bankBranch" TEXT,
    "swiftCode" TEXT,
    "masterCurrency" TEXT NOT NULL DEFAULT 'USD',
    "countryOfOrigin" TEXT DEFAULT 'India',
    "portOfLoading" TEXT,
    "placeOfReceipt" TEXT,
    "itemCodePrefix" TEXT,
    "itemCodeDigits" INTEGER NOT NULL DEFAULT 4,
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrgRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_number_settings" (
    "id" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "prefix" VARCHAR(10) NOT NULL,
    "digits" INTEGER NOT NULL DEFAULT 5,
    "startingNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_number_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domestic_proformas" (
    "id" TEXT NOT NULL,
    "proformaNumber" VARCHAR(50) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "isRateLocked" BOOLEAN NOT NULL DEFAULT false,
    "sellerCompanyName" VARCHAR(255) NOT NULL,
    "sellerGstin" VARCHAR(50) NOT NULL,
    "sellerState" VARCHAR(100) NOT NULL,
    "customerName" VARCHAR(255) NOT NULL,
    "customerGstin" VARCHAR(50) NOT NULL,
    "placeOfSupply" VARCHAR(100) NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountType" VARCHAR(10) NOT NULL DEFAULT '₹',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxableAmount" DOUBLE PRECISION NOT NULL,
    "igst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTax" DOUBLE PRECISION NOT NULL,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "paymentTerms" TEXT,
    "reference" VARCHAR(255),
    "notes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domestic_proformas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domestic_proforma_items" (
    "id" TEXT NOT NULL,
    "proformaId" TEXT NOT NULL,
    "itemCode" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "hsn" VARCHAR(50) NOT NULL,
    "qty" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "gstPercent" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domestic_proforma_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_challans" (
    "id" TEXT NOT NULL,
    "challanNumber" VARCHAR(50) NOT NULL,
    "challanDate" TIMESTAMP(3) NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "deliveryType" VARCHAR(50) NOT NULL DEFAULT 'supply_of_goods',
    "companyName" VARCHAR(255) NOT NULL,
    "gstin" VARCHAR(50) NOT NULL DEFAULT '',
    "state" VARCHAR(100) NOT NULL DEFAULT '',
    "customerId" VARCHAR(255) NOT NULL DEFAULT '',
    "customerName" VARCHAR(255) NOT NULL,
    "customerGstin" VARCHAR(50) NOT NULL DEFAULT '',
    "buyerAddress" VARCHAR(500) NOT NULL DEFAULT '',
    "buyerState" VARCHAR(100) NOT NULL DEFAULT '',
    "placeOfSupply" VARCHAR(100) NOT NULL,
    "transporterName" VARCHAR(255),
    "vehicleNumber" VARCHAR(50),
    "expectedDeliveryDate" TIMESTAMP(3),
    "linkedInvoiceId" VARCHAR(255),
    "reference" VARCHAR(255),
    "notes" TEXT,
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxableAmount" DOUBLE PRECISION NOT NULL,
    "totalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_challans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_challan_items" (
    "id" TEXT NOT NULL,
    "challanId" TEXT NOT NULL,
    "itemCode" VARCHAR(100) NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "hsn" VARCHAR(50) NOT NULL DEFAULT '',
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" VARCHAR(20) NOT NULL DEFAULT 'PCS',
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "gst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_challan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_invoices" (
    "id" TEXT NOT NULL,
    "invoiceNumber" VARCHAR(50) NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "exchangeRate" DOUBLE PRECISION NOT NULL DEFAULT 93.06,
    "companyName" VARCHAR(255) NOT NULL,
    "gstin" VARCHAR(50) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "customerId" VARCHAR(255) NOT NULL,
    "customerName" VARCHAR(255) NOT NULL,
    "customerGstin" VARCHAR(50) NOT NULL,
    "placeOfSupply" VARCHAR(100) NOT NULL,
    "bankName" VARCHAR(150),
    "accountNumber" VARCHAR(50),
    "ifscCode" VARCHAR(11),
    "branch" VARCHAR(150),
    "paymentTerms" VARCHAR(255),
    "reference" VARCHAR(255),
    "notes" TEXT,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxableAmount" DOUBLE PRECISION NOT NULL,
    "igst" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTax" DOUBLE PRECISION NOT NULL,
    "grandTotal" DOUBLE PRECISION NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_invoice_line_items" (
    "id" TEXT NOT NULL,
    "taxInvoiceId" TEXT NOT NULL,
    "itemCode" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "hsn" VARCHAR(50) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "gst" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_invoice_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domestic_buyers" (
    "id" TEXT NOT NULL,
    "companyName" VARCHAR(255) NOT NULL,
    "tradeName" VARCHAR(255),
    "gstin" VARCHAR(15) NOT NULL,
    "panNumber" VARCHAR(10),
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100) NOT NULL,
    "pincode" VARCHAR(10),
    "contactPerson" VARCHAR(150),
    "designation" VARCHAR(150),
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "alternatePhone" VARCHAR(30),
    "bankName" VARCHAR(150),
    "accountNumber" VARCHAR(50),
    "ifscCode" VARCHAR(11),
    "branch" VARCHAR(150),
    "notes" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domestic_buyers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_contacts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "referenceId" TEXT,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_organizationId_userId_key" ON "organization_members"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "document_number_settings_documentType_key" ON "document_number_settings"("documentType");

-- CreateIndex
CREATE UNIQUE INDEX "domestic_proformas_proformaNumber_key" ON "domestic_proformas"("proformaNumber");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_challans_challanNumber_key" ON "delivery_challans"("challanNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tax_invoices_invoiceNumber_key" ON "tax_invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "tax_invoices_customerName_idx" ON "tax_invoices"("customerName");

-- CreateIndex
CREATE INDEX "tax_invoices_status_idx" ON "tax_invoices"("status");

-- CreateIndex
CREATE INDEX "tax_invoices_invoiceDate_idx" ON "tax_invoices"("invoiceDate");

-- CreateIndex
CREATE INDEX "tax_invoices_deletedAt_idx" ON "tax_invoices"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "domestic_buyers_gstin_key" ON "domestic_buyers"("gstin");

-- CreateIndex
CREATE INDEX "domestic_buyers_status_idx" ON "domestic_buyers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "email_contacts_email_key" ON "email_contacts"("email");

-- CreateIndex
CREATE INDEX "email_logs_referenceId_idx" ON "email_logs"("referenceId");

-- CreateIndex
CREATE INDEX "email_logs_type_idx" ON "email_logs"("type");

-- CreateIndex
CREATE INDEX "email_logs_status_idx" ON "email_logs"("status");

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domestic_proforma_items" ADD CONSTRAINT "domestic_proforma_items_proformaId_fkey" FOREIGN KEY ("proformaId") REFERENCES "domestic_proformas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_challan_items" ADD CONSTRAINT "delivery_challan_items_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "delivery_challans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_invoice_line_items" ADD CONSTRAINT "tax_invoice_line_items_taxInvoiceId_fkey" FOREIGN KEY ("taxInvoiceId") REFERENCES "tax_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
