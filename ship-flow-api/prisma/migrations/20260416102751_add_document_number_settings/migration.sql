-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TAX_INVOICE', 'DOMESTIC_PROFORMA', 'CREDIT_NOTE', 'DELIVERY_CHALLAN');

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

-- CreateIndex
CREATE UNIQUE INDEX "document_number_settings_documentType_key" ON "document_number_settings"("documentType");
