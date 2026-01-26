// src/app/DashboardWrapper.tsx
'use client';

import React, { useState } from 'react';
import Navbar from './(components)/Navbar';
import Sidebar from './(components)/Sidebar';

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">

      <Sidebar
        open={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      <main
        className={`flex flex-col flex-1 h-full overflow-y-auto transition-all duration-300`}
      >
        <div className="px-9 py-7 w-full min-h-full">
          <Navbar toggleSidebar={() => setSidebarOpen(prev => !prev)} />
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardWrapper;