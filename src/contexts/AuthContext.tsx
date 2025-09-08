'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'employee';
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('welink_auth_token');
        if (token) {
          // Get user ID from token
          const userId = token.replace('token-', '');
          
          // Get all users and find the current one
          const response = await fetch('http://localhost:3000/api/v1/users');
          if (response.ok) {
            const users = await response.json();
            const userData = users.find((u: { id: string }) => u.id === userId);
            
            if (userData) {
              setUser({ 
                ...userData, 
                token, 
                name: userData.username,
                role: userData.role as 'admin' | 'employee'
              });
              return;
            }
          }
          
          // If we get here, the token is invalid
          localStorage.removeItem('welink_auth_token');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('welink_auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const { user: userData, token } = await response.json();
      
      if (!userData || !token) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('welink_auth_token', token);
      setUser({ ...userData, token, name: userData.name || userData.username });
      router.push('/checkpoint');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // The backend doesn't have a specific logout endpoint, just clear the token locally
      localStorage.removeItem('welink_auth_token');
      setUser(null);
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('welink_auth_token');
      setUser(null);
      router.push('/checkpoint/login');
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
