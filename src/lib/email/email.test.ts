import { describe, it, expect } from 'vitest';
import { EmailService, emailService } from '@/lib/email/email';

describe('EmailService', () => {
  describe('sendVerificationEmail', () => {
    it('should create verification email with correct parameters', async () => {
      const service = new EmailService();

      const result = await service.sendVerificationEmail(
        'test@example.com',
        '123456',
        10
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should use default expiry time of 10 minutes', async () => {
      const service = new EmailService();

      const result = await service.sendVerificationEmail(
        'test@example.com',
        '654321'
      );

      expect(result.success).toBe(true);
    });
  });

  describe('send', () => {
    it('should send generic email', async () => {
      const service = new EmailService();

      const result = await service.send({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test body',
        html: '<html><body>Test body</body></html>',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('emailService singleton', () => {
    it('should be an instance of EmailService', () => {
      expect(emailService).toBeInstanceOf(EmailService);
    });
  });
});
