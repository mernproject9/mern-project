import { useState } from "react";

export default function LoginForm({ onLoginSuccess, onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("Computer Science & AI");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [tokenResult, setTokenResult] = useState(null);

  const API_URL = "http://localhost:5000/api/auth";

  // Helper to parse JWT payload for client display
  const decodeJwtPayload = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const fillQuickPreset = (presetRole) => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsRegister(false);
    if (presetRole === "student") {
      setEmail("student@urban.edu");
      setPassword("password123");
    } else {
      setEmail("admin@urban.edu");
      setPassword("admin123");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const endpoint = isRegister ? `${API_URL}/register` : `${API_URL}/login`;
    const payload = isRegister
      ? { name, email, password, role, department }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Acceptance Criteria Verification:
      // 1. User receives JWT token
      // 2. JWT includes user ID and role in payload
      // 4. Stored securely on client side (localStorage)
      const jwtToken = data.token;
      const decodedPayload = decodeJwtPayload(jwtToken);

      // Secure client storage
      localStorage.setItem("urban_edu_token", jwtToken);
      localStorage.setItem("urban_edu_user", JSON.stringify(data.user));

      setTokenResult({
        rawToken: jwtToken,
        payload: decodedPayload,
        user: data.user
      });

      setSuccessMessage(isRegister ? "Account registered and logged in successfully!" : "Authentication successful! JWT token received & stored.");

      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({
            token: jwtToken,
            user: data.user,
            decoded: decodedPayload
          });
        }
      }, 1200);

    } catch (err) {
      console.error("Auth error:", err);
      // Acceptance Criteria 3: Invalid credentials rejected with error message
      setErrorMessage(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "480px",
          width: "100%",
          borderRadius: "var(--radius-lg)",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)"
        }}
      >
        {/* Header */}
        <div style={{ padding: "1.5rem 1.5rem 1rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff"
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", margin: 0 }}>{isRegister ? "Create Account" : "Welcome Back"}</h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>
                {isRegister ? "Register for Urban EdTech Portal" : "Sign in to access your course dashboard"}
              </p>
            </div>
          </div>
          {onClose && (
            <button className="icon-btn" onClick={onClose} style={{ background: "transparent", border: "none" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Quick Demo Login Presets */}
        <div style={{ padding: "1rem 1.5rem 0.5rem", background: "rgba(99, 102, 241, 0.05)", borderBottom: "1px solid var(--border-color)" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
            ⚡ Demo Quick Presets:
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => fillQuickPreset("student")}
              style={{
                flex: 1,
                padding: "0.4rem 0.6rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                background: "rgba(99, 102, 241, 0.1)",
                color: "var(--text-primary)",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.3rem"
              }}
            >
              🎓 Student Demo
            </button>
            <button
              type="button"
              onClick={() => fillQuickPreset("admin")}
              style={{
                flex: 1,
                padding: "0.4rem 0.6rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                background: "rgba(168, 85, 247, 0.1)",
                color: "var(--text-primary)",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.3rem"
              }}
            >
              👑 Admin Demo
            </button>
          </div>
        </div>

        {/* Body Form */}
        <div style={{ padding: "1.5rem" }}>
          {/* Error Message Box */}
          {errorMessage && (
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-sm)",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              fontSize: "0.85rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div style={{
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-sm)",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
              fontSize: "0.85rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {isRegister && (
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--text-secondary)" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem"
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--text-secondary)" }}>
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  placeholder="name@urban.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem"
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  Password
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 2.5rem 0.65rem 0.85rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer"
                  }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.35rem", color: "var(--text-secondary)" }}>
                  Account Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                    fontSize: "0.9rem"
                  }}
                >
                  <option value="student">Student Learner</option>
                  <option value="admin">Platform Admin</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.95rem",
                fontWeight: 600,
                marginTop: "0.5rem",
                justifyContent: "center"
              }}
            >
              {loading ? (
                <span>Authenticating & Issuing Token...</span>
              ) : isRegister ? (
                "Create Account & Issue JWT"
              ) : (
                "Sign In with JWT Auth"
              )}
            </button>
          </form>

          {/* Toggle between Register / Login */}
          <div style={{ marginTop: "1.25rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            {isRegister ? "Already have an account?" : "Don't have an account yet?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-primary)",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              {isRegister ? "Sign In" : "Register Now"}
            </button>
          </div>

          {/* Token Payload Verification Card (Displays payload details when authenticated) */}
          {tokenResult && (
            <div style={{
              marginTop: "1.5rem",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              background: "var(--bg-primary)",
              border: "1px dashed var(--accent-primary)",
              fontSize: "0.8rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 700, color: "var(--accent-success)" }}>✓ JWT Issued & Stored</span>
                <span className={`badge badge-${tokenResult.user.role === 'admin' ? 'completed' : 'in-progress'}`}>
                  Role: {tokenResult.user.role}
                </span>
              </div>
              <div style={{ color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                <strong>User ID:</strong> {tokenResult.payload?.id || tokenResult.user.id}
              </div>
              <div style={{ color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                <strong>Payload Email:</strong> {tokenResult.payload?.email}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", wordBreak: "break-all", fontFamily: "monospace", background: "rgba(0,0,0,0.3)", padding: "0.5rem", borderRadius: "4px" }}>
                <strong>JWT:</strong> {tokenResult.rawToken.substring(0, 45)}...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
