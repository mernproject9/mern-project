import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourseProgressView from "../components/CourseProgressView";
import AdminCourseForm from "../components/AdminCourseForm";
import AdminProgressReports from "../components/AdminProgressReports";
import CertificateModal from "../components/CertificateModal";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, role, setDemoRole } = useAuth();
  const location = useLocation();

  // Tab state for Admin / Instructor
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'analytics', 'add-course', 'certificates'
  const [showCertModal, setShowCertModal] = useState(false);

  // Check URL query parameters for tab navigation (e.g. ?tab=add-course)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab");
    if (tabParam) {
      if (tabParam === "add-course") setActiveTab("add-course");
      else if (tabParam === "analytics") setActiveTab("analytics");
      else if (tabParam === "certificates") setActiveTab("certificates");
    }
  }, [location.search]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0f172a" }}>
      <div className="container" style={{ flex: 1 }}>
        <Navbar />

        {/* Interactive Role Status & Quick Switcher Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))",
            border: `1px solid ${
              role === "Admin"
                ? "rgba(245, 158, 11, 0.4)"
                : role === "Instructor"
                ? "rgba(99, 102, 241, 0.4)"
                : "rgba(16, 185, 129, 0.4)"
            }`,
            borderRadius: "16px",
            padding: "16px 24px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                padding: "4px 10px",
                borderRadius: "20px",
                background:
                  role === "Admin"
                    ? "#f59e0b"
                    : role === "Instructor"
                    ? "#6366f1"
                    : "#10b981",
                color: role === "Admin" ? "#0f172a" : "#ffffff",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              JWT Claim: {role || "STUDENT"}
            </span>
            <span style={{ fontSize: "14px", color: "#cbd5e1" }}>
              Logged in as: <strong style={{ color: "#f8fafc" }}>{user?.name || "Learner"}</strong> ({user?.email || "jwt@verified.edu"})
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Test Role Views:</span>
            <button
              onClick={() => setDemoRole("Student")}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: role === "Student" ? "2px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                background: role === "Student" ? "rgba(16, 185, 129, 0.2)" : "rgba(15, 23, 42, 0.6)",
                color: role === "Student" ? "#34d399" : "#94a3b8",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              🎓 Student View
            </button>
            <button
              onClick={() => setDemoRole("Admin")}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: role === "Admin" ? "2px solid #f59e0b" : "1px solid rgba(255,255,255,0.1)",
                background: role === "Admin" ? "rgba(245, 158, 11, 0.2)" : "rgba(15, 23, 42, 0.6)",
                color: role === "Admin" ? "#fbbf24" : "#94a3b8",
                fontSize: "12px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ⚡ Admin View
            </button>
          </div>
        </div>

        {/* Dynamic Landing Page Content Based on Role */}
        {role === "Admin" ? (
          /* ==================== ADMIN ROLE DASHBOARD LANDING ==================== */
          <div>
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{ fontSize: "30px", color: "#fbbf24", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
                ⚡ Urban EdTech Admin Control & Analytics Portal
              </h1>
              <p style={{ color: "#94a3b8", fontSize: "15px", marginTop: "6px" }}>
                Centralized dashboard to add new courses, track urban enrollment stats, and generate progress reports.
              </p>
            </div>

            {/* Admin Metrics Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              <div style={adminCardStyle}>
                <div style={{ fontSize: "24px" }}>👥</div>
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Total Enrolled Learners</div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: "#f8fafc" }}>3,160</div>
                </div>
              </div>
              <div style={adminCardStyle}>
                <div style={{ fontSize: "24px" }}>📚</div>
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Active Courses</div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: "#fbbf24" }}>6 Published</div>
                </div>
              </div>
              <div style={adminCardStyle}>
                <div style={{ fontSize: "24px" }}>🎯</div>
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Avg Completion Rate</div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: "#34d399" }}>78.4%</div>
                </div>
              </div>
              <div style={adminCardStyle}>
                <div style={{ fontSize: "24px" }}>🏆</div>
                <div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>Certificates Awarded</div>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: "#38bdf8" }}>1,480</div>
                </div>
              </div>
            </div>

            {/* Admin Tabs */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                marginBottom: "24px",
                paddingBottom: "12px",
              }}
            >
              <button
                onClick={() => setActiveTab("overview")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === "overview" ? "#f59e0b" : "rgba(255,255,255,0.05)",
                  color: activeTab === "overview" ? "#0f172a" : "#cbd5e1",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                📈 Enrollment Stats & Reports
              </button>

              <button
                onClick={() => setActiveTab("add-course")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === "add-course" ? "#f59e0b" : "rgba(255,255,255,0.05)",
                  color: activeTab === "add-course" ? "#0f172a" : "#cbd5e1",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                ➕ Add New Course
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === "analytics" ? "#f59e0b" : "rgba(255,255,255,0.05)",
                  color: activeTab === "analytics" ? "#0f172a" : "#cbd5e1",
                  fontWeight: "bold",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                📊 Course Metrics & Charts
              </button>
            </div>

            {/* Tab Views */}
            {activeTab === "overview" && <AdminProgressReports />}

            {activeTab === "add-course" && (
              <AdminCourseForm
                onCourseAdded={() => {
                  setActiveTab("analytics");
                }}
              />
            )}

            {activeTab === "analytics" && <CourseProgressView />}
          </div>
        ) : (
          /* ==================== STUDENT ROLE DASHBOARD LANDING ==================== */
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <h1 style={{ fontSize: "30px", color: "#f8fafc", margin: 0 }}>
                  🎓 Student Learning Portal & Progress Analytics
                </h1>
                <p style={{ color: "#94a3b8", fontSize: "15px", marginTop: "6px" }}>
                  Centralized urban EdTech platform to track course enrollments, module completion, quiz performance, and certificates.
                </p>
              </div>

              {/* Download Certificate Action for Students */}
              <button
                onClick={() => setShowCertModal(true)}
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🏆 Download Course Certificate
              </button>
            </div>

            {/* Main Interactive Course Progress & Charts Component */}
            <CourseProgressView />
          </div>
        )}

        {/* Certificate Modal */}
        {showCertModal && (
          <CertificateModal
            studentName={user?.name || "Urban Learner"}
            courseTitle="MERN Stack Development"
            onClose={() => setShowCertModal(false)}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

const adminCardStyle = {
  background: "#1e293b",
  border: "1px solid rgba(245, 158, 11, 0.2)",
  borderRadius: "12px",
  padding: "18px",
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

export default Dashboard;
