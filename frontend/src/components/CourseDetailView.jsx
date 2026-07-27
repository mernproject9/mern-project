import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CourseDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const API_URL = window.location.port === "5173" ? `/api/courses/${id}` : `http://localhost:5000/api/courses/${id}`;

    fetch(API_URL)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load course details (Status ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setCourse(data);
          if (data.modules && data.modules.length > 0) {
            setExpandedModule(data.modules[0].id || "m1");
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Course fetch error:", err);
          // Fallback to local default course presentation if backend fails
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Back Navigation preserving scroll position
  const handleBackToCatalog = () => {
    const savedScrollPos = sessionStorage.getItem("catalog_scroll_pos");
    navigate("/");
    if (savedScrollPos) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedScrollPos, 10),
          behavior: "instant"
        });
      }, 50);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
        <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)" }}>
          Loading Course Details...
        </h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Fetching syllabus, description, and instructor information for ID: <code>{id}</code>
        </p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="dashboard-container" style={{ padding: "3rem 1.5rem" }}>
        <button className="btn-secondary" onClick={handleBackToCatalog} style={{ marginBottom: "1.5rem" }}>
          ← Back to Catalog
        </button>
        <div style={{
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#f87171",
          padding: "1.5rem",
          borderRadius: "var(--radius-md)"
        }}>
          <h3>Error Loading Course Details</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ paddingBottom: "4rem" }}>
      {/* Back Navigation Bar */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          className="btn-secondary"
          onClick={handleBackToCatalog}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Course Catalog
        </button>

        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
          Course Route ID: {id}
        </span>
      </div>

      {/* Hero Banner Header */}
      <div style={{
        background: course?.thumbnailGradient || "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
        borderRadius: "var(--radius-lg)",
        padding: "2.5rem 2rem",
        color: "#ffffff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        marginBottom: "2rem",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 700 }}>
            {course?.code || "CS-401"}
          </span>
          <span style={{ background: "rgba(0,0,0,0.25)", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 600 }}>
            {course?.category || "Web Development"}
          </span>
          <span style={{ background: "rgba(16, 185, 129, 0.3)", color: "#a7f3d0", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.8rem", fontWeight: 700 }}>
            Level: {course?.level || "Intermediate"}
          </span>
        </div>

        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.75rem", lineHeight: 1.2 }}>
          {course?.title}
        </h1>

        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", fontSize: "0.9rem", opacity: 0.95, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Estimated {course?.estimatedHours || 40} Hours</span>
          </div>
          <div>
            📚 {course?.totalLessons || course?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 10} Total Lessons
          </div>
          <div>
            👨‍🏫 Taught by <strong>{course?.instructor}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns (Content & Sidebar) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem" }}>
        
        {/* Left Column: Full Description & Syllabus */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Section 1: Full Course Description */}
          <div className="section-card" style={{ background: "var(--bg-secondary)", padding: "1.75rem" }}>
            <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              📖 Full Course Description
            </h2>
            
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              {course?.description || "This course provides a comprehensive deep dive into core and advanced concepts. Gain hands-on practical experience through guided projects, code walk-throughs, and real-world architecture patterns."}
            </p>

            {/* Learning Outcomes */}
            {course?.learningOutcomes && course.learningOutcomes.length > 0 && (
              <div style={{ marginTop: "1.25rem", background: "var(--bg-card)", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  🎯 What You Will Learn
                </h4>
                <ul style={{ paddingLeft: "1.25rem", margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {course.learningOutcomes.map((outcome, idx) => (
                    <li key={idx} style={{ lineHeight: 1.5 }}>{outcome}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {course?.prerequisites && course.prerequisites.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <h4 style={{ fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                  📋 Course Prerequisites
                </h4>
                <ul style={{ paddingLeft: "1.25rem", margin: 0, color: "var(--text-muted)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {course.prerequisites.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section 2: Complete Course Syllabus */}
          <div className="section-card" style={{ background: "var(--bg-secondary)", padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                📚 Course Syllabus & Modules
              </h2>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {course?.modules?.length || 0} Modules
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {course?.modules?.map((mod, modIdx) => {
                const isExpanded = expandedModule === mod.id;
                return (
                  <div
                    key={mod.id || modIdx}
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden"
                    }}
                  >
                    <div
                      onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                      style={{
                        padding: "1rem 1.25rem",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: isExpanded ? "rgba(99, 102, 241, 0.08)" : "transparent",
                        transition: "background 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{
                          color: "var(--accent-primary)",
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                          display: "inline-block"
                        }}>
                          ▶
                        </span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                            {mod.title}
                          </div>
                          {mod.description && (
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                              {mod.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                        {mod.lessons?.length || 0} Lessons
                      </span>
                    </div>

                    {isExpanded && mod.lessons && (
                      <div style={{ borderTop: "1px solid var(--border-color)", padding: "0.75rem 1.25rem 1rem" }}>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                          {mod.lessons.map((les) => (
                            <li
                              key={les.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.5rem 0.75rem",
                                borderRadius: "var(--radius-sm)",
                                background: "var(--bg-secondary)",
                                fontSize: "0.88rem"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                <span style={{ color: les.completed ? "var(--accent-success)" : "var(--text-muted)" }}>
                                  {les.completed ? "✓" : "📄"}
                                </span>
                                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{les.title}</span>
                              </div>
                              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
                                {les.duration}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Instructor Info & Enrollment Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Section 3: Instructor Information Card */}
          <div className="section-card" style={{ background: "var(--bg-secondary)", padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1.05rem", color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              👤 Instructor Information
            </h3>

            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <img
                src={course?.instructorAvatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                alt={course?.instructor}
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid var(--accent-primary)",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  marginBottom: "0.75rem"
                }}
              />
              <h4 style={{ fontSize: "1.1rem", margin: "0 0 0.2rem", color: "var(--text-primary)" }}>
                {course?.instructor}
              </h4>
              <div style={{ fontSize: "0.8rem", color: "var(--accent-primary)", fontWeight: 600 }}>
                {course?.instructorRole || "Lead Course Instructor"}
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, background: "var(--bg-card)", padding: "0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
              {course?.instructorBio || `${course?.instructor} is an experienced industry educator specializing in ${course?.category}. They have taught thousands of engineering students worldwide.`}
            </p>
          </div>

          {/* Quick Details Sidebar Card */}
          <div className="section-card" style={{ background: "var(--bg-secondary)", padding: "1.5rem" }}>
            <h4 style={{ fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.85rem" }}>
              ⚡ Course Quick Overview
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Course Code:</span>
                <strong style={{ color: "var(--text-primary)" }}>{course?.code}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Category:</span>
                <strong style={{ color: "var(--text-primary)" }}>{course?.category}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Total Hours:</span>
                <strong style={{ color: "var(--text-primary)" }}>{course?.estimatedHours}h</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Certificate:</span>
                <span style={{ color: "var(--accent-success)", fontWeight: 700 }}>Included</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={handleBackToCatalog}
              style={{ width: "100%", justifyContent: "center", marginTop: "1.25rem" }}
            >
              Return to Catalog Dashboard
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
