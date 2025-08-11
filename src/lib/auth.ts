/**
 * Authentication utilities for the ERP system
 */

import { hash, compare } from 'bcryptjs';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
}

export function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export const ROLE_PERMISSIONS = {
  ADMIN: ['read:all', 'write:all', 'delete:all'],
  MANAGER: ['read:all', 'write:finance', 'write:crm', 'write:inventory'],
  ACCOUNTANT: ['read:all', 'write:finance'],
  SALES: ['read:all', 'write:crm'],
  USER: ['read:own']
};

export function hasPermission(userRole: string, permission: string): boolean {
  const rolePerms = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS] || [];
  return rolePerms.includes(permission);
}