import React, { useState, useEffect } from "react";
import ModuleProgressChart from "./charts/ModuleProgressChart";
import QuizScoreChart from "./charts/QuizScoreChart";
import CourseStatusDoughnut from "./charts/CourseStatusDoughnut";
import SkillRadarChart from "./charts/SkillRadarChart";
import "./CourseProgressView.css";

const API_BASE_URL = "http://localhost:5000";

const DEFAULT_COURSES = [
  { _id: "1", title: "MERN Stack Development" },
  { _id: "2", title: "Java Programming" },
  { _id: "3", title: "Data Structures & Algorithms" },
  { _id: "4", title: "Python Data Science" },
  { _id: "5", title: "UI/UX Design Masterclass" },
  { _id: "6", title: "Cloud Computing & DevOps" },
];

export function CourseProgressView() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState("1");
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("charts"); // 'charts', 'modules', 'quizzes'

  // Fetch course list on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/courses`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCourses(data);
            setSelectedCourseId(String(data[0]._id));
          }
        }
      } catch (err) {
        console.warn("Could not fetch course list from backend, using defaults:", err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch detailed progress when selectedCourseId changes
  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/courses/${selectedCourseId}/progress`);
        if (!res.ok) {
          throw new Error(`Failed to load progress (Status: ${res.status})`);
        }
        const data = await res.json();
        setProgressData(data);
      } catch (err) {
        console.error("Progress fetch error:", err);
        setError("Could not load course progress data.");
      } finally {
        setLoading(false);
      }
    };

    if (selectedCourseId) {
      fetchProgress();
    }
  }, [selectedCourseId]);

  const handleSelectCourse = (e) => {
    setSelectedCourseId(e.target.value);
  };

  const handleExportReport = () => {
    if (!progressData) return;
    const reportData = JSON.stringify(progressData, null, 2);
    const blob = new Blob([reportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(progressData.courseTitle || "course").toLowerCase().replace(/\s+/g, "_")}_progress_report.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="progress-view-container">
      {/* Course Selector & Summary Header */}
      <div className="progress-header">
        <div className="course-selector-bar">
          <div className="selector-label-group">
            <span style={{ fontSize: "24px" }}>📊</span>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", color: "#f8fafc", fontWeight: "700" }}>
                Urban EdTech Learning Analytics & Progress Metrics
              </h2>
              <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
                Centralized dashboard to analyze real-time module progress, quiz performance & certificate readiness
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="selector-label">Course:</span>
              <select
                className="course-dropdown"
                value={selectedCourseId}
                onChange={handleSelectCourse}
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportReport}
              className="export-btn"
              title="Export Course Analytics Report as JSON"
            >
              📥 Export Report
            </button>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="course-pills-row">
          {courses.map((c) => (
            <button
              key={c._id}
              className={`course-pill-btn ${String(c._id) === String(selectedCourseId) ? "active" : ""}`}
              onClick={() => setSelectedCourseId(String(c._id))}
            >
              {c.title}
            </button>
          ))}
        </div>

        {/* Metric Cards Summary */}
        {progressData && (
          <div className="summary-cards-grid">
            <div className="metric-card">
              <div className="metric-icon" style={{ background: "rgba(167, 139, 250, 0.15)", color: "#a78bfa" }}>🎯</div>
              <div className="metric-info">
                <h4>Overall Progress</h4>
                <p style={{ color: "#a78bfa" }}>{progressData.overallProgress}%</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8" }}>⏱️</div>
              <div className="metric-info">
                <h4>Hours Invested</h4>
                <p style={{ color: "#38bdf8" }}>{progressData.totalHoursSpent || 0} hrs</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: "rgba(74, 222, 128, 0.15)", color: "#4ade80" }}>📝</div>
              <div className="metric-info">
                <h4>Average Quiz Score</h4>
                <p style={{ color: "#4ade80" }}>{progressData.avgQuizScore || 0}%</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon" style={{ background: "rgba(250, 204, 21, 0.15)", color: "#facc15" }}>📦</div>
              <div className="metric-info">
                <h4>Completed Modules</h4>
                <p style={{ color: "#facc15" }}>
                  {progressData.completedModules} / {progressData.totalModules}
                </p>
              </div>
            </div>

            <div className="metric-card" style={{ border: progressData.overallProgress >= 100 ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.12)" }}>
              <div className="metric-icon" style={{ background: progressData.overallProgress >= 100 ? "rgba(52, 211, 153, 0.15)" : "rgba(251, 191, 36, 0.15)" }}>
                {progressData.overallProgress >= 100 ? "🏆" : "🔒"}
              </div>
              <div className="metric-info">
                <h4>Certificate Status</h4>
                <p style={{ color: progressData.overallProgress >= 100 ? "#34d399" : "#fbbf24", fontSize: "14px", fontWeight: "700" }}>
                  {progressData.overallProgress >= 100 ? "Eligible (100%)" : `${progressData.overallProgress}% (Req: 100%)`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="skeleton-loader-container">
          <div className="spinner" style={{ margin: "0 auto 15px auto" }}></div>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>Fetching real-time course analytics & module progress...</p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "30px", background: "#1e293b", borderRadius: "12px", border: "1px solid #ef4444" }}>
          <p style={{ color: "#ef4444", margin: 0, fontWeight: "600" }}>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && progressData && (
        <>
          {/* View Switcher Controls */}
          <div className="view-mode-tabs">
            <button
              className={`view-mode-btn ${viewMode === "charts" ? "active" : ""}`}
              onClick={() => setViewMode("charts")}
            >
              📊 Graphical Charts View
            </button>
            <button
              className={`view-mode-btn ${viewMode === "modules" ? "active" : ""}`}
              onClick={() => setViewMode("modules")}
            >
              📚 Module Breakdown ({progressData.modules.length})
            </button>
            <button
              className={`view-mode-btn ${viewMode === "quizzes" ? "active" : ""}`}
              onClick={() => setViewMode("quizzes")}
            >
              🏆 Quiz Assessments ({progressData.quizzes.length})
            </button>
          </div>

          {/* Conditional View: Graphical Charts View */}
          {(viewMode === "charts" || viewMode === "all") && (
            <div className="charts-grid-2col">
              {/* Chart 1: Module Progress */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <div className="chart-card-title">
                    <span>📊</span> Module Progress & Study Time Distribution
                  </div>
                  <span className="chart-badge">Bar Chart</span>
                </div>
                <ModuleProgressChart modules={progressData.modules} />
              </div>

              {/* Chart 2: Quiz Scores */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <div className="chart-card-title">
                    <span>📈</span> Quiz Score Trend vs 70% Passing Threshold
                  </div>
                  <span className="chart-badge">Area Line Chart</span>
                </div>
                <QuizScoreChart quizzes={progressData.quizzes} />
              </div>

              {/* Chart 3: Doughnut Status Breakdown */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <div className="chart-card-title">
                    <span>🍩</span> Module Status Breakdown
                  </div>
                  <span className="chart-badge">Doughnut</span>
                </div>
                <CourseStatusDoughnut progressData={progressData} />
              </div>

              {/* Chart 4: Radar Skill Matrix */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <div className="chart-card-title">
                    <span>🕸️</span> Competency Matrix & Skill Mastery
                  </div>
                  <span className="chart-badge">Radar Matrix</span>
                </div>
                <SkillRadarChart skillMetrics={progressData.skillMetrics} />
              </div>
            </div>
          )}

          {/* Detailed Lists & Tables */}
          {(viewMode === "charts" || viewMode === "modules" || viewMode === "quizzes") && (
            <div className="details-tables-grid">
              {/* Module Breakdown List */}
              {(viewMode === "charts" || viewMode === "modules") && (
                <div className="detail-table-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, color: "#a78bfa", fontSize: "17px", fontWeight: "700" }}>
                      📚 Course Modules Breakdown
                    </h3>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      {progressData.completedModules} of {progressData.totalModules} Completed
                    </span>
                  </div>
                  {progressData.modules.map((m) => {
                    const statusClass =
                      m.status === "Completed"
                        ? "completed"
                        : m.status === "In Progress"
                        ? "in-progress"
                        : "not-started";
                    const fillColor =
                      m.status === "Completed"
                        ? "#22c55e"
                        : m.status === "In Progress"
                        ? "#f59e0b"
                        : "#64748b";

                    return (
                      <div key={m.id} className="module-item-row">
                        <div className="module-row-top">
                          <span className="module-name">{m.name}</span>
                          <span className={`status-tag ${statusClass}`}>{m.status}</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${m.progress}%`, background: fillColor }}
                          ></div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8" }}>
                          <span>Completion: {m.progress}%</span>
                          <span>Time Spent: {m.timeSpentHours || 0} hrs</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quiz Performance List */}
              {(viewMode === "charts" || viewMode === "quizzes") && (
                <div className="detail-table-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, color: "#38bdf8", fontSize: "17px", fontWeight: "700" }}>
                      🏆 Quiz Assessments & Scores
                    </h3>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Avg Score: {progressData.avgQuizScore || 0}%
                    </span>
                  </div>
                  {progressData.quizzes.map((q) => (
                    <div key={q.id} className="quiz-item-row">
                      <div className="quiz-info">
                        <span className="quiz-title">{q.title}</span>
                        <span className="quiz-meta">
                          Attempts: {q.attempts || 0} • Status: {q.status} • Benchmark: 70%
                        </span>
                      </div>
                      <div className={`quiz-score-badge ${q.status === "Passed" ? "passed" : "pending"}`}>
                        {q.score > 0 ? `${q.score}%` : "Not Taken"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CourseProgressView;
