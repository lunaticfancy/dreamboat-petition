import { describe, it, expect } from 'vitest';
import type {
  EmailPayload,
  EmailResponse,
  EmailProviderType,
  IEmailProvider,
} from '@/lib/email/types';

describe('Email Types', () => {
  describe('EmailPayload', () => {
    it('should accept valid payload with all fields', () => {
      const payload: EmailPayload = {
        to: 'test@example.com',
        from: 'sender@example.com',
        subject: 'Test Subject',
        text: 'Plain text content',
        html: '<html><body>HTML content</body></html>',
      };

      expect(payload.to).toBe('test@example.com');
      expect(payload.subject).toBe('Test Subject');
    });

    it('should accept payload with only required fields', () => {
      const payload: EmailPayload = {
        to: 'test@example.com',
        subject: 'Test Subject',
      };

      expect(payload.to).toBe('test@example.com');
      expect(payload.subject).toBe('Test Subject');
    });

    it('should accept array of recipients', () => {
      const payload: EmailPayload = {
        to: ['test1@example.com', 'test2@example.com'],
        subject: 'Test Subject',
      };

      expect(Array.isArray(payload.to)).toBe(true);
    });
  });

  describe('EmailResponse', () => {
    it('should accept success response', () => {
      const response: EmailResponse = {
        success: true,
        messageId: 'msg-123',
      };

      expect(response.success).toBe(true);
      expect(response.messageId).toBe('msg-123');
    });

    it('should accept failure response', () => {
      const response: EmailResponse = {
        success: false,
        error: 'Connection failed',
      };

      expect(response.success).toBe(false);
      expect(response.error).toBe('Connection failed');
    });
  });

  describe('EmailProviderType', () => {
    it('should accept valid provider types', () => {
      const smtp: EmailProviderType = 'smtp';
      const sendgrid: EmailProviderType = 'sendgrid';
      const mock: EmailProviderType = 'mock';

      expect(smtp).toBe('smtp');
      expect(sendgrid).toBe('sendgrid');
      expect(mock).toBe('mock');
    });
  });
});
