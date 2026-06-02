import { Module } from '@nestjs/common';
import { PrismaModule } from '@shipflow/database';
import { EmailModule } from '../email/email.module';
import { InvoiceEmailController } from './invoice-email.controller';
import { InvoiceEmailService } from './invoice-email.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [InvoiceEmailController],
  providers: [InvoiceEmailService],
})
export class InvoiceEmailModule {}
