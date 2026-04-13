import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AuthUser,
  getCurrentUser,
  login as apiLogin,
  apiLoginGoogle,
  apiLoginMicrosoft,
  api2faLogin,
  register as apiRegister,
  logout as apiLogout,
} from '../api/exchange';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean; tempToken?: string }>;
  loginGoogle: (credential: string) => Promise<void>;
  loginMicrosoft: (credential: string) => Promise<void>;
  complete2FA: (tempToken: string, code: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const existingUser = getCurrentUser();
    setUser(existingUser);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    if (result.requires2FA) {
      return { requires2FA: true, tempToken: result.tempToken };
    }
    if (result.user) setUser(result.user);
    return {};
  };

  const complete2FA = async (tempToken: string, code: string) => {
    const result = await api2faLogin(tempToken, code);
    setUser(result.user);
  };

  const loginGoogle = async (credential: string) => {
    const result = await apiLoginGoogle(credential);
    setUser(result.user);
  };

  const loginMicrosoft = async (credential: string) => {
    const result = await apiLoginMicrosoft(credential);
    setUser(result.user);
  };

  const register = async (email: string, password: string, displayName?: string) => {
    await apiRegister(email, password, displayName);
    // User is created but must verify email before logging in.
    // We intentionally do not call setUser here.
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, loginGoogle, loginMicrosoft, complete2FA, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
