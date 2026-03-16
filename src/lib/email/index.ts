// ============================================
// Email Service Exports
// ============================================

export { EmailService, emailService } from './email';
export type {
  EmailPayload,
  EmailResponse,
  EmailProviderType,
  IEmailProvider,
} from './types';
export { createVerificationEmail } from './templates/verification';
export { getEmailProviderType, createEmailProvider } from './providers';
