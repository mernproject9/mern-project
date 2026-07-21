import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  ArrowLeft,
  Clock,
  User,
  BookOpen,
  CheckCircle,
  AlertCircle,
  ShieldCheck
} from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, API_BASE } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Route protection & fetch data
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCourseAndEnrollment = async () => {
      setLoading(true);
      setError("");
      try {
        // 1. Fetch course details
        const courseRes = await fetch(`${API_BASE}/courses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!courseRes.ok) {
          throw new Error("Course not found");
        }
        const courseData = await courseRes.json();
        setCourse(courseData);

        // 2. Fetch user enrollment status for this course
        const enrollRes = await fetch(`${API_BASE}/enrollments/my/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (enrollRes.ok) {
          const enrollData = await enrollRes.json();
          setEnrollment(enrollData);
        } else {
          // 404 or other error means not enrolled yet
          setEnrollment(null);
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError(err.message || "Failed to load course details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndEnrollment();
  }, [id, token, navigate, API_BASE]);

  const handleEnroll = async () => {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    setEnrolling(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.message?.toLowerCase().includes("already enrolled")) {
          // If already enrolled, fetch current enrollment object to sync state
          const enrollRes = await fetch(`${API_BASE}/enrollments/my/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (enrollRes.ok) {
            const enrollData = await enrollRes.json();
            setEnrollment(enrollData);
          }
        }
        throw new Error(data.message || "Failed to enroll in the course.");
      }

      setSuccess(`Congratulations! You have successfully enrolled in "${course?.title || "the course"}".`);
      setEnrollment(data); // update enrollment status in UI immediately
    } catch (err) {
      setError(err.message || "An unexpected error occurred during enrollment.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <AlertCircle size={48} style={{ color: "var(--color-danger)", marginBottom: "16px" }} />
          <h2 className="auth-title">Error</h2>
          <p className="auth-subtitle" style={{ marginBottom: "20px" }}>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ marginLeft: 0, minHeight: "100vh" }}>
      {/* Top Header Navigation */}
      <header className="navbar" style={{ padding: "0 40px" }}>
        <button
          className="btn btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px" }}
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <span className="logo-text">UrbanLearner Portal</span>
      </header>

      {/* Course Detail Page Body */}
      <div className="content-body" style={{ padding: "40px" }}>
        
        {success && (
          <div className="alert alert-success" style={{ marginBottom: "24px" }}>
            <CheckCircle size={18} /> {success}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: "24px" }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="charts-grid" style={{ gridTemplateColumns: "2.2fr 1fr", gap: "32px" }}>
          {/* Main Info */}
          <div>
            {/* Banner block */}
            <div
              style={{
                height: "260px",
                borderRadius: "16px",
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.2), rgba(11, 15, 25, 0.95)), url(${
                  course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                marginBottom: "32px",
                border: "1px solid var(--border-color)"
              }}
            >
              <span className="badge badge-info" style={{ width: "fit-content", marginBottom: "12px", textTransform: "uppercase" }}>
                {course.category}
              </span>
              <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#fff", lineHeight: 1.2 }}>
                {course.title}
              </h2>
            </div>

            {/* Description */}
            <div className="chart-card" style={{ marginBottom: "32px" }}>
              <h3 className="card-title" style={{ marginBottom: "12px" }}>Course Overview</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.7", fontSize: "1rem" }}>
                {course.description}
              </p>
              
              <div style={{ display: "flex", gap: "24px", marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <User size={20} style={{ color: "var(--color-primary)" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Instructor</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: "600" }}>{course.instructor}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Clock size={20} style={{ color: "var(--color-secondary)" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Duration</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: "600" }}>{course.duration}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <BookOpen size={20} style={{ color: "var(--color-success)" }} />
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Modules</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: "600" }}>{course.modules.length} Modules</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Syllabus Modules */}
            <div className="chart-card">
              <h3 className="card-title">Curriculum Syllabus ({course.modules.length} Modules)</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
                Complete these modules to earn your verified certificate.
              </p>

              <div className="module-list" style={{ marginTop: "20px" }}>
                {course.modules.map((mod, idx) => (
                  <div
                    key={idx}
                    className="module-item"
                    style={{
                      cursor: "default",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          color: "var(--color-primary)"
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span className="module-title-text" style={{ fontWeight: 500 }}>{mod}</span>
                    </div>
                    {enrollment?.completedModules.includes(mod) && (
                      <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        Completed <CheckCircle size={12} />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enrollment Sidebar Widget */}
          <div>
            <div className="chart-card" style={{ position: "sticky", top: "100px" }}>
              <h3 className="card-title" style={{ marginBottom: "16px" }}>Enrollment Options</h3>
              
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Tuition Cost</div>
                <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--color-success)", margin: "4px 0 8px 0" }}>
                  FREE
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  Sponsored under the Urban Learner Scholarship. No charge for eligible enrolled scholars.
                </p>
              </div>

              {enrollment ? (
                // Case 1: Already Enrolled
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div
                    style={{
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      borderRadius: "10px",
                      padding: "16px",
                      textAlign: "center"
                    }}
                  >
                    <CheckCircle size={28} style={{ color: "var(--color-success)", marginBottom: "8px" }} />
                    <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>You Are Enrolled!</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                      Current Progress: {enrollment.progress}%
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary btn-block"
                    disabled={true}
                    style={{ opacity: 0.7, cursor: "not-allowed" }}
                  >
                    Already Enrolled
                  </button>

                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => navigate("/dashboard")}
                  >
                    Go to Study Portal
                  </button>
                </div>
              ) : (
                // Case 2: Not Enrolled
                <div>
                  <button
                    className="btn btn-primary btn-block"
                    onClick={handleEnroll}
                    disabled={enrolling}
                    style={{ padding: "16px", fontSize: "1.1rem" }}
                  >
                    {enrolling ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <span className="spinner-sm"></span> Enrolling...
                      </span>
                    ) : (
                      "Enroll in Course"
                    )}
                  </button>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                    <ShieldCheck size={14} style={{ color: "var(--color-success)" }} /> Verified Enrollment Security
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
