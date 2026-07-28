import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function StudentForm({ setStudent }) {
  const { login, setDemoRole } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Student",
  });

  const [roleSelectorType, setRoleSelectorType] = useState("radio"); // 'radio' or 'dropdown'
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);

  const roles = [
    { value: "Student", label: "🎓 Student", desc: "Access course catalog, track progress & earn certificates" },
    { value: "Instructor", label: "👨‍🏫 Instructor", desc: "Create courses, upload modules & monitor student performance" },
    { value: "Admin", label: "⚡ Admin", desc: "Manage portal metrics, user roles & system analytics" },
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear status message when editing
    if (statusMessage.text) {
      setStatusMessage({ type: "", text: "" });
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.email.trim()) {
      setStatusMessage({ type: "error", text: "Please enter your email address." });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setStatusMessage({ type: "error", text: "Please enter a valid email address." });
      return false;
    }
    if (!formData.password) {
      setStatusMessage({ type: "error", text: "Please enter a password." });
      return false;
    }
    if (formData.password.length < 6) {
      setStatusMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return false;
    }
    if (!formData.role) {
      setStatusMessage({ type: "error", text: "Please select a user role." });
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage({ type: "", text: "" });

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Primary API endpoint and fallback
      const apiEndpoints = [
        "http://localhost:5000/api/auth/register",
        "http://localhost:5000/students",
        "/api/auth/register",
        "/students"
      ];

      let response = null;
      let data = null;

      for (const endpoint of apiEndpoints) {
        try {
          response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });
          data = await response.json();
          if (response && response.ok) break;
        } catch (err) {
          // try next
        }
      }

      if (response && response.ok && data) {
        setStatusMessage({
          type: "success",
          text: data.message || "Registration Successful! Logging in...",
        });

        if (data.token) {
          login(data.token, data.student);
        } else {
          setDemoRole(formData.role);
        }

        setTimeout(() => {
          navigate("/dashboard");
        }, 800);
      } else {
        // Fallback demo account login
        setDemoRole(formData.role);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setDemoRole(formData.role);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-container" style={containerStyle}>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: "0 0 8px 0", color: "#f8fafc", fontSize: "24px" }}>
          🚀 Create Account
        </h2>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
          Join the Urban EdTech Portal to track progress and earn certificates
        </p>
      </div>

      {statusMessage.text && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor:
              statusMessage.type === "success"
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${
              statusMessage.type === "success" ? "#10b981" : "#ef4444"
            }`,
            color: statusMessage.type === "success" ? "#34d399" : "#fca5a5",
          }}
        >
          <span>{statusMessage.type === "success" ? "✅" : "⚠️"}</span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Full Name */}
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>
            Email Address <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="learner@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div>
          <label style={labelStyle}>
            Password <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ ...inputStyle, paddingRight: "45px" }}
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
                color: "#94a3b8",
                cursor: "pointer",
                padding: 0,
                fontSize: "14px",
              }}
            >
              {showPassword ? "👁️" : "🔒"}
            </button>
          </div>
        </div>

        {/* Role Selection header with mode toggle */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ ...labelStyle, margin: 0 }}>
              Select Role <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ fontSize: "12px", color: "#6366f1" }}>
              <button
                type="button"
                onClick={() => setRoleSelectorType(roleSelectorType === "radio" ? "dropdown" : "radio")}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#818cf8",
                  cursor: "pointer",
                  fontSize: "12px",
                  textDecoration: "underline",
                  padding: 0,
                  margin: 0,
                }}
              >
                Switch to {roleSelectorType === "radio" ? "Dropdown" : "Radio Buttons"}
              </button>
            </div>
          </div>

          {roleSelectorType === "dropdown" ? (
            /* Dropdown Role Selector */
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          ) : (
            /* Radio Button Role Selector */
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {roles.map((r) => (
                <label
                  key={r.value}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "10px",
                    background: formData.role === r.value ? "rgba(99, 102, 241, 0.15)" : "rgba(15, 23, 42, 0.5)",
                    border: `1px solid ${formData.role === r.value ? "#6366f1" : "rgba(99, 102, 241, 0.2)"}`,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={formData.role === r.value}
                    onChange={handleChange}
                    style={{ marginTop: "3px", accentColor: "#6366f1" }}
                  />
                  <div>
                    <div style={{ fontWeight: "600", color: "#f8fafc", fontSize: "14px" }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                      {r.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...buttonStyle,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Registering..." : "Complete Registration"}
        </button>
      </form>
    </div>
  );
}

const containerStyle = {
  background: "rgba(30, 41, 59, 0.8)",
  border: "1px solid rgba(99, 102, 241, 0.25)",
  backdropFilter: "blur(16px)",
  padding: "28px",
  borderRadius: "16px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
  maxWidth: "460px",
  width: "100%",
  margin: "0 auto",
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: "600",
  color: "#cbd5e1",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid rgba(99, 102, 241, 0.3)",
  background: "rgba(15, 23, 42, 0.6)",
  color: "#f8fafc",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
};

const buttonStyle = {
  marginTop: "10px",
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: "600",
  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
  transition: "all 0.3s ease",
};

export default StudentForm;
