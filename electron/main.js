const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development";

// ============================================
// API CONFIGURATION
// ============================================

// Next.js API server URL (runs alongside Electron)
const API_BASE_URL = isDev ? 'http://localhost:3000' : 'http://localhost:3000';

/**
 * Make authenticated API request to Next.js server
 * @param {string} endpoint - API endpoint (e.g., '/api/rolls')
 * @param {object} options - Fetch options
 * @param {string} token - Auth token (optional)
 */
async function apiRequest(endpoint, options = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error?.message || 'API request failed');
    error.code = data.error?.code || 'API_ERROR';
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if user has permission
 */
function hasPermission(user, requiredPermission) {
  if (!user) return false;

  const rolePermissions = {
    admin: ['*'], // All permissions
    storekeeper: ['rolls:read', 'rolls:create', 'rolls:update', 'catalogs:read', 'catalogs:create', 'catalogs:update', 'reports:read'],
    viewer: ['rolls:read', 'catalogs:read', 'reports:read'],
  };

  const permissions = rolePermissions[user.role] || [];
  return permissions.includes('*') || permissions.includes(requiredPermission);
}

/**
 * Standard error handler for IPC
 */
function handleIPCError(error) {
  console.error('IPC Error:', error);

  return {
    success: false,
    error: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      statusCode: error.statusCode || 500,
    },
  };
}

// ============================================
// SESSION MANAGEMENT
// ============================================

// Store authenticated user sessions (webContentsId -> user)
const activeSessions = new Map();

/**
 * Set authenticated user for a renderer process
 */
function setAuthenticatedUser(webContentsId, user) {
  activeSessions.set(webContentsId, {
    user,
    loginTime: Date.now(),
  });
  console.log(`✅ User authenticated: ${user.email} (webContentsId: ${webContentsId})`);
}

/**
 * Get authenticated user for a renderer process
 */
function getAuthenticatedUser(webContentsId) {
  const session = activeSessions.get(webContentsId);
  return session ? session.user : null;
}

/**
 * Clear authenticated user for a renderer process
 */
function clearAuthenticatedUser(webContentsId) {
  const session = activeSessions.get(webContentsId);
  if (session) {
    console.log(`🚪 User logged out: ${session.user.email}`);
    activeSessions.delete(webContentsId);
  }
}

/**
 * Require authentication - throws if not authenticated
 */
function requireAuth(event) {
  const user = getAuthenticatedUser(event.sender.id);
  if (!user) {
    const error = new Error('Authentication required');
    error.code = 'AUTH_REQUIRED';
    error.statusCode = 401;
    throw error;
  }
  return user;
}

/**
 * Require specific permission - throws if user doesn't have it
 */
function requirePermission(event, permission) {
  const user = requireAuth(event);
  if (!hasPermission(user, permission)) {
    const error = new Error(`Permission denied: ${permission}`);
    error.code = 'PERMISSION_DENIED';
    error.statusCode = 403;
    throw error;
  }
  return user;
}

// ============================================
// AUTHENTICATION IPC HANDLERS (API PROXY)
// ============================================

ipcMain.handle('auth:login', async (event, email, password) => {
  try {
    // Call Next.js API
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store user session in Electron
    if (result.user) {
      setAuthenticatedUser(event.sender.id, result.user);
    }

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('auth:logout', async (event) => {
  try {
    const user = getAuthenticatedUser(event.sender.id);

    // Call Next.js API if user exists
    if (user?.token) {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      }, user.token);
    }

    // Clear user session in Electron
    clearAuthenticatedUser(event.sender.id);

    return { success: true, data: null };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('auth:checkAuth', async (event) => {
  try {
    // Return current authenticated user from Electron session
    const user = getAuthenticatedUser(event.sender.id);
    return { success: true, data: user };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// ROLLS IPC HANDLERS (API PROXY WITH PERMISSIONS)
// ============================================

ipcMain.handle('rolls:getAll', async (event, filters = {}) => {
  try {
    const user = requirePermission(event, 'rolls:read');

    const queryString = new URLSearchParams(filters).toString();
    const result = await apiRequest(`/api/rolls${queryString ? '?' + queryString : ''}`, {
      method: 'GET',
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:getById', async (event, id) => {
  try {
    const user = requirePermission(event, 'rolls:read');

    const result = await apiRequest(`/api/rolls/${id}`, {
      method: 'GET',
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:findByBarcode', async (event, barcode) => {
  try {
    const user = requirePermission(event, 'rolls:read');

    const result = await apiRequest(`/api/rolls?barcode=${encodeURIComponent(barcode)}`, {
      method: 'GET',
    }, user.token);

    // Return first match
    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:create', async (event, data) => {
  try {
    const user = requirePermission(event, 'rolls:create');

    const result = await apiRequest('/api/rolls', {
      method: 'POST',
      body: JSON.stringify(data),
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:update', async (event, id, data) => {
  try {
    const user = requirePermission(event, 'rolls:update');

    const result = await apiRequest(`/api/rolls/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:delete', async (event, id) => {
  try {
    const user = requirePermission(event, 'rolls:update');

    await apiRequest(`/api/rolls/${id}`, {
      method: 'DELETE',
    }, user.token);

    return { success: true, data: null };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:updateStatus', async (event, id, status) => {
  try {
    const user = requirePermission(event, 'rolls:update');

    const result = await apiRequest(`/api/rolls/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// CATALOGS IPC HANDLERS (API PROXY WITH PERMISSIONS)
// ============================================

ipcMain.handle('catalogs:getAll', async (event) => {
  try {
    const user = requirePermission(event, 'catalogs:read');

    const result = await apiRequest('/api/catalogs', {
      method: 'GET',
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:getById', async (event, id) => {
  try {
    const user = requirePermission(event, 'catalogs:read');

    const result = await apiRequest(`/api/catalogs/${id}`, {
      method: 'GET',
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:create', async (event, data) => {
  try {
    const user = requirePermission(event, 'catalogs:create');

    const result = await apiRequest('/api/catalogs', {
      method: 'POST',
      body: JSON.stringify(data),
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:update', async (event, id, data) => {
  try {
    const user = requirePermission(event, 'catalogs:update');

    const result = await apiRequest(`/api/catalogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:delete', async (event, id) => {
  try {
    const user = requirePermission(event, 'catalogs:update');

    await apiRequest(`/api/catalogs/${id}`, {
      method: 'DELETE',
    }, user.token);

    return { success: true, data: null };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:getRollsCount', async (event, catalogId) => {
  try {
    const user = requirePermission(event, 'catalogs:read');

    // This would need a custom endpoint or we fetch the catalog
    const result = await apiRequest(`/api/catalogs/${catalogId}`, {
      method: 'GET',
    }, user.token);

    return { success: true, data: result.rollsCount || 0 };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// USERS IPC HANDLERS (API PROXY WITH PERMISSIONS)
// ============================================

ipcMain.handle('users:getAll', async (event) => {
  try {
    const user = requireAuth(event); // Admin check done by API

    const result = await apiRequest('/api/users', {
      method: 'GET',
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('users:getById', async (event, id) => {
  try {
    const user = requireAuth(event);

    const result = await apiRequest(`/api/users/${id}`, {
      method: 'GET',
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('users:create', async (event, data) => {
  try {
    const user = requireAuth(event); // Admin check done by API

    const result = await apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('users:update', async (event, id, data) => {
  try {
    const user = requireAuth(event);

    const result = await apiRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('users:delete', async (event, id) => {
  try {
    const user = requireAuth(event); // Admin check done by API

    await apiRequest(`/api/users/${id}`, {
      method: 'DELETE',
    }, user.token);

    return { success: true, data: null };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// AUDIT LOG & DATABASE UTILITY IPC HANDLERS
// ============================================

ipcMain.handle('audit:getLogs', async (event, filters = {}) => {
  try {
    const user = requirePermission(event, 'reports:read');

    const queryString = new URLSearchParams(filters).toString();
    const result = await apiRequest(`/api/audit${queryString ? '?' + queryString : ''}`, {
      method: 'GET',
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('db:getStats', async (event) => {
  try {
    const user = requirePermission(event, 'reports:read');

    const result = await apiRequest('/api/database/stats', {
      method: 'GET',
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('db:getColors', async (event) => {
  try {
    const user = requirePermission(event, 'rolls:read');

    const result = await apiRequest('/api/database/colors', {
      method: 'GET',
    }, user.token);

    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// WINDOW MANAGEMENT
// ============================================

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const startURL = isDev
    ? "http://localhost:3000"
    : `file://${path.join(__dirname, "../out/index.html")}`;

  mainWindow.loadURL(startURL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Clean up session when window closes
  mainWindow.webContents.on('destroyed', () => {
    clearAuthenticatedUser(mainWindow.webContents.id);
  });
}

// ============================================
// APP LIFECYCLE
// ============================================

app.whenReady().then(() => {
  console.log('🚀 Electron app starting...');
  console.log(`📡 API Server: ${API_BASE_URL}`);
  console.log('⚠️  Note: Next.js dev server must be running on port 3000');

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // Clear all sessions
  activeSessions.clear();

  if (process.platform !== "darwin") {
    app.quit();
  }
});