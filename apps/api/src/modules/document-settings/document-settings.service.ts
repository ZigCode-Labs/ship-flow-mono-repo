import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@shipflow/database';
import { UpsertSettingDto } from './document-settings.schema';

@Injectable()
export class DocumentSettingsService {
  private readonly logger = new Logger(DocumentSettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.documentNumberSetting.findMany({
      orderBy: { documentType: 'asc' },
    });
  }

  async findByType(documentType: UpsertSettingDto['documentType']) {
    return this.prisma.documentNumberSetting.findUnique({
      where: { documentType },
    });
  }

  async upsert(dto: UpsertSettingDto) {
    return this.prisma.documentNumberSetting.upsert({
      where: { documentType: dto.documentType },
      update: {
        prefix: dto.prefix,
        digits: dto.digits,
        startingNumber: dto.startingNumber,
      },
      create: {
        documentType: dto.documentType,
        prefix: dto.prefix,
        digits: dto.digits,
        startingNumber: dto.startingNumber,
      },
    });
  }

  async upsertMany(settings: UpsertSettingDto[]) {
    this.logger.log(`Received ${settings.length} settings to upsert`);
    this.logger.log('Payload:', JSON.stringify(settings, null, 2));

    const results = await this.prisma.$transaction(
      settings.map((dto) =>
        this.prisma.documentNumberSetting.upsert({
          where: { documentType: dto.documentType },
          update: {
            prefix: dto.prefix,
            digits: dto.digits,
            startingNumber: dto.startingNumber,
          },
          create: {
            documentType: dto.documentType,
            prefix: dto.prefix,
            digits: dto.digits,
            startingNumber: dto.startingNumber,
          },
        }),
      ),
    );

    this.logger.log('Upsert results:', JSON.stringify(results, null, 2));
    return results;
  }
}
