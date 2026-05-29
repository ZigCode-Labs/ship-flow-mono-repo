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

-- CreateIndex
CREATE UNIQUE INDEX "domestic_buyers_gstin_key" ON "domestic_buyers"("gstin");

-- CreateIndex
CREATE INDEX "domestic_buyers_status_idx" ON "domestic_buyers"("status");
