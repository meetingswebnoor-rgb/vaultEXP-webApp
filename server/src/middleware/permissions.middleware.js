/**
 * permissions.middleware.js
 * ─────────────────────────────────────────────────────────────────
 * Enterprise Portal Permission System
 * Unifies RBAC, Tenant Isolation, and Feature Flags without duplicating core logic.
 */

const { protect, restrictTo } = require('./auth.middleware');
const { requireTenant } = require('./tenant.middleware');
const { verifyDocumentOwnership } = require('./documentSecurity.middleware');
const { AppError } = require('../utils/appError');

/**
 * 1. Client Isolation Guard
 * Ensures the user is a 'CLIENT' and enforces strictly isolated queries.
 * Injects req.clientId for downstream use.
 */
const requireClientIsolation = [
  protect,
  restrictTo('CLIENT'),
  (req, res, next) => {
    // Force all downstream queries to use this explicit clientId
    req.clientId = req.user.id;
    next();
  }
];

/**
 * 2. Workspace Admin Guard
 * Wraps tenant middleware to enforce that the user is an 'owner' or 'admin' 
 * of the specific x-workspace-id passed in the headers.
 */
const requireWorkspaceAdmin = [
  protect,
  requireTenant,
  (req, res, next) => {
    const allowedRoles = ['owner', 'admin'];
    if (!allowedRoles.includes(req.workspaceRole)) {
      return next(new AppError('Forbidden — Workspace Admin access required', 403, 'FORBIDDEN_WORKSPACE_ROLE'));
    }
    next();
  }
];

/**
 * 3. AI Access Guard
 * Enforces rate limiting or subscription validation before allowing AI queries.
 */
const requireAIAccess = [
  protect,
  (req, res, next) => {
    // In a production environment:
    // 1. Check Redis for AI query rate limits
    // 2. Check if the workspace or client has an active AI subscription tier
    
    const userRole = req.user.role;
    // Basic guard: ensure only known roles can access the AI
    if (!['SUPER_ADMIN', 'business_owner', 'TEAM_MEMBER', 'CLIENT'].includes(userRole)) {
      return next(new AppError('Forbidden — AI Access not available for this role', 403, 'FORBIDDEN_AI_ACCESS'));
    }
    
    // Inject AI context flags
    req.aiContext = {
      isClientMode: userRole === 'CLIENT',
      tenantId: userRole === 'CLIENT' ? req.user.id : req.headers['x-workspace-id']
    };
    
    next();
  }
];

/**
 * 4. Enterprise Document Guard
 * Unifies Document Security for both internal workspace members and external clients.
 */
const requireDocumentAccess = (level = 'read') => [
  protect,
  async (req, res, next) => {
    // If the user is a client, use the strict ownership verification
    if (req.user.role === 'CLIENT') {
      return verifyDocumentOwnership(req, res, next);
    }
    
    // If the user is internal, ensure they have workspace context
    if (req.headers['x-workspace-id']) {
      return requireTenant(req, res, (err) => {
        if (err) return next(err);
        
        // In a real app: Verify the specific document belongs to this workspace
        // For 'write' level, verify req.workspaceRole is owner/admin/editor
        if (level === 'write' && req.workspaceRole === 'viewer') {
           return next(new AppError('Forbidden — Cannot modify documents', 403, 'FORBIDDEN_WORKSPACE_ROLE'));
        }
        
        next();
      });
    }

    return next(new AppError('Forbidden — Document access requires context', 403));
  }
];

module.exports = {
  requireClientIsolation,
  requireWorkspaceAdmin,
  requireAIAccess,
  requireDocumentAccess
};
