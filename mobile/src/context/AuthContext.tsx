import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, saveToken, getToken, clearToken } from '../api/client';

type User = {
  id: string;
  phoneNumber?: string;
  email?: string;
  gender: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  coinBalance: number;
  freeCallUsed: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string, isEmail: boolean) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: (u: User) => void;
};

const AuthContext = createContext<AuthContextType>(null as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      // في نسخة كاملة: استدعِ /users/me هنا لجلب بيانات المستخدم الحالية
      setLoading(false);
    })();
  }, []);

  async function login(identifier: string, password: string, isEmail: boolean) {
    const body = isEmail
      ? { email: identifier, password }
      : { phoneNumber: identifier, password };
    const { data } = await api.post('/auth/login', body);
    await saveToken(data.token);
    setUser(data.user);
  }

  async function register(payload: any) {
    const { data } = await api.post('/auth/register', payload);
    await saveToken(data.token);
    setUser(data.user);
  }

  async function logout() {
    await clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser: setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
