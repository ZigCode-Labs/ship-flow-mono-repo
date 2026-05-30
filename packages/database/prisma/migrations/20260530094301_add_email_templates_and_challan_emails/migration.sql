-- CreateTable
CREATE TABLE "organization_email_templates" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "documentType" VARCHAR(100) NOT NULL,
    "subjectTemplate" VARCHAR(500) NOT NULL,
    "bodyTemplate" TEXT NOT NULL,
    "defaultCc" VARCHAR(500),
    "defaultBcc" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_challan_emails" (
    "id" TEXT NOT NULL,
    "challanId" TEXT NOT NULL,
    "recipientEmail" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(500) NOT NULL,
    "message" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_challan_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_email_templates_organizationId_documentType_key" ON "organization_email_templates"("organizationId", "documentType");

-- CreateIndex
CREATE INDEX "delivery_challan_emails_challanId_idx" ON "delivery_challan_emails"("challanId");

-- AddForeignKey
ALTER TABLE "organization_email_templates" ADD CONSTRAINT "organization_email_templates_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_challan_emails" ADD CONSTRAINT "delivery_challan_emails_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "delivery_challans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
