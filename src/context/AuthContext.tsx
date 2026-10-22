// ============================================================
// HARVESTLINK - Auth Context (Demo Mode)
// ============================================================

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Profile, UserRole } from '../types';
import { DEMO_PROFILES, DEMO_CREDENTIALS } from '../data/demoData';

interface AuthContextValue {
  user: Profile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (email: string, password: string, role: UserRole, displayName: string) => Promise<{ error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_APP_MODE === 'demo';

const SESSION_KEY = 'harvestlink_demo_session';

function loadSessionFromStorage(): Profile | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(loadSessionFromStorage);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate network delay

    if (DEMO_MODE) {
      const cred = DEMO_CREDENTIALS.find(
        c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
      );
      if (!cred) {
        setIsLoading(false);
        return { error: 'Invalid email or password. Use demo credentials from the login page.' };
      }
      const profile = DEMO_PROFILES.find(p => p.email === cred.email);
      if (!profile) {
        setIsLoading(false);
        return { error: 'Profile not found.' };
      }
      setUser(profile);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile));
      setIsLoading(false);
      return {};
    }

    // Supabase mode would go here
    setIsLoading(false);
    return { error: 'Supabase not configured. Running in demo mode.' };
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    role: UserRole,
    displayName: string
  ): Promise<{ error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    if (DEMO_MODE) {
      // In demo mode, create a temporary profile
      if (role === 'admin') {
        setIsLoading(false);
        return { error: 'Admin accounts cannot be created through public registration.' };
      }
      const newProfile: Profile = {
        id: `demo-new-${Date.now()}`,
        email,
        role,
        displayName,
        preferredLanguage: 'en',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(newProfile);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(newProfile));
      setIsLoading(false);
      return {};
    }

    setIsLoading(false);
    return { error: 'Supabase not configured.' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isDemoMode: DEMO_MODE, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { DEMO_MODE };
