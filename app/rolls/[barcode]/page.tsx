'use client';

import React from 'react';
import { ArrowLeft, Printer, Edit3, History, Package, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const RollDetailsPage = () => {
  const params = useParams();
  const { barcode } = params; // Get dynamic barcode from URL

  // Mock Fetching Data based on barcode
  const rollData = {
    barcode: barcode,
    catalog: 'Velvet Soft',
    color: 'Royal Blue',
    degree: 'A',
    length: 45.5,
    status: 'In Stock',
    createdAt: 'Jan 10, 2024 - 10:30 AM',
    createdBy: 'John Doe',
    location: 'Warehouse A - Rack 4',
  };

  return (
    <div className="max-w-5xl mx-auto w-full pb-10">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/rolls" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Roll #{rollData.barcode}
              <span className="px-2.5 py-0.5 rounded-full text-sm bg-green-100 text-green-700 border border-green-200 font-medium">
                {rollData.status}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
            <Printer size={16} />
            Print Label
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium">
            <Edit3 size={16} />
            Edit Details
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Package size={18} className="text-blue-600" />
                Product Information
              </h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-8">
              <InfoItem label="Catalog" value={rollData.catalog} />
              <InfoItem label="Color" value={rollData.color} />
              <InfoItem label="Degree" value={`Grade ${rollData.degree}`} />
              <InfoItem label="Current Length" value={`${rollData.length} meters`} />
              <InfoItem label="Location" value={rollData.location} />
              <InfoItem label="Created By" value={rollData.createdBy} />
            </div>
          </div>

          {/* History Placeholder */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 opacity-60">
             <div className="flex items-center gap-2 mb-4">
                <History className="text-gray-400" size={20} />
                <h3 className="font-semibold text-gray-800">History Log</h3>
             </div>
             <p className="text-sm text-gray-500">History timeline (Movements, Cuts, Returns) will be implemented here.</p>
          </div>
        </div>

        {/* Right Column: Quick Stats / Meta */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Metadata</h3>
            <div className="space-y-4">
               <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created At</p>
                    <p className="text-sm font-medium text-gray-900">{rollData.createdAt}</p>
                  </div>
               </div>
               {/* Barcode Display */}
               <div className="pt-4 mt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Barcode Preview</p>
                  <div className="h-16 bg-gray-100 rounded-lg flex items-center justify-center font-mono text-gray-400 tracking-widest border border-dashed border-gray-300">
                    ||| || ||| ||
                  </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper Component for Details
const InfoItem = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
    <p className="text-base font-medium text-gray-900 mt-1">{value}</p>
  </div>
);

export default RollDetailsPage;