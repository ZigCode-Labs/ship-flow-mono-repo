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

-- AddForeignKey
ALTER TABLE "tax_invoice_line_items" ADD CONSTRAINT "tax_invoice_line_items_taxInvoiceId_fkey" FOREIGN KEY ("taxInvoiceId") REFERENCES "tax_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
