import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DocumentSettingsService } from './document-settings.service';
import {
  upsertSettingSchema,
  UpsertSettingDto,
} from './document-settings.schema';
import { z } from 'zod';

@Controller('document-settings')
export class DocumentSettingsController {
  private readonly logger = new Logger(DocumentSettingsController.name);

  constructor(
    private readonly documentSettingsService: DocumentSettingsService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    this.logger.log('findAll called');
    return this.documentSettingsService.findAll();
  }

  @Get(':documentType')
  @HttpCode(HttpStatus.OK)
  findByType(documentType: UpsertSettingDto['documentType']) {
    return this.documentSettingsService.findByType(documentType);
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async upsertMany(@Body() body: unknown) {
    this.logger.log('Received PUT request to upsertMany');
    this.logger.log('Raw request body:', JSON.stringify(body, null, 2));

    const schema = z.array(upsertSettingSchema);
    const result = schema.safeParse(body);

    if (!result.success) {
      this.logger.error('Validation failed:', result.error.issues);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    this.logger.log('Validation passed for', result.data.length, 'settings');
    const savedData = await this.documentSettingsService.upsertMany(
      result.data,
    );
    this.logger.log('Service returned:', JSON.stringify(savedData, null, 2));
    return savedData;
  }

  @Put(':documentType')
  @HttpCode(HttpStatus.OK)
  upsert(@Body() body: unknown) {
    const result = upsertSettingSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }
    return this.documentSettingsService.upsert(result.data);
  }
}
