import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getEmailProviderType,
  createEmailProvider,
} from '@/lib/email/providers/index';
import { MockProvider } from '@/lib/email/providers/mock';
import { NodemailerProvider } from '@/lib/email/providers/nodemailer';
import { SendGridProvider } from '@/lib/email/providers/sendgrid';

describe('Email Provider Factory', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('getEmailProviderType', () => {
    it('should return "mock" when EMAIL_PROVIDER is set to "mock"', () => {
      vi.stubEnv('EMAIL_PROVIDER', 'mock');
      expect(getEmailProviderType()).toBe('mock');
      vi.unstubAllEnvs();
    });

    it('should return "sendgrid" when EMAIL_PROVIDER is set to "sendgrid"', () => {
      vi.stubEnv('EMAIL_PROVIDER', 'sendgrid');
      expect(getEmailProviderType()).toBe('sendgrid');
      vi.unstubAllEnvs();
    });

    it('should return "smtp" when EMAIL_PROVIDER is set to "smtp"', () => {
      vi.stubEnv('EMAIL_PROVIDER', 'smtp');
      expect(getEmailProviderType()).toBe('smtp');
      vi.unstubAllEnvs();
    });

    it('should return "sendgrid" when SENDGRID_API_KEY is set', () => {
      vi.stubEnv('SENDGRID_API_KEY', 'SG.test-key');
      expect(getEmailProviderType()).toBe('sendgrid');
      vi.unstubAllEnvs();
    });

    it('should return "smtp" when SMTP_HOST is set', () => {
      vi.stubEnv('SMTP_HOST', 'smtp.example.com');
      expect(getEmailProviderType()).toBe('smtp');
      vi.unstubAllEnvs();
    });

    it('should return "mock" in development environment', () => {
      vi.stubEnv('NODE_ENV', 'development');
      expect(getEmailProviderType()).toBe('mock');
      vi.unstubAllEnvs();
    });

    it('should return "smtp" in production without other config', () => {
      vi.stubEnv('NODE_ENV', 'production');
      expect(getEmailProviderType()).toBe('smtp');
      vi.unstubAllEnvs();
    });
  });

  describe('createEmailProvider', () => {
    it('should create MockProvider when provider type is "mock"', () => {
      vi.stubEnv('EMAIL_PROVIDER', 'mock');
      const provider = createEmailProvider();
      expect(provider).toBeInstanceOf(MockProvider);
      vi.unstubAllEnvs();
    });

    it('should create SendGridProvider when provider type is "sendgrid"', () => {
      vi.stubEnv('EMAIL_PROVIDER', 'sendgrid');
      vi.stubEnv('SENDGRID_API_KEY', 'SG.test-key');
      const provider = createEmailProvider();
      expect(provider).toBeInstanceOf(SendGridProvider);
      vi.unstubAllEnvs();
    });

    it('should create NodemailerProvider when provider type is "smtp"', () => {
      vi.stubEnv('EMAIL_PROVIDER', 'smtp');
      const provider = createEmailProvider();
      expect(provider).toBeInstanceOf(NodemailerProvider);
      vi.unstubAllEnvs();
    });
  });
});
