import type { UUID, Timestamp } from '@/lib/electron-api.d';

// Standardized roles (lowercase)
export type UserRole = 'admin' | 'storekeeper' | 'viewer';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: UUID;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Timestamp;
  avatar?: string; // URL to image (optional)

  // Audit fields
  createdAt: Timestamp;
  createdBy: UUID;
  updatedAt: Timestamp;
  updatedBy: UUID;
  deletedAt: Timestamp | null;
  deletedBy: UUID | null;
}