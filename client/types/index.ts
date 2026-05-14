/**
 * Core Domain Types
 */

export type BusinessType = 'sole_proprietor' | 'partnership' | 'llc' | 'corporation' | 'nonprofit' | 'freelance' | 'agency' | 'other';

export interface Business {
  _id: string;
  id: string;
  name: string;
  type: BusinessType;
  industry?: string;
  description?: string;
  currency: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export type PropertyType = 'residential' | 'commercial' | 'industrial' | 'land' | 'mixed_use';

export interface Property {
  _id: string;
  id: string;
  name: string;
  type: PropertyType;
  address: string;
  purchaseValue?: number;
  currentValue?: number;
  currency: string;
  tenantCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  _id: string;
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rentAmount: number;
  status: 'active' | 'inactive' | 'vacated' | 'evicted';
  leaseStartDate: string;
  leaseEndDate?: string;
}

export interface Wallet {
  _id: string;
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment' | 'crypto' | 'cash' | 'other';
  balance: number;
  currency: string;
  provider?: string;
}

export interface Investment {
  _id: string;
  id: string;
  name: string;
  ticker?: string;
  type: 'stock' | 'etf' | 'crypto' | 'mutual_fund' | 'real_estate' | 'bond' | 'business' | 'manual_asset';
  amountInvested: number;
  currentValue: number;
  currency: string;
  status: 'active' | 'sold' | 'partially_sold';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}
