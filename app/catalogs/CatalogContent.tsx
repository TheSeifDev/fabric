'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Plus,
  MoreHorizontal,
  BookOpen,
  Layers,
  Filter,
  Eye,
  Edit,
  Trash2,
  LucideIcon
} from 'lucide-react';
import { Catalog } from './types';

// Mock Data
const initialCatalogs: Catalog[] = [
  { id: '1', name: 'Velvet Royal', code: 'CAT-2024-V', material: 'Velvet', rollsCount: 145, status: 'Active', createdAt: '2024-01-15' },
  { id: '2', name: 'Silk Road', code: 'CAT-2024-S', material: 'Silk', rollsCount: 89, status: 'Active', createdAt: '2024-02-10' },
  { id: '3', name: 'Cotton Basic', code: 'CAT-2023-C', material: 'Cotton', rollsCount: 320, status: 'Archived', createdAt: '2023-11-05' },
];

const CatalogContent = () => {
  const [catalogs, setCatalogs] = useState<Catalog[]>(initialCatalogs);
  const [searchTerm, setSearchTerm] = useState('');

  // State to track which dropdown is currently open
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Toggle Menu Handler
  const toggleMenu = (id: string) => {
    if (activeMenuId === id) {
      setActiveMenuId(null); // Close if clicking same
    } else {
      setActiveMenuId(id); // Open new
    }
  };

  // Delete Handler
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this catalog?')) {
      setCatalogs(prev => prev.filter(c => c.id !== id));
      setActiveMenuId(null);
    }
  };

  const filteredCatalogs = catalogs.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto w-full pb-10 min-h-screen" onClick={() => setActiveMenuId(null)}>

      {/* --- Page Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            Catalog Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Organize your fabric collections, materials, and patterns.
          </p>
        </div>

        <Link href="/catalogs/add">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm font-medium">
            <Plus size={18} />
            New Catalog
          </button>
        </Link>
      </div>

      {/* --- Stats Overview --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Catalogs" value={catalogs.length} icon={BookOpen} color="blue" />
        <StatCard label="Active Collections" value={catalogs.filter(c => c.status === 'Active').length} icon={Layers} color="green" />
        <StatCard label="Total Rolls Linked" value="554" icon={Layers} color="purple" />
      </div>

      {/* --- Controls --- */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Catalog Name or Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-visible">
        <div className="overflow-visible">
          {/* Note: changed overflow-x-auto to overflow-visible so dropdowns aren't clipped if table is small, 
              but usually for responsive tables you want auto. For dropdowns inside tables, 
              Portal or relative positioning is key. Here we use relative. */}

          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Catalog Details</th>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4">Inventory</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCatalogs.map((catalog) => (
                <tr key={catalog.id} className="hover:bg-gray-50/50 transition-colors">

                  {/* Name & Code */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs shrink-0">
                        {catalog.code.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{catalog.name}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{catalog.code}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md font-medium">
                      {catalog.material}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{catalog.rollsCount} Rolls</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={catalog.status} />
                  </td>

                  {/* --- WORKING ACTIONS COLUMN --- */}
                  <td className="px-6 py-4 text-right relative">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent closing immediately
                          toggleMenu(catalog.id);
                        }}
                        className={`p-2 rounded-lg transition-colors ${activeMenuId === catalog.id ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === catalog.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                          <div className="py-1">
                            <Link href={`/catalogs/${catalog.id}`} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                              <Eye size={16} />
                              View Details
                            </Link>
                            <Link href={`/catalogs/${catalog.id}/edit`} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors text-left">
                              <Edit size={16} />
                              Edit Catalog
                            </Link>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button
                              onClick={() => handleDelete(catalog.id)}
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

// --- Sub-Components ---

const StatusBadge = ({ status }: { status: Catalog['status'] }) => {
  const styles = {
    'Active': 'bg-green-100 text-green-700 ring-green-600/20',
    'Archived': 'bg-gray-100 text-gray-600 ring-gray-600/20',
    'Draft': 'bg-orange-100 text-orange-700 ring-orange-600/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple';
}

const StatCard = ({ label, value, icon: Icon, color }: StatCardProps) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default CatalogContent;