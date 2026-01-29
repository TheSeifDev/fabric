import type { UUID, Timestamp } from '@/lib/electron-api.d';

export type CatalogStatus = 'active' | 'archived' | 'draft';

export interface Catalog {
  id: UUID;
  code: string;
  name: string;
  material: string;
  description: string;
  status: CatalogStatus;
  image?: string; // Optional cover image for the catalog

  // Audit fields
  createdAt: Timestamp;
  createdBy: UUID;
  updatedAt: Timestamp;
  updatedBy: UUID;
  deletedAt: Timestamp | null;
  deletedBy: UUID | null;
}