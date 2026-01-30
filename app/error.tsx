/**
 * Next.js Global Error Page
 * Handles errors in the root layout and app-level errors
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logError, getUserFriendlyMessage } from '@/lib/errors';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log error when component mounts
        logError(error, { digest: error.digest });
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Something went wrong
                            </h2>

                            <p className="text-gray-600 mb-6">
                                {getUserFriendlyMessage(error)}
                            </p>

                            {process.env.NODE_ENV === 'development' && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
                                    <p className="text-xs font-mono text-red-600 break-all">
                                        {error.message}
                                    </p>
                                    {error.digest && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            Error ID: {error.digest}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={reset}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                                >
                                    <RefreshCw size={18} />
                                    Try Again
                                </button>

                                <a
                                    href="/"
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                                >
                                    <Home size={18} />
                                    Go Home
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
