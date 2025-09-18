import React, { createContext, useContext, useMemo, useState } from 'react';
import { authenticate } from '../api';
import { LoginResponse, RoleName, UserDto } from '../types';

interface AuthContextValue {
  user: UserDto | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: RoleName[]) => boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LoginResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const response = await authenticate(email, password);
      setSession(response);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Invalid credentials.');
      throw err;
    }
  };

  const logout = () => setSession(null);

  const hasRole = (...roles: RoleName[]) => {
    if (!session?.user) return false;
    return roles.includes(session.user.role.name);
  };

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      login,
      logout,
      hasRole,
      error,
    }),
    [session, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
