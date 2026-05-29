import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PrismaService } from '@shipflow/database';
import {
  CreateDomesticBuyerDto,
  UpdateDomesticBuyerDto,
} from './domestic-buyers.schema';

@Injectable()
export class DomesticBuyersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateDomesticBuyerDto) {
    try {
      return await this.prisma.domesticBuyer.create({
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A domestic buyer with this GSTIN already exists',
        );
      }
      throw error;
    }
  }

  async findAll(status?: CreateDomesticBuyerDto['status']) {
    return this.prisma.domesticBuyer.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const buyer = await this.prisma.domesticBuyer.findUnique({
      where: { id },
    });

    if (!buyer) {
      throw new NotFoundException(`Domestic buyer with ID ${id} not found`);
    }

    return buyer;
  }

  async update(id: string, data: UpdateDomesticBuyerDto) {
    await this.findOne(id);

    try {
      return await this.prisma.domesticBuyer.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'A domestic buyer with this GSTIN already exists',
        );
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.domesticBuyer.delete({
      where: { id },
    });
  }
}
