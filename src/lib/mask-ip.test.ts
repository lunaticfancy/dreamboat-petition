import { describe, it, expect } from 'vitest';

// Copy of maskIpAddress function from src/app/api/petitions/[id]/comments/route.ts
const maskIpAddress = (ip: string | null): string => {
  if (!ip || ip === 'unknown') return '익명';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.${parts[3]}`;
  }
  if (ip.includes(':')) {
    const ipv6Parts = ip.split(':').filter(Boolean);
    if (ipv6Parts.length >= 4) {
      return `${ipv6Parts[0]}:${ipv6Parts[1]}:***:${ipv6Parts[ipv6Parts.length - 1]}`;
    }
    if (ipv6Parts.length >= 2) {
      return `${ipv6Parts[0]}:***:${ipv6Parts[ipv6Parts.length - 1]}`;
    }
    if (ip === '::1') return 'localhost';
    if (ip === '::') return 'IPv6';
  }
  return '익명';
};

describe('maskIpAddress', () => {
  describe('IPv4', () => {
    it('should mask IPv4 address correctly', () => {
      expect(maskIpAddress('192.168.1.100')).toBe('192.168.***.100');
    });

    it('should mask IPv4 localhost address correctly', () => {
      expect(maskIpAddress('127.0.0.1')).toBe('127.0.***.1');
    });
  });

  describe('IPv6', () => {
    it('should return localhost for IPv6 localhost', () => {
      expect(maskIpAddress('::1')).toBe('localhost');
    });

    it('should mask short IPv6 address correctly', () => {
      expect(maskIpAddress('2001:0db8:85a3:0001')).toBe('2001:0db8:***:0001');
    });

    it('should mask long IPv6 address correctly', () => {
      expect(maskIpAddress('2001:0db8:85a3:0001:0000:0000:0000:0001')).toBe(
        '2001:0db8:***:0001'
      );
    });
  });

  describe('edge cases', () => {
    it('should return 익명 for null', () => {
      expect(maskIpAddress(null)).toBe('익명');
    });

    it('should return 익명 for unknown', () => {
      expect(maskIpAddress('unknown')).toBe('익명');
    });

    it('should return 익명 for empty string', () => {
      expect(maskIpAddress('')).toBe('익명');
    });

    it('should return 익ن for invalid IP', () => {
      expect(maskIpAddress('invalid')).toBe('익명');
    });
  });
});
