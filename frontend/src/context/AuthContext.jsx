import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "silver-shield-auth";

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { token: "", user: null };
  } catch {
    return { token: "", user: null };
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(loadStoredAuth);

  const login = (payload) => {
    const next = {
      token: payload.token,
      user: payload.user,
    };
    setAuthState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const logout = () => {
    const next = { token: "", user: null };
    setAuthState(next);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      token: authState.token,
      user: authState.user,
      isAuthenticated: Boolean(authState.token),
      isAdmin: authState.user?.role === "admin",
      login,
      logout,
    }),
    [authState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
