/**
 * Next.js Error Page
 * Handles errors in app router pages
 */

'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { logError, normalizeError } from '@/lib/errors';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error when component mounts
        logError(error, {
            digest: error.digest,
            page: 'error-page',
        });
    }, [error]);

    const normalizedError = normalizeError(error);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 rounded-full bg-red-100">
                            <AlertTriangle size={32} className="text-red-600" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                        Something Went Wrong
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 text-center mb-6">
                        {normalizedError.message || 'An unexpected error occurred while loading this page.'}
                    </p>

                    {/* Error Code (if available) */}
                    {error.digest && (
                        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 text-center">
                                Error ID: <code className="font-mono">{error.digest}</code>
                            </p>
                        </div>
                    )}

                    {/* Development Details */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs font-mono text-gray-700 mb-2">
                                <strong>Error Code:</strong> {normalizedError.code}
                            </p>
                            {error.stack && (
                                <details className="mt-2">
                                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                                        Stack Trace
                                    </summary>
                                    <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                                        {error.stack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={reset}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                            <RefreshCw size={18} />
                            Try Again
                        </button>

                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                        >
                            <Home size={18} />
                            Go to Dashboard
                        </Link>
                    </div>

                    {/* Help Text */}
                    <p className="text-xs text-gray-500 text-center mt-6">
                        If this problem persists, please contact your system administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}
