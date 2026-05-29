import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateTaxInvoiceDto,
  UpdateTaxInvoiceDto,
  FilterTaxInvoiceDto,
} from './dto';

@Injectable()
export class TaxInvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async getNextNumber() {
    const setting = await this.prisma.documentNumberSetting.findUnique({
      where: { documentType: 'TAX_INVOICE' },
    });

    if (!setting) {
      return { nextNumber: 'DI-26-27-001' };
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    let fyStart: number;
    let fyEnd: number;
    if (month >= 4) {
      fyStart = year;
      fyEnd = year + 1;
    } else {
      fyStart = year - 1;
      fyEnd = year;
    }

    const fyString = `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`;
    const paddedNumber = String(setting.startingNumber).padStart(
      setting.digits,
      '0',
    );

    return { nextNumber: `${setting.prefix}-${fyString}-${paddedNumber}` };
  }

  async create(data: CreateTaxInvoiceDto) {
    const { lineItems, ...invoiceData } = data;

    return this.prisma.$transaction(async (prisma) => {
      const setting = await prisma.documentNumberSetting.findUnique({
        where: { documentType: 'TAX_INVOICE' },
      });

      let finalInvoiceNumber: string = invoiceData.invoiceNumber ?? '';

      if (setting) {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        let fyStart: number;
        let fyEnd: number;
        if (month >= 4) {
          fyStart = year;
          fyEnd = year + 1;
        } else {
          fyStart = year - 1;
          fyEnd = year;
        }

        const fyString = `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`;
        const paddedNumber = String(setting.startingNumber).padStart(
          setting.digits,
          '0',
        );

        finalInvoiceNumber = `${setting.prefix}-${fyString}-${paddedNumber}`;

        await prisma.documentNumberSetting.update({
          where: { documentType: 'TAX_INVOICE' },
          data: { startingNumber: setting.startingNumber + 1 },
        });
      }

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
