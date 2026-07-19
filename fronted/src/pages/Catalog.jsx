import React, { useState, useEffect } from "react";
import { BookOpen, User, Calendar, Check, Play, Search, AlertCircle, Sparkles } from "lucide-react";
import { api, getUser } from "../utils/api";

const Catalog = () => {
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const user = getUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const courseList = await api.getCourses();
        setCourses(courseList);

        if (user && user.role !== "admin") {
          const enrollments = await api.getMyEnrollments();
          setMyEnrollments(enrollments);
        }
      } catch (err) {
        setError(err.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleEnroll = async (courseId) => {
    if (!user) {
      setError("Please sign in to enroll in courses.");
      return;
    }
    setError("");
    setSuccessMsg("");
    setActionLoading(true);

    try {
      await api.enroll(courseId);
      setSuccessMsg("Successfully enrolled in course!");
      // Refresh enrollments
      const enrollments = await api.getMyEnrollments();
      setMyEnrollments(enrollments);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Enrollment failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const isEnrolled = (courseId) => {
    return myEnrollments.some((e) => e.course && e.course._id === courseId);
  };

  const categories = ["All", ...new Set(courses.map((c) => c.category))];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "3rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Explore Course Catalog</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Equipping urban learners with practical, career-defining skills. Select from curated cohorts below.
        </p>
      </div>

      {successMsg && (
        <div className="glass-panel" style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "var(--accent-emerald)",
          padding: "1rem",
          borderRadius: "var(--radius-sm)",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <Sparkles size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{
          background: "rgba(244, 63, 94, 0.1)",
          border: "1px solid rgba(244, 63, 94, 0.2)",
          color: "var(--accent-rose)",
          padding: "1rem",
          borderRadius: "var(--radius-sm)",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "1.5rem",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "2rem",
        padding: "1.25rem",
        background: "rgba(17, 24, 39, 0.5)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-glass)"
      }}>
        {/* Search */}
        <div style={{ position: "relative", minWidth: "280px", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            className="form-input"
            style={{ width: "100%", paddingLeft: "2.5rem" }}
            placeholder="Search courses, instructors, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category filters */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="btn"
              style={{
                padding: "0.5rem 1rem",
                fontSize: "0.85rem",
                borderRadius: "20px",
                background: selectedCategory === cat ? "var(--primary)" : "rgba(255, 255, 255, 0.03)",
                color: selectedCategory === cat ? "#ffffff" : "var(--text-secondary)",
                border: "1px solid " + (selectedCategory === cat ? "var(--primary)" : "var(--border-glass)"),
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{
            display: "inline-block",
            width: "40px",
            height: "40px",
            border: "4px solid rgba(255,255,255,0.1)",
            borderTopColor: "var(--primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="glass-panel" style={{ padding: "4rem", textAlign: "center" }}>
          <BookOpen size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
          <h3>No Courses Found</h3>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Try expanding your search query or selecting a different category.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "2rem"
        }}>
          {filteredCourses.map((course) => {
            const enrolled = isEnrolled(course._id);
            return (
              <div 
                key={course._id} 
                className="glass-panel glass-panel-hover" 
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "1.75rem",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Category tag */}
                <div style={{ marginBottom: "1rem" }}>
                  <span className="badge badge-indigo">
                    {course.category}
                  </span>
                </div>

                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem", minHeight: "2.8rem", display: "flex", alignItems: "center" }}>
                  {course.title}
                </h3>

                <p style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  marginBottom: "1.5rem",
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flex: 1
                }}>
                  {course.description}
                </p>

                {/* Metadata */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--border-glass)",
                  marginBottom: "1.5rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <User size={14} style={{ color: "var(--primary)" }} />
                    <span>{course.instructor}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <Calendar size={14} style={{ color: "var(--accent-teal)" }} />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: "0.6rem" }}
                  >
                    Details
                  </button>

                  {user && user.role === "admin" ? (
                    <button className="btn btn-disabled" style={{ flex: 1.5, padding: "0.6rem" }} disabled>
                      Admin Mode
                    </button>
                  ) : enrolled ? (
                    <button
                      className="btn"
                      style={{
                        flex: 1.5,
                        background: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "var(--accent-emerald)",
                        cursor: "default",
                        padding: "0.6rem"
                      }}
                    >
                      <Check size={16} />
                      Enrolled
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course._id)}
                      disabled={actionLoading}
                      className="btn btn-primary"
                      style={{ flex: 1.5, padding: "0.6rem" }}
                    >
                      <Play size={16} />
                      Enroll
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 200,
          padding: "1rem"
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: "100%",
            maxWidth: "600px",
            padding: "2.5rem",
            background: "rgba(17, 24, 39, 0.95)",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
              <div>
                <span className="badge badge-indigo" style={{ marginBottom: "0.5rem" }}>
                  {selectedCourse.category}
                </span>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{selectedCourse.title}</h2>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-secondary)",
                  fontSize: "1.5rem",
                  cursor: "pointer"
                }}
              >
                &times;
              </button>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              {selectedCourse.description}
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              padding: "1rem",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "var(--radius-sm)",
              marginBottom: "1.5rem",
              fontSize: "0.9rem"
            }}>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Instructor</span>
                <span style={{ fontWeight: 600 }}>{selectedCourse.instructor}</span>
              </div>
              <div>
                <span style={{ color: "var(--text-muted)", display: "block" }}>Duration</span>
                <span style={{ fontWeight: 600 }}>{selectedCourse.duration}</span>
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Course Syllabus</h4>
              {selectedCourse.modules && selectedCourse.modules.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {selectedCourse.modules.map((mod, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "0.75rem 1rem",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "center"
                      }}
                    >
                      <span style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "rgba(99, 102, 241, 0.1)",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                        fontWeight: "bold"
                      }}>
                        {index + 1}
                      </span>
                      <span>{mod}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No syllabus details added yet.</p>
              )}
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setSelectedCourse(null)}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Close
              </button>
              
              {user && user.role !== "admin" && !isEnrolled(selectedCourse._id) && (
                <button
                  onClick={() => {
                    handleEnroll(selectedCourse._id);
                    setSelectedCourse(null);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={actionLoading}
                >
                  <Play size={16} />
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
