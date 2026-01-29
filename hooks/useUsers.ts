/**
 * useUsers Hook
 * React hook for managing user data and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { userService } from '@/lib/services/UserService';
import type { User, CreateUserDTO, UpdateUserDTO } from '@/lib/electron-api.d';

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load users
    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await userService.getAll();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
            console.error('useUsers.loadUsers error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get user by ID
    const getUser = useCallback(async (id: string): Promise<User | null> => {
        try {
            setError(null);
            return await userService.getById(id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get user');
            console.error('useUsers.getUser error:', err);
            return null;
        }
    }, []);

    // Create user
    const createUser = useCallback(async (data: CreateUserDTO): Promise<User | null> => {
        try {
            setError(null);
            const newUser = await userService.create(data);
            setUsers((prev) => [...prev, newUser]);
            return newUser;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create user');
            console.error('useUsers.createUser error:', err);
            return null;
        }
    }, []);

    // Update user
    const updateUser = useCallback(async (id: string, data: UpdateUserDTO): Promise<User | null> => {
        try {
            setError(null);
            const updatedUser = await userService.update(id, data);
            setUsers((prev) =>
                prev.map((user) => (user.id === id ? updatedUser : user))
            );
            return updatedUser;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user');
            console.error('useUsers.updateUser error:', err);
            return null;
        }
    }, []);

    // Delete user
    const deleteUser = useCallback(async (id: string): Promise<boolean> => {
        try {
            setError(null);
            await userService.delete(id);
            setUsers((prev) => prev.filter((user) => user.id !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete user');
            console.error('useUsers.deleteUser error:', err);
            return false;
        }
    }, []);

    // Update password
    const updatePassword = useCallback(async (userId: string, oldPassword: string, newPassword: string): Promise<boolean> => {
        try {
            setError(null);
            await userService.updatePassword(userId, oldPassword, newPassword);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update password');
            console.error('useUsers.updatePassword error:', err);
            return false;
        }
    }, []);

    // Check email uniqueness
    const isEmailUnique = useCallback(async (email: string, excludeId?: string): Promise<boolean> => {
        try {
            return await userService.isEmailUnique(email, excludeId);
        } catch (err) {
            console.error('useUsers.isEmailUnique error:', err);
            return false;
        }
    }, []);

    // Load on mount
    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    return {
        users,
        loading,
        error,
        loadUsers,
        getUser,
        createUser,
        updateUser,
        deleteUser,
        updatePassword,
        isEmailUnique,
    };
}
