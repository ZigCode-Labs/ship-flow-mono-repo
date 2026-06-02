import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@shipflow/database';
import { EmailService } from '../email/email.service';
import { SendDeliveryChallanEmailDto } from './delivery-challan-email.schema';

function buildDeliveryChallanEmailHtml(message: string, challanNumber: string) {
  const normalizedMessage = message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('<br />');

  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <p>${normalizedMessage}</p>
      <p style="margin-top: 24px;">Reference: <strong>${challanNumber}</strong></p>
    </div>
  `;
}

@Injectable()
export class DeliveryChallanEmailService {
  private readonly logger = new Logger(DeliveryChallanEmailService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async sendEmail(data: SendDeliveryChallanEmailDto) {
    const challan = await this.prisma.deliveryChallan.findUnique({
      where: { id: data.challanId },
    });

    if (!challan) {
      throw new NotFoundException(
        `Delivery challan with ID ${data.challanId} not found`,
      );
    }

    const emailRecord = await this.prisma.deliveryChallanEmail.create({
      data: {
        challanId: data.challanId,
        recipientEmail: data.recipientEmail,
        subject: data.subject,
        message: data.message,
        status: 'pending',
      },
    });

    try {
      const attachments = data.pdfBase64
        ? [{ filename: `${challan.challanNumber}.pdf`, content: Buffer.from(data.pdfBase64, 'base64') }]
        : undefined;

      await this.emailService.sendEmail(
        data.recipientEmail,
        data.subject,
        buildDeliveryChallanEmailHtml(data.message, challan.challanNumber),
        { fromName: challan.companyName, attachments },
      );

      await this.prisma.$transaction([
        this.prisma.deliveryChallanEmail.update({
          where: { id: emailRecord.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            error: null,
          },
        }),
        this.prisma.deliveryChallan.update({
          where: { id: challan.id },
          data: { status: 'sent' },
        }),
        this.prisma.emailLog.create({
          data: {
            type: 'DELIVERY_CHALLAN',
            referenceId: challan.id,
            to: data.recipientEmail,
            subject: data.subject,
            status: 'sent',
          },
        }),
      ]);

      return {
        ok: true,
        message: 'Delivery challan email sent successfully',
        data: {
          challanId: challan.id,
          challanNumber: challan.challanNumber,
          recipientEmail: data.recipientEmail,
          emailRecordId: emailRecord.id,
        },
      };
    } catch (error: any) {
      this.logger.error(
        'Failed to send delivery challan email',
        error?.stack || error?.message,
      );

      await this.prisma.$transaction([
        this.prisma.deliveryChallanEmail.update({
          where: { id: emailRecord.id },
          data: {
            status: 'failed',
            error: error?.message || 'Unknown error',
          },
        }),
        this.prisma.emailLog.create({
          data: {
            type: 'DELIVERY_CHALLAN',
            referenceId: challan.id,
            to: data.recipientEmail,
            subject: data.subject,
            status: 'failed',
            error: error?.message || 'Unknown error',
          },
        }),
      ]);

      throw new InternalServerErrorException(
        error?.message || 'Failed to send delivery challan email',
      );
    }
  }
}
