import { useState, useEffect } from "react";

export default function JwtTokenModal({ studentToken, adminToken, onClose }) {
  const [copiedRole, setCopiedRole] = useState(null);
  const [testResponse, setTestResponse] = useState(null);
  const [testing, setTesting] = useState(false);

  const copyToClipboard = (text, role) => {
    navigator.clipboard.writeText(text);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const testApiRoute = async (route, token, expectedRole) => {
    setTesting(true);
    setTestResponse(null);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(route, { headers });
      const data = await res.json();
      setTestResponse({
        route,
        tokenRole: expectedRole || "No Token",
        status: res.status,
        data
      });
    } catch (err) {
      setTestResponse({
        route,
        tokenRole: expectedRole || "No Token",
        status: 500,
        data: { message: err.message }
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)" }}>🔑 JWT Authentication & Role Inspection</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Verify JWT tokens and test 401 & 403 authorization rules</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Tokens Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            {/* Student Token */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "1rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#818cf8" }}>🎓 Student Role JWT</span>
                <button
                  className="btn-secondary"
                  onClick={() => copyToClipboard(`Bearer ${studentToken}`, "student")}
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.72rem" }}
                >
                  {copiedRole === "student" ? "Copied! ✓" : "Copy Bearer"}
                </button>
              </div>
              <div style={{
                background: "var(--bg-primary)",
                padding: "0.5rem",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontFamily: "monospace",
                wordBreak: "break-all",
                color: "var(--text-secondary)",
                maxHeight: "60px",
                overflowY: "auto"
              }}>
                {studentToken}
              </div>
              <button
                className="btn-secondary"
                onClick={() => testApiRoute("/api/admin/overview", studentToken, "Student")}
                disabled={testing}
                style={{ width: "100%", marginTop: "0.75rem", fontSize: "0.78rem", justifyContent: "center" }}
              >
                Test Admin Route (Expect 403 Forbidden)
              </button>
            </div>

            {/* Admin Token */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-md)",
              padding: "1rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f87171" }}>🛡️ Admin Role JWT</span>
                <button
                  className="btn-secondary"
                  onClick={() => copyToClipboard(`Bearer ${adminToken}`, "admin")}
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.72rem" }}
                >
                  {copiedRole === "admin" ? "Copied! ✓" : "Copy Bearer"}
                </button>
              </div>
              <div style={{
                background: "var(--bg-primary)",
                padding: "0.5rem",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontFamily: "monospace",
                wordBreak: "break-all",
                color: "var(--text-secondary)",
                maxHeight: "60px",
                overflowY: "auto"
              }}>
                {adminToken}
              </div>
              <button
                className="btn-primary"
                onClick={() => testApiRoute("/api/admin/overview", adminToken, "Admin")}
                disabled={testing}
                style={{ width: "100%", marginTop: "0.75rem", fontSize: "0.78rem", justifyContent: "center" }}
              >
                Test Admin Route (Expect 200 OK)
              </button>
            </div>
          </div>

          {/* Test without any token */}
          <div style={{ textAlign: "center" }}>
            <button
              className="btn-secondary"
              onClick={() => testApiRoute("/api/admin/overview", null, "None")}
              disabled={testing}
              style={{ fontSize: "0.8rem" }}
            >
              ⚠️ Test Request Without Token (Expect 401 Unauthorized)
            </button>
          </div>

          {/* Test Live Response Panel */}
          {testResponse && (
            <div style={{
              background: testResponse.status === 200 ? "rgba(16, 185, 129, 0.1)" : (testResponse.status === 403 ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)"),
              border: `1px solid ${testResponse.status === 200 ? "var(--accent-success)" : (testResponse.status === 403 ? "var(--accent-warning)" : "#f87171")}`,
              borderRadius: "var(--radius-md)",
              padding: "1rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                  Tested Target: <code>{testResponse.route}</code>
                </span>
                <span style={{
                  padding: "0.2rem 0.6rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  background: testResponse.status === 200 ? "var(--accent-success)" : (testResponse.status === 403 ? "#fbbf24" : "#ef4444"),
                  color: testResponse.status === 403 ? "black" : "white"
                }}>
                  HTTP {testResponse.status} {testResponse.status === 403 ? "FORBIDDEN" : (testResponse.status === 401 ? "UNAUTHORIZED" : "OK")}
                </span>
              </div>
              <pre style={{
                background: "var(--bg-primary)",
                padding: "0.75rem",
                borderRadius: "6px",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                overflowX: "auto",
                maxHeight: "150px"
              }}>
                {JSON.stringify(testResponse.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
