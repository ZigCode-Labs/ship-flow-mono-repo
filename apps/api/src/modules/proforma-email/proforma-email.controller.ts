import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ProformaEmailService } from './proforma-email.service';
import {
  createBusinessEmailContactSchema,
  searchContactsQuerySchema,
  sendProformaEmailSchema,
} from './proforma-email.schema';

@Controller('proforma-email')
export class ProformaEmailController {
  constructor(private readonly proformaEmailService: ProformaEmailService) {}

  @Get('contacts')
  @HttpCode(HttpStatus.OK)
  searchContacts(@Query() query: unknown) {
    const result = searchContactsQuerySchema.safeParse(query);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }
    return this.proformaEmailService.searchContacts(result.data.search || '');
  }

  @Post('contacts')
  @HttpCode(HttpStatus.CREATED)
  createContact(@Body() body: unknown) {
    const result = createBusinessEmailContactSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }
    return this.proformaEmailService.createContact(result.data);
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendEmail(@Body() body: unknown) {
    const result = sendProformaEmailSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }
    return this.proformaEmailService.sendEmail(result.data);
  }
}
