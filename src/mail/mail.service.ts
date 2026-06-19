import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Citizen } from '../citizens/entities/citizen.entity';
import { ComplaintRequest } from '../requests/entities/request.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter | null;

  constructor() {
    if (!process.env.SMTP_HOST) {
      this.logger.warn('SMTP_HOST not set — response emails are disabled.');
      this.transporter = null;
      return;
    }
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true', // true for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Email the citizen the official response to their request.
   * Never throws — a mail failure must not roll back the staff action.
   */
  async sendRequestResponse(
    citizen: Citizen,
    request: ComplaintRequest,
    response: string,
  ): Promise<void> {
    if (!this.transporter) return;
    if (!citizen?.email) {
      this.logger.warn(`Request #${request.id} citizen has no email; skipping.`);
      return;
    }

    const from =
      process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'no-reply@complaints';
    const name = `${citizen.firstName} ${citizen.lastName}`.trim();

    try {
      await this.transporter.sendMail({
        from,
        to: citizen.email,
        subject: `Update on your request #${request.id}`,
        text:
          `Dear ${name},\n\n` +
          `There is an update on your ${request.type} (#${request.id}).\n` +
          `Status: ${request.status}\n\n` +
          `Response:\n${response}\n\n` +
          `Thank you.`,
        html:
          `<p>Dear ${name},</p>` +
          `<p>There is an update on your <b>${request.type}</b> (#${request.id}).</p>` +
          `<p><b>Status:</b> ${request.status}</p>` +
          `<p><b>Response:</b><br/>${response.replace(/\n/g, '<br/>')}</p>` +
          `<p>Thank you.</p>`,
      });
      this.logger.log(`Response email sent to ${citizen.email} (req #${request.id})`);
    } catch (err) {
      this.logger.error(
        `Failed to email response for request #${request.id}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
