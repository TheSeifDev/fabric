'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

const EditCatalogPage = () => {
  const router = useRouter();
  const params = useParams(); // Get ID from URL
  const [loading, setLoading] = useState(false);

  // Mock State - In real app, fetch data in useEffect based on params.id
  const [formData, setFormData] = useState({
    name: 'Velvet Royal',
    code: 'CAT-2024-V',
    material: 'Velvet',
    status: 'active', // Changed from 'Active'
    description: 'Premium royal velvet collection for luxury upholstery.',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Updating Catalog:', formData);

    // Simulate API delay
    setTimeout(() => {
      setLoading(false);
      router.push(`/catalogs/${params.id}`); // Redirect back to details
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto w-full pb-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/catalogs/${params.id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Edit Catalog</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Catalog Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Code */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Code</label>
              <input
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 cursor-not-allowed"
                disabled // Code usually shouldn't change
              />
            </div>

            {/* Material */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Material</label>
              <input
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-medium disabled:opacity-70"
            >
              {loading ? 'Updating...' : <><Save size={18} /> Save Changes</>}
            </button>
            <Link href={`/catalogs/${params.id}`} className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditCatalogPage;