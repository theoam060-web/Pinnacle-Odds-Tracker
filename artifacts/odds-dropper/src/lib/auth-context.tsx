import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

const JWT_KEY = "st_jwt";

interface AuthUser {
  id: string;
  email?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  token: string | null;
  getToken: () => string | null;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoaded: false,
  isSignedIn: false,
  token: null,
  getToken: () => null,
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get("session_token");
    if (sessionToken) {
      try { localStorage.setItem(JWT_KEY, sessionToken); } catch {}
      const clean = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", clean);
    }

    const stored = sessionToken ?? localStorage.getItem(JWT_KEY);
    if (!stored) {
      setIsLoaded(true);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${stored}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email ?? undefined });
          setToken(stored);
        } else {
          try { localStorage.removeItem(JWT_KEY); } catch {}
        }
      })
      .catch(() => {
        try { localStorage.removeItem(JWT_KEY); } catch {}
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const signOut = () => {
    try { localStorage.removeItem(JWT_KEY); } catch {}
    setUser(null);
    setToken(null);
    window.location.href = "/";
  };

  const getToken = (): string | null => {
    if (token) return token;
    try { return localStorage.getItem(JWT_KEY); } catch { return null; }
  };

  return (
    <AuthContext.Provider value={{ user, isLoaded, isSignedIn: !!user, token, getToken, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  return useContext(AuthContext);
}

export function getStoredToken(): string | null {
  try { return localStorage.getItem(JWT_KEY); } catch { return null; }
}
