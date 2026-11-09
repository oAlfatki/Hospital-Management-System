import { useState } from 'react';
import type { User } from '../types/User';
export function useUserFilters(users: User[]) {
  const [search, setSearch] = useState('');
  const term = search.trim().toLocaleLowerCase();
  const filteredUsers = users.filter(u => [u.userId, u.name, u.email, u.role, u.contactNumber, u.department].some(v => v?.toLocaleLowerCase().includes(term)));
  return { search, setSearch, filteredUsers };
}
