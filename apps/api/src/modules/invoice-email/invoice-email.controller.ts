import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { InvoiceEmailService } from './invoice-email.service';
import { sendInvoiceEmailSchema } from './invoice-email.schema';

@Controller('invoice-email')
export class InvoiceEmailController {
  constructor(private readonly invoiceEmailService: InvoiceEmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendEmail(@Body() body: unknown) {
    const result = sendInvoiceEmailSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }
    return this.invoiceEmailService.sendEmail(result.data);
  }
}
