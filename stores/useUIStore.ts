/**
 * UI Store - Zustand
 * Centralized UI state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIStore {
    // Sidebar
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    // Modals
    activeModal: string | null;
    modalData: unknown;
    openModal: (id: string, data?: unknown) => void;
    closeModal: () => void;

    // Toasts (for future toast system integration)
    toasts: Array<{
        id: string;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
    }>;
    addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    removeToast: (id: string) => void;

    // Loading overlay
    globalLoading: boolean;
    setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIStore>()(
    devtools(
        (set) => ({
            // Sidebar state
            sidebarOpen: true,

            toggleSidebar: () => {
                set(state => ({ sidebarOpen: !state.sidebarOpen }));
            },

            setSidebarOpen: (open: boolean) => {
                set({ sidebarOpen: open });
            },

            // Modal state
            activeModal: null,
            modalData: null,

            openModal: (id: string, data?: unknown) => {
                set({ activeModal: id, modalData: data });
            },

            closeModal: () => {
                set({ activeModal: null, modalData: null });
            },

            // Toast state
            toasts: [],

            addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
                const id = Date.now().toString();
                set(state => ({
                    toasts: [...state.toasts, { id, message, type }]
                }));

                // Auto-remove after 5 seconds
                setTimeout(() => {
                    set(state => ({
                        toasts: state.toasts.filter(t => t.id !== id)
                    }));
                }, 5000);
            },

            removeToast: (id: string) => {
                set(state => ({
                    toasts: state.toasts.filter(t => t.id !== id)
                }));
            },

            // Global loading
            globalLoading: false,

            setGlobalLoading: (loading: boolean) => {
                set({ globalLoading: loading });
            },
        }),
        { name: 'UIStore' }
    )
);
