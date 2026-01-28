'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Shield,
  Mail,
  Edit3,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';
import { User, UserRole } from './types';

// Mock Data
const initialUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2 mins ago' },
  { id: '2', name: 'Sarah Smith', email: 'sarah@example.com', role: 'Editor', status: 'Active', lastLogin: '1 day ago' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '2 weeks ago' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', role: 'Editor', status: 'Active', lastLogin: '5 hours ago' },
];

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter Logic
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle Menu
  const toggleMenu = (id: string) => {
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // Handlers (Mock)
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setActiveMenuId(null);
    }
  };

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) return { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' };
      return u;
    }));
    setActiveMenuId(null);
  };

  return (
    <div className="max-w-7xl mx-auto w-full pb-10 min-h-screen" onClick={() => setActiveMenuId(null)}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage system access, roles, and user accounts.
          </p>
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm font-medium">
          <Plus size={18} />
          Invite User
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-visible">
        <div className="overflow-visible">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">

                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar Placeholder */}
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200 shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>

                  {/* Status Indicator */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={`text-sm font-medium ${user.status === 'Active' ? 'text-gray-700' : 'text-gray-400'}`}>
                        {user.status}
                      </span>
                    </div>
                  </td>

                  {/* Last Login */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.lastLogin}
                  </td>

                  {/* Actions Dropdown */}
                  <td className="px-6 py-4 text-right relative">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(user.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${activeMenuId === user.id ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {activeMenuId === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                          <div className="py-1">
                            <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors text-left">
                              <Edit3 size={16} />
                              Edit User
                            </button>
                            <button
                              onClick={() => toggleStatus(user.id)}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors text-left"
                            >
                              {user.status === 'Active' ? <UserX size={16} /> : <UserCheck size={16} />}
                              {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Role Badge ---
const RoleBadge = ({ role }: { role: UserRole }) => {
  const styles = {
    'Admin': 'bg-purple-50 text-purple-700 border-purple-200',
    'Editor': 'bg-blue-50 text-blue-700 border-blue-200',
    'Viewer': 'bg-gray-50 text-gray-600 border-gray-200',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-medium ${styles[role]}`}>
      <Shield size={12} />
      {role}
    </div>
  );
};

export default UsersPage;