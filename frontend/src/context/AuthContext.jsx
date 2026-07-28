import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Helper to decode JWT token payload safely without external dependencies
export const decodeJWT = (token) => {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to decode JWT token:", err);
    return null;
  }
};

// Helper to create a signed mock JWT string for client-side demo role switching
export const createDemoToken = (role, name = "Demo User", email = "demo@urbanedtech.edu") => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      id: `demo_${role.toLowerCase()}_${Date.now()}`,
      name: role === "Admin" ? "System Admin" : role === "Instructor" ? "Prof. Urban" : name,
      email: email,
      role: role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    })
  );
  const signature = btoa("demo_signature");
  return `${header}.${payload}.${signature}`;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount or token change
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const decoded = decodeJWT(storedToken);
        if (decoded) {
          // Check expiration
          if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            console.warn("JWT Token expired, logging out");
            logout();
          } else {
            setToken(storedToken);
            setUser({
              _id: decoded.id || decoded._id,
              name: decoded.name || "Urban Learner",
              email: decoded.email || "",
              role: decoded.role || "Student",
            });
            setRole(decoded.role || "Student");
          }
        } else {
          // Invalid token format
          logout();
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = (newToken, userData = null) => {
    if (!newToken) return;
    localStorage.setItem("token", newToken);
    setToken(newToken);

    const decoded = decodeJWT(newToken);
    const userRole = userData?.role || decoded?.role || "Student";
    const userObj = {
      _id: userData?._id || decoded?.id || decoded?._id || "usr_demo",
      name: userData?.name || decoded?.name || "Urban Learner",
      email: userData?.email || decoded?.email || "",
      role: userRole,
    };

    setUser(userObj);
    setRole(userRole);
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setRole(null);
  };

  // Switch demo role dynamically for testing Admin / Student / Instructor perspectives
  const setDemoRole = (newRole) => {
    const demoToken = createDemoToken(newRole);
    login(demoToken);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        setDemoRole,
        decodeJWT,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
