/**
 * Edit Catalog Page - With Zod Validation
 * Form for editing existing catalogs with complete validation
 */

'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { updateCatalogSchema, type UpdateCatalogInput } from '@/lib/validation/schemas';
import { FormField, FormSelect, FormTextarea } from '@/components/ui';
import { useCatalogs } from '@/hooks/useCatalogs';

const EditCatalogPage = () => {
  const router = useRouter();
  const params = useParams();
  const { updateCatalog, getCatalog } = useCatalogs();
  const [loading, setLoading] = useState(false);

  // Mock State - In real app, fetch data in useEffect based on params.id
  const [formData, setFormData] = useState<UpdateCatalogInput>({
    name: 'Velvet Royal',
    code: 'CAT-2024-V',
    material: 'Velvet',
    status: 'active',
    description: 'Premium royal velvet collection for luxury upholstery.',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateCatalogInput, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field
    if (errors[name as keyof UpdateCatalogInput]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    // Validate with Zod
    const result = updateCatalogSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof UpdateCatalogInput, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof UpdateCatalogInput;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);

      // Update catalog via service layer
      const updated = await updateCatalog(params.id as string, result.data);

      if (updated) {
        router.push(`/catalogs/${params.id}`);
      } else {
        setServerError('Failed to update catalog. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setServerError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
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
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {serverError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="md:col-span-2">
              <FormField
                label="Catalog Name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                error={errors.name}
                placeholder="e.g. Velvet Royal"
                required
              />
            </div>

            {/* Code (disabled) */}
            <FormField
              label="Code"
              name="code"
              value={formData.code || ''}
              onChange={handleChange}
              error={errors.code}
              disabled
            />

            {/* Material */}
            <FormField
              label="Material"
              name="material"
              value={formData.material || ''}
              onChange={handleChange}
              error={errors.material}
              placeholder="e.g. Velvet, Silk, Cotton"
              required
            />

            {/* Status */}
            <div className="md:col-span-2">
              <FormSelect
                label="Status"
                name="status"
                value={formData.status || 'active'}
                onChange={handleChange}
                error={errors.status}
                required
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'archived', label: 'Archived' },
                  { value: 'draft', label: 'Draft' },
                ]}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <FormTextarea
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                error={errors.description}
                placeholder="Enter catalog description..."
                rows={4}
                maxLength={500}
              />
            </div>
          </div>

          <div className="pt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 font-medium"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
            <Link
              href={`/catalogs/${params.id}`}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditCatalogPage;