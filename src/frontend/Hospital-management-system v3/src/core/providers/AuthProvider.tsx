import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/src/features/users/types/User';
import { authService } from '@/src/features/auth/services/authService';
import axios from '../config/axios';
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();
  useEffect(() => {
    let active = true;
    localStorage.removeItem('hms_auth_session');
    axios.get<User>('/api/auth/session').then(r => { if (active) setUser(r.data); }).catch(() => { if (active) setUser(null); }).finally(() => { if (active) setIsLoading(false); });
    const expire = () => { setUser(null); queryClient.clear(); };
    window.addEventListener('hms:session-expired', expire);
    return () => { active = false; window.removeEventListener('hms:session-expired', expire); };
  }, [queryClient]);
  const login = async (email: string, pass: string) => {
    const res = await authService.login(email, pass);
    if (res.success) { queryClient.clear(); setUser(res.data); return { success: true }; }
    return { success: false, error: res.error.message };
  };
  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null); queryClient.clear();
  };
  return <AuthContext.Provider value={{ user, isLoading, setUser, login, logout, isAuthenticated: !!user }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
