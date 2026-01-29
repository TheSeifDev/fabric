'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, ScanBarcode, Box } from 'lucide-react'; // Removed Palette, Ruler
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Interface for the reusable Input
interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const AddRollPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    barcode: '',
    catalogId: '', // Changed from 'catalog'
    color: '',
    degree: 'A' as 'A' | 'B' | 'C', // Type the degree field
    lengthMeters: '', // Changed from 'length'
    location: '', // Added location field
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API Call
    console.log('Saving Roll:', formData);

    setTimeout(() => {
      setLoading(false);
      router.push('/rolls');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto w-full pb-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/rolls" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Add New Roll</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section: Identification */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ScanBarcode size={16} className="text-blue-600" /> Identification
            </h3>
            <div className="grid gap-4">
              <FormInput
                label="Barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Scan or enter barcode"
                autoFocus
              />
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Section: Specifications */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Box size={16} className="text-blue-600" /> Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Catalog ID"
                name="catalogId"
                value={formData.catalogId}
                onChange={handleChange}
                placeholder="e.g. cat-001"
              />
              <FormInput
                label="Color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g. Navy Blue"
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Degree</label>
                <select
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="A">Grade A</option>
                  <option value="B">Grade B</option>
                  <option value="C">Grade C</option>
                </select>
              </div>

              <FormInput
                label="Length (Meters)"
                name="lengthMeters"
                type="number"
                value={formData.lengthMeters}
                onChange={handleChange}
                placeholder="e.g. 50.5"
              />

              <FormInput
                label="Location (Optional)"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. A1, B3"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 font-medium disabled:opacity-70"
            >
              {loading ? 'Saving...' : <><Save size={18} /> Save Roll</>}
            </button>
            <Link href="/rolls" className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// Fixed: Used interface instead of 'any'
const FormInput = ({ label, name, type = "text", value, onChange, placeholder, autoFocus }: FormInputProps) => (
  <div className="space-y-1.5 w-full">
    <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
    />
  </div>
);

export default AddRollPage;