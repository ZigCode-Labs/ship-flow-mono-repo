import { Module } from '@nestjs/common';
import { PrismaModule } from '@shipflow/database';
import { EmailModule } from '../email/email.module';
import { CreditNoteEmailController } from './credit-note-email.controller';
import { CreditNoteEmailService } from './credit-note-email.service';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [CreditNoteEmailController],
  providers: [CreditNoteEmailService],
})
export class CreditNoteEmailModule {}
