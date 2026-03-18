import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { mockFindMany, mockGetServerSession } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockGetServerSession: vi.fn().mockReturnValue(Promise.resolve(null)),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    comment = {
      findMany: mockFindMany,
    };
  },
}));

vi.mock('@prisma/adapter-libsql', () => ({
  PrismaLibSql: class {
    constructor() {}
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

import { GET } from '../route';

describe('GET /api/petitions/[id]/comments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  const createMockRequest = () => {
    return {
      headers: new Headers(),
    } as Request;
  };

  const createMockParams = (id: string) => {
    return { params: Promise.resolve({ id }) };
  };

  describe('Response fields', () => {
    it('should contain anonymousId field (masked IP) for parent comment', async () => {
      mockGetServerSession.mockResolvedValue(null);

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Parent comment',
          userId: 'user-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '192.168.1.100',
          user: { name: 'John', role: 'PARENT' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments[0]).toHaveProperty('anonymousId');
      expect(data.comments[0].anonymousId).toBe('192.168.***.100');
    });

    it('should contain isStaff field (true/false)', async () => {
      mockGetServerSession.mockResolvedValue(null);

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Admin comment',
          userId: 'admin-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '10.0.0.1',
          user: { name: 'Admin User', role: 'ADMIN' },
        },
        {
          id: '2',
          content: 'Parent comment',
          userId: 'parent-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '192.168.1.50',
          user: { name: 'Parent User', role: 'PARENT' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments).toHaveLength(2);
      expect(data.comments[0]).toHaveProperty('isStaff');
      expect(data.comments[1]).toHaveProperty('isStaff');
    });

    it('should contain staffRole field (ADMIN/DIRECTOR/TEACHER/null)', async () => {
      mockGetServerSession.mockResolvedValue(null);

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Admin comment',
          userId: 'admin-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '10.0.0.1',
          user: { name: 'Admin User', role: 'ADMIN' },
        },
        {
          id: '2',
          content: 'Parent comment',
          userId: 'parent-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '192.168.1.50',
          user: { name: 'Parent User', role: 'PARENT' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments[0]).toHaveProperty('staffRole');
      expect(data.comments[1]).toHaveProperty('staffRole');
    });
  });

  describe('IPv4 IP masking', () => {
    it('should mask IPv4 IP address correctly in response', async () => {
      mockGetServerSession.mockResolvedValue(null);

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Comment with IPv4',
          userId: 'user-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '192.168.100.50',
          user: { name: 'User', role: 'PARENT' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments[0].anonymousId).toBe('192.168.***.50');
    });

    it('should return 익명 for unknown IP', async () => {
      mockGetServerSession.mockResolvedValue(null);

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Comment with unknown IP',
          userId: 'user-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: 'unknown',
          user: { name: 'User', role: 'PARENT' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments[0].anonymousId).toBe('익명');
    });
  });

  describe('IPv6 IP masking', () => {
    it('should mask IPv6 IP address correctly in response', async () => {
      mockGetServerSession.mockResolvedValue(null);

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Comment with IPv6',
          userId: 'user-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '2001:0db8:85a3:0001:0000:0000:0000:0001',
          user: { name: 'User', role: 'PARENT' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments[0].anonymousId).toBe('2001:0db8:***:0001');
    });

    it('should return localhost for IPv6 localhost', async () => {
      mockGetServerSession.mockResolvedValue(null);

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Comment with IPv6 localhost',
          userId: 'user-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '::1',
          user: { name: 'User', role: 'PARENT' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments[0].anonymousId).toBe('localhost');
    });

    it('should mask short IPv6 address correctly', async () => {
      mockGetServerSession.mockResolvedValue(null);

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Comment with short IPv6',
          userId: 'user-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '2001:0db8:85a3:0001',
          user: { name: 'User', role: 'PARENT' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments[0].anonymousId).toBe('2001:0db8:***:0001');
    });
  });

  describe('User role-based response', () => {
    it('should return isStaff=true, staffRole=ADMIN, user.name="관리자" for admin comment', async () => {
      mockGetServerSession.mockResolvedValue(null);

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Admin comment',
          userId: 'admin-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '10.0.0.1',
          user: { name: '관리자', role: 'ADMIN' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments[0].isStaff).toBe(true);
      expect(data.comments[0].staffRole).toBe('ADMIN');
      expect(data.comments[0].user.name).toBe('관리자');
    });

    it('should return isStaff=true, staffRole=DIRECTOR, user.name displayed for director comment', async () => {
      mockGetServerSession.mockResolvedValue(null);

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Director comment',
          userId: 'director-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '10.0.0.2',
          user: { name: 'Director Kim', role: 'DIRECTOR' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments[0].isStaff).toBe(true);
      expect(data.comments[0].staffRole).toBe('DIRECTOR');
      expect(data.comments[0].user.name).toBe('Director Kim');
    });

    it('should return isStaff=true, staffRole=TEACHER for teacher comment', async () => {
      mockGetServerSession.mockResolvedValue(null);

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Teacher comment',
          userId: 'teacher-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '10.0.0.3',
          user: { name: 'Teacher Lee', role: 'TEACHER' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments[0].isStaff).toBe(true);
      expect(data.comments[0].staffRole).toBe('TEACHER');
    });

    it('should return isStaff=false, staffRole=null, anonymousId=masked IP for parent comment', async () => {
      mockGetServerSession.mockResolvedValue(null);

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Parent comment',
          userId: 'parent-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '192.168.1.100',
          user: { name: 'Parent User', role: 'PARENT' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments[0].isStaff).toBe(false);
      expect(data.comments[0].staffRole).toBe(null);
      expect(data.comments[0].anonymousId).toBe('192.168.***.100');
    });
  });

  describe('Staff session access', () => {
    it('should include hidden comments when user is staff', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'staff-1', role: 'ADMIN' },
      });

      mockFindMany.mockResolvedValue([
        {
          id: '1',
          content: 'Hidden comment',
          userId: 'user-1',
          petitionId: 'petition-1',
          parentId: null,
          isHidden: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: '10.0.0.1',
          user: { name: 'User', role: 'PARENT' },
        },
      ]);

      const req = createMockRequest();
      const params = createMockParams('petition-1');

      const response = await GET(req, params);
      const data = await response.json();

      expect(data.comments).toHaveLength(1);
      expect(mockFindMany).toHaveBeenCalled();
    });
  });
});
