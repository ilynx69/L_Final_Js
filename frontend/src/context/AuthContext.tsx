"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../lib/types";
import { ApiClient } from "../lib/api";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, passwordHash: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await ApiClient.auth.me();
        setUser(currentUser);
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Simple route protection logic
  useEffect(() => {
    if (loading) return;

    if (!user && pathname !== "/login") {
      router.push("/login");
    } else if (user) {
      if (pathname === "/login" || pathname === "/") {
        if (user.role === "TEACHER") {
          router.push("/teacher");
        } else {
          router.push("/student");
        }
      } else if (pathname.startsWith("/student") && user.role !== "STUDENT") {
        router.push("/teacher");
      } else if (pathname.startsWith("/teacher") && user.role !== "TEACHER") {
        router.push("/student");
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, passwordHash: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await ApiClient.auth.login(email, passwordHash);
      if (response.success && response.user) {
        setUser(response.user);
        if (response.user.role === "TEACHER") {
          router.push("/teacher");
        } else {
          router.push("/student");
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await ApiClient.auth.logout();
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
