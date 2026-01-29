const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development";

// Mock data storage (will be replaced with SQLite later)
let mockData = {
  currentUser: null,
  rolls: [],
  catalogs: [],
  users: [],
  auditLogs: [],
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate UUID (simple version for now)
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get current timestamp
 */
function getTimestamp() {
  return Date.now();
}

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
 * Create audit log entry
 */
function createAuditLog(action, entityType, entityId, userId, oldValues = null, newValues = null) {
  const log = {
    id: generateUUID(),
    userId,
    action,
    entityType,
    entityId,
    oldValues: oldValues ? JSON.stringify(oldValues) : null,
    newValues: newValues ? JSON.stringify(newValues) : null,
    timestamp: getTimestamp(),
  };
  mockData.auditLogs.push(log);
  return log;
}

// ============================================
// ERROR HANDLING
// ============================================

class AppError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

function handleIPCError(error) {
  console.error('IPC Error:', error);

  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      },
    };
  }

  return {
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    },
  };
}

// ============================================
// ROLLS IPC HANDLERS
// ============================================

ipcMain.handle('rolls:getAll', async (event, filters = {}) => {
  try {
    let rolls = [...mockData.rolls.filter(r => !r.deletedAt)];

    // Apply filters
    if (filters.catalog) {
      rolls = rolls.filter(r => r.catalogId === filters.catalog);
    }
    if (filters.color) {
      rolls = rolls.filter(r => r.color === filters.color);
    }
    if (filters.degree) {
      rolls = rolls.filter(r => r.degree === filters.degree);
    }
    if (filters.status) {
      rolls = rolls.filter(r => r.status === filters.status);
    }

    return { success: true, data: rolls };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:getById', async (event, id) => {
  try {
    const roll = mockData.rolls.find(r => r.id === id && !r.deletedAt);
    if (!roll) {
      throw new AppError('Roll not found', 'NOT_FOUND', 404);
    }
    return { success: true, data: roll };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:findByBarcode', async (event, barcode) => {
  try {
    const roll = mockData.rolls.find(r => r.barcode === barcode && !r.deletedAt);
    return { success: true, data: roll || null };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:create', async (event, data) => {
  try {
    const user = mockData.currentUser;
    if (!hasPermission(user, 'rolls:create')) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED', 403);
    }

    // Check for duplicate barcode
    const existing = mockData.rolls.find(r => r.barcode === data.barcode && !r.deletedAt);
    if (existing) {
      throw new AppError('Barcode already exists', 'DUPLICATE_BARCODE', 409);
    }

    const now = getTimestamp();
    const roll = {
      id: generateUUID(),
      ...data,
      status: data.status || 'in_stock',
      createdAt: now,
      createdBy: user?.id || 'system',
      updatedAt: now,
      updatedBy: user?.id || 'system',
      deletedAt: null,
      deletedBy: null,
    };

    mockData.rolls.push(roll);
    createAuditLog('create', 'roll', roll.id, user?.id, null, roll);

    return { success: true, data: roll };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:update', async (event, id, data) => {
  try {
    const user = mockData.currentUser;
    if (!hasPermission(user, 'rolls:update')) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED', 403);
    }

    const index = mockData.rolls.findIndex(r => r.id === id && !r.deletedAt);
    if (index === -1) {
      throw new AppError('Roll not found', 'NOT_FOUND', 404);
    }

    const oldRoll = { ...mockData.rolls[index] };
    const updatedRoll = {
      ...mockData.rolls[index],
      ...data,
      updatedAt: getTimestamp(),
      updatedBy: user?.id || 'system',
    };

    mockData.rolls[index] = updatedRoll;
    createAuditLog('update', 'roll', id, user?.id, oldRoll, updatedRoll);

    return { success: true, data: updatedRoll };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:delete', async (event, id) => {
  try {
    const user = mockData.currentUser;
    if (!hasPermission(user, 'rolls:delete')) {
      throw new AppError('Unauthorized - Admin only', 'UNAUTHORIZED', 403);
    }

    const index = mockData.rolls.findIndex(r => r.id === id && !r.deletedAt);
    if (index === -1) {
      throw new AppError('Roll not found', 'NOT_FOUND', 404);
    }

    const oldRoll = { ...mockData.rolls[index] };

    // Soft delete
    mockData.rolls[index] = {
      ...mockData.rolls[index],
      deletedAt: getTimestamp(),
      deletedBy: user?.id || 'system',
    };

    createAuditLog('delete', 'roll', id, user?.id, oldRoll, null);

    return { success: true, data: null };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:search', async (event, query) => {
  try {
    const lowerQuery = query.toLowerCase();
    const results = mockData.rolls.filter(r =>
      !r.deletedAt && (
        r.barcode.toLowerCase().includes(lowerQuery) ||
        r.color.toLowerCase().includes(lowerQuery) ||
        r.catalog.toLowerCase().includes(lowerQuery)
      )
    );
    return { success: true, data: results };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// CATALOGS IPC HANDLERS
// ============================================

ipcMain.handle('catalogs:getAll', async (event) => {
  try {
    const catalogs = mockData.catalogs.filter(c => !c.deletedAt);
    return { success: true, data: catalogs };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:getById', async (event, id) => {
  try {
    const catalog = mockData.catalogs.find(c => c.id === id && !c.deletedAt);
    if (!catalog) {
      throw new AppError('Catalog not found', 'NOT_FOUND', 404);
    }
    return { success: true, data: catalog };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:create', async (event, data) => {
  try {
    const user = mockData.currentUser;
    if (!hasPermission(user, 'catalogs:create')) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED', 403);
    }

    const now = getTimestamp();
    const catalog = {
      id: generateUUID(),
      ...data,
      createdAt: now,
      createdBy: user?.id || 'system',
      updatedAt: now,
      updatedBy: user?.id || 'system',
      deletedAt: null,
      deletedBy: null,
    };

    mockData.catalogs.push(catalog);
    createAuditLog('create', 'catalog', catalog.id, user?.id, null, catalog);

    return { success: true, data: catalog };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:getRollsCount', async (event, catalogId) => {
  try {
    const count = mockData.rolls.filter(r => r.catalogId === catalogId && !r.deletedAt).length;
    return { success: true, data: count };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// AUTH IPC HANDLERS
// ============================================

ipcMain.handle('auth:login', async (event, email, password) => {
  try {
    // Mock authentication (replace with real auth later)
    const user = mockData.users.find(u => u.email === email);

    if (!user) {
      throw new AppError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // In real implementation, verify password hash here

    mockData.currentUser = user;
    createAuditLog('login', 'user', user.id, user.id);

    return {
      success: true,
      data: {
        user: { ...user, passwordHash: undefined },
        token: 'mock-token-' + user.id
      }
    };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('auth:logout', async (event) => {
  try {
    const user = mockData.currentUser;
    if (user) {
      createAuditLog('logout', 'user', user.id, user.id);
    }
    mockData.currentUser = null;
    return { success: true, data: null };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('auth:getCurrentUser', async (event) => {
  try {
    const user = mockData.currentUser;
    return {
      success: true,
      data: user ? { ...user, passwordHash: undefined } : null
    };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('auth:checkPermission', async (event, permission) => {
  try {
    const user = mockData.currentUser;
    const hasAccess = hasPermission(user, permission);
    return { success: true, data: hasAccess };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// SYSTEM IPC HANDLERS
// ============================================

ipcMain.handle('system:getInfo', async (event) => {
  try {
    return {
      success: true,
      data: {
        version: app.getVersion(),
        platform: process.platform,
        electron: process.versions.electron,
        chrome: process.versions.chrome,
        node: process.versions.node,
      },
    };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('system:getSettings', async (event) => {
  try {
    // Mock settings (replace with electron-store later)
    return {
      success: true,
      data: {
        companyName: 'Fabric Warehouse',
        currency: 'USD',
        units: 'meters',
        autoBackup: true,
      },
    };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// AUDIT LOG IPC HANDLERS
// ============================================

ipcMain.handle('auditLog:getLogs', async (event, options = {}) => {
  try {
    const { page = 1, pageSize = 50 } = options;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const logs = mockData.auditLogs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(start, end);

    return {
      success: true,
      data: {
        logs,
        total: mockData.auditLogs.length,
        page,
        pageSize,
      },
    };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('auditLog:getByEntity', async (event, entityType, entityId) => {
  try {
    const logs = mockData.auditLogs
      .filter(log => log.entityType === entityType && log.entityId === entityId)
      .sort((a, b) => b.timestamp - a.timestamp);

    return { success: true, data: logs };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// ELECTRON APP LIFECYCLE
// ============================================

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false, // Security: disable node integration
      enableRemoteModule: false, // Security: disable remote module
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools(); // Auto-open DevTools in development
  } else {
    win.loadFile(path.join(__dirname, "../out/index.html"));
  }

  // Initialize mock data
  initializeMockData();
}

function initializeMockData() {
  // Create mock admin user
  mockData.users.push({
    id: generateUUID(),
    name: 'Admin User',
    email: 'admin@fabric.com',
    passwordHash: 'hashed_password', // In real app, use bcrypt
    role: 'admin',
    status: 'active',
    createdAt: getTimestamp(),
    updatedAt: getTimestamp(),
  });

  // Set as current user for testing
  mockData.currentUser = mockData.users[0];

  console.log('Mock data initialized');
  console.log('Login as: admin@fabric.com');
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});