import { Module } from '@nestjs/common';
import { PrismaModule } from '@shipflow/database';
import { EmailModule } from '../email/email.module';
import { ProformaEmailController } from './proforma-email.controller';
import { ProformaEmailService } from './proforma-email.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [ProformaEmailController],
  providers: [ProformaEmailService],
})
export class ProformaEmailModule {}
