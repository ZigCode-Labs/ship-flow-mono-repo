import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CreditNoteEmailService } from './credit-note-email.service';
import { sendCreditNoteEmailSchema } from './credit-note-email.schema';

@Controller('credit-note-email')
export class CreditNoteEmailController {
  constructor(private readonly creditNoteEmailService: CreditNoteEmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendEmail(@Body() body: unknown) {
    const result = sendCreditNoteEmailSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }
    return this.creditNoteEmailService.sendEmail(result.data);
  }
}
