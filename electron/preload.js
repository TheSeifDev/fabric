const { contextBridge, ipcRenderer } = require('electron');

/**
 * Secure IPC Bridge for Fabric Inventory Management System
 * Exposes safe APIs to the renderer process via contextBridge
 */

contextBridge.exposeInMainWorld('electronAPI', {
  // ============================================
  // ROLLS API
  // ============================================
  rolls: {
    /**
     * Get all rolls with optional filters
     * @param {object} filters - Optional filters (catalog, color, degree, status)
     * @returns {Promise<Roll[]>}
     */
    getAll: (filters) => ipcRenderer.invoke('rolls:getAll', filters),

    /**
     * Get a single roll by ID
     * @param {string} id - Roll UUID
     * @returns {Promise<Roll>}
     */
    getById: (id) => ipcRenderer.invoke('rolls:getById', id),

    /**
     * Find roll by barcode
     * @param {string} barcode - Barcode string
     * @returns {Promise<Roll | null>}
     */
    findByBarcode: (barcode) => ipcRenderer.invoke('rolls:findByBarcode', barcode),

    /**
     * Create a new roll
     * @param {object} data - Roll data
     * @returns {Promise<Roll>}
     */
    create: (data) => ipcRenderer.invoke('rolls:create', data),

    /**
     * Update an existing roll
     * @param {string} id - Roll UUID
     * @param {object} data - Updated roll data
     * @returns {Promise<Roll>}
     */
    update: (id, data) => ipcRenderer.invoke('rolls:update', id, data),

    /**
     * Delete a roll (soft delete)
     * @param {string} id - Roll UUID
     * @returns {Promise<void>}
     */
    delete: (id) => ipcRenderer.invoke('rolls:delete', id),

    /**
     * Search rolls by barcode or other fields
     * @param {string} query - Search query
     * @returns {Promise<Roll[]>}
     */
    search: (query) => ipcRenderer.invoke('rolls:search', query),
  },

  // ============================================
  // CATALOGS API
  // ============================================
  catalogs: {
    getAll: () => ipcRenderer.invoke('catalogs:getAll'),
    getById: (id) => ipcRenderer.invoke('catalogs:getById', id),
    create: (data) => ipcRenderer.invoke('catalogs:create', data),
    update: (id, data) => ipcRenderer.invoke('catalogs:update', id, data),
    delete: (id) => ipcRenderer.invoke('catalogs:delete', id),
    getRollsCount: (id) => ipcRenderer.invoke('catalogs:getRollsCount', id),
  },

  // ============================================
  // USERS API
  // ============================================
  users: {
    getAll: () => ipcRenderer.invoke('users:getAll'),
    getById: (id) => ipcRenderer.invoke('users:getById', id),
    create: (data) => ipcRenderer.invoke('users:create', data),
    update: (id, data) => ipcRenderer.invoke('users:update', id, data),
    delete: (id) => ipcRenderer.invoke('users:delete', id),
    updatePassword: (userId, oldPassword, newPassword) =>
      ipcRenderer.invoke('users:updatePassword', userId, oldPassword, newPassword),
  },

  // ============================================
  // AUTH API
  // ============================================
  auth: {
    /**
     * Login user
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{ user: User, token: string }>}
     */
    login: (email, password) => ipcRenderer.invoke('auth:login', email, password),

    /**
     * Logout current user
     * @returns {Promise<void>}
     */
    logout: () => ipcRenderer.invoke('auth:logout'),

    /**
     * Get current authenticated user
     * @returns {Promise<User | null>}
     */
    getCurrentUser: () => ipcRenderer.invoke('auth:getCurrentUser'),

    /**
     * Check if user has permission
     * @param {string} permission - Permission name
     * @returns {Promise<boolean>}
     */
    checkPermission: (permission) => ipcRenderer.invoke('auth:checkPermission', permission),
  },

  // ============================================
  // REPORTS API
  // ============================================
  reports: {
    /**
     * Generate inventory report
     * @param {object} options - Report options (dateRange, catalogs, etc.)
     * @returns {Promise<ReportData>}
     */
    generateInventory: (options) => ipcRenderer.invoke('reports:generateInventory', options),

    /**
     * Generate sales report
     * @param {object} options - Report options
     * @returns {Promise<ReportData>}
     */
    generateSales: (options) => ipcRenderer.invoke('reports:generateSales', options),

    /**
     * Generate user activity report
     * @param {object} options - Report options
     * @returns {Promise<ReportData>}
     */
    generateUserActivity: (options) =>
      ipcRenderer.invoke('reports:generateUserActivity', options),

    /**
     * Export report to PDF
     * @param {string} reportId - Report ID
     * @returns {Promise<string>} File path
     */
    exportToPDF: (reportId) => ipcRenderer.invoke('reports:exportToPDF', reportId),

    /**
     * Export report to CSV
     * @param {string} reportId - Report ID
     * @returns {Promise<string>} File path
     */
    exportToCSV: (reportId) => ipcRenderer.invoke('reports:exportToCSV', reportId),
  },

  // ============================================
  // SYSTEM API
  // ============================================
  system: {
    /**
     * Get application info
     * @returns {Promise<{ version: string, platform: string }>}
     */
    getInfo: () => ipcRenderer.invoke('system:getInfo'),

    /**
     * Create database backup
     * @returns {Promise<string>} Backup file path
     */
    createBackup: () => ipcRenderer.invoke('system:createBackup'),

    /**
     * Restore database from backup
     * @param {string} backupPath - Path to backup file
     * @returns {Promise<void>}
     */
    restoreBackup: (backupPath) => ipcRenderer.invoke('system:restoreBackup', backupPath),

    /**
     * Get application settings
     * @returns {Promise<object>}
     */
    getSettings: () => ipcRenderer.invoke('system:getSettings'),

    /**
     * Update application settings
     * @param {object} settings - Settings object
     * @returns {Promise<void>}
     */
    updateSettings: (settings) => ipcRenderer.invoke('system:updateSettings', settings),
  },

  // ============================================
  // AUDIT LOG API
  // ============================================
  auditLog: {
    /**
     * Get audit logs with pagination
     * @param {object} options - Pagination and filter options
     * @returns {Promise<{ logs: AuditLog[], total: number }>}
     */
    getLogs: (options) => ipcRenderer.invoke('auditLog:getLogs', options),

    /**
     * Get audit logs for specific entity
     * @param {string} entityType - Entity type (roll, catalog, user)
     * @param {string} entityId - Entity ID
     * @returns {Promise<AuditLog[]>}
     */
    getByEntity: (entityType, entityId) =>
      ipcRenderer.invoke('auditLog:getByEntity', entityType, entityId),
  },
});

// Expose node process info (read-only)
contextBridge.exposeInMainWorld('process', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
});
