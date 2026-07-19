import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Award, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, TrendingUp, Grid } from "lucide-react";
import { api, getUser } from "../utils/api";
import Certificate from "../components/Certificate";

// Register Chart.js dependencies
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const LearnerDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedEnrollment, setExpandedEnrollment] = useState(null);
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const user = getUser();

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await api.getMyEnrollments();
      setEnrollments(data.filter(e => e.course));
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const toggleExpand = (id) => {
    if (expandedEnrollment === id) {
      setExpandedEnrollment(null);
    } else {
      setExpandedEnrollment(id);
    }
  };

  const handleModuleToggle = async (enrollment, moduleTitle) => {
    const isCompleted = enrollment.completedModules.includes(moduleTitle);
    let updatedModules;

    if (isCompleted) {
      updatedModules = enrollment.completedModules.filter((m) => m !== moduleTitle);
    } else {
      updatedModules = [...enrollment.completedModules, moduleTitle];
    }

    setUpdatingId(enrollment._id);

    try {
      const updated = await api.updateProgress(enrollment._id, updatedModules);
      // Update local state
      setEnrollments((prev) =>
        prev.map((e) => (e._id === enrollment._id ? { ...e, ...updated } : e))
      );
    } catch (err) {
      setError(err.message || "Failed to update module progress.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Compute Dashboard Metrics
  const totalEnrolled = enrollments.length;
  const completedCourses = enrollments.filter((e) => e.status === "completed").length;
  const inProgressCourses = totalEnrolled - completedCourses;
  const averageProgress = totalEnrolled 
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrolled) 
    : 0;

  // Chart 1 data: Course Progress
  const barChartData = {
    labels: enrollments.map((e) => e.course ? e.course.title.substring(0, 15) + "..." : "Course"),
    datasets: [
      {
        label: "Progress (%)",
        data: enrollments.map((e) => e.progress),
        backgroundColor: "rgba(99, 102, 241, 0.75)",
        borderColor: "var(--primary)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.9)",
        titleColor: "#ffffff",
        bodyColor: "var(--text-primary)",
        borderColor: "var(--border-glass)",
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "var(--text-secondary)" }
      },
      x: {
        grid: { display: false },
        ticks: { color: "var(--text-secondary)" }
      }
    }
  };

  // Chart 2 data: Course Status Distribution
  const doughnutChartData = {
    labels: ["Completed", "In Progress"],
    datasets: [
      {
        data: [completedCourses, inProgressCourses],
        backgroundColor: ["rgba(16, 185, 129, 0.8)", "rgba(245, 158, 11, 0.8)"],
        borderColor: ["#10b981", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "var(--text-primary)", boxWidth: 12 }
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "6rem" }}>
        <div style={{
          display: "inline-block",
          width: "40px",
          height: "40px",
          border: "4px solid rgba(255,255,255,0.1)",
          borderTopColor: "var(--primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
        <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Loading your learning dashboard...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "4rem" }}>
      {/* Header and Welcome */}
      <div style={{
        padding: "2.5rem",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(20, 184, 166, 0.05))",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-glass)",
        marginBottom: "2.5rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1.5rem"
      }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Welcome back, {user ? user.name : "Learner"}!
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Review your academic metrics, track modules in real-time, and download your certifications.
          </p>
        </div>
        <Link to="/catalog" className="btn btn-primary">
          <BookOpen size={16} />
          Browse Courses
        </Link>
      </div>

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

      {totalEnrolled === 0 ? (
        <div className="glass-panel" style={{ padding: "4rem", textAlign: "center" }}>
          <BookOpen size={48} style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }} />
          <h2>No Course Enrollments Found</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", marginBottom: "2rem" }}>
            You haven't enrolled in any courses yet. Unify your learning map by exploring our catalogue.
          </p>
          <Link to="/catalog" className="btn btn-primary">
            Explore Courses
          </Link>
        </div>
      ) : (
        <>
          {/* Metrics & Analytics Dashboard */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2.5rem"
          }}>
            {/* KPI 1 */}
            <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                <BookOpen size={24} />
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Enrolled Courses</span>
                <strong style={{ fontSize: "1.75rem", fontWeight: 700 }}>{totalEnrolled}</strong>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-emerald)" }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Completed Courses</span>
                <strong style={{ fontSize: "1.75rem", fontWeight: 700 }}>{completedCourses}</strong>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "rgba(20,184,166,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-teal)" }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Average Progress</span>
                <strong style={{ fontSize: "1.75rem", fontWeight: 700 }}>{averageProgress}%</strong>
              </div>
            </div>
          </div>

          {/* Visual Charts */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
            marginBottom: "3rem"
          }}>
            {/* Bar Chart */}
            <div className="glass-panel" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem", color: "#ffffff" }}>Learning Progress Mapping</h3>
              <div style={{ position: "relative", height: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>

            {/* Doughnut Chart */}
            <div className="glass-panel" style={{ padding: "2rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem", color: "#ffffff" }}>Completion Status Analysis</h3>
              <div style={{ position: "relative", height: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {completedCourses === 0 && inProgressCourses === 0 ? (
                  <span style={{ color: "var(--text-muted)" }}>No data available</span>
                ) : (
                  <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                )}
              </div>
            </div>
          </div>

          {/* Course Tracker Panels */}
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Grid size={20} style={{ color: "var(--accent-teal)" }} />
            Active Enrollment Workspaces
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              if (!course) return null;

              const isExpanded = expandedEnrollment === enrollment._id;
              
              return (
                <div 
                  key={enrollment._id} 
                  className="glass-panel" 
                  style={{
                    padding: "1.5rem 2rem",
                    borderLeft: `4px solid ${enrollment.progress === 100 ? "var(--accent-emerald)" : "var(--primary)"}`
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1.5rem"
                  }}>
                    {/* Course info */}
                    <div style={{ flex: 1, minWidth: "250px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                        <span className="badge badge-indigo">{course.category}</span>
                        {enrollment.progress === 100 && (
                          <span className="badge badge-emerald" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <CheckCircle2 size={12} />
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#ffffff" }}>{course.title}</h3>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Instructor: <strong>{course.instructor}</strong> | Duration: {course.duration}
                      </span>
                    </div>

                    {/* Progress slider view */}
                    <div style={{ width: "200px", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: 600 }}>
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{
                          width: `${enrollment.progress}%`,
                          height: "100%",
                          background: enrollment.progress === 100 
                            ? "linear-gradient(to right, var(--accent-emerald), var(--accent-teal))" 
                            : "linear-gradient(to right, var(--primary), var(--accent-teal))",
                          transition: "width 0.4s ease-out"
                        }} />
                      </div>
                    </div>

                    {/* CTAs */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      {enrollment.progress === 100 && (
                        <button
                          onClick={() => setActiveCertificate(enrollment)}
                          className="btn btn-accent animate-pulse-glow"
                          style={{
                            padding: "0.6rem 1.25rem",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            boxShadow: "0 0 15px rgba(20, 184, 166, 0.3)"
                          }}
                        >
                          <Award size={16} />
                          Certificate
                        </button>
                      )}

                      <button
                        onClick={() => toggleExpand(enrollment._id)}
                        className="btn btn-secondary"
                        style={{ padding: "0.6rem 1rem", fontSize: "0.85rem" }}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp size={16} />
                            Hide Modules
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} />
                            Track Progress
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandible module checklist */}
                  {isExpanded && (
                    <div style={{
                      marginTop: "1.5rem",
                      paddingTop: "1.5rem",
                      borderTop: "1px solid var(--border-glass)",
                      animation: "fadeIn var(--transition-fast) forwards"
                    }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "1rem" }}>
                        Syllabus Progress Checklist
                      </h4>
                      {course.modules && course.modules.length > 0 ? (
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                          gap: "1rem"
                        }}>
                          {course.modules.map((mod, index) => {
                            const isCompleted = enrollment.completedModules.includes(mod);
                            return (
                              <label
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.75rem",
                                  padding: "0.85rem 1rem",
                                  background: isCompleted ? "rgba(16, 185, 129, 0.04)" : "rgba(255, 255, 255, 0.02)",
                                  border: "1px solid " + (isCompleted ? "rgba(16, 185, 129, 0.2)" : "var(--border-glass)"),
                                  borderRadius: "8px",
                                  cursor: updatingId === enrollment._id ? "not-allowed" : "pointer",
                                  transition: "all var(--transition-fast)"
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  disabled={updatingId === enrollment._id}
                                  onChange={() => handleModuleToggle(enrollment, mod)}
                                  style={{
                                    accentColor: "var(--accent-teal)",
                                    width: "18px",
                                    height: "18px",
                                    cursor: "pointer"
                                  }}
                                />
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontSize: "0.9rem", fontWeight: 500, color: isCompleted ? "var(--text-primary)" : "var(--text-secondary)" }}>
                                    {mod}
                                  </span>
                                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                    Module {index + 1}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No syllabus modules mapped to this course.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Render Certificate Modal if Active */}
      {activeCertificate && (
        <Certificate 
          enrollment={activeCertificate} 
          onClose={() => setActiveCertificate(null)} 
        />
      )}
    </div>
  );
};

export default LearnerDashboard;
