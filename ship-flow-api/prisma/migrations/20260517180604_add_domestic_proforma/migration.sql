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

-- CreateIndex
CREATE UNIQUE INDEX "domestic_proformas_proformaNumber_key" ON "domestic_proformas"("proformaNumber");

-- AddForeignKey
ALTER TABLE "domestic_proforma_items" ADD CONSTRAINT "domestic_proforma_items_proformaId_fkey" FOREIGN KEY ("proformaId") REFERENCES "domestic_proformas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
