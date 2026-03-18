// ============================================
// SendGrid Email Provider
// ============================================

import sgMail from '@sendgrid/mail';
import { IEmailProvider, EmailPayload, EmailResponse } from '../types';

/**
 * SendGrid email provider
 * Requires SENDGRID_API_KEY environment variable
 */
export class SendGridProvider implements IEmailProvider {
  private initialized = false;

  /**
   * Initializes SendGrid client with API key
   */
  private initialize(): void {
    if (this.initialized) return;

    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }

    sgMail.setApiKey(apiKey);
    this.initialized = true;
  }

  /**
   * Sends an email via SendGrid API
   * @param payload - Email payload
   * @returns Response indicating success/failure
   */
  async send(payload: EmailPayload): Promise<EmailResponse> {
    try {
      this.initialize();

      const apiKey = process.env.SENDGRID_API_KEY;
      const fromEmail =
        process.env.SENDGRID_FROM_EMAIL ||
        process.env.SMTP_FROM ||
        'noreply@puruni.com';
      const fromName =
        process.env.SENDGRID_FROM_NAME ||
        process.env.SMTP_FROM_NAME ||
        '푸르니';

      console.log('[SendGrid] Sending email:', {
        to: payload.to,
        from: fromEmail,
        subject: payload.subject,
        hasApiKey: !!apiKey,
      });

      const [response] = await sgMail.send({
        to: payload.to,
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: payload.subject,
        text: payload.text || '',
        html: payload.html || '',
      });

      const rawMessageId = response.headers['x-message-id'];
      const messageId = Array.isArray(rawMessageId)
        ? rawMessageId[0]
        : rawMessageId || undefined;

      return {
        success: true,
        messageId,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown SendGrid error';
      console.error('[SendGrid] Send failed:', message);
      return {
        success: false,
        error: message,
      };
    }
  }
}
