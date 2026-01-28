export interface Roll {
  barcode: string;
  catalog: string;
  color: string;
  degree: string;
  length: number;
  status: 'In Stock' | 'Sold' | 'Reserved';
  createdAt: string;
}


export type UserRole = 'admin' | 'editor' | 'viewer';
export const CURRENT_USER_ROLE: UserRole = 'admin';