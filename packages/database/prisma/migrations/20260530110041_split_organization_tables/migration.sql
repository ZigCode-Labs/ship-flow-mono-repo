/*
  Warnings:

  - You are about to alter the column `defaultCc` on the `organization_email_templates` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to alter the column `defaultBcc` on the `organization_email_templates` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to drop the column `adCode` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine1` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `authorizedSignatoryDesignation` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `authorizedSignatoryName` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccountNo` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `bankAddress` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `bankBranch` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `bankIFSC` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `cinNumber` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `complianceNotes` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `countryOfOrigin` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `defaultAdditionalDetails` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `defaultAdditionalInfo` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `defaultDescriptionOfGoods` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `defaultFreightBasis` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `defaultInvoiceTerms` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `defaultProformaTerms` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `dgftAuth` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `dgftExpiry` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `documentSet` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `emailReplyTo` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `fax` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `gstNumber` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `iecCode` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `industryType` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `ircNo` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `itemCodeDigits` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `itemCodePrefix` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `masterCurrency` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `panNumber` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `phone2` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `phone3` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `pincode` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `placeOfReceipt` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `portOfLoading` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `portRegistrationNumber` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `rcmcExpiry` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `rcmcNumber` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNumber` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `sedexRegistrationNumber` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `signatureUrl` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `smtpEnabled` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `smtpFromEmail` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `smtpFromName` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `smtpHost` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `smtpPort` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `smtpUseTls` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `stampUrl` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `swiftCode` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `tanNumber` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `tradeName` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `organizations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "delivery_challan_emails" ALTER COLUMN "subject" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "organization_active_documents" ALTER COLUMN "isEnabled" SET DEFAULT true;

-- AlterTable
ALTER TABLE "organization_email_templates" ALTER COLUMN "documentType" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "defaultCc" SET DATA TYPE VARCHAR(500),
ALTER COLUMN "defaultBcc" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "adCode",
DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
DROP COLUMN "authorizedSignatoryDesignation",
DROP COLUMN "authorizedSignatoryName",
DROP COLUMN "bankAccountNo",
DROP COLUMN "bankAddress",
DROP COLUMN "bankBranch",
DROP COLUMN "bankIFSC",
DROP COLUMN "bankName",
DROP COLUMN "cinNumber",
DROP COLUMN "city",
DROP COLUMN "complianceNotes",
DROP COLUMN "country",
DROP COLUMN "countryOfOrigin",
DROP COLUMN "defaultAdditionalDetails",
DROP COLUMN "defaultAdditionalInfo",
DROP COLUMN "defaultDescriptionOfGoods",
DROP COLUMN "defaultFreightBasis",
DROP COLUMN "defaultInvoiceTerms",
DROP COLUMN "defaultProformaTerms",
DROP COLUMN "dgftAuth",
DROP COLUMN "dgftExpiry",
DROP COLUMN "documentSet",
DROP COLUMN "email",
DROP COLUMN "emailReplyTo",
DROP COLUMN "fax",
DROP COLUMN "gstNumber",
DROP COLUMN "iecCode",
DROP COLUMN "industryType",
DROP COLUMN "ircNo",
DROP COLUMN "itemCodeDigits",
DROP COLUMN "itemCodePrefix",
DROP COLUMN "logoUrl",
DROP COLUMN "masterCurrency",
DROP COLUMN "panNumber",
DROP COLUMN "phone",
DROP COLUMN "phone2",
DROP COLUMN "phone3",
DROP COLUMN "pincode",
DROP COLUMN "placeOfReceipt",
DROP COLUMN "portOfLoading",
DROP COLUMN "portRegistrationNumber",
DROP COLUMN "rcmcExpiry",
DROP COLUMN "rcmcNumber",
DROP COLUMN "registrationNumber",
DROP COLUMN "sedexRegistrationNumber",
DROP COLUMN "signatureUrl",
DROP COLUMN "smtpEnabled",
DROP COLUMN "smtpFromEmail",
DROP COLUMN "smtpFromName",
DROP COLUMN "smtpHost",
DROP COLUMN "smtpPort",
DROP COLUMN "smtpUseTls",
DROP COLUMN "stampUrl",
DROP COLUMN "state",
DROP COLUMN "swiftCode",
DROP COLUMN "tanNumber",
DROP COLUMN "tradeName",
DROP COLUMN "website";

-- CreateTable
CREATE TABLE "organization_profiles" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "tradeName" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "fax" TEXT,
    "phone" TEXT,
    "phone2" TEXT,
    "phone3" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "signatureUrl" TEXT,
    "stampUrl" TEXT,
    "authorizedSignatoryName" TEXT,
    "authorizedSignatoryDesignation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_compliances" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "iecCode" TEXT,
    "gstNumber" TEXT,
    "panNumber" TEXT,
    "cinNumber" TEXT,
    "registrationNumber" TEXT,
    "adCode" TEXT,
    "rcmcNumber" TEXT,
    "rcmcExpiry" TIMESTAMP(3),
    "dgftAuth" TEXT,
    "dgftExpiry" TIMESTAMP(3),
    "tanNumber" TEXT,
    "ircNo" TEXT,
    "portRegistrationNumber" TEXT,
    "sedexRegistrationNumber" TEXT,
    "complianceNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_compliances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_bankings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "bankName" TEXT,
    "bankAccountNo" TEXT,
    "bankIFSC" TEXT,
    "bankBranch" TEXT,
    "bankAddress" TEXT,
    "swiftCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_bankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_smtps" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "smtpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpFromEmail" TEXT,
    "smtpFromName" TEXT,
    "smtpUseTls" BOOLEAN NOT NULL DEFAULT true,
    "emailReplyTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_smtps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_export_defaults" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "masterCurrency" TEXT NOT NULL DEFAULT 'USD',
    "countryOfOrigin" TEXT DEFAULT 'India',
    "portOfLoading" TEXT,
    "placeOfReceipt" TEXT,
    "itemCodePrefix" TEXT,
    "itemCodeDigits" INTEGER NOT NULL DEFAULT 4,
    "defaultInvoiceTerms" TEXT,
    "defaultProformaTerms" TEXT,
    "industryType" TEXT,
    "documentSet" TEXT DEFAULT 'standard',
    "defaultAdditionalDetails" TEXT,
    "defaultDescriptionOfGoods" TEXT,
    "defaultAdditionalInfo" TEXT,
    "defaultFreightBasis" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_export_defaults_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_profiles_organizationId_key" ON "organization_profiles"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_compliances_organizationId_key" ON "organization_compliances"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_bankings_organizationId_key" ON "organization_bankings"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_smtps_organizationId_key" ON "organization_smtps"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_export_defaults_organizationId_key" ON "organization_export_defaults"("organizationId");

-- AddForeignKey
ALTER TABLE "organization_profiles" ADD CONSTRAINT "organization_profiles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_compliances" ADD CONSTRAINT "organization_compliances_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_bankings" ADD CONSTRAINT "organization_bankings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_smtps" ADD CONSTRAINT "organization_smtps_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_export_defaults" ADD CONSTRAINT "organization_export_defaults_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
