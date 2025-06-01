// Admin Configuration for LearnQuest
// Defines admin users and their privileges

export interface AdminUser {
  email: string;
  role: 'owner' | 'admin' | 'moderator';
  permissions: AdminPermission[];
  usageLimits: UsageLimits;
  displayName?: string;
}

export interface AdminPermission {
  resource: string;
  actions: string[];
}

export interface UsageLimits {
  vectorUploads: number | 'unlimited';
  apiCalls: number | 'unlimited';
  storageGB: number | 'unlimited';
  aiRequests: number | 'unlimited';
  maxFileSize: number; // in MB
}

// Admin users configuration
export const ADMIN_USERS: AdminUser[] = [
  {
    email: 'thakurranveersingh505@gmail.com',
    role: 'owner',
    displayName: 'Ranveer Singh (Owner)',
    permissions: [
      {
        resource: 'vector-database',
        actions: ['upload', 'delete', 'manage', 'view-all']
      },
      {
        resource: 'users',
        actions: ['view', 'edit', 'delete', 'manage']
      },
      {
        resource: 'content',
        actions: ['upload', 'edit', 'delete', 'moderate']
      },
      {
        resource: 'analytics',
        actions: ['view', 'export']
      },
      {
        resource: 'system',
        actions: ['configure', 'maintain', 'backup']
      }
    ],
    usageLimits: {
      vectorUploads: 'unlimited',
      apiCalls: 'unlimited',
      storageGB: 'unlimited',
      aiRequests: 'unlimited',
      maxFileSize: 500 // 500MB for admin
    }
  }
];

// Default user limits (for non-admin users)
export const DEFAULT_USER_LIMITS: UsageLimits = {
  vectorUploads: 50, // 50 documents per month
  apiCalls: 1000, // 1000 API calls per month
  storageGB: 1, // 1GB storage
  aiRequests: 500, // 500 AI requests per month
  maxFileSize: 50 // 50MB max file size
};

// Check if user is admin
export const isAdmin = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;
  return ADMIN_USERS.some(admin => admin.email.toLowerCase() === userEmail.toLowerCase());
};

// Get admin user details
export const getAdminUser = (userEmail: string): AdminUser | null => {
  if (!userEmail) return null;
  return ADMIN_USERS.find(admin => admin.email.toLowerCase() === userEmail.toLowerCase()) || null;
};

// Check if user has specific permission
export const hasPermission = (userEmail: string, resource: string, action: string): boolean => {
  const adminUser = getAdminUser(userEmail);
  if (!adminUser) return false;
  
  const permission = adminUser.permissions.find(p => p.resource === resource);
  return permission ? permission.actions.includes(action) : false;
};

// Get user usage limits
export const getUserLimits = (userEmail: string): UsageLimits => {
  const adminUser = getAdminUser(userEmail);
  return adminUser ? adminUser.usageLimits : DEFAULT_USER_LIMITS;
};

// Check if user can perform action based on limits
export const canPerformAction = (
  userEmail: string, 
  action: keyof UsageLimits, 
  currentUsage: number = 0
): boolean => {
  const limits = getUserLimits(userEmail);
  const limit = limits[action];
  
  if (limit === 'unlimited') return true;
  if (typeof limit === 'number') return currentUsage < limit;
  
  return false;
};

// Admin role hierarchy
export const ROLE_HIERARCHY = {
  'owner': 4,
  'admin': 3,
  'moderator': 2,
  'user': 1
};

// Check if user has higher or equal role
export const hasRoleOrHigher = (userEmail: string, requiredRole: keyof typeof ROLE_HIERARCHY): boolean => {
  const adminUser = getAdminUser(userEmail);
  if (!adminUser) return requiredRole === 'user';
  
  const userRoleLevel = ROLE_HIERARCHY[adminUser.role];
  const requiredRoleLevel = ROLE_HIERARCHY[requiredRole];
  
  return userRoleLevel >= requiredRoleLevel;
};

// Get user role display
export const getUserRoleDisplay = (userEmail: string): string => {
  const adminUser = getAdminUser(userEmail);
  if (!adminUser) return 'User';
  
  return adminUser.role.charAt(0).toUpperCase() + adminUser.role.slice(1);
};

// Admin features that should be visible
export const ADMIN_FEATURES = {
  VECTOR_UPLOAD: 'vector-upload',
  USER_MANAGEMENT: 'user-management',
  ANALYTICS: 'analytics',
  SYSTEM_CONFIG: 'system-config',
  CONTENT_MODERATION: 'content-moderation'
};

// Check if admin feature should be visible
export const shouldShowAdminFeature = (userEmail: string, feature: string): boolean => {
  if (!isAdmin(userEmail)) return false;
  
  switch (feature) {
    case ADMIN_FEATURES.VECTOR_UPLOAD:
      return hasPermission(userEmail, 'vector-database', 'upload');
    case ADMIN_FEATURES.USER_MANAGEMENT:
      return hasPermission(userEmail, 'users', 'manage');
    case ADMIN_FEATURES.ANALYTICS:
      return hasPermission(userEmail, 'analytics', 'view');
    case ADMIN_FEATURES.SYSTEM_CONFIG:
      return hasPermission(userEmail, 'system', 'configure');
    case ADMIN_FEATURES.CONTENT_MODERATION:
      return hasPermission(userEmail, 'content', 'moderate');
    default:
      return false;
  }
};

// Export admin email for easy access
export const OWNER_EMAIL = 'thakurranveersingh505@gmail.com';
