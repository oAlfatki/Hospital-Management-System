import React, { createContext, useContext, useState } from 'react';
import type { User } from '@/src/features/users/types/User';
import { authService } from '@/src/features/auth/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Restore session from localStorage if available — no bypass
    const session = authService.getCurrentSession();
    return session.user ?? null;
  });

  const login = async (email: string, pass: string) => {
    console.log("start authService");
    const res = await authService.login(email, pass);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem(
        'hms_auth_session',
        JSON.stringify({ user: res.data, failedAttempts: 0 })
      );
      return { success: true };
    }
    return { success: false, error: res.success ? undefined : res.error?.message };
  };

  const logout = () => {
    authService.logout();
    // FIX: was setting back to defaultAdminUser — now correctly nulls out
    setUser(null);
    localStorage.removeItem('hms_auth_session');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: false,
        setUser,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
