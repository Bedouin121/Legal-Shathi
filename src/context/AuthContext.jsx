import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "@/services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authAPI
        .getMe()
        .then((data) => {
          // Always set user if token exists (email is now verified by OTP flow)
          setUser(data);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    
    // Check if email verification is required
    if (data.requiresVerification) {
      throw new Error(data.message);
    }
    
    localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authAPI.register({ name, email, password });
    localStorage.setItem("token", data.token);
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint (optional, for API consistency)
      await authAPI.logout();
    } catch (error) {
      console.warn("Logout API call failed:", error);
    } finally {
      // Always clear local state regardless of API call success
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  const updateFavorites = (favorites) => {
    setUser((prev) => (prev ? { ...prev, favorites } : prev));
  };

  const updateUser = (userData) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : userData));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateFavorites, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
