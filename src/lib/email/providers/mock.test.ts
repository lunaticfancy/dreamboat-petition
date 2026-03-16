import { describe, it, expect } from 'vitest';
import { MockProvider } from '@/lib/email/providers/mock';

describe('MockProvider', () => {
  it('should send email successfully and return success response', async () => {
    const provider = new MockProvider();
    const result = await provider.send({
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test content',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toContain('mock-');
  });

  it('should handle multiple recipients', async () => {
    const provider = new MockProvider();
    const result = await provider.send({
      to: ['test1@example.com', 'test2@example.com'],
      subject: 'Test Subject',
      text: 'Test content',
    });

    expect(result.success).toBe(true);
  });

  it('should include HTML content if provided', async () => {
    const provider = new MockProvider();
    const result = await provider.send({
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<html><body>Test</body></html>',
    });

    expect(result.success).toBe(true);
  });

  it('should always return success (mock behavior)', async () => {
    const provider = new MockProvider();

    const result1 = await provider.send({
      to: '',
      subject: '',
    });

    expect(result1.success).toBe(true);
  });
});
