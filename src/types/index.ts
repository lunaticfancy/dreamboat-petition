// ============================================
// Type Definitions for Anonymous Petition System
// ============================================

// ============================================
// Enums
// ============================================

export type UserRole = 'PARENT' | 'TEACHER' | 'DIRECTOR' | 'ADMIN';

export type PetitionStatus =
  | 'OPEN'
  | 'PENDING_ANSWER'
  | 'ANSWERED'
  | 'MERGED'
  | 'CLOSED';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'ACTIONED' | 'DISMISSED';

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isVerified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ============================================
// Petition Types
// ============================================

export interface Petition {
  id: string;
  title: string;
  content: string;
  status: PetitionStatus;
  anonymousId: string;
  agreedCount: number;
  mergedToId?: string;
  createdAt: Date;
  updatedAt: Date;
  answeredAt?: Date;
  closedAt?: Date;
  mergedAt?: Date;
}

export interface CreatePetitionInput {
  title: string;
  content: string;
}

export interface PetitionWithDetails extends Petition {
  agreements: Agreement[];
  comments: Comment[];
  answers: Answer[];
  files: FileUpload[];
  _count?: {
    agreements: number;
    comments: number;
  };
}

// ============================================
// Agreement Types
// ============================================

export interface Agreement {
  id: string;
  userId: string;
  petitionId: string;
  anonymousKey: string;
  createdAt: Date;
}

export interface CreateAgreementInput {
  petitionId: string;
}

// ============================================
// Comment Types
// ============================================

export interface Comment {
  id: string;
  content: string;
  userId: string;
  petitionId: string;
  parentId?: string;
  isStaff: boolean;
  staffRole?: 'TEACHER' | 'DIRECTOR';
  anonymousId?: string;
  isHidden?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentInput {
  content: string;
  petitionId: string;
  parentId?: string;
}

// ============================================
// Answer Types
// ============================================

export interface Answer {
  id: string;
  content: string;
  authorId: string;
  petitionId: string;
  createdAt: Date;
  updatedAt: Date;
  editHistory?: AnswerEditHistory[];
}

export interface CreateAnswerInput {
  content: string;
  petitionId: string;
}

export interface AnswerEditHistory {
  id: string;
  answerId: string;
  previousContent: string;
  editedAt: Date;
}

// ============================================
// Report Types
// ============================================

export interface Report {
  id: string;
  petitionId?: string;
  commentId?: string;
  reporterId: string;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
  processedAt?: Date;
}

export interface CreateReportInput {
  petitionId?: string;
  commentId?: string;
  reason: string;
}

// ============================================
// Verification Code Types
// ============================================

export interface VerificationCode {
  id: string;
  code: string;
  userId: string;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
  createdAt: Date;
}

export interface CreateVerificationCodeInput {
  userId: string;
  code: string;
  expiresAt: Date;
}

// ============================================
// Setting Types
// ============================================

export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedById?: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface UpdateSettingInput {
  key: string;
  value: string;
}

// ============================================
// File Upload Types
// ============================================

export interface FileUpload {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  petitionId: string;
  uploadedAt: Date;
}

export interface CreateFileUploadInput {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  petitionId: string;
}

// ============================================
// Push Subscription Types
// ============================================

export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface CreatePushSubscriptionInput {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  expiresAt?: Date;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// Form Input Types
// ============================================

export interface SignUpInput {
  email: string;
  password: string;
  name?: string;
}

export interface VerifyCodeInput {
  email: string;
  code: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// ============================================
// Filter Types
// ============================================

export interface PetitionFilter {
  status?: PetitionStatus;
  search?: string;
  sortBy?: 'createdAt' | 'agreedCount';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// ============================================
// Context Types
// ============================================

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isVerified: boolean;
}
