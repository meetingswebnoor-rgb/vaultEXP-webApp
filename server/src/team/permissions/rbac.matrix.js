/**
 * Enterprise Permission Matrix
 * Maps each TeamRole to a list of allowed resource actions.
 */

const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant',
  PROPERTY_MANAGER: 'property_manager',
  VIEWER: 'viewer',
  CLIENT: 'client'
};

const PERMISSIONS = {
  // Business
  BUSINESS_VIEW: 'business:view',
  BUSINESS_EDIT: 'business:edit',
  BUSINESS_DELETE: 'business:delete',
  
  // Properties
  PROPERTY_VIEW: 'property:view',
  PROPERTY_EDIT: 'property:edit',
  PROPERTY_DELETE: 'property:delete',
  
  // Documents
  DOCUMENT_VIEW: 'document:view',
  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_DELETE: 'document:delete',
  
  // Financial (Wallet/Expenses/Invoices)
  FINANCE_VIEW: 'finance:view',
  FINANCE_MANAGE: 'finance:manage',
  
  // Investments
  INVESTMENT_VIEW: 'investment:view',
  INVESTMENT_MANAGE: 'investment:manage',
  
  // Analytics & AI
  ANALYTICS_VIEW: 'analytics:view',
  AI_EXECUTE: 'ai:execute',
  
  // Team
  TEAM_MANAGE: 'team:manage'
};

const RoleMatrix = {
  [ROLES.OWNER]: Object.values(PERMISSIONS), // Owner gets everything
  
  [ROLES.ADMIN]: [
    ...Object.values(PERMISSIONS)
  ].filter(p => p !== PERMISSIONS.TEAM_MANAGE), // Admin gets everything except deleting the team itself
  
  [ROLES.MANAGER]: [
    PERMISSIONS.BUSINESS_VIEW,
    PERMISSIONS.BUSINESS_EDIT,
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.PROPERTY_EDIT,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.AI_EXECUTE
  ],
  
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.BUSINESS_VIEW,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_MANAGE,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  
  [ROLES.PROPERTY_MANAGER]: [
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.PROPERTY_EDIT,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.FINANCE_VIEW // To see rent payments
  ],
  
  [ROLES.VIEWER]: [
    PERMISSIONS.BUSINESS_VIEW,
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.DOCUMENT_VIEW,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  
  [ROLES.CLIENT]: [
    PERMISSIONS.PROPERTY_VIEW,
    PERMISSIONS.DOCUMENT_VIEW
    // Extremely restricted
  ]
};

const hasPermission = (role, permission) => {
  const allowed = RoleMatrix[role];
  return allowed ? allowed.includes(permission) : false;
};

module.exports = {
  ROLES,
  PERMISSIONS,
  RoleMatrix,
  hasPermission
};
