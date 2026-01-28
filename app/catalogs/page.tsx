import React from 'react';
import { Metadata } from 'next';
import CatalogContent from './CatalogContent';

export const metadata: Metadata = {
  title: 'Catalogs | Fabric Inventory System',
  description: 'Manage fabric catalogs, collections, and material specifications efficiently.',
  openGraph: {
    title: 'Catalogs Management',
    description: 'Centralized fabric catalog system.',
    type: 'website',
  },
};

const CatalogsPage = () => {
  return (
    <main className="w-full">
      <CatalogContent />
    </main>
  );
};

export default CatalogsPage;