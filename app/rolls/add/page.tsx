/**
 *  Add Roll Page - With Zod Validation
 * Form for creating new fabric rolls with complete validation
 */

'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, ScanBarcode, Box } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createRollSchema, type CreateRollInput } from '@/lib/validation/schemas';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { useRolls } from '@/hooks/useRolls';
import { FormErrorBoundary } from '@/components/ErrorBoundary';
import { isValidationError, isConflictError } from '@/lib/errors';

const AddRollPage = () => {
  const router = useRouter();
  const { createRoll } = useRolls();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateRollInput>({
    barcode: '',
    catalogId: '',
    color: '',
    degree: 'A',
    lengthMeters: 0,
    location: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateRollInput, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field when user starts typing
    if (errors[name as keyof CreateRollInput]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    // Validate with Zod
    const result = createRollSchema.safeParse(formData);

    if (!result.success) {
      // Convert Zod errors to our error format
      const fieldErrors: Partial<Record<keyof CreateRollInput, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof CreateRollInput;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);

      // Create roll via service layer (server will validate barcode uniqueness)
      const newRoll = await createRoll(result.data);

      if (newRoll) {
        // Success - redirect to rolls list
        router.push('/rolls');
      } else {
        setServerError('Failed to create roll. Please try again.');
      }
    } catch (error) {
      console.error('Form submission error:', error);

      // Handle specific error types
      if (isConflictError(error)) {
        setErrors({ barcode: 'This barcode already exists in the system' });
      } else if (isValidationError(error)) {
        setServerError(error.message);
      } else {
        setServerError(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
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

          {/* Section: Identification */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ScanBarcode size={16} className="text-blue-600" /> Identification
            </h3>
            <div className="grid gap-4">
              <FormField
                label="Barcode"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                error={errors.barcode}
                placeholder="Scan or enter barcode"
                required
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
              <FormField
                label="Catalog ID"
                name="catalogId"
                value={formData.catalogId}
                onChange={handleChange}
                error={errors.catalogId}
                placeholder="e.g. cat-001"
                required
              />

              <FormField
                label="Color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                error={errors.color}
                placeholder="e.g. Navy Blue"
                required
              />

              <FormSelect
                label="Degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                error={errors.degree}
                required
                options={[
                  { value: 'A', label: 'Grade A' },
                  { value: 'B', label: 'Grade B' },
                  { value: 'C', label: 'Grade C' },
                ]}
              />

              <FormField
                label="Length (Meters)"
                name="lengthMeters"
                type="number"
                value={formData.lengthMeters}
                onChange={handleChange}
                error={errors.lengthMeters}
                placeholder="e.g. 50.5"
                required
                min={0.1}
                step={0.1}
              />

              <FormField
                label="Location (Optional)"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                error={errors.location}
                placeholder="e.g. A1, B3"
              />
            </div>
          </div>

          <div className="h-px bg-gray-100"></div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Link
              href="/rolls"
              className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 text-sm font-medium"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Roll
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRollPage;