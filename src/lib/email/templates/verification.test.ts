import { describe, it, expect } from 'vitest';
import { createVerificationEmail } from '@/lib/email/templates/verification';

describe('Verification Email Template', () => {
  it('should create verification email with correct structure', () => {
    const data = { code: '123456', expiryMinutes: 10 };
    const result = createVerificationEmail(data);

    expect(result).toHaveProperty('subject');
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('html');
  });

  it('should include verification code in all formats', () => {
    const data = { code: '654321', expiryMinutes: 5 };
    const result = createVerificationEmail(data);

    expect(result.subject).toContain('인증 코드');
    expect(result.text).toContain('654321');
    expect(result.html).toContain('654321');
  });

  it('should include expiry time in all formats', () => {
    const data = { code: '111111', expiryMinutes: 15 };
    const result = createVerificationEmail(data);

    expect(result.text).toContain('15분');
    expect(result.html).toContain('15분');
  });

  it('should use sender name from env or default', () => {
    const data = { code: '222222', expiryMinutes: 10 };
    const result = createVerificationEmail(data);

    expect(result.html).toContain('푸르니');
    expect(result.text).toContain('푸르니');
  });

  it('should format HTML with proper structure', () => {
    const data = { code: '333333', expiryMinutes: 10 };
    const result = createVerificationEmail(data);

    expect(result.html).toContain('<!DOCTYPE html>');
    expect(result.html).toContain('<html');
    expect(result.html).toContain('<body');
    expect(result.html).toContain('</body>');
    expect(result.html).toContain('</html>');
  });

  it('should include warning about unauthorized requests', () => {
    const data = { code: '444444', expiryMinutes: 10 };
    const result = createVerificationEmail(data);

    expect(result.text).toContain('본인이 요청하지 않으셨다면');
    expect(result.html).toContain('본인이 요청하지 않으셨다면');
  });
});
