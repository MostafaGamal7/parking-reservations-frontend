import { AuthResponse, User } from "@/types";
import { authApi } from "./api";

// Token management utilities
export const TOKEN_KEY = "welink_auth_token";
export const USER_KEY = "welink_user_data";

export interface LoginCredentials {
  username: string;
  password: string;
  role: "employee" | "admin";
}

export interface StoredAuthData {
  user: User;
  token: string;
  timestamp: number;
}

// Token storage and retrieval
export const storeAuthData = (authData: AuthResponse): void => {
  if (typeof window === "undefined") return;

  const dataToStore: StoredAuthData = {
    user: authData.user,
    token: authData.token,
    timestamp: Date.now(),
  };

  localStorage.setItem(TOKEN_KEY, authData.token);
  localStorage.setItem(USER_KEY, JSON.stringify(dataToStore));
};

export const getStoredAuthData = (): StoredAuthData | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedData = localStorage.getItem(USER_KEY);
    if (!storedData) return null;

    const authData: StoredAuthData = JSON.parse(storedData);

    // Check if data is older than 24 hours
    const isExpired = Date.now() - authData.timestamp > 24 * 60 * 60 * 1000;
    if (isExpired) {
      clearAuthData();
      return null;
    }

    return authData;
  } catch {
    clearAuthData();
    return null;
  }
};

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const clearAuthData = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Token validation
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

export const isTokenExpiring = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = payload.exp - currentTime;
    // Consider token expiring if it expires within 5 minutes
    return timeUntilExpiry < 300;
  } catch {
    return true;
  }
};

// Authentication functions
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const response = await authApi.login(credentials);
    storeAuthData(response);
    return response;
  } catch (error) {
    clearAuthData();
    throw error;
  }
};

export const logout = (): void => {
  clearAuthData();
};

// No refreshToken endpoint on backend; keep a stub to avoid breaking imports
export const refreshToken = async (): Promise<string | null> => {
  return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const authData = getStoredAuthData();
  if (!authData) return false;

  const token = getStoredToken();
  if (!token) return false;

  return !isTokenExpired(token);
};

// Get current user
export const getCurrentUser = (): User | null => {
  const authData = getStoredAuthData();
  return authData?.user || null;
};
