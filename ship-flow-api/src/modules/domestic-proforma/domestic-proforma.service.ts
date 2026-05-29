import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDomesticProformaDto,
  UpdateDomesticProformaDto,
} from './domestic-proforma.schema';

@Injectable()
export class DomesticProformaService {
  constructor(private readonly prisma: PrismaService) {}

  async getNextNumber() {
    const setting = await this.prisma.documentNumberSetting.findUnique({
      where: { documentType: 'DOMESTIC_PROFORMA' },
    });

    if (!setting) {
      return { nextNumber: 'DPI-26-27-001' }; // Fallback
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    let fyStart, fyEnd;
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

  async create(data: CreateDomesticProformaDto) {
    const { lineItems, ...proformaData } = data;

    return this.prisma.$transaction(async (prisma) => {
      // 1. Get the current setting for Domestic Proforma
      const setting = await prisma.documentNumberSetting.findUnique({
        where: { documentType: 'DOMESTIC_PROFORMA' },
      });

      let finalProformaNumber = proformaData.proformaNumber;

      if (setting) {
        // Calculate Financial Year (April to March)
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;

        let fyStart, fyEnd;
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

        finalProformaNumber = `${setting.prefix}-${fyString}-${paddedNumber}`;

        // 2. Increment the setting so next user gets the next number
        await prisma.documentNumberSetting.update({
          where: { documentType: 'DOMESTIC_PROFORMA' },
          data: { startingNumber: setting.startingNumber + 1 },
        });
      }

      // 3. Create the document
      return prisma.domesticProforma.create({
        data: {
          ...proformaData,
          proformaNumber: finalProformaNumber,
          lineItems: {
            create: lineItems.map((item) => ({
              itemCode: item.itemCode,
              description: item.description,
              hsn: item.hsn,
              qty: item.qty,
              rate: item.rate,
              amount: item.amount,
              gstPercent: item.gstPercent,
              total: item.total,
            })),
          },
        },
        include: {
          lineItems: true,
        },
      });
    });
  }

  async findAll() {
    return this.prisma.domesticProforma.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lineItems: true,
      },
    });
  }

  async findOne(id: string) {
    const proforma = await this.prisma.domesticProforma.findUnique({
      where: { id },
      include: {
        lineItems: true,
      },
    });

    if (!proforma) {
      throw new NotFoundException(`Domestic proforma with ID ${id} not found`);
    }

    return proforma;
  }

  async update(id: string, data: UpdateDomesticProformaDto) {
    // Check if exists
    await this.findOne(id);

    const { lineItems, ...proformaData } = data;

    return this.prisma.$transaction(async (prisma) => {
      // If line items are provided, delete old ones and recreate
      if (lineItems) {
        await prisma.domesticProformaItem.deleteMany({
          where: { proformaId: id },
        });
      }

      return prisma.domesticProforma.update({
        where: { id },
        data: {
          ...proformaData,
          ...(lineItems && {
            lineItems: {
              create: lineItems.map((item) => ({
                itemCode: item.itemCode,
                description: item.description,
                hsn: item.hsn,
                qty: item.qty,
                rate: item.rate,
                amount: item.amount,
                gstPercent: item.gstPercent,
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
    // Check if exists
    await this.findOne(id);

    return this.prisma.domesticProforma.delete({
      where: { id },
    });
  }
}
