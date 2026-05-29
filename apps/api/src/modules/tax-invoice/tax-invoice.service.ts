import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaService } from '@shipflow/database';
import {
  CreateTaxInvoiceDto,
  UpdateTaxInvoiceDto,
  FilterTaxInvoiceDto,
} from './dto';

// Structural subset of PrismaClient that both the real client and the
// transaction client satisfy — used to share number-resolution logic.
type TxClient = Pick<PrismaService, 'taxInvoice' | 'documentNumberSetting'>;

@Injectable()
export class TaxInvoiceService {
  private readonly logger = new Logger(TaxInvoiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getFyString(date = new Date()): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const fyStart = month >= 4 ? year : year - 1;
    const fyEnd = fyStart + 1;
    return `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`;
  }

  /**
   * Determines the next safe fallback invoice number by finding the
   * lexicographically highest existing number for the current FY prefix —
   * including soft-deleted records so their unique slot is never reused.
   */
  private async resolveNextFallbackNumber(
    client: TxClient,
    fyString: string,
  ): Promise<string> {
    const prefix = `DI-${fyString}-`;
    const last = await client.taxInvoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: 'desc' },
      select: { invoiceNumber: true },
    });
    let seq = 1;
    if (last) {
      const n = parseInt(last.invoiceNumber.slice(prefix.length), 10);
      if (!isNaN(n)) seq = n + 1;
    }
    return `${prefix}${String(seq).padStart(3, '0')}`;
  }

  async getNextNumber() {
    const setting = await this.prisma.documentNumberSetting.findUnique({
      where: { documentType: 'TAX_INVOICE' },
    });

    const fyString = this.getFyString();

    if (!setting) {
      const nextNumber = await this.resolveNextFallbackNumber(
        this.prisma as unknown as TxClient,
        fyString,
      );
      return { nextNumber };
    }

    const paddedNumber = String(setting.startingNumber).padStart(
      setting.digits,
      '0',
    );

    return { nextNumber: `${setting.prefix}-${fyString}-${paddedNumber}` };
  }

  async create(data: CreateTaxInvoiceDto) {
    const { lineItems, ...invoiceData } = data;

    try {
      return await this.prisma.$transaction(async (prisma) => {
        const setting = await prisma.documentNumberSetting.findUnique({
          where: { documentType: 'TAX_INVOICE' },
        });

        const fyString = this.getFyString();
        let finalInvoiceNumber: string;

        if (setting) {
          const paddedNumber = String(setting.startingNumber).padStart(
            setting.digits,
            '0',
          );

          finalInvoiceNumber = `${setting.prefix}-${fyString}-${paddedNumber}`;

          await prisma.documentNumberSetting.update({
            where: { documentType: 'TAX_INVOICE' },
            data: { startingNumber: setting.startingNumber + 1 },
          });
        } else {
          finalInvoiceNumber = await this.resolveNextFallbackNumber(
            prisma as unknown as TxClient,
            fyString,
          );
        }

        this.logger.log(`Creating tax invoice ${finalInvoiceNumber}`);

        const invoice = await prisma.taxInvoice.create({
          data: {
            ...invoiceData,
            invoiceNumber: finalInvoiceNumber,
            amount: invoiceData.grandTotal ?? 0,
            lineItems: {
              create: lineItems.map((item) => ({
                itemCode: item.itemCode,
                description: item.description,
                hsn: item.hsn,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
                gst: item.gst,
                total: item.total,
              })),
            },
          },
          include: {
            lineItems: true,
          },
        });

        return invoice;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Tax invoice number collision on fields: ${JSON.stringify(
            (error.meta as { target?: string[] })?.target,
          )} — likely a concurrent creation race.`,
        );
        throw new ConflictException(
          'Invoice number was just assigned to another invoice. Please try again.',
        );
      }
      throw error;
    }
  }

  async findAll(filters: FilterTaxInvoiceDto) {
    const { search, page, limit, sortBy, sortOrder, status, dateFrom, dateTo } =
      filters;

    const where: Prisma.TaxInvoiceWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.invoiceDate = {};
      if (dateFrom) where.invoiceDate.gte = dateFrom;
      if (dateTo) where.invoiceDate.lte = dateTo;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerGstin: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.taxInvoice.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          lineItems: true,
        },
      }),
      this.prisma.taxInvoice.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findTrash(filters: FilterTaxInvoiceDto) {
    const { page, limit, sortBy, sortOrder } = filters;

    const where: Prisma.TaxInvoiceWhereInput = {
      deletedAt: { not: null },
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.taxInvoice.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
        include: {
          lineItems: true,
        },
      }),
      this.prisma.taxInvoice.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.taxInvoice.findUnique({
      where: { id },
      include: {
        lineItems: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Tax invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async update(id: string, data: UpdateTaxInvoiceDto) {
    await this.findOne(id);

    const { lineItems, ...invoiceData } = data;

    return this.prisma.$transaction(async (prisma) => {
      if (lineItems) {
        await prisma.taxInvoiceLineItem.deleteMany({
          where: { taxInvoiceId: id },
        });
      }

      return prisma.taxInvoice.update({
        where: { id },
        data: {
          ...invoiceData,
          ...(invoiceData.grandTotal !== undefined && {
            amount: invoiceData.grandTotal,
          }),
          ...(lineItems && {
            lineItems: {
              create: lineItems.map((item) => ({
                itemCode: item.itemCode,
                description: item.description,
                hsn: item.hsn,
                quantity: item.quantity,
                rate: item.rate,
                amount: item.amount,
                gst: item.gst,
                total: item.total,
              })),
            },
          }),
        },
        include: {
          lineItems: true,
        },
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.taxInvoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    const invoice = await this.prisma.taxInvoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException(`Tax invoice with ID ${id} not found`);
    }

    if (!invoice.deletedAt) {
      throw new NotFoundException(`Tax invoice with ID ${id} is not deleted`);
    }

    return this.prisma.taxInvoice.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        lineItems: true,
      },
    });
  }
}
