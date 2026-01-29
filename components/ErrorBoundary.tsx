/**
 * React Error Boundary Component
 * Catches errors in component tree and displays fallback UI
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { logError, normalizeError, isCriticalError } from '@/lib/errors';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    resetKeys?: Array<string | number>;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error with component stack
        logError(error, {
            componentStack: errorInfo.componentStack,
            critical: isCriticalError(error),
        });

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    componentDidUpdate(prevProps: Props) {
        // Reset error boundary when resetKeys change
        if (this.state.hasError && this.props.resetKeys) {
            const prevKeys = prevProps.resetKeys || [];
            const currentKeys = this.props.resetKeys;

            if (prevKeys.length !== currentKeys.length ||
                prevKeys.some((key, index) => key !== currentKeys[index])) {
                this.reset();
            }
        }
    }

    reset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
        }

        return this.props.children;
    }
}

// ============================================
// DEFAULT ERROR FALLBACK UI
// ============================================

interface FallbackProps {
    error: Error;
    reset: () => void;
}

function DefaultErrorFallback({ error, reset }: FallbackProps) {
    const normalizedError = normalizeError(error);
    const isCritical = isCriticalError(error);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-full ${isCritical ? 'bg-red-100' : 'bg-yellow-100'}`}>
                            <AlertTriangle
                                size={32}
                                className={isCritical ? 'text-red-600' : 'text-yellow-600'}
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                        {isCritical ? 'Critical Error' : 'Something Went Wrong'}
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 text-center mb-6">
                        {normalizedError.message || 'An unexpected error occurred'}
                    </p>

                    {/* Error Details (Development Only) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs font-mono text-gray-700 mb-2">
                                <strong>Error Code:</strong> {normalizedError.code}
                            </p>
                            {normalizedError.stack && (
                                <details className="mt-2">
                                    <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                                        Stack Trace
                                    </summary>
                                    <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                                        {normalizedError.stack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        {!isCritical && (
                            <button
                                onClick={reset}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                            >
                                <RefreshCw size={18} />
                                Try Again
                            </button>
                        )}

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

// ============================================
// SPECIALIZED ERROR BOUNDARIES
// ============================================

/**
 * Minimal error boundary for critical sections
 * Shows simplified error without navigation
 */
export function MinimalErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            fallback={
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                        An error occurred in this section. Please refresh the page.
                    </p>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
}

/**
 * Form error boundary with specific handling
 */
export function FormErrorBoundary({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary
            fallback={
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
                        <div>
                            <h3 className="font-semibold text-yellow-900 mb-1">
                                Form Error
                            </h3>
                            <p className="text-sm text-yellow-700 mb-4">
                                There was an error processing your form. Please try again or refresh the page.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-yellow-700 font-medium hover:text-yellow-800 underline"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            {children}
        </ErrorBoundary>
    );
}
