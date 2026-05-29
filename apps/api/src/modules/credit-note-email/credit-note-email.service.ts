import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '@shipflow/database';
import { EmailService, EmailAttachment } from '../email/email.service';
import { SendCreditNoteEmailDto } from './credit-note-email.schema';
import { generateCreditNotePdf, buildCreditNoteEmailHtml } from './credit-note-pdf.generator';

@Injectable()
export class CreditNoteEmailService {
  private readonly logger = new Logger(CreditNoteEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async sendEmail(data: SendCreditNoteEmailDto) {
    try {
      this.logger.log(`Starting email send for credit note ${data.creditNote.creditNoteNumber}`);

      const recipientEmails = data.recipients.map((r) => r.email);
      const firstRecipientName = data.recipients[0]?.name || '';

      let attachments: EmailAttachment[] | undefined;

      if (data.attachPdf) {
        try {
          this.logger.log('Generating credit note PDF...');
          const pdfBuffer = await generateCreditNotePdf(data.creditNote);
          attachments = [{ filename: data.pdfFileName, content: pdfBuffer }];
          this.logger.log('Credit note PDF generated successfully');
        } catch (pdfErr: any) {
          this.logger.error('PDF generation failed:', pdfErr?.message, pdfErr?.stack);
          throw new InternalServerErrorException(
            `PDF generation failed: ${pdfErr?.message || 'Unknown error'}`,
          );
        }
      }

      const message =
        data.message || buildCreditNoteEmailHtml(data.creditNote, firstRecipientName);

      try {
        this.logger.log(`Sending credit note email to ${recipientEmails.join(', ')}...`);
        await this.emailService.sendEmail(recipientEmails, data.subject, message, {
          cc: data.cc,
          attachments,
        });
        this.logger.log('Credit note email sent successfully');
      } catch (emailErr: any) {
        this.logger.error('Email send failed:', emailErr?.message);
        throw new InternalServerErrorException(
          `Email sending failed: ${emailErr?.message || 'Unknown error'}`,
        );
      }

      await this.prisma.emailLog.create({
        data: {
          type: 'CREDIT_NOTE',
          referenceId: data.creditNote.creditNoteNumber,
          to: recipientEmails.join(', '),
          subject: data.subject,
          status: 'sent',
        },
      });

      return {
        ok: true,
        message: 'Email sent successfully',
        sentTo: recipientEmails,
        data: {
          creditNoteNumber: data.creditNote.creditNoteNumber,
          recipientCount: recipientEmails.length,
          attachPdf: data.attachPdf,
        },
      };
    } catch (err: any) {
      this.logger.error('sendEmail error:', err?.message, err?.stack);
      throw new InternalServerErrorException(
        err?.message || 'Failed to send credit note email',
      );
    }
  }
}
