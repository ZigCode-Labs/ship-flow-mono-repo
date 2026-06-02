import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@shipflow/database';
import { EmailService, EmailAttachment } from '../email/email.service';
import {
  CreateBusinessEmailContactDto,
  SendProformaEmailDto,
} from './proforma-email.schema';
import {
  generateProformaPdf,
  buildEmailHtml,
} from './proforma-pdf.generator';

@Injectable()
export class ProformaEmailService {
  private readonly logger = new Logger(ProformaEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async searchContacts(search: string) {
    const query = search.trim().toLowerCase();

    const [emailContacts, domesticBuyers] = await Promise.all([
      this.prisma.emailContact.findMany({
        where: query
          ? {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { company: { contains: query, mode: 'insensitive' } },
              ],
            }
          : undefined,
        take: 20,
      }),
      this.prisma.domesticBuyer.findMany({
        where: query
          ? {
              OR: [
                { companyName: { contains: query, mode: 'insensitive' } },
                { contactPerson: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
              ],
            }
          : undefined,
        take: 20,
      }),
    ]);

    const contacts = emailContacts.map((c) => ({
      id: c.id,
      name: c.name || c.email,
      email: c.email,
      company: c.company || '',
      type: 'Contact',
    }));

    const buyers = domesticBuyers.map((b) => ({
      id: b.id,
      name: b.contactPerson || b.companyName,
      email: b.email || '',
      company: b.companyName,
      type: 'Domestic Buyer',
    }));

    const merged = [...contacts, ...buyers];

    // Deduplicate by email (case-insensitive)
    const seen = new Set<string>();
    const deduped = merged.filter((item) => {
      const key = item.email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return deduped;
  }

  async createContact(data: CreateBusinessEmailContactDto) {
    return this.prisma.emailContact.upsert({
      where: { email: data.email },
      create: {
        email: data.email,
        name: data.name,
        company: data.company || null,
        phone: data.phone || null,
        notes: data.notes || null,
      },
      update: {
        name: data.name,
        company: data.company || null,
        phone: data.phone || null,
        notes: data.notes || null,
      },
    });
  }

  async sendEmail(data: SendProformaEmailDto) {
    try {
      this.logger.log(`Starting email send for proforma ${data.proformaNumber} (id: ${data.proformaId})`);

      const proformaDoc = await this.prisma.domesticProforma.findUnique({
        where: { id: data.proformaId },
        include: { lineItems: true },
      });

      if (!proformaDoc) {
        this.logger.warn(`Proforma not found: ${data.proformaId}`);
        throw new NotFoundException(
          `Proforma with ID ${data.proformaId} not found`,
        );
      }

      const sellerCompanyName = proformaDoc.sellerCompanyName;
      const recipientEmails = data.recipients.map((r) => r.email);
      const firstRecipientName = data.recipients[0]?.name || '';

      let attachments: EmailAttachment[] | undefined;

      if (data.attachPdf) {
        try {
          this.logger.log('Generating PDF...');
          const pdfBuffer = await generateProformaPdf(proformaDoc as any);
          attachments = [
            {
              filename: data.pdfFileName,
              content: pdfBuffer,
            },
          ];
          this.logger.log('PDF generated successfully');
        } catch (pdfErr: any) {
          this.logger.error('PDF generation failed:', pdfErr?.message, pdfErr?.stack);
          throw new InternalServerErrorException(
            `PDF generation failed: ${pdfErr?.message || 'Unknown error'}`,
          );
        }
      }

      const message =
        data.message ||
        buildEmailHtml(proformaDoc as any, firstRecipientName);

      try {
        this.logger.log(`Sending email to ${recipientEmails.join(', ')}...`);
        await this.emailService.sendEmail(
          recipientEmails,
          data.subject,
          message,
          {
            fromName: sellerCompanyName,
            cc: data.cc,
            attachments,
          },
        );
        this.logger.log('Email sent successfully');
      } catch (emailErr: any) {
        this.logger.error('Email send failed:', emailErr?.message);
        throw new InternalServerErrorException(
          `Email sending failed: ${emailErr?.message || 'Unknown error'}`,
        );
      }

      // Log to EmailLog
      await this.prisma.emailLog.create({
        data: {
          type: 'PROFORMA',
          referenceId: data.proformaId,
          to: recipientEmails.join(', '),
          subject: data.subject,
          status: 'sent',
        },
      });

      // Mark proforma as sent
      await this.prisma.domesticProforma.update({
        where: { id: data.proformaId },
        data: { status: 'SENT' },
      });

      return {
        ok: true,
        message: 'Email sent successfully',
        sentTo: recipientEmails,
        data: {
          proformaNumber: data.proformaNumber,
          recipientCount: recipientEmails.length,
          attachPdf: data.attachPdf,
        },
      };
    } catch (err: any) {
      this.logger.error('sendEmail error:', err?.message, err?.stack);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException(
        err?.message || 'Failed to send proforma email',
      );
    }
  }
}
