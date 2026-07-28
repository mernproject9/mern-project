export default function EmptyEnrolledState({ onOpenEnrollModal, onClearFilters, isFiltered }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "4rem 2rem",
        background: "var(--bg-secondary)",
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--border-glow)",
        margin: "1.5rem 0",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Background radial glow effect */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0, 0, 0, 0) 70%)",
          pointerEvents: "none"
        }}
      />

      {/* Hero Illustration Badge */}
      <div style={{ position: "relative", display: "inline-block", marginBottom: "1.75rem" }}>
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)",
            border: "2px solid var(--accent-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            boxShadow: "var(--shadow-glow)"
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-primary)" }}>
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>

        <span
          style={{
            position: "absolute",
            bottom: "-4px",
            right: "-4px",
            background: "var(--gradient-brand)",
            color: "white",
            fontSize: "0.85rem",
            padding: "0.2rem 0.5rem",
            borderRadius: "var(--radius-full)",
            fontWeight: 800,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
          }}
        >
          ✨ New
        </span>
      </div>

      {/* Main Headline */}
      <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
        {isFiltered ? "No Enrolled Courses Match Your Filter" : "Your Learning Journey Begins Here! 🚀"}
      </h3>

      {/* Description Body */}
      <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: "520px", margin: "0 auto 2rem", lineHeight: 1.6 }}>
        {isFiltered
          ? "No active enrollments matched your search query or selected status filter. Try clearing filters to view all enrolled courses."
          : "You haven't enrolled in any courses yet. Discover industry-grade Web Engineering, Data Science, and Cybersecurity courses in our catalog to start building your skills today."}
      </p>

      {/* Feature Highlights Grid when 0 enrollments */}
      {!isFiltered && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            maxWidth: "650px",
            margin: "0 auto 2.5rem"
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              textAlign: "left"
            }}
          >
            <div style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>🎓</div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>Verified Certificates</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Earn credentials upon 100% course completion</div>
          </div>

          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              textAlign: "left"
            }}
          >
            <div style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>👨‍🏫</div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>Expert Instructors</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Learn from lead software architects & Ph.Ds</div>
          </div>

          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              padding: "1rem",
              borderRadius: "var(--radius-md)",
              textAlign: "left"
            }}
          >
            <div style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>📊</div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>Skill Analytics</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>Track lesson progress & weekly study hours</div>
          </div>
        </div>
      )}

      {/* Action CTA Buttons */}
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
        {isFiltered && onClearFilters && (
          <button className="btn-secondary" onClick={onClearFilters}>
            🔄 Reset Filters
          </button>
        )}

        <button
          className="btn-primary"
          onClick={onOpenEnrollModal}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "0.95rem",
            fontWeight: 700,
            boxShadow: "var(--shadow-glow)"
          }}
        >
          + Explore Course Catalog & Enroll
        </button>
      </div>
    </div>
  );
}
