import React from "react";
import { Award, Printer, X, ShieldCheck } from "lucide-react";

const Certificate = ({ enrollment, onClose }) => {
  if (!enrollment || !enrollment.course || enrollment.progress !== 100) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleDateString();
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const certificateId = `CERT-${enrollment._id.substring(enrollment._id.length - 8).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="no-print" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 300,
      padding: "1rem"
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        width: "100%",
        maxWidth: "850px"
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          color: "#ffffff"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldCheck size={20} style={{ color: "var(--accent-teal)" }} />
            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>Verified Digital Certificate</span>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={handlePrint} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              <Printer size={16} />
              Print / Save PDF
            </button>
            <button onClick={onClose} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
              <X size={16} />
              Close
            </button>
          </div>
        </div>

        {/* Certificate Card container */}
        <div 
          className="certificate-print-area" 
          style={{
            width: "100%",
            background: "#ffffff",
            color: "#1e293b",
            padding: "3.5rem 4rem",
            borderRadius: "8px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            border: "16px double #cbd5e1",
            position: "relative",
            textAlign: "center",
            fontFamily: "'Outfit', sans-serif"
          }}
        >
          {/* Decorative Corner Borders */}
          <div style={{ position: "absolute", top: "15px", left: "15px", right: "15px", bottom: "15px", border: "2px solid #94a3b8", pointerEvents: "none" }} />
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem" }}>
            <Award size={64} style={{ color: "#6366f1", marginBottom: "1rem" }} />
            <span style={{
              fontSize: "0.85rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "4px",
              color: "#6366f1"
            }}>
              Certificate of Completion
            </span>
          </div>

          <p style={{ fontStyle: "italic", fontSize: "1.1rem", color: "#64748b", marginBottom: "2rem" }}>
            This is proudly presented to
          </p>

          <h1 style={{
            fontSize: "2.8rem",
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: "1rem",
            fontStyle: "normal",
            borderBottom: "2px solid #e2e8f0",
            display: "inline-block",
            paddingBottom: "0.5rem",
            minWidth: "60%"
          }}>
            {enrollment.student ? enrollment.student.name : "Learner"}
          </h1>

          <p style={{
            fontSize: "1rem",
            color: "#475569",
            maxWidth: "540px",
            margin: "0 auto 2rem",
            lineHeight: 1.6
          }}>
            for successfully satisfying all academic criteria and completing the syllabus modules for the specialized course program:
          </p>

          <h2 style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#1e1b4b",
            marginBottom: "2rem"
          }}>
            {enrollment.course ? enrollment.course.title : "Urban Course Program"}
          </h2>

          <p style={{ fontSize: "0.95rem", color: "#64748b", marginBottom: "3rem" }}>
            Granted on <strong style={{ color: "#334155" }}>{formatDate(enrollment.completedAt)}</strong>
          </p>

          {/* Signatures and Seals */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            width: "100%",
            marginTop: "1rem",
            padding: "0 2rem"
          }}>
            {/* Signature 1 */}
            <div style={{ width: "200px" }}>
              <div style={{
                fontFamily: "'Playball', 'Brush Script MT', cursive, sans-serif",
                fontSize: "1.5rem",
                color: "#4f46e5",
                marginBottom: "0.25rem",
                borderBottom: "1px solid #cbd5e1"
              }}>
                Sarah Jenkins
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>
                Course Instructor
              </span>
            </div>

            {/* Verification Seal */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                border: "4px double #818cf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f0f2ff",
                color: "#4f46e5",
                marginBottom: "0.5rem"
              }}>
                <Award size={36} />
              </div>
              <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "#94a3b8" }}>
                ID: {certificateId}
              </span>
            </div>

            {/* Signature 2 */}
            <div style={{ width: "200px" }}>
              <div style={{
                fontFamily: "'Playball', 'Brush Script MT', cursive, sans-serif",
                fontSize: "1.5rem",
                color: "#0f172a",
                marginBottom: "0.25rem",
                borderBottom: "1px solid #cbd5e1"
              }}>
                UrbanEd Board
              </div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>
                Academics Director
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
