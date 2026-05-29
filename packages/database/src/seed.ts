import 'dotenv/config';
import { PrismaClient, DocumentType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedDocumentNumberSettings() {
  const defaults = [
    { documentType: DocumentType.TAX_INVOICE, prefix: 'DI', digits: 5, startingNumber: 1 },
    { documentType: DocumentType.DOMESTIC_PROFORMA, prefix: 'PRO', digits: 5, startingNumber: 1 },
    { documentType: DocumentType.CREDIT_NOTE, prefix: 'CRN', digits: 5, startingNumber: 1 },
    { documentType: DocumentType.DELIVERY_CHALLAN, prefix: 'DC', digits: 5, startingNumber: 1 },
  ];

  for (const data of defaults) {
    await prisma.documentNumberSetting.upsert({
      where: { documentType: data.documentType },
      update: {},
      create: data,
    });
  }
  console.log('✓ Document number settings seeded');
}

async function seedUsers() {
  const existing = await prisma.user.count();
  if (existing > 0) {
    console.log('  Users already exist, skipping');
    return;
  }

  const password = await argon2.hash('Demo@1234');
  await prisma.user.create({
    data: {
      email: 'admin@shipflow.com',
      password,
      firstName: 'Admin',
      lastName: 'User',
    },
  });
  console.log('✓ Users seeded  (admin@shipflow.com / Demo@1234)');
}

async function seedDomesticBuyers() {
  const existing = await prisma.domesticBuyer.count();
  if (existing > 0) {
    console.log('  Domestic buyers already exist, skipping');
    return;
  }

  await prisma.domesticBuyer.createMany({
    data: [
      {
        companyName: 'ABC Corporation Pvt. Ltd.',
        tradeName: 'ABC Corp',
        gstin: '27AABCU9603R1ZM',
        panNumber: 'AABCU9603R',
        address: '101, Business Tower, Nariman Point',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400021',
        contactPerson: 'Rajesh Kumar',
        designation: 'Purchase Manager',
        email: 'rajesh@abccorp.com',
        phone: '9876543210',
        bankName: 'ICICI Bank',
        accountNumber: '123456789012',
        ifscCode: 'ICIC0001234',
        branch: 'Nariman Point',
        status: 'active',
      },
      {
        companyName: 'Sunrise Enterprises',
        tradeName: 'Sunrise',
        gstin: '06AAFCS5784G1ZK',
        panNumber: 'AAFCS5784G',
        address: '45, Industrial Area, Sector 18',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122015',
        contactPerson: 'Priya Sharma',
        designation: 'Director',
        email: 'priya@sunrise.in',
        phone: '9812345678',
        bankName: 'HDFC Bank',
        accountNumber: '50200012345678',
        ifscCode: 'HDFC0001001',
        branch: 'Sector 18 Gurugram',
        status: 'active',
      },
      {
        companyName: 'Global Tech Solutions',
        gstin: '29AABCG4321H1ZP',
        panNumber: 'AABCG4321H',
        address: '12, Electronic City Phase 1',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560100',
        contactPerson: 'Anil Reddy',
        designation: 'CFO',
        email: 'anil@globaltech.io',
        phone: '9900112233',
        status: 'active',
      },
    ],
  });
  console.log('✓ Domestic buyers seeded (3 records)');
}

async function seedDomesticProformas() {
  const existing = await prisma.domesticProforma.count();
  if (existing > 0) {
    console.log('  Domestic proformas already exist, skipping');
    return;
  }

  const today = new Date();
  const validUntil30 = new Date(today);
  validUntil30.setDate(validUntil30.getDate() + 30);
  const validUntil15 = new Date(today);
  validUntil15.setDate(validUntil15.getDate() + 15);

  await prisma.domesticProforma.create({
    data: {
      proformaNumber: 'PRO-26-27-00001',
      date: today,
      validUntil: validUntil30,
      exchangeRate: 93.06,
      isRateLocked: false,
      sellerCompanyName: 'Sharma Traders Pvt. Ltd.',
      sellerGstin: '27AABCT1234F1Z5',
      sellerState: 'Maharashtra',
      customerName: 'ABC Corporation Pvt. Ltd.',
      customerGstin: '27AABCU9603R1ZM',
      placeOfSupply: 'Maharashtra',
      discountValue: 2000,
      discountType: '₹',
      subtotal: 42000,
      discountAmount: 2000,
      taxableAmount: 40000,
      igst: 7200,
      totalTax: 7200,
      grandTotal: 47200,
      paymentTerms: 'Advance 50%, balance on delivery',
      reference: 'ENQ-2026-045',
      notes: 'Prices valid for 30 days. GST extra as applicable.',
      status: 'DRAFT',
      lineItems: {
        create: [
          {
            itemCode: 'PRD-001',
            description: 'Industrial Grade Steel Pipes (2 inch)',
            hsn: '7304',
            qty: 100,
            rate: 250,
            amount: 25000,
            gstPercent: 18,
            total: 29500,
          },
          {
            itemCode: 'PRD-002',
            description: 'MS Flat Bar 50x6mm',
            hsn: '7216',
            qty: 200,
            rate: 85,
            amount: 17000,
            gstPercent: 18,
            total: 20060,
          },
        ],
      },
    },
  });

  await prisma.domesticProforma.create({
    data: {
      proformaNumber: 'PRO-26-27-00002',
      date: today,
      validUntil: validUntil15,
      exchangeRate: 93.06,
      isRateLocked: true,
      sellerCompanyName: 'Sharma Traders Pvt. Ltd.',
      sellerGstin: '27AABCT1234F1Z5',
      sellerState: 'Maharashtra',
      customerName: 'Sunrise Enterprises',
      customerGstin: '06AAFCS5784G1ZK',
      placeOfSupply: 'Haryana',
      discountValue: 0,
      discountType: '₹',
      subtotal: 75000,
      discountAmount: 0,
      taxableAmount: 75000,
      igst: 13500,
      totalTax: 13500,
      grandTotal: 88500,
      paymentTerms: 'Net 15 days',
      reference: 'PO-SUN-2026-012',
      status: 'SENT',
      lineItems: {
        create: [
          {
            itemCode: 'SVC-001',
            description: 'Annual Maintenance Contract - Heavy Equipment',
            hsn: '9987',
            qty: 1,
            rate: 75000,
            amount: 75000,
            gstPercent: 18,
            total: 88500,
          },
        ],
      },
    },
  });

  console.log('✓ Domestic proformas seeded (2 records)');
}

async function seedDeliveryChallans() {
  const existing = await prisma.deliveryChallan.count();
  if (existing > 0) {
    console.log('  Delivery challans already exist, skipping');
    return;
  }

  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  await prisma.deliveryChallan.create({
    data: {
      challanNumber: 'DC-26-27-00001',
      challanDate: today,
      deliveryDate,
      deliveryType: 'supply_of_goods',
      companyName: 'Sharma Traders Pvt. Ltd.',
      gstin: '27AABCT1234F1Z5',
      state: 'Maharashtra',
      customerId: 'cust-001',
      customerName: 'ABC Corporation Pvt. Ltd.',
      customerGstin: '27AABCU9603R1ZM',
      buyerAddress: '101, Business Tower, Nariman Point, Mumbai - 400021',
      buyerState: 'Maharashtra',
      placeOfSupply: 'Maharashtra',
      transporterName: 'Speedy Logistics',
      vehicleNumber: 'MH12AB1234',
      expectedDeliveryDate: deliveryDate,
      linkedInvoiceId: 'DI-26-27-00001',
      reference: 'PO-2026-001',
      notes: 'Handle with care. Fragile items.',
      exchangeRate: 1,
      subtotal: 50000,
      discount: 0,
      taxableAmount: 50000,
      totalTax: 9000,
      grandTotal: 59000,
      status: 'draft',
      lineItems: {
        create: [
          {
            itemCode: 'ITM-001',
            description: 'Industrial Grade Steel Pipes (2 inch) - 6m length',
            hsn: '7304',
            quantity: 50,
            unit: 'NOS',
            rate: 600,
            amount: 30000,
            gst: 18,
            total: 35400,
          },
          {
            itemCode: 'ITM-002',
            description: 'MS Flat Bar 50x6mm - 6m length',
            hsn: '7216',
            quantity: 100,
            unit: 'NOS',
            rate: 200,
            amount: 20000,
            gst: 18,
            total: 23600,
          },
        ],
      },
    },
  });

  await prisma.deliveryChallan.create({
    data: {
      challanNumber: 'DC-26-27-00002',
      challanDate: today,
      deliveryType: 'job_work',
      companyName: 'Sharma Traders Pvt. Ltd.',
      gstin: '27AABCT1234F1Z5',
      state: 'Maharashtra',
      customerId: 'cust-002',
      customerName: 'Sunrise Enterprises',
      customerGstin: '06AAFCS5784G1ZK',
      buyerAddress: '45, Industrial Area, Sector 18, Gurugram - 122015',
      buyerState: 'Haryana',
      placeOfSupply: 'Haryana',
      reference: 'JW-2026-007',
      notes: 'Job work material. To be returned after processing.',
      exchangeRate: 1,
      subtotal: 15000,
      discount: 0,
      taxableAmount: 15000,
      totalTax: 0,
      grandTotal: 15000,
      status: 'dispatched',
      lineItems: {
        create: [
          {
            itemCode: 'RM-001',
            description: 'Raw Material - Aluminium Sheets 2mm',
            hsn: '7606',
            quantity: 30,
            unit: 'KGS',
            rate: 500,
            amount: 15000,
            gst: 0,
            total: 15000,
          },
        ],
      },
    },
  });

  console.log('✓ Delivery challans seeded (2 records)');
}

async function seedTaxInvoices() {
  const existing = await prisma.taxInvoice.count();
  if (existing > 0) {
    console.log('  Tax invoices already exist, skipping');
    return;
  }

  const today = new Date();
  const due30 = new Date(today);
  due30.setDate(due30.getDate() + 30);
  const due15 = new Date(today);
  due15.setDate(due15.getDate() + 15);
  const pastDate = new Date(today);
  pastDate.setDate(pastDate.getDate() - 20);
  const pastDue = new Date(today);
  pastDue.setDate(pastDue.getDate() - 5);

  await prisma.taxInvoice.create({
    data: {
      invoiceNumber: 'DI-26-27-00001',
      invoiceDate: today,
      dueDate: due30,
      exchangeRate: 93.06,
      companyName: 'Sharma Traders Pvt. Ltd.',
      gstin: '27AABCT1234F1Z5',
      state: 'Maharashtra',
      customerId: 'cust-001',
      customerName: 'ABC Corporation Pvt. Ltd.',
      customerGstin: '27AABCU9603R1ZM',
      placeOfSupply: 'Maharashtra',
      bankName: 'HDFC Bank',
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      branch: 'Mumbai',
      paymentTerms: 'Net 30 days',
      reference: 'PO-2026-001',
      notes: 'Thank you for your business.',
      subtotal: 100000,
      discount: 5000,
      taxableAmount: 95000,
      igst: 17100,
      totalTax: 17100,
      grandTotal: 112100,
      status: 'draft',
      lineItems: {
        create: [
          {
            itemCode: 'ITM-001',
            description: 'Consulting Services - Q1 2026',
            hsn: '9983',
            quantity: 1,
            rate: 50000,
            amount: 50000,
            gst: 18,
            total: 59000,
          },
          {
            itemCode: 'ITM-002',
            description: 'Software License - Enterprise (2 users)',
            hsn: '9973',
            quantity: 2,
            rate: 25000,
            amount: 50000,
            gst: 18,
            total: 59000,
          },
        ],
      },
    },
  });

  await prisma.taxInvoice.create({
    data: {
      invoiceNumber: 'DI-26-27-00002',
      invoiceDate: today,
      dueDate: due15,
      exchangeRate: 93.06,
      companyName: 'Sharma Traders Pvt. Ltd.',
      gstin: '27AABCT1234F1Z5',
      state: 'Maharashtra',
      customerId: 'cust-002',
      customerName: 'Sunrise Enterprises',
      customerGstin: '06AAFCS5784G1ZK',
      placeOfSupply: 'Haryana',
      bankName: 'HDFC Bank',
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      branch: 'Mumbai',
      paymentTerms: 'Net 15 days',
      reference: 'PO-SUN-2026-012',
      subtotal: 75000,
      discount: 0,
      taxableAmount: 75000,
      igst: 13500,
      totalTax: 13500,
      grandTotal: 88500,
      status: 'sent',
      lineItems: {
        create: [
          {
            itemCode: 'SVC-001',
            description: 'Annual Maintenance Contract - Heavy Equipment',
            hsn: '9987',
            quantity: 1,
            rate: 75000,
            amount: 75000,
            gst: 18,
            total: 88500,
          },
        ],
      },
    },
  });

  await prisma.taxInvoice.create({
    data: {
      invoiceNumber: 'DI-26-27-00003',
      invoiceDate: pastDate,
      dueDate: pastDue,
      exchangeRate: 92.5,
      companyName: 'Sharma Traders Pvt. Ltd.',
      gstin: '27AABCT1234F1Z5',
      state: 'Maharashtra',
      customerId: 'cust-003',
      customerName: 'Global Tech Solutions',
      customerGstin: '29AABCG4321H1ZP',
      placeOfSupply: 'Karnataka',
      bankName: 'HDFC Bank',
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      branch: 'Mumbai',
      paymentTerms: 'Immediate',
      reference: 'PO-GT-2026-003',
      notes: 'Payment overdue. Please settle at the earliest.',
      subtotal: 180000,
      discount: 10000,
      taxableAmount: 170000,
      igst: 30600,
      totalTax: 30600,
      grandTotal: 200600,
      status: 'overdue',
      lineItems: {
        create: [
          {
            itemCode: 'HW-001',
            description: 'Server Hardware - Dell PowerEdge R750',
            hsn: '8471',
            quantity: 1,
            rate: 120000,
            amount: 120000,
            gst: 18,
            total: 141600,
          },
          {
            itemCode: 'HW-002',
            description: 'Network Switch - 48 Port Managed',
            hsn: '8517',
            quantity: 2,
            rate: 30000,
            amount: 60000,
            gst: 18,
            total: 70800,
          },
        ],
      },
    },
  });

  console.log('✓ Tax invoices seeded (3 records)');
}

async function main() {
  console.log('Starting seed...\n');

  await seedDocumentNumberSettings();
  await seedUsers();
  await seedDomesticBuyers();
  await seedDomesticProformas();
  await seedDeliveryChallans();
  await seedTaxInvoices();

  console.log('\nSeed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
