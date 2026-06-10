'use server';

import prisma from '@/lib/prisma';
import { UserRepository } from '@/repository/user.repository';
import type { User, Department, Role } from '@/lib/types';
import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { authCookie, serverAuthService } from '@/services/auth-server.service';

export interface CreateUserInput {
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
  password?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: Role;
  departmentId?: string;
  password?: string;
}

function toSafeUser(user: any): User {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role as Role,
    departmentId: user.departmentId ? String(user.departmentId) : undefined,
    department: user.department
      ? {
          id: String(user.department.id),
          name: user.department.name,
        }
      : undefined,
    createdAt: user.createdAt.toISOString(),
  };
}

function toSafeDepartment(dept: any): Department {
  return {
    id: String(dept.id),
    name: dept.name,
  };
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export async function getUsers(): Promise<User[]> {
  const dbUsers = await UserRepository.findAll();
  return dbUsers.map(toSafeUser);
}

export async function getDepartments(): Promise<Department[]> {
  const dbDepts = await prisma.department.findMany({
    orderBy: { name: 'asc' },
  });
  return dbDepts.map(toSafeDepartment);
}

export async function getUsersByRole(role: Role): Promise<User[]> {
  const dbUsers = await prisma.user.findMany({
    where: {
      role: role as any,
      isActive: true,
    },
    include: {
      department: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
  return dbUsers.map(toSafeUser);
}

export async function getUserById(id: string): Promise<User | null> {
  const dbUser = await UserRepository.findById(Number(id));
  return dbUser ? toSafeUser(dbUser) : null;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const passwordHash = input.password ? hashPassword(input.password) : undefined;
  const dbUser = await UserRepository.create({
    name: input.name,
    email: input.email.toLowerCase(),
    role: input.role as any,
    departmentId: input.departmentId ? Number(input.departmentId) : null,
    password: passwordHash,
  });
  return toSafeUser(dbUser);
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
  const updateData: any = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.email !== undefined) updateData.email = input.email.toLowerCase();
  if (input.role !== undefined) updateData.role = input.role as any;
  if (input.departmentId !== undefined) {
    updateData.departmentId = input.departmentId ? Number(input.departmentId) : null;
  }
  if (input.password) {
    updateData.password = hashPassword(input.password);
  }
  const dbUser = await UserRepository.update(Number(id), updateData);
  return dbUser ? toSafeUser(dbUser) : null;
}

export async function deleteUser(id: string): Promise<boolean> {
  await UserRepository.delete(Number(id));
  return true;
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authCookie.name)?.value;
    const authResult = await serverAuthService.authenticateToken(token);
    
    if (!authResult.success || !authResult.user) {
      return { success: false, error: 'Unauthorized.' };
    }
    
    const userId = Number(authResult.user.id);
    const dbUser = await UserRepository.findById(userId);
    if (!dbUser) {
      return { success: false, error: 'User not found.' };
    }
    
    const isCurrentValid = serverAuthService.verifyPassword(currentPassword, dbUser.password);
    if (!isCurrentValid) {
      return { success: false, error: 'Incorrect current password.' };
    }
    
    const newPasswordHash = hashPassword(newPassword);
    await UserRepository.updatePassword(userId, newPasswordHash);
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'An error occurred while updating the password.' };
  }
}
