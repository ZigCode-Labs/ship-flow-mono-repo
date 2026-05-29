import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDeliveryChallanDto,
  UpdateDeliveryChallanDto,
} from './delivery-challan.schema';

@Injectable()
export class DeliveryChallanService {
  constructor(private readonly prisma: PrismaService) {}

  async getNextNumber() {
    const setting = await this.prisma.documentNumberSetting.findUnique({
      where: { documentType: 'DELIVERY_CHALLAN' },
    });

    if (!setting) {
      return { nextNumber: 'DC-26-27-001' }; // Fallback
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

  async create(data: CreateDeliveryChallanDto) {
    const { lineItems, ...challanData } = data;

    return this.prisma.$transaction(async (prisma) => {
      // 1. Get the current setting for Delivery Challan
      const setting = await prisma.documentNumberSetting.findUnique({
        where: { documentType: 'DELIVERY_CHALLAN' },
      });

      let finalChallanNumber = challanData.challanNumber;

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

        finalChallanNumber = `${setting.prefix}-${fyString}-${paddedNumber}`;

        // 2. Increment the setting so next user gets the next number
        await prisma.documentNumberSetting.update({
          where: { documentType: 'DELIVERY_CHALLAN' },
          data: { startingNumber: setting.startingNumber + 1 },
        });
      }

      // 3. Create the document
      return prisma.deliveryChallan.create({
        data: {
          ...challanData,
          challanNumber: finalChallanNumber,
          lineItems: {
            create: lineItems.map((item) => ({
              itemCode: item.itemCode,
              description: item.description,
              hsn: item.hsn,
              quantity: item.quantity,
              unit: item.unit,
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
    });
  }

  async findAll() {
    return this.prisma.deliveryChallan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lineItems: true,
      },
    });
  }

  async findOne(id: string) {
    const challan = await this.prisma.deliveryChallan.findUnique({
      where: { id },
      include: {
        lineItems: true,
      },
    });

    if (!challan) {
      throw new NotFoundException(`Delivery challan with ID ${id} not found`);
    }

    return challan;
  }

  async update(id: string, data: UpdateDeliveryChallanDto) {
    // Check if exists
    await this.findOne(id);

    const { lineItems, ...challanData } = data;

    return this.prisma.$transaction(async (prisma) => {
      // If line items are provided, delete old ones and recreate
      if (lineItems) {
        await prisma.deliveryChallanItem.deleteMany({
          where: { challanId: id },
        });
      }

      return prisma.deliveryChallan.update({
        where: { id },
        data: {
          ...challanData,
          ...(lineItems && {
            lineItems: {
              create: lineItems.map((item) => ({
                itemCode: item.itemCode,
                description: item.description,
                hsn: item.hsn,
                quantity: item.quantity,
                unit: item.unit,
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
    // Check if exists
    await this.findOne(id);

    return this.prisma.deliveryChallan.delete({
      where: { id },
    });
  }
}
