/**
 * Toast Utilities
 * Helper functions for showing toast notifications
 */

import toast from 'react-hot-toast';
import { createElement as h } from 'react';

/**
 * Show success toast
 */
export function showSuccess(message: string) {
    toast.success(message);
}

/**
 * Show error toast
 */
export function showError(message: string) {
    toast.error(message);
}

/**
 * Show loading toast and return dismiss function
 */
export function showLoading(message: string = 'Loading...') {
    return toast.loading(message);
}

/**
 * Dismiss a specific toast
 */
export function dismissToast(toastId: string) {
    toast.dismiss(toastId);
}

/**
 * Show toast with undo action
 */
export function showUndo(
    message: string,
    onUndo: () => void,
    duration: number = 5000
) {
    toast(
        (t) =>
            h(
                'div',
                { className: 'flex items-center gap-3' },
                h('span', null, message),
                h(
                    'button',
                    {
                        onClick: () => {
                            onUndo();
                            toast.dismiss(t.id);
                        },
                        className:
                            'px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium',
                    },
                    'Undo'
                )
            ),
        { duration }
    );
}

/**
 * Show promise toast (automatically handles loading, success, error states)
 */
export function showPromise<T>(
    promise: Promise<T>,
    messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
    }
) {
    return toast.promise(promise, messages);
}

/**
 * Show custom toast with action buttons
 */
export function showCustom(
    message: string,
    actions: Array<{
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'danger';
    }>,
    duration: number = 6000
) {
    toast(
        (t) =>
            h(
                'div',
                { className: 'flex flex-col gap-3' },
                h('div', null, message),
                h(
                    'div',
                    { className: 'flex gap-2' },
                    ...actions.map((action, i) =>
                        h(
                            'button',
                            {
                                key: i,
                                onClick: () => {
                                    action.onClick();
                                    toast.dismiss(t.id);
                                },
                                className: `px-3 py-1 rounded font-medium ${action.variant === 'danger'
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : action.variant === 'secondary'
                                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`,
                            },
                            action.label
                        )
                    )
                )
            ),
        { duration }
    );
}
