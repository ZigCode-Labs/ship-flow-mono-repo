import { Module } from '@nestjs/common';
import { PrismaModule } from '@shipflow/database';
import { EmailModule } from '../email/email.module';
import { DeliveryChallanEmailController } from './delivery-challan-email.controller';
import { DeliveryChallanEmailService } from './delivery-challan-email.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [DeliveryChallanEmailController],
  providers: [DeliveryChallanEmailService],
})
export class DeliveryChallanEmailModule {}
