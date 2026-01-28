export interface Catalog {
  id: string;
  name: string;
  code: string;
  material: string;
  rollsCount: number;
  status: 'Active' | 'Archived' | 'Draft';
  createdAt: string;
  image?: string; // Optional cover image for the catalog
}