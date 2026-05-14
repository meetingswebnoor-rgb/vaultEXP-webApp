// ============================================================
// Vault Types - Core business domain types
// ============================================================

export type VaultCategory = 'finance' | 'property' | 'business' | 'personal';
export type VaultStatus = 'active' | 'archived' | 'locked';

export interface IVault {
  id: string;
  name: string;
  description?: string;
  category: VaultCategory;
  status: VaultStatus;
  ownerId: string;
  organizationId?: string;
  members: IVaultMember[];
  metadata: IVaultMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface IVaultMember {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
}

export interface IVaultMetadata {
  totalAssets: number;
  totalValue?: number;
  currency?: string;
  tags: string[];
  customFields: Record<string, unknown>;
}

export interface IVaultEntry {
  id: string;
  vaultId: string;
  title: string;
  type: string;
  data: Record<string, unknown>;
  attachments: IAttachment[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}
