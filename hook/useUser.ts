'use client';

import { useCallback, useState } from 'react';
import type { Department, Role, User } from '@/lib/types';
import {
  userService,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/services/user.service';

export function useUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T,>(action: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      return await action();
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unable to load users.';
      setError(message);
      throw caughtError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    const result = await run(() => userService.getUsers());
    setUsers(result);
    return result;
  }, [run]);

  const loadDepartments = useCallback(async () => {
    const result = await run(() => userService.getDepartments());
    setDepartments(result);
    return result;
  }, [run]);

  const loadUsersByRole = useCallback(
    async (role: Role) => {
      const result = await run(() => userService.getUsersByRole(role));
      setUsers(result);
      return result;
    },
    [run]
  );

  const getUserById = useCallback(
    async (id: string) => {
      const result = await run(() => userService.getUserById(id));
      setSelectedUser(result);
      return result;
    },
    [run]
  );

  const createUser = useCallback(
    async (input: CreateUserInput) => {
      const result = await run(() => userService.createUser(input));
      setUsers((current) => [result, ...current]);
      return result;
    },
    [run]
  );

  const updateUser = useCallback(
    async (id: string, input: UpdateUserInput) => {
      const result = await run(() => userService.updateUser(id, input));

      if (result) {
        setUsers((current) => current.map((user) => (user.id === id ? result : user)));
        setSelectedUser((current) => (current?.id === id ? result : current));
      }

      return result;
    },
    [run]
  );

  const deleteUser = useCallback(
    async (id: string) => {
      const result = await run(() => userService.deleteUser(id));

      if (result) {
        setUsers((current) => current.filter((user) => user.id !== id));
        setSelectedUser((current) => (current?.id === id ? null : current));
      }

      return result;
    },
    [run]
  );

  return {
    users,
    departments,
    selectedUser,
    isLoading,
    error,
    loadUsers,
    loadDepartments,
    loadUsersByRole,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  };
}
