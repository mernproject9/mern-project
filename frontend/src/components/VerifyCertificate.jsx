import { useState } from "react";
import { ShieldCheck, ShieldAlert, Search, RefreshCw, CheckCircle, XCircle, Award, User, BookOpen, Calendar } from "lucide-react";

const VerifyCertificate = ({ token, API_BASE, reports = [] }) => {
  const [certInputId, setCertInputId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searchedId, setSearchedId] = useState("");

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!certInputId.trim()) return;

    const queryId = certInputId.trim();
    setLoading(true);
    setResult(null);
    setSearchedId(queryId);

    try {
      const response = await fetch(
        `${API_BASE}/enrollments/admin/verify-certificate/${encodeURIComponent(queryId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.isValid) {
        setResult({
          isValid: true,
          message: data.message || "Certificate verified successfully",
          certificate: data.certificate,
        });
      } else {
        setResult({
          isValid: false,
          message: data.message || `Certificate ID "${queryId}" is invalid or not found.`,
        });
      }
    } catch (error) {
      console.error("Certificate verification error:", error);
      setResult({
        isValid: false,
        message: error.message || "Server error while verifying certificate.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (id) => {
    setCertInputId(id);
  };

  const completedCertificates = reports.filter((r) => r.certificateId);

  return (
    <div className="verify-certificate-wrapper" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header card */}
      <div className="chart-card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck size={22} style={{ color: "var(--color-primary)" }} /> Certificate Authenticity Verification
          </h3>
          <span className="badge badge-info">Admin Tool Only</span>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "20px" }}>
          Input a unique certificate ID issued by UrbanLearner to verify its legitimacy, recipient, and course details.
        </p>

        <form onSubmit={handleVerify} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "280px", position: "relative" }}>
            <Search
              size={18}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="e.g. UL-687A...-DATE-123"
              value={certInputId}
              onChange={(e) => setCertInputId(e.target.value)}
              style={{ paddingLeft: "42px" }}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "160px", justifyContent: "center" }}
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="spin-icon" /> Verifying...
              </>
            ) : (
              <>
                <ShieldCheck size={16} /> Verify Authenticity
              </>
            )}
          </button>
        </form>

        {/* Quick select certificates from reports if present */}
        {completedCertificates.length > 0 && (
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px dashed var(--border-color)" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
              Quick test with issued certificates:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {completedCertificates.map((cert) => (
                <button
                  key={cert.enrollmentId}
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    fontFamily: "monospace",
                    background: certInputId === cert.certificateId ? "var(--color-primary-glow)" : "rgba(255,255,255,0.03)",
                    borderColor: certInputId === cert.certificateId ? "var(--color-primary)" : "var(--border-color)",
                  }}
                  onClick={() => handleQuickSelect(cert.certificateId)}
                >
                  {cert.certificateId} ({cert.studentName})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result Card */}
      {result && (
        <div className="chart-card" style={{ transition: "all 0.3s ease", position: "relative" }}>
          {result.isValid ? (
            <div>
              {/* Status Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid var(--color-success)",
                  marginBottom: "24px",
                }}
              >
                <CheckCircle size={32} style={{ color: "var(--color-success)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: "700", color: "var(--color-success)", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    VALID & AUTHENTIC CERTIFICATE
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {result.message}
                  </div>
                </div>
              </div>

              {/* Certificate Breakdown Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                  backgroundColor: "rgba(15, 20, 36, 0.5)",
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div className="cert-detail-item">
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>
                    Certificate Unique ID
                  </span>
                  <span
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      fontFamily: "monospace",
                      color: "var(--color-secondary)",
                      background: "rgba(14, 165, 233, 0.1)",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      display: "inline-block",
                      marginTop: "4px",
                    }}
                  >
                    {result.certificate.certificateId}
                  </span>
                </div>

                <div className="cert-detail-item">
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>
                    Status
                  </span>
                  <span
                    className="badge badge-success"
                    style={{ marginTop: "4px", display: "inline-block", textTransform: "capitalize" }}
                  >
                    Verified ({result.certificate.status})
                  </span>
                </div>

                <div className="cert-detail-item">
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <User size={14} /> Student Recipient
                  </span>
                  <span style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", display: "block", marginTop: "4px" }}>
                    {result.certificate.studentName}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {result.certificate.studentEmail}
                  </span>
                </div>

                <div className="cert-detail-item">
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <BookOpen size={14} /> Course Title
                  </span>
                  <span style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", display: "block", marginTop: "4px" }}>
                    {result.certificate.courseTitle}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Category: {result.certificate.category}
                  </span>
                </div>

                <div className="cert-detail-item">
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Award size={14} /> Course Instructor
                  </span>
                  <span style={{ fontSize: "0.95rem", fontWeight: "500", color: "var(--text-primary)", display: "block", marginTop: "4px" }}>
                    {result.certificate.instructor}
                  </span>
                </div>

                <div className="cert-detail-item">
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={14} /> Issue Date / Completion
                  </span>
                  <span style={{ fontSize: "0.95rem", fontWeight: "500", color: "var(--text-primary)", display: "block", marginTop: "4px" }}>
                    {result.certificate.issueDate ? new Date(result.certificate.issueDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }) : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Invalid Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid var(--color-danger)",
                }}
              >
                <XCircle size={32} style={{ color: "var(--color-danger)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: "700", color: "var(--color-danger)", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    INVALID / UNVERIFIED CERTIFICATE
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {result.message}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Requested ID: <code style={{ color: "var(--color-danger)" }}>{searchedId}</code>. Please confirm the Certificate ID syntax and ensure the student has fully completed the course curriculum.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VerifyCertificate;
