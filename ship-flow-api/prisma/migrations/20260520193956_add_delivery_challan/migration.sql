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

-- CreateIndex
CREATE UNIQUE INDEX "delivery_challans_challanNumber_key" ON "delivery_challans"("challanNumber");

-- AddForeignKey
ALTER TABLE "delivery_challan_items" ADD CONSTRAINT "delivery_challan_items_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "delivery_challans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
