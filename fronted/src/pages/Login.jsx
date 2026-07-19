import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Award, Shield } from "lucide-react";
import { api, setToken, setUser } from "../utils/api";

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data);
      if (onLoginSuccess) onLoginSuccess(data);
      
      // Redirect based on role
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "85vh",
      padding: "1rem"
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: "100%",
        maxWidth: "460px",
        padding: "2.5rem",
        border: "1px solid var(--border-glass)",
        background: "rgba(17, 24, 39, 0.75)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
          <div style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, var(--primary), var(--accent-teal))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
            boxShadow: "0 8px 24px rgba(99, 102, 241, 0.3)"
          }}>
            <Award size={32} style={{ color: "#ffffff" }} />
          </div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.25rem" }}>Welcome Back</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Unifying urban education, one module at a time.
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.2)",
            color: "var(--accent-rose)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ width: "100%", paddingLeft: "2.5rem" }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ width: "100%", paddingLeft: "2.5rem" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: "100%", marginTop: "1rem", height: "46px" }}
            disabled={loading}
          >
            {loading ? "Signing In..." : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem" }}>
          <span style={{ color: "var(--text-secondary)" }}>Don't have an account? </span>
          <Link to="/register" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
            Register here
          </Link>
        </div>

        <div style={{ 
          marginTop: "1.5rem", 
          padding: "0.75rem", 
          background: "rgba(255, 255, 255, 0.02)", 
          borderRadius: "8px", 
          fontSize: "0.8rem", 
          color: "var(--text-muted)",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center"
        }}>
          <Shield size={16} style={{ color: "var(--accent-teal)" }} />
          <span>Demo tip: To register an admin account, select the "Admin" role on the sign up page!</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
