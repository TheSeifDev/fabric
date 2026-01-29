/**
 * FormSelect Component
 * Reusable select field with validation support
 */

'use client';

import React from 'react';

interface FormSelectProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Array<{ value: string; label: string }>;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export function FormSelect({
    label,
    name,
    value,
    onChange,
    options,
    error,
    required = false,
    disabled = false,
}: FormSelectProps) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={name} className="text-sm font-medium text-gray-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`
          w-full px-4 py-2.5 bg-white border rounded-xl text-sm
          focus:outline-none focus:ring-2 transition-all cursor-pointer
          ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                    }
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
        `}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
