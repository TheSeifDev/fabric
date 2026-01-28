
import React from 'react';
import { Metadata } from 'next';
import ProfileContent from './ProfileContent';

export const metadata: Metadata = {
  title: 'My Profile | Fabric Dashboard',
  description: 'Manage your personal information and account security settings.',
  robots: {
    index: false,
    follow: false,
  },
};

const Page = () => {
  return (
    <main className="w-full">
      <ProfileContent />
    </main>
  );
};

export default Page;