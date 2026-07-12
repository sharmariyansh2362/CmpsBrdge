import React, { createContext, useState, useEffect, useContext } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";
  const buildUrl = (path) => {
    return path.startsWith("http") ? path : `${BACKEND_URL}${path}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(buildUrl("/api/auth/me"), {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (!data.error) setUser(data);
        })
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password, role) => {
    const res = await fetch(buildUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Login request failed', data);
      throw new Error(data.error || "Login request failed");
    }
    if (data.token) {
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error };
  };

  const logout = async () => {
    await fetch(buildUrl("/api/auth/logout"), {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    localStorage.removeItem("token");
    setUser(null);
  };

  const apiCall = async (path, options = {}) => {
    const token = localStorage.getItem("token");
    const url = buildUrl(path);
    const defaults = {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {})
      }
    };
    const merged = { ...defaults, ...options };
    const res = await fetch(url, merged);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Network error");
    return data;
  };

  return (
    <AppContext.Provider value={{ user, setUser, loading, login, logout, apiCall }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
