const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development";

// ============================================
// DATABASE & SERVICES INITIALIZATION
// ============================================

// Import database initialization
let setupDatabase;
let authService;
let rollService;
let catalogService;
let userService;
let getAuditRepository;
let getDatabaseStats;
let backupDatabase;

// Lazy load services (after app is ready)
async function initializeServices() {
  try {
    // Dynamic import to avoid issues with TypeScript/ES modules
    const dbInit = require(path.join(__dirname, '../database/init.js'));
    setupDatabase = dbInit.setupDatabase;

    const { authService: auth } = require(path.join(__dirname, '../lib/services/AuthService.js'));
    const { rollService: rolls } = require(path.join(__dirname, '../lib/services/RollService.js'));
    const { catalogService: catalogs } = require(path.join(__dirname, '../lib/services/CatalogService.js'));
    const { userService: users } = require(path.join(__dirname, '../lib/services/UserService.js'));
    const { getAuditRepository: auditRepo } = require(path.join(__dirname, '../database/repositories/index.js'));
    const { getDatabaseStats: dbStats, backupDatabase: backup } = require(path.join(__dirname, '../database/connection.js'));

    authService = auth;
    rollService = rolls;
    catalogService = catalogs;
    userService = users;
    getAuditRepository = auditRepo;
    getDatabaseStats = dbStats;
    backupDatabase = backup;

    // Initialize database
    await setupDatabase();
    console.log('✅ Database initialized successfully');

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    return false;
  }
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
// AUTHENTICATION IPC HANDLERS
// ============================================

ipcMain.handle('auth:login', async (event, email, password) => {
  try {
    const result = await authService.login(email, password);
    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('auth:logout', async () => {
  try {
    await authService.logout();
    return { success: true, data: null };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('auth:checkAuth', async (event, token) => {
  try {
    // This would validate the token and return user info
    // For now, returning null (implement token validation later)
    return { success: true, data: null };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// ROLLS IPC HANDLERS
// ============================================

ipcMain.handle('rolls:getAll', async (event, filters = {}) => {
  try {
    const rolls = await rollService.getAll(filters);
    return { success: true, data: rolls };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:getById', async (event, id) => {
  try {
    const roll = await rollService.getById(id);
    return { success: true, data: roll };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:findByBarcode', async (event, barcode) => {
  try {
    const roll = await rollService.findByBarcode(barcode);
    return { success: true, data: roll };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:create', async (event, data) => {
  try {
    const userId = event.sender.userId || null; // Set from auth context
    const roll = await rollService.create(data, userId);
    return { success: true, data: roll };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:update', async (event, id, data) => {
  try {
    const userId = event.sender.userId || null;
    const roll = await rollService.update(id, data, userId);
    return { success: true, data: roll };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:delete', async (event, id) => {
  try {
    const userId = event.sender.userId || null;
    await rollService.delete(id, userId);
    return { success: true, data: null };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('rolls:updateStatus', async (event, id, status) => {
  try {
    const userId = event.sender.userId || null;
    const roll = await rollService.updateStatus(id, status, userId);
    return { success: true, data: roll };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// CATALOGS IPC HANDLERS
// ============================================

ipcMain.handle('catalogs:getAll', async () => {
  try {
    const catalogs = await catalogService.getAll();
    return { success: true, data: catalogs };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:getById', async (event, id) => {
  try {
    const catalog = await catalogService.getById(id);
    return { success: true, data: catalog };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:create', async (event, data) => {
  try {
    const userId = event.sender.userId || null;
    const catalog = await catalogService.create(data, userId);
    return { success: true, data: catalog };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:update', async (event, id, data) => {
  try {
    const userId = event.sender.userId || null;
    const catalog = await catalogService.update(id, data, userId);
    return { success: true, data: catalog };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:delete', async (event, id) => {
  try {
    const userId = event.sender.userId || null;
    await catalogService.delete(id, userId);
    return { success: true, data: null };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('catalogs:getRollsCount', async (event, catalogId) => {
  try {
    const count = await catalogService.getRollsCount(catalogId);
    return { success: true, data: count };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// USERS IPC HANDLERS
// ============================================

ipcMain.handle('users:getAll', async () => {
  try {
    const users = await userService.getAll();
    return { success: true, data: users };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('users:getById', async (event, id) => {
  try {
    const user = await userService.getById(id);
    return { success: true, data: user };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('users:create', async (event, data) => {
  try {
    const userId = event.sender.userId || null;
    const user = await userService.create(data, userId);
    return { success: true, data: user };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('users:update', async (event, id, data) => {
  try {
    const userId = event.sender.userId || null;
    const user = await userService.update(id, data, userId);
    return { success: true, data: user };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('users:delete', async (event, id) => {
  try {
    const userId = event.sender.userId || null;
    await userService.delete(id, userId);
    return { success: true, data: null };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// AUDIT LOG IPC HANDLERS
// ============================================

ipcMain.handle('audit:getLogs', async (event, filters) => {
  try {
    const auditRepo = getAuditRepository();
    const logs = auditRepo.findAll(filters);
    return { success: true, data: logs };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('audit:getByEntity', async (event, entityType, entityId) => {
  try {
    const auditRepo = getAuditRepository();
    const logs = auditRepo.findByEntity(entityType, entityId);
    return { success: true, data: logs };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('audit:getByUser', async (event, userId) => {
  try {
    const auditRepo = getAuditRepository();
    const logs = auditRepo.findByUser(userId);
    return { success: true, data: logs };
  } catch (error) {
    return handleIPCError(error);
  }
});

// ============================================
// DATABASE UTILITY IPC HANDLERS
// ============================================

ipcMain.handle('db:getStats', async () => {
  try {
    const stats = getDatabaseStats();
    return { success: true, data: stats };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('db:backup', async (event, backupPath) => {
  try {
    const result = backupDatabase(backupPath);
    return { success: true, data: result };
  } catch (error) {
    return handleIPCError(error);
  }
});

ipcMain.handle('db:getColors', async () => {
  try {
    // Get all unique colors from rolls
    const rolls = await rollService.getAll();
    const colors = [...new Set(rolls.map(r => r.color))].filter(Boolean);
    return { success: true, data: colors };
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
}

// ============================================
// APP LIFECYCLE
// ============================================

app.whenReady().then(async () => {
  // Initialize database and services before opening window
  const initialized = await initializeServices();

  if (!initialized) {
    console.error('Failed to initialize application');
    app.quit();
    return;
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});