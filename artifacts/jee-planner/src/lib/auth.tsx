import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthUser {
  id: number;
  username: string;
}

interface AuthStatus {
  loggedIn: boolean;
  hasUser: boolean;
  username?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  hasUser: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<string | null>;
  setup: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hasUser, setHasUser] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch("/api/auth/status", { credentials: "include" });
      const data: AuthStatus = await res.json();
      setHasUser(data.hasUser);
      if (data.loggedIn && data.username) {
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        if (meRes.ok) {
          const me: AuthUser = await meRes.json();
          setUser(me);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function login(username: string, password: string): Promise<string | null> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Login failed";
    setUser(data);
    setHasUser(true);
    return null;
  }

  async function setup(username: string, password: string): Promise<string | null> {
    const res = await fetch("/api/auth/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Setup failed";
    setUser(data);
    setHasUser(true);
    return null;
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, hasUser, loading, login, setup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
