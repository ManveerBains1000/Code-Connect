import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while restoring session

  // On mount — verify JWT cookie with backend and restore session
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/me");
        setUser(data.user);
      } catch {
        setUser(null); // cookie missing, expired, or invalid
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const signup = async (username, email, password) => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/signup", { username, email, password });
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/login", { email, password });
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (e) {
      console.error("Logout error:", e.message);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, login, logout, isSignedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
