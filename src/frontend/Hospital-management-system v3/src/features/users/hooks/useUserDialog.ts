import { useState } from 'react';
import type { User } from '../types/User';

export function useUserDialog() {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const openCreateDialog = () => {
    setMode('create');
    setSelectedUser(null);
    setIsOpen(true);
  };

  const openEditDialog = (user: User) => {
    setMode('edit');
    setSelectedUser(user);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedUser(null);
  };

  return {
    mode,
    isOpen,
    selectedUser,
    openCreateDialog,
    openEditDialog,
    closeDialog,
  };
}
