export default function CertificateModal({ course, student, onClose }) {
  if (!course) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: "1.1rem" }}>Verified Certificate of Completion</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="certificate-frame">
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏆</div>
            <div className="certificate-title">Certificate of Achievement</div>
            <div className="certificate-subtitle">This is proudly awarded to</div>
            <div className="certificate-recipient">{student?.name || "Alex Morgan"}</div>
            <div style={{ fontSize: "0.85rem", color: "#94a3b8", margin: "1rem 0 0.5rem" }}>
              for successfully completing all modules & requirement criteria for
            </div>
            <div className="certificate-course">{course.title}</div>
            
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px stroke rgba(255,255,255,0.2)",
              fontSize: "0.75rem",
              color: "#94a3b8"
            }}>
              <div>
                <div style={{ fontWeight: 700, color: "white" }}>{course.instructor}</div>
                <div>{course.instructorRole || "Lead Instructor"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "#f59e0b" }}>VERIFIED ID: EDUPULSE-2026-9941</div>
                <div>Issued: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
            <a
              href={`/api/certificates/download/${student?.id || "demo_1"}/${course.id || course._id || course.code}?studentName=${encodeURIComponent(student?.name || "Alex Morgan")}&courseTitle=${encodeURIComponent(course.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              📥 Download Backend Generated PDF
            </a>
            <button className="btn-secondary" onClick={() => window.print()}>
              🖨️ Print View
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
