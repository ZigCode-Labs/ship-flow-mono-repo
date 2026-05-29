import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaService } from '@shipflow/database';
import {
  CreateDomesticProformaDto,
  UpdateDomesticProformaDto,
} from './domestic-proforma.schema';

type TxClient = Pick<PrismaService, 'domesticProforma' | 'documentNumberSetting'>;

@Injectable()
export class DomesticProformaService {
  private readonly logger = new Logger(DomesticProformaService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getFyString(date = new Date()): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const fyStart = month >= 4 ? year : year - 1;
    const fyEnd = fyStart + 1;
    return `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`;
  }

  /**
   * Finds the highest existing proforma number for the current FY and returns
   * the next sequence. Uses hard-delete semantics (no deletedAt), so all rows
   * count. This prevents duplicate collisions regardless of prior deletions.
   */
  private async resolveNextFallbackNumber(
    client: TxClient,
    fyString: string,
  ): Promise<string> {
    const prefix = `DPI-${fyString}-`;
    const last = await client.domesticProforma.findFirst({
      where: { proformaNumber: { startsWith: prefix } },
      orderBy: { proformaNumber: 'desc' },
      select: { proformaNumber: true },
    });
    let seq = 1;
    if (last) {
      const n = parseInt(last.proformaNumber.slice(prefix.length), 10);
      if (!isNaN(n)) seq = n + 1;
    }
    return `${prefix}${String(seq).padStart(3, '0')}`;
  }

  async getNextNumber() {
    const setting = await this.prisma.documentNumberSetting.findUnique({
      where: { documentType: 'DOMESTIC_PROFORMA' },
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

  async create(data: CreateDomesticProformaDto) {
    const { lineItems, ...proformaData } = data;

    try {
      return await this.prisma.$transaction(async (prisma) => {
        const setting = await prisma.documentNumberSetting.findUnique({
          where: { documentType: 'DOMESTIC_PROFORMA' },
        });

        const fyString = this.getFyString();
        let finalProformaNumber: string;

        if (setting) {
          const paddedNumber = String(setting.startingNumber).padStart(
            setting.digits,
            '0',
          );
          finalProformaNumber = `${setting.prefix}-${fyString}-${paddedNumber}`;

          await prisma.documentNumberSetting.update({
            where: { documentType: 'DOMESTIC_PROFORMA' },
            data: { startingNumber: setting.startingNumber + 1 },
          });
        } else {
          finalProformaNumber = await this.resolveNextFallbackNumber(
            prisma as unknown as TxClient,
            fyString,
          );
        }

        this.logger.log(`Creating proforma ${finalProformaNumber}`);

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
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          `Proforma number collision on fields: ${JSON.stringify(
            (error.meta as { target?: string[] })?.target,
          )} — likely a concurrent creation race.`,
        );
        throw new ConflictException(
          'Proforma number was just assigned to another document. Please try again.',
        );
      }
      throw error;
    }
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
    await this.findOne(id);

    const { lineItems, ...proformaData } = data;

    return this.prisma.$transaction(async (prisma) => {
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
    await this.findOne(id);

    return this.prisma.domesticProforma.delete({
      where: { id },
    });
  }
}
