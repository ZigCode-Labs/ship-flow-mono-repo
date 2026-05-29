import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shipflow/database';
import { EmailService, EmailAttachment } from '../email/email.service';
import { SendInvoiceEmailDto } from './invoice-email.schema';
import { generateInvoicePdf, buildInvoiceEmailHtml } from './invoice-pdf.generator';

@Injectable()
export class InvoiceEmailService {
  private readonly logger = new Logger(InvoiceEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async sendEmail(data: SendInvoiceEmailDto) {
    try {
      this.logger.log(`Starting email send for invoice ${data.invoiceNumber} (id: ${data.invoiceId})`);

      const invoiceDoc = await this.prisma.taxInvoice.findUnique({
        where: { id: data.invoiceId },
        include: { lineItems: true },
      });

      if (!invoiceDoc) {
        this.logger.warn(`Tax invoice not found: ${data.invoiceId}`);
        throw new NotFoundException(`Tax invoice with ID ${data.invoiceId} not found`);
      }

      const recipientEmails = data.recipients.map((r) => r.email);
      const firstRecipientName = data.recipients[0]?.name || '';

      let attachments: EmailAttachment[] | undefined;

      if (data.attachPdf) {
        try {
          this.logger.log('Generating invoice PDF...');
          const pdfBuffer = await generateInvoicePdf(invoiceDoc as any);
          attachments = [{ filename: data.pdfFileName, content: pdfBuffer }];
          this.logger.log('Invoice PDF generated successfully');
        } catch (pdfErr: any) {
          this.logger.error('PDF generation failed:', pdfErr?.message, pdfErr?.stack);
          throw new InternalServerErrorException(
            `PDF generation failed: ${pdfErr?.message || 'Unknown error'}`,
          );
        }
      }

      const message =
        data.message || buildInvoiceEmailHtml(invoiceDoc as any, firstRecipientName);

      try {
        this.logger.log(`Sending invoice email to ${recipientEmails.join(', ')}...`);
        await this.emailService.sendEmail(recipientEmails, data.subject, message, {
          fromName: invoiceDoc.companyName,
          cc: data.cc,
          attachments,
        });
        this.logger.log('Invoice email sent successfully');
      } catch (emailErr: any) {
        this.logger.error('Email send failed:', emailErr?.message);
        throw new InternalServerErrorException(
          `Email sending failed: ${emailErr?.message || 'Unknown error'}`,
        );
      }

      await this.prisma.emailLog.create({
        data: {
          type: 'TAX_INVOICE',
          referenceId: data.invoiceId,
          to: recipientEmails.join(', '),
          subject: data.subject,
          status: 'sent',
        },
      });

      await this.prisma.taxInvoice.update({
        where: { id: data.invoiceId },
        data: { status: 'sent' },
      });

      return {
        ok: true,
        message: 'Email sent successfully',
        sentTo: recipientEmails,
        data: {
          invoiceNumber: data.invoiceNumber,
          recipientCount: recipientEmails.length,
          attachPdf: data.attachPdf,
        },
      };
    } catch (err: any) {
      this.logger.error('sendEmail error:', err?.message, err?.stack);
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to send invoice email',
      );
    }
  }
}
