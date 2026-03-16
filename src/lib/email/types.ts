// ============================================
// Email Service Type Definitions
// ============================================

/**
 * Email payload for sending emails
 */
export interface EmailPayload {
  /** Recipient email address(es) */
  to: string | string[];
  /** Sender email address (optional, uses default from config) */
  from?: string;
  /** Email subject line */
  subject: string;
  /** Plain text body (optional) */
  text?: string;
  /** HTML body (optional) */
  html?: string;
}

/**
 * Response from email sending operation
 */
export interface EmailResponse {
  /** Whether the email was sent successfully */
  success: boolean;
  /** Message ID from the email provider (on success) */
  messageId?: string;
  /** Error message (on failure) */
  error?: string;
}

/**
 * Supported email provider types
 */
export type EmailProviderType = 'smtp' | 'sendgrid' | 'mock';

/**
 * Interface for email provider implementations
 */
export interface IEmailProvider {
  /**
   * Send an email
   * @param payload - Email payload
   * @returns Response indicating success/failure
   */
  send(payload: EmailPayload): Promise<EmailResponse>;
}
