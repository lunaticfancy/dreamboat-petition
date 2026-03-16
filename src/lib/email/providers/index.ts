// ============================================
// Email Provider Factory
// ============================================

import { IEmailProvider, EmailProviderType } from '../types';
import { NodemailerProvider } from './nodemailer';
import { SendGridProvider } from './sendgrid';
import { MockProvider } from './mock';

/**
 * Gets the configured email provider type
 * Priority: EMAIL_PROVIDER env > SENDGRID_API_KEY > SMTP_HOST > mock (dev)
 */
export function getEmailProviderType(): EmailProviderType {
  const provider =
    process.env.EMAIL_PROVIDER?.toLowerCase() as EmailProviderType;

  // Explicit provider setting
  if (provider === 'sendgrid') return 'sendgrid';
  if (provider === 'smtp') return 'smtp';
  if (provider === 'mock') return 'mock';

  // Auto-detect based on available credentials
  if (process.env.SENDGRID_API_KEY) return 'sendgrid';
  if (process.env.SMTP_HOST) return 'smtp';

  // Default to mock in development
  if (process.env.NODE_ENV !== 'production') return 'mock';

  // Default to SMTP in production (requires configuration)
  return 'smtp';
}

/**
 * Creates an email provider instance based on configuration
 */
export function createEmailProvider(): IEmailProvider {
  const providerType = getEmailProviderType();

  switch (providerType) {
    case 'sendgrid':
      return new SendGridProvider();
    case 'mock':
      return new MockProvider();
    case 'smtp':
    default:
      return new NodemailerProvider();
  }
}
