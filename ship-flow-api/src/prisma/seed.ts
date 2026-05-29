import 'dotenv/config';
import { PrismaClient, DocumentType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const defaults = [
    {
      documentType: DocumentType.TAX_INVOICE,
      prefix: 'DI',
      digits: 5,
      startingNumber: 1,
    },
    {
      documentType: DocumentType.DOMESTIC_PROFORMA,
      prefix: 'PRO',
      digits: 5,
      startingNumber: 1,
    },
    {
      documentType: DocumentType.CREDIT_NOTE,
      prefix: 'CRN',
      digits: 5,
      startingNumber: 1,
    },
    {
      documentType: DocumentType.DELIVERY_CHALLAN,
      prefix: 'DC',
      digits: 5,
      startingNumber: 1,
    },
  ];

  for (const data of defaults) {
    try {
      await prisma.documentNumberSetting.upsert({
        where: { documentType: data.documentType },
        update: {},
        create: data,
      });
    } catch (error) {
      console.error(`Failed to seed ${data.documentType}:`, error);
      throw error;
    }
  }
  console.log('Seeded document number settings');

  const existingInvoices = await prisma.taxInvoice.count();
  if (existingInvoices === 0) {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = await prisma.taxInvoice.create({
      data: {
        invoiceNumber: 'DI-26-27-00001',
        invoiceDate: today,
        dueDate,
        exchangeRate: 93.06,
        companyName: 'Sharma Traders Pvt. Ltd.',
        gstin: '27AABCT1234F1Z5',
        state: 'MH',
        customerId: 'cust-001',
        customerName: 'ABC Corporation',
        customerGstin: '27AABCU9603R1ZM',
        placeOfSupply: 'MH',
        bankName: 'HDFC Bank',
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
        branch: 'Mumbai',
        paymentTerms: 'Net 30 days',
        reference: 'PO-2026-001',
        notes: 'Sample tax invoice for testing',
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
              description: 'Software License - Enterprise',
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
    console.log(`Seeded tax invoice: ${invoice.invoiceNumber}`);
  } else {
    console.log('Tax invoices already exist, skipping seed');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
