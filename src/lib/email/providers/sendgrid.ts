// ============================================
// SendGrid Email Provider using native fetch
// ============================================

import { IEmailProvider, EmailPayload, EmailResponse } from '../types';

/**
 * SendGrid email provider using native fetch API
 * Requires SENDGRID_API_KEY environment variable
 */
export class SendGridProvider implements IEmailProvider {
  private apiKey: string | null = null;

  /**
   * Initializes SendGrid API key
   */
  private initialize(): void {
    if (this.apiKey) return;

    const key = process.env.SENDGRID_API_KEY;
    if (!key) {
      throw new Error('SENDGRID_API_KEY is not configured');
    }
    this.apiKey = key;
  }

  /**
   * Sends an email via SendGrid API using native fetch
   * @param payload - Email payload
   * @returns Response indicating success/failure
   */
  async send(payload: EmailPayload): Promise<EmailResponse> {
    try {
      this.initialize();

      const fromEmail =
        process.env.SENDGRID_FROM_EMAIL ||
        process.env.SMTP_FROM ||
        'noreply@puruni.com';
      const fromName =
        process.env.SENDGRID_FROM_NAME ||
        process.env.SMTP_FROM_NAME ||
        '푸르니';

      const emailData = {
        personalizations: [
          {
            to: [{ email: payload.to }],
          },
        ],
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: payload.subject,
        content: [
          {
            type: 'text/plain',
            value: payload.text || '',
          },
          {
            type: 'text/html',
            value: payload.html || payload.text || '',
          },
        ],
      };

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.status === 202) {
        const messageId = response.headers.get('X-Message-Id') || undefined;
        return {
          success: true,
          messageId,
        };
      }

      const errorText = await response.text();
      console.error('[SendGrid] Send failed:', response.status, errorText);
      return {
        success: false,
        error: `SendGrid API error: ${response.status} - ${errorText}`,
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
