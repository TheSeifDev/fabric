/**
 * Global Error Handler
 * Catches errors at the root layout level
 */

'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-2xl shadow-2xl p-8">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="p-4 rounded-full bg-red-100">
                                    <AlertTriangle size={32} className="text-red-600" />
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                                Application Error
                            </h1>

                            {/* Message */}
                            <p className="text-gray-600 text-center mb-6">
                                A critical error occurred. The application needs to be restarted.
                            </p>

                            {/* Error ID */}
                            {error.digest && (
                                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-600 text-center">
                                        Error ID: <code className="font-mono">{error.digest}</code>
                                    </p>
                                </div>
                            )}

                            {/* Action */}
                            <button
                                onClick={reset}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                            >
                                <RefreshCw size={18} />
                                Restart Application
                            </button>

                            {/* Help Text */}
                            <p className="text-xs text-gray-500 text-center mt-6">
                                If this problem persists, please contact technical support.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
