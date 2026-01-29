// Import types from centralized location
import type { UUID, Timestamp, AuditFields } from '@/lib/electron-api.d';

export type RollStatus = 'in_stock' | 'reserved' | 'sold';
export type RollDegree = 'A' | 'B' | 'C';

export interface Roll {
  id: UUID;
  barcode: string;
  catalogId: UUID; // Foreign key to Catalog
  color: string;
  degree: RollDegree;
  lengthMeters: number;
  status: RollStatus;
  location: string | null;

  // Audit fields
  createdAt: Timestamp;
  createdBy: UUID;
  updatedAt: Timestamp;
  updatedBy: UUID;
  deletedAt: Timestamp | null;
  deletedBy: UUID | null;
}

// Standardized roles (matches lib/permissions.ts)
export type UserRole = 'admin' | 'storekeeper' | 'viewer';
export const CURRENT_USER_ROLE: UserRole = 'admin';