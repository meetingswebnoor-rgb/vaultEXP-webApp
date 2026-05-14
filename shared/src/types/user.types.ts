// ============================================================
// User Types - Shared between client and server
// ============================================================

export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  subscription: SubscriptionTier;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserProfile extends IUser {
  phone?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  preferences: IUserPreferences;
}

export interface IUserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
}
