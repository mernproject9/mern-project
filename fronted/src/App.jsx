import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Catalog from "./pages/Catalog";
import LearnerDashboard from "./pages/LearnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { getUser, api } from "./utils/api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session state on load
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = getUser();
      if (storedUser) {
        setUser(storedUser);
        try {
          // Verify with backend to ensure session is still valid
          const verifiedUser = await api.getMe();
          setUser({ ...storedUser, ...verifiedUser });
        } catch (error) {
          console.error("Token verification failed:", error);
          // Don't log out immediately if server is temporarily unreachable,
          // but if it's an auth error (e.g. 401), we could clear storage.
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--bg-primary)"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255,255,255,0.1)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        {user && <Navbar onLogout={handleLogout} />}
        
        <main className="main-content">
          <Routes>
            {/* Public/Auth Routes */}
            <Route 
              path="/login" 
              element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace /> : <Register onRegisterSuccess={handleLoginSuccess} />} 
            />

            {/* Protected Student Routes */}
            <Route 
              path="/dashboard" 
              element={user ? (user.role === "admin" ? <Navigate to="/admin" replace /> : <LearnerDashboard />) : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/catalog" 
              element={user ? <Catalog /> : <Navigate to="/login" replace />} 
            />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={user && user.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" replace />} 
            />

            {/* Fallback routing */}
            <Route 
              path="*" 
              element={<Navigate to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"} replace />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;