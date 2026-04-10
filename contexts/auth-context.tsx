'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { encodeBase64 } from '@/lib/base64-utils';

export interface User {
  email: string;
  username: string;
  uid: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signup: (username: string, email: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // ✅ SIGNUP (username + email + password)
  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!username || !email || !password) {
        throw new Error('All fields are required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

      // Check email
      if (existingUsers.some((u: any) => u.email === email)) {
        throw new Error('Email already registered');
      }

      // Check username
      if (existingUsers.some((u: any) => u.username === username)) {
        throw new Error('Username already taken');
      }

      const newUser = {
        username,
        email,
        password: encodeBase64(password),
        uid: `user_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      existingUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));

      const userData = {
        username: newUser.username,
        email: newUser.email,
        uid: newUser.uid,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ LOGIN (username + password)
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      if (!username || !password) {
        throw new Error('Username and password are required');
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');

      const foundUser = users.find(
        (u: any) =>
          u.username === username &&
          u.password === encodeBase64(password)
      );

      if (!foundUser) {
        throw new Error('Invalid username or password');
      }

      const userData = {
        username: foundUser.username,
        email: foundUser.email,
        uid: foundUser.uid,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ HOOK
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}