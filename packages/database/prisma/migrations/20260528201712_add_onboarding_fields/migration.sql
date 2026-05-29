-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "authorizedSignatoryDesignation" TEXT,
ADD COLUMN     "authorizedSignatoryName" TEXT,
ADD COLUMN     "defaultInvoiceTerms" TEXT,
ADD COLUMN     "defaultProformaTerms" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "smtpFromEmail" TEXT,
ADD COLUMN     "smtpFromName" TEXT,
ADD COLUMN     "smtpHost" TEXT,
ADD COLUMN     "smtpPort" INTEGER,
ADD COLUMN     "smtpUseTls" BOOLEAN NOT NULL DEFAULT true;
