import { createContext, useEffect, useState } from "react";
import type { Autentication } from "../types/Usuario.type";

interface AuthContextType {
  auth: Autentication | null;
  login: (data: Autentication) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<Autentication | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auth");
    if (stored) {
      setAuth(JSON.parse(stored));
    }
  }, []);

  const login = (data: Autentication) => {
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setAuth(null);
  };

  /*
  const hasRole = (role: string): boolean => {
    return auth?.roles?.includes(role as any) ?? false
  }
    */
  const hasRole = (role: string): boolean => {
    if (!auth?.roles) return false
    return auth.roles.some(r => {
      if (typeof r === 'object' && r !== null) {
        return (r as any).nombre === role
      }
      return r === role
    })
  }

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        isAuthenticated: !!auth?.token,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

