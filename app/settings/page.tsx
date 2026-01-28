'use client';

import React from 'react';
import { Plus, ShieldCheck } from 'lucide-react';
import { RolesTable } from './components/RolesTable';

const SettingsPage = () => {
  return (
    <div className="max-w-6xl mx-auto w-full pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" />
            Role Management
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage user roles, access permissions, and system security.
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm font-medium">
          <Plus size={18} />
          Create New Role
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* You can add tabs here later if needed (e.g., General | Roles | Security) */}
        
        <RolesTable />

        {/* Helper Note */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
            <div className="p-1 bg-blue-100 rounded-full text-blue-600 shrink-0">
                <ShieldCheck size={16} />
            </div>
            <div>
                <h4 className="text-sm font-semibold text-blue-800">About Roles</h4>
                <p className="text-xs text-blue-600/80 mt-1">
                    Roles define what actions users can perform in the system. 
                    Deleting a role will restrict access for all users currently assigned to it.
                </p>
            </div>
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;