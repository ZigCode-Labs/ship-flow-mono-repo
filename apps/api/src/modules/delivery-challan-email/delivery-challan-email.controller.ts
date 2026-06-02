import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { DeliveryChallanEmailService } from './delivery-challan-email.service';
import { sendDeliveryChallanEmailSchema } from './delivery-challan-email.schema';

@Controller('delivery-challan-email')
export class DeliveryChallanEmailController {
  constructor(
    private readonly deliveryChallanEmailService: DeliveryChallanEmailService,
  ) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendEmail(@Body() body: unknown) {
    const result = sendDeliveryChallanEmailSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: result.error.issues,
      });
    }

    return this.deliveryChallanEmailService.sendEmail(result.data);
  }
}
