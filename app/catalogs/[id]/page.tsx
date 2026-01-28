import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Layers,
  Calendar,
  Box,
  CheckCircle2,
  Printer,
  LucideIcon
} from 'lucide-react';

// --- Dynamic SEO ---
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // In a real app, fetch catalog name by ID here
  const id = params.id;
  return {
    title: `Catalog #${id} Details | Fabric System`,
    description: `View detailed inventory for catalog ${id}`,
  };
}

// --- Page Component ---
const CatalogDetailsPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;

  // Mock Data (Replace with real DB fetch)
  const catalogData = {
    id: id,
    name: 'Velvet Royal',
    code: 'CAT-2024-V',
    material: 'Velvet',
    description: 'Premium royal velvet collection for luxury upholstery.',
    rollsCount: 145,
    status: 'Active',
    createdAt: 'Jan 15, 2024',
    lastUpdated: '2 days ago',
  };

  return (
    <div className="max-w-5xl mx-auto w-full pb-10">

      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/catalogs" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {catalogData.name}
              <span className="px-2.5 py-0.5 rounded-full text-sm bg-green-100 text-green-700 border border-green-200 font-medium">
                {catalogData.status}
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-0.5 font-mono">{catalogData.code}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
            <Printer size={16} />
            Print Report
          </button>
          <Link href={`/catalogs/${id}/edit`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium">
              <Edit size={16} />
              Edit Catalog
            </button>
          </Link>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">

          {/* General Info Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-gray-800">General Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="Material Type" value={catalogData.material} icon={Box} />
              <DetailItem label="Total Rolls" value={catalogData.rollsCount} icon={Layers} />
              <div className="md:col-span-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{catalogData.description}</p>
              </div>
            </div>
          </div>

          {/* Linked Rolls Preview (Table Placeholder) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Recent Rolls in Collection</h3>
              <Link href={`/rolls?catalog=${catalogData.name}`} className="text-sm text-blue-600 hover:underline">
                View All
              </Link>
            </div>
            {/* Simple Table List */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center font-mono text-xs">
                      R{i}
                    </div>
                    <span className="text-sm font-medium text-gray-700">Roll #1000234{i}</span>
                  </div>
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">In Stock</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Meta Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">System Metadata</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="text-sm font-medium text-gray-900">{catalogData.createdAt}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">{catalogData.lastUpdated}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Define the interface
interface DetailItemProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
}

// Apply the interface
const DetailItem = ({ label, value, icon: Icon }: DetailItemProps) => (
  <div>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className="text-gray-400" />
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
    <p className="text-base font-semibold text-gray-900">{value}</p>
  </div>
);

export default CatalogDetailsPage;