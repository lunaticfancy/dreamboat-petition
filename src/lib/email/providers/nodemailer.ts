// ============================================
// Nodemailer (SMTP) Email Provider
// ============================================

import nodemailer from 'nodemailer';
import { IEmailProvider, EmailPayload, EmailResponse } from '../types';

/**
 * SMTP email provider using Nodemailer
 * Works with any SMTP server (Gmail, Outlook, custom, etc.)
 */
export class NodemailerProvider implements IEmailProvider {
  private transporter: nodemailer.Transporter | null = null;

  /**
   * Creates or returns existing transporter
   */
  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    return this.transporter;
  }

  /**
   * Sends an email via SMTP
   * @param payload - Email payload
   * @returns Response indicating success/failure
   */
  async send(payload: EmailPayload): Promise<EmailResponse> {
    try {
      const transporter = await this.getTransporter();

      const fromName = process.env.SMTP_FROM_NAME || '푸르니';
      const fromEmail = process.env.SMTP_FROM || 'noreply@puruni.com';

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown SMTP error';
      console.error('[Nodemailer] Send failed:', message);
      return {
        success: false,
        error: message,
      };
    }
  }
}
