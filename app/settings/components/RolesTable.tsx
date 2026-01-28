'use client';

import React from 'react';
// Removed 'MoreVertical' and 'Users' to fix the lint warning
import { Edit3, Trash2, Shield } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  usersCount: number;
  description: string;
  createdAt: string;
  color: string;
}

const rolesData: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    usersCount: 2,
    description: 'Full access to all system resources.',
    createdAt: 'Jan 12, 2024',
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: '2',
    name: 'Manager',
    usersCount: 8,
    description: 'Can manage production and view reports.',
    createdAt: 'Feb 05, 2024',
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: '3',
    name: 'Operator',
    usersCount: 24,
    description: 'Limited access to daily tasks.',
    createdAt: 'Mar 20, 2024',
    color: 'bg-green-100 text-green-700'
  },
  {
    id: '4',
    name: 'Viewer',
    usersCount: 5,
    description: 'Read-only access to dashboards.',
    createdAt: 'Apr 10, 2024',
    color: 'bg-gray-100 text-gray-600'
  },
];

export const RolesTable = () => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Role Name</th>
              <th className="px-6 py-4">Users Assigned</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rolesData.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50/50 transition-colors group">
                {/* Role Name & Description */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${role.color}`}>
                      <Shield size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{role.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{role.description}</p>
                    </div>
                  </div>
                </td>

                {/* Users Count */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2 overflow-hidden">
                      {/* Fake avatars for visual appeal */}
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-200" />
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-300" />
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                      {role.usersCount} users
                    </span>
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{role.createdAt}</span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Role">
                      <Edit3 size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Role">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination / Footer */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30 flex justify-between items-center text-xs text-gray-500">
        <span>Showing 4 of 4 roles</span>
        <div className="flex gap-2">
          <button className="hover:text-gray-900 disabled:opacity-50" disabled>Previous</button>
          <button className="hover:text-gray-900 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
};