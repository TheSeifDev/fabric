'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Trash2
  // Removed MoreHorizontal
} from 'lucide-react';
import { Roll, CURRENT_USER_ROLE } from './types';

// Mock Data (temporary - will be replaced with IPC calls)
const initialRolls: Roll[] = [
  {
    id: '1',
    barcode: '10002345',
    catalogId: 'cat-1',
    color: 'Royal Blue',
    degree: 'A',
    lengthMeters: 45.5,
    status: 'in_stock',
    location: 'A1',
    createdAt: Date.parse('2024-01-10'),
    createdBy: 'admin-1',
    updatedAt: Date.parse('2024-01-10'),
    updatedBy: 'admin-1',
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: '2',
    barcode: '10002346',
    catalogId: 'cat-2',
    color: 'Crimson',
    degree: 'B',
    lengthMeters: 120.0,
    status: 'reserved',
    location: 'B3',
    createdAt: Date.parse('2024-01-12'),
    createdBy: 'admin-1',
    updatedAt: Date.parse('2024-01-12'),
    updatedBy: 'admin-1',
    deletedAt: null,
    deletedBy: null,
  },
  {
    id: '3',
    barcode: '10002347',
    catalogId: 'cat-1',
    color: 'Black',
    degree: 'A',
    lengthMeters: 30.0,
    status: 'sold',
    location: null,
    createdAt: Date.parse('2024-01-15'),
    createdBy: 'admin-1',
    updatedAt: Date.parse('2024-01-15'),
    updatedBy: 'admin-1',
    deletedAt: null,
    deletedBy: null,
  },
];

// Interface for the Filter Component
interface SelectFilterProps {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

const RollsPage = () => {
  // Removed setRolls to fix "assigned but never used"
  const [rolls] = useState<Roll[]>(initialRolls);
  const [search, setSearch] = useState('');

  // Filters State
  const [filters, setFilters] = useState({
    catalog: '',
    color: '',
    degree: ''
  });

  // Filter Logic
  const filteredRolls = rolls.filter(roll => {
    const matchesSearch = roll.barcode.toLowerCase().includes(search.toLowerCase()) ||
      roll.catalogId.toLowerCase().includes(search.toLowerCase()) ||
      roll.color.toLowerCase().includes(search.toLowerCase());
    const matchesCatalog = filters.catalog ? roll.catalogId === filters.catalog : true;
    const matchesColor = filters.color ? roll.color === filters.color : true;
    const matchesDegree = filters.degree ? roll.degree === filters.degree : true;

    return matchesSearch && matchesCatalog && matchesColor && matchesDegree;
  });

  return (
    <div className="max-w-7xl mx-auto w-full pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rolls Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage stock, barcodes, and roll details.</p>
        </div>
        <Link href="/rolls/add">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm font-medium">
            <Plus size={18} />
            Add New Roll
          </button>
        </Link>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">

        {/* Search */}
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filters Wrapper */}
        <div className="flex gap-2 w-full md:w-2/3 overflow-x-auto pb-1 md:pb-0">
          <SelectFilter
            placeholder="Catalog"
            value={filters.catalog}
            onChange={(val: string) => setFilters({ ...filters, catalog: val })}
            options={['Velvet Soft', 'Silk Touch', 'Cotton']}
          />
          <SelectFilter
            placeholder="Color"
            value={filters.color}
            onChange={(val: string) => setFilters({ ...filters, color: val })}
            options={['Royal Blue', 'Crimson', 'Black']}
          />
          <SelectFilter
            placeholder="Degree"
            value={filters.degree}
            onChange={(val: string) => setFilters({ ...filters, degree: val })}
            options={['A', 'B', 'C']}
          />

          {(filters.catalog || filters.color || filters.degree) && (
            <button
              onClick={() => setFilters({ catalog: '', color: '', degree: '' })}
              className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Barcode</th>
                <th className="px-6 py-4">Catalog</th>
                <th className="px-6 py-4">Color</th>
                <th className="px-6 py-4">Degree</th>
                <th className="px-6 py-4">Length (m)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRolls.length > 0 ? (
                filteredRolls.map((roll) => (
                  <tr key={roll.barcode} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono font-medium text-gray-900">{roll.barcode}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{roll.catalogId}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-900 border border-gray-200"></span>
                        {roll.color}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Degree {roll.degree}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{roll.lengthMeters}m</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={roll.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/rolls/${roll.barcode}`}>
                          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye size={18} />
                          </button>
                        </Link>
                        {['admin', 'storekeeper'].includes(CURRENT_USER_ROLE) && (
                          <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                            <Edit3 size={18} />
                          </button>
                        )}
                        {CURRENT_USER_ROLE === 'admin' && (
                          <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No rolls found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Fixed: Defined props interface instead of 'any'
const SelectFilter = ({ placeholder, value, onChange, options }: SelectFilterProps) => (
  // Fixed: Updated min-w-[140px] to min-w-35
  <div className="relative min-w-35">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
  </div>
);

const StatusBadge = ({ status }: { status: Roll['status'] }) => {
  const styles: Record<Roll['status'], string> = {
    'in_stock': 'bg-green-100 text-green-700 border-green-200',
    'sold': 'bg-gray-100 text-gray-600 border-gray-200',
    'reserved': 'bg-orange-100 text-orange-700 border-orange-200',
  };

  const labels: Record<Roll['status'], string> = {
    'in_stock': 'In Stock',
    'sold': 'Sold',
    'reserved': 'Reserved',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default RollsPage;