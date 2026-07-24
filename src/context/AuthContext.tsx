import React, { createContext, useContext, useState, useEffect } from "react";
import { api, UserDTO } from "@/lib/api";

interface AuthContextType {
  user: UserDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, user: UserDTO) => void;
  register: (token: string, user: UserDTO) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredToken = (): string | null => {
  if (typeof window !== "undefined" && window.localStorage) {
    return localStorage.getItem("echoscan_token");
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    const savedToken = getStoredToken();
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.getProfile();
      if (res.success && res.user) {
        setUser(res.user);
        setToken(savedToken);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogin = (newToken: string, newUser: UserDTO) => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("echoscan_token", newToken);
    }
    setToken(newToken);
    setUser(newUser);
  };

  const handleRegister = (newToken: string, newUser: UserDTO) => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem("echoscan_token", newToken);
    }
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem("echoscan_token");
    }
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
