// ============================================
// Mock Email Provider (for Development)
// ============================================

import { IEmailProvider, EmailPayload, EmailResponse } from '../types';

/**
 * Mock email provider for development testing
 * Logs emails to console instead of sending
 */
export class MockProvider implements IEmailProvider {
  /**
   * Sends an email by logging to console
   * @param payload - Email payload
   * @returns Success response with mock message ID
   */
  async send(payload: EmailPayload): Promise<EmailResponse> {
    const recipients = Array.isArray(payload.to)
      ? payload.to.join(', ')
      : payload.to;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 [MOCK EMAIL]');
    console.log(
      `   From: ${process.env.SMTP_FROM_NAME || '푸르니'} <${process.env.SMTP_FROM || 'noreply@puruni.com'}>`
    );
    console.log(`   To: ${recipients}`);
    console.log(`   Subject: ${payload.subject}`);
    console.log('   ─────────────────────────────────────');
    if (payload.text) {
      console.log(payload.text);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }
}
