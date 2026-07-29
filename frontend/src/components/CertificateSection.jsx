import React, { useState } from "react";

/**
 * CertificateSection Component
 * Displays course completion certificate cards for students.
 * Download button is rendered conditionally ONLY for eligible users (100% completion / completed status).
 */
export default function CertificateSection({
  courses = [],
  student,
  onOpenCertificate
}) {
  const [activeFilter, setActiveFilter] = useState("all"); // "all", "eligible", "in-progress"

  const studentId = student?.id || "demo_1";
  const studentName = student?.name || "Alex Morgan";

  // Check whether student is eligible for certificate in a given course
  const checkIsEligible = (course) => {
    if (!course) return false;
    return course.progressPercentage >= 100 || course.status === "completed" || course.isEligible === true;
  };

  const eligibleCourses = courses.filter(checkIsEligible);
  const inProgressCourses = courses.filter((c) => !checkIsEligible(c));

  const filteredCourses = courses.filter((c) => {
    if (activeFilter === "eligible") return checkIsEligible(c);
    if (activeFilter === "in-progress") return !checkIsEligible(c);
    return true;
  });

  // Trigger PDF certificate download
  const handleDownloadCertificate = (e, course) => {
    e.stopPropagation();
    const courseId = course.id || course._id || course.code;
    const downloadUrl = `/api/certificates/download/${studentId}/${courseId}?studentName=${encodeURIComponent(studentName)}&courseTitle=${encodeURIComponent(course.title)}&progressPercentage=${course.progressPercentage || 0}`;

    // Create invisible anchor to initiate native browser file download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `EduPulse_Certificate_${(course.code || courseId).replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="section-card certificate-section" id="certificates-section" style={{ marginTop: "2rem" }}>
      <div className="section-header" style={{ flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.3rem" }}>🎓</span> Course Completion Certificates
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            View certificate details and download official verified PDF completion credentials for finished courses.
          </p>
        </div>

        <div className="tab-group">
          <button
            className={`tab-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All Courses ({courses.length})
          </button>
          <button
            className={`tab-btn ${activeFilter === "eligible" ? "active" : ""}`}
            onClick={() => setActiveFilter("eligible")}
          >
            🏆 Eligible ({eligibleCourses.length})
          </button>
          <button
            className={`tab-btn ${activeFilter === "in-progress" ? "active" : ""}`}
            onClick={() => setActiveFilter("in-progress")}
          >
            ⏳ In Progress ({inProgressCourses.length})
          </button>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📜</div>
          <p style={{ fontWeight: 600 }}>No certificates found matching filter criteria.</p>
        </div>
      ) : (
        <div
          className="certificates-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.25rem",
            marginTop: "1.25rem"
          }}
        >
          {filteredCourses.map((course) => {
            const isEligible = checkIsEligible(course);
            const courseId = course.id || course._id || course.code;
            const codeFormatted = (course.code || "CS-401").replace(/[^A-Z0-9]/g, "");
            const certId = course.certificateId || `EDUPULSE-CERT-2026-${codeFormatted}-8942`;
            
            // Format issue or completion date
            const dateObj = course.completedAt ? new Date(course.completedAt) : new Date();
            const completionDateFormatted = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            });

            return (
              <div
                key={courseId}
                className={`certificate-card ${isEligible ? "eligible" : "locked"}`}
                style={{
                  background: isEligible
                    ? "linear-gradient(145deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)"
                    : "var(--bg-card)",
                  border: isEligible ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid var(--border-color)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  boxShadow: isEligible ? "0 4px 20px rgba(245, 158, 11, 0.08)" : "none",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
              >
                {/* Decorative Top Accent Bar */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    borderTopLeftRadius: "var(--radius-lg)",
                    borderTopRightRadius: "var(--radius-lg)",
                    background: isEligible
                      ? "linear-gradient(90deg, #f59e0b, #ec4899, #6366f1)"
                      : "var(--border-color)"
                  }}
                />

                {/* Top Header & Eligibility Status Badge */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "0.5px" }}>
                      {course.code || "COURSE"}
                    </span>
                    {isEligible ? (
                      <span
                        className="certificate-status-badge eligible"
                        style={{
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "#34d399",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem"
                        }}
                      >
                        ✓ Eligible for Certificate
                      </span>
                    ) : (
                      <span
                        className="certificate-status-badge locked"
                        style={{
                          background: "rgba(245, 158, 11, 0.12)",
                          color: "#fbbf24",
                          border: "1px solid rgba(245, 158, 11, 0.25)",
                          padding: "0.2rem 0.6rem",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem"
                        }}
                      >
                        🔒 In Progress ({course.progressPercentage || 0}%)
                      </span>
                    )}
                  </div>

                  {/* Course Title */}
                  <h3
                    className="certificate-course-title"
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: "0.75rem",
                      lineHeight: 1.3
                    }}
                  >
                    {course.title}
                  </h3>

                  {/* UI Certificate Details (Course, Date, ID) */}
                  <div
                    className="certificate-details"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.45rem",
                      background: "rgba(0, 0, 0, 0.25)",
                      padding: "0.85rem",
                      borderRadius: "var(--radius-md)",
                      marginBottom: "1rem",
                      fontSize: "0.82rem",
                      border: "1px solid rgba(255, 255, 255, 0.06)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Recipient:</span>
                      <strong style={{ color: "var(--text-primary)" }}>{studentName}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Instructor:</span>
                      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{course.instructor || "EduPulse Faculty"}</span>
                    </div>

                    {isEligible ? (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Completion Date:</span>
                          <span className="certificate-date" style={{ color: "#34d399", fontWeight: 600 }}>{completionDateFormatted}</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ color: "var(--text-secondary)" }}>Certificate ID:</span>
                          <span className="certificate-id" style={{ color: "#f59e0b", fontFamily: "monospace", fontWeight: 700, fontSize: "0.78rem" }}>
                            {certId}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Eligibility Status:</span>
                        <span style={{ color: "#fbbf24", fontWeight: 600 }}>
                          Requires 100% ({course.progressPercentage || 0}% Done)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Conditional Actions Footer */}
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {isEligible ? (
                    <>
                      {/* Download button is visible ONLY for eligible users */}
                      <button
                        className="btn-primary certificate-download-btn"
                        onClick={(e) => handleDownloadCertificate(e, course)}
                        style={{
                          flex: 1,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.4rem",
                          padding: "0.55rem 0.85rem",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        📥 Download PDF Certificate
                      </button>

                      {onOpenCertificate && (
                        <button
                          className="btn-secondary"
                          onClick={() => onOpenCertificate(course)}
                          title="View Digital Certificate Preview Modal"
                          style={{
                            padding: "0.55rem 0.75rem",
                            fontSize: "0.82rem"
                          }}
                        >
                          👁️ View Modal
                        </button>
                      )}
                    </>
                  ) : (
                    /* Show locked notice for non-eligible users; Download button is hidden */
                    <div
                      className="certificate-locked-notice"
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(245, 158, 11, 0.08)",
                        border: "1px dashed rgba(245, 158, 11, 0.3)",
                        textAlign: "center",
                        fontSize: "0.78rem",
                        color: "#fbbf24",
                        fontWeight: 600
                      }}
                    >
                      🔒 Complete 100% of lessons to unlock certificate download
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
