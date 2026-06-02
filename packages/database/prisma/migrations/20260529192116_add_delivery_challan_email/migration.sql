-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePhotoUrl" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "bankAddress" TEXT,
ADD COLUMN     "complianceNotes" TEXT,
ADD COLUMN     "defaultAdditionalDetails" TEXT,
ADD COLUMN     "defaultAdditionalInfo" TEXT,
ADD COLUMN     "defaultDescriptionOfGoods" TEXT,
ADD COLUMN     "defaultFreightBasis" TEXT,
ADD COLUMN     "documentSet" TEXT DEFAULT 'standard',
ADD COLUMN     "emailReplyTo" TEXT,
ADD COLUMN     "fax" TEXT,
ADD COLUMN     "industryType" TEXT,
ADD COLUMN     "ircNo" TEXT,
ADD COLUMN     "phone2" TEXT,
ADD COLUMN     "phone3" TEXT,
ADD COLUMN     "portRegistrationNumber" TEXT,
ADD COLUMN     "sedexRegistrationNumber" TEXT,
ADD COLUMN     "smtpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tanNumber" TEXT;

-- CreateTable
CREATE TABLE "delivery_challan_emails" (
    "id" TEXT NOT NULL,
    "challanId" TEXT NOT NULL,
    "recipientEmail" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_challan_emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_email_templates" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentType" VARCHAR(50) NOT NULL,
    "subjectTemplate" VARCHAR(500) NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "defaultCc" TEXT,
    "defaultBcc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_active_documents" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentName" VARCHAR(100) NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_active_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "delivery_challan_emails_challanId_idx" ON "delivery_challan_emails"("challanId");

-- CreateIndex
CREATE INDEX "delivery_challan_emails_recipientEmail_idx" ON "delivery_challan_emails"("recipientEmail");

-- CreateIndex
CREATE INDEX "delivery_challan_emails_status_idx" ON "delivery_challan_emails"("status");

-- CreateIndex
CREATE UNIQUE INDEX "organization_email_templates_organizationId_documentType_key" ON "organization_email_templates"("organizationId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "organization_active_documents_organizationId_documentName_key" ON "organization_active_documents"("organizationId", "documentName");

-- AddForeignKey
ALTER TABLE "delivery_challan_emails" ADD CONSTRAINT "delivery_challan_emails_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "delivery_challans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_email_templates" ADD CONSTRAINT "organization_email_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_active_documents" ADD CONSTRAINT "organization_active_documents_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
