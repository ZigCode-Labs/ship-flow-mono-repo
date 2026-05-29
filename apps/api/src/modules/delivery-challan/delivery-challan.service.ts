import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaService } from '@shipflow/database';
import {
  CreateDeliveryChallanDto,
  UpdateDeliveryChallanDto,
} from './delivery-challan.schema';

type TxClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

@Injectable()
export class DeliveryChallanService {
  private readonly logger = new Logger(DeliveryChallanService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getFinancialYear(): { fyString: string; year: number } {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    let fyStart: number, fyEnd: number;
    if (month >= 4) {
      fyStart = year;
      fyEnd = year + 1;
    } else {
      fyStart = year - 1;
      fyEnd = year;
    }

    return {
      fyString: `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`,
      year,
    };
  }

  /**
   * Scans forward from startNum until it finds a challan number not yet in use.
   * Guards against collisions from any prior creation (including concurrent ones
   * that committed before this transaction started).
   */
  private async findNextAvailableNumber(
    prisma: TxClient,
    prefix: string,
    fyString: string,
    startNum: number,
    digits: number,
  ): Promise<{ number: string; nextCounter: number }> {
    let counter = startNum;
    let candidate: string;
    let exists: boolean;

    do {
      candidate = `${prefix}-${fyString}-${String(counter).padStart(digits, '0')}`;
      const existing = await prisma.deliveryChallan.findUnique({
        where: { challanNumber: candidate },
      });
      exists = !!existing;
      if (exists) counter++;
    } while (exists);

    return { number: candidate, nextCounter: counter + 1 };
  }

  async getNextNumber() {
    const setting = await this.prisma.documentNumberSetting.findUnique({
      where: { documentType: 'DELIVERY_CHALLAN' },
    });

    const { fyString } = this.getFinancialYear();

    if (!setting) {
      // No setting yet means no challan has ever been created — derive from
      // existing records so the preview stays accurate if records exist.
      const prefix = 'DC';
      const fullPrefix = `${prefix}-${fyString}-`;
      const last = await this.prisma.deliveryChallan.findFirst({
        where: { challanNumber: { startsWith: fullPrefix } },
        orderBy: { challanNumber: 'desc' },
        select: { challanNumber: true },
      });
      let seq = 1;
      if (last) {
        const n = parseInt(last.challanNumber.slice(fullPrefix.length), 10);
        if (!isNaN(n)) seq = n + 1;
      }
      return { nextNumber: `${fullPrefix}${String(seq).padStart(3, '0')}` };
    }

    const { number } = await this.findNextAvailableNumber(
      this.prisma as unknown as TxClient,
      setting.prefix,
      fyString,
      setting.startingNumber,
      setting.digits,
    );

    return { nextNumber: number };
  }

  async create(data: CreateDeliveryChallanDto) {
    const { lineItems, ...challanData } = data;

    try {
      return await this.prisma.$transaction(async (prisma) => {
        let setting = await prisma.documentNumberSetting.findUnique({
          where: { documentType: 'DELIVERY_CHALLAN' },
        });

        if (!setting) {
          setting = await prisma.documentNumberSetting.create({
            data: {
              documentType: 'DELIVERY_CHALLAN',
              prefix: 'DC',
              digits: 3,
              startingNumber: 1,
            },
          });
        }

        const { fyString } = this.getFinancialYear();
        const { number: finalChallanNumber, nextCounter } =
          await this.findNextAvailableNumber(
            prisma as unknown as TxClient,
            setting.prefix,
            fyString,
            setting.startingNumber,
            setting.digits,
          );

        await prisma.documentNumberSetting.update({
          where: { documentType: 'DELIVERY_CHALLAN' },
          data: { startingNumber: nextCounter },
        });

        this.logger.log(`Creating delivery challan ${finalChallanNumber}`);

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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Challan number collision on fields: ${JSON.stringify(
            (error.meta as { target?: string[] })?.target,
          )} — likely a concurrent creation race.`,
        );
        throw new ConflictException(
          'Challan number was just assigned to another document. Please try again.',
        );
      }
      throw error;
    }
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
    await this.findOne(id);

    const { lineItems, challanNumber: _cn, ...challanData } = data;

    return this.prisma.$transaction(async (prisma) => {
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
    await this.findOne(id);

    return this.prisma.deliveryChallan.delete({
      where: { id },
    });
  }
}
