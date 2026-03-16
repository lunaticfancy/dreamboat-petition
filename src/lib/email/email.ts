// ============================================
// Email Service
// ============================================

import { EmailPayload, EmailResponse, IEmailProvider } from './types';
import { createEmailProvider } from './providers';
import { createVerificationEmail } from './templates/verification';

/**
 * Email service for sending various types of emails
 * Uses configured provider (SMTP, SendGrid, or Mock)
 */
export class EmailService {
  private provider: IEmailProvider | null = null;

  private getProvider(): IEmailProvider {
    if (!this.provider) {
      this.provider = createEmailProvider();
    }
    return this.provider;
  }

  async send(payload: EmailPayload): Promise<EmailResponse> {
    const provider = this.getProvider();
    return provider.send(payload);
  }

  /**
   * Sends a verification email with a code
   * @param email - Recipient email address
   * @param code - Verification code (typically 6 digits)
   * @param expiryMinutes - Minutes until code expires (default: 10)
   * @returns Response indicating success/failure
   */
  async sendVerificationEmail(
    email: string,
    code: string,
    expiryMinutes: number = 10
  ): Promise<EmailResponse> {
    const { subject, text, html } = createVerificationEmail({
      code,
      expiryMinutes,
    });

    return this.send({
      to: email,
      subject,
      text,
      html,
    });
  }
}

/**
 * Singleton email service instance for app-wide use
 */
export const emailService = new EmailService();
