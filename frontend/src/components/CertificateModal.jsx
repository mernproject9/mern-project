import React from "react";

function CertificateModal({ studentName, courseTitle, onClose }) {
  const issueDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certId = "URBAN-CERT-" + Math.floor(100000 + Math.random() * 900000);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
          border: "4px solid #f59e0b",
          borderRadius: "20px",
          maxWidth: "700px",
          width: "100%",
          padding: "40px",
          color: "white",
          boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
          position: "relative",
          textAlign: "center",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "20px",
            background: "none",
            border: "none",
            color: "#94a3b8",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ✖
        </button>

        {/* Certificate Watermark / Header */}
        <div style={{ fontSize: "50px", marginBottom: "10px" }}>🏆</div>

        <div style={{ textTransform: "uppercase", letterSpacing: "3px", fontSize: "12px", color: "#fbbf24", fontWeight: "bold" }}>
          Urban EdTech Learning Portal
        </div>

        <h1 style={{ fontSize: "32px", margin: "10px 0 20px 0", color: "#ffffff", fontFamily: "Georgia, serif" }}>
          Certificate of Completion
        </h1>

        <p style={{ color: "#cbd5e1", fontSize: "15px" }}>This is to certify that</p>

        <h2 style={{ fontSize: "28px", color: "#38bdf8", margin: "10px 0", textDecoration: "underline" }}>
          {studentName || "Urban Learner"}
        </h2>

        <p style={{ color: "#cbd5e1", fontSize: "15px", maxWidth: "500px", margin: "0 auto 20px auto" }}>
          has successfully completed all required modules, practical assignments, and final evaluations for the course
        </p>

        <h3 style={{ fontSize: "22px", color: "#a855f7", margin: "10px 0 25px 0" }}>
          {courseTitle || "MERN Stack Development"}
        </h3>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            paddingTop: "20px",
            borderTop: "1px dashed rgba(255,255,255,0.2)",
            marginTop: "30px",
            fontSize: "13px",
            color: "#94a3b8",
          }}
        >
          <div>
            <div style={{ color: "#f8fafc", fontWeight: "bold" }}>{issueDate}</div>
            <div>Date of Issuance</div>
          </div>

          <div>
            <div style={{ color: "#f59e0b", fontWeight: "bold", fontFamily: "monospace" }}>{certId}</div>
            <div>Certificate ID</div>
          </div>

          <div>
            <div style={{ color: "#f8fafc", fontWeight: "bold" }}>Urban EdTech Board</div>
            <div>Verified Authority</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "15px" }}>
          <button
            onClick={handlePrint}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
            }}
          >
            📥 Print / Save PDF Certificate
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "12px 24px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default CertificateModal;
