/**
 * Utility functions for common operations
 */

/**
 * Format timestamp to relative time (e.g., "2 mins ago", "1 day ago")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted string
 */
export function formatRelativeTime(timestamp: number | undefined): string {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    if (weeks < 4) return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Format timestamp to date string (e.g., "Jan 15, 2024")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted string
 */
export function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format timestamp to date and time string (e.g., "Jan 15, 2024 3:45 PM")
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted string
 */
export function formatDateTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

/**
 * Truncate string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
    return num.toLocaleString('en-US');
}

/**
 * Format currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for environments without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Hash password using SHA-256
 * In production, use bcrypt or argon2 instead
 */
export async function hashPassword(password: string): Promise<string> {
    // For development, using simple SHA-256
    // In production, use bcrypt: const bcrypt = require('bcryptjs'); return bcrypt.hash(password, 10);
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

/**
 * Generate authentication token
 * In production, use JWT
 */
export function generateToken(userId: string): string {
    // For development, simple token
    // In production, use JWT: const jwt = require('jsonwebtoken'); return jwt.sign({ userId }, secret, { expiresIn: '24h' });
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${userId}.${timestamp}.${random}`;
}

/**
 * className utility for merging Tailwind classes
 * @param classes - Class names to merge
 * @returns Merged class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
