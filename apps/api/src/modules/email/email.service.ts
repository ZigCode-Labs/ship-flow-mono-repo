import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    const rawGmailUser = this.configService.get<string>('GMAIL_USER') || '';
    const rawGmailPass = this.configService.get<string>('GMAIL_APP_PASSWORD') || '';

    // Strip surrounding quotes and whitespace
    const gmailUser = rawGmailUser.replace(/^["']|["']$/g, '').trim();
    const gmailPass = rawGmailPass.replace(/^["']|["']$/g, '').trim().replace(/\s+/g, '');

    if (!gmailUser || gmailUser.toLowerCase().includes('your-gmail')) {
      this.logger.warn(
        'GMAIL_USER is not configured. Email sending will fail. Please set it in apps/api/.env',
      );
      return;
    }

    if (!gmailPass || gmailPass.toLowerCase().includes('xxxx')) {
      this.logger.warn(
        'GMAIL_APP_PASSWORD is not configured. Email sending will fail. Please set it in apps/api/.env',
      );
      return;
    }

    this.isConfigured = true;

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    // Verify credentials immediately on startup so auth errors surface in logs right away
    this.transporter.verify((err) => {
      if (err) {
        this.logger.error(
          `SMTP verification failed. This usually means either:\n` +
          `  1. You are using your regular Gmail password instead of a Google App Password.\n` +
          `  2. 2-Step Verification is NOT turned on for this Gmail account.\n` +
          `  3. The App Password is incorrect or was revoked.\n\n` +
          `To fix:\n` +
          `  1. Go to https://myaccount.google.com/security and turn ON 2-Step Verification.\n` +
          `  2. Go to https://myaccount.google.com/apppasswords and create an App Password for "Mail".\n` +
          `  3. Copy the 16-character password (no spaces) into apps/api/.env as GMAIL_APP_PASSWORD.\n\n` +
          `Original error: ${err.message}`,
        );
        this.isConfigured = false;
      } else {
        this.logger.log('SMTP connection verified successfully.');
      }
    });
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    message: string,
    options?: {
      fromName?: string;
      cc?: string;
      attachments?: EmailAttachment[];
    },
  ): Promise<SentMessageInfo> {
    if (!this.isConfigured) {
      throw new InternalServerErrorException(
        'Email service is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in apps/api/.env. ' +
        'You must use a Google App Password (not your regular Gmail password) and have 2-Step Verification enabled.',
      );
    }

    const fromEmail = this.configService.get<string>('GMAIL_USER')?.replace(/^["']|["']$/g, '').trim() || '';
    const fromName =
      options?.fromName ||
      this.configService.get<string>('GMAIL_FROM_NAME') ||
      'ShipFlow';

    try {
      const result = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        cc: options?.cc,
        subject,
        html: message,
        attachments: options?.attachments,
      });
      return result;
    } catch (err: any) {
      const msg = err?.message || '';

      if (msg.includes('535') || msg.includes('Invalid login') || msg.includes('Username and Password not accepted')) {
        this.logger.error('Gmail authentication failed. Details:', msg);
        throw new InternalServerErrorException(
          'Gmail rejected the login credentials. ' +
          'Please check: (1) You are using a Google App Password (not your regular Gmail password). ' +
          '(2) 2-Step Verification is turned ON for this account. ' +
          '(3) The App Password is copied correctly without spaces. ' +
          'Create an App Password at: https://myaccount.google.com/apppasswords',
        );
      }

      this.logger.error('Email send failed:', msg, err?.stack);
      throw new InternalServerErrorException(
        `Failed to send email: ${msg || 'Unknown error'}`,
      );
    }
  }
}
