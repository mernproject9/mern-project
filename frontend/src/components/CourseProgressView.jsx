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

  return (
    <div className="progress-view-container">
      {/* Course Selector & Summary Header */}
      <div className="progress-header">
        <div className="course-selector-bar">
          <div className="selector-label-group">
            <span style={{ fontSize: "24px" }}>📊</span>
            <div>
              <h2 style={{ margin: 0, fontSize: "20px", color: "#f8fafc" }}>
                Course Detail & Learning Metrics
              </h2>
              <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#94a3b8" }}>
                Select a course to analyze real-time module progress & quiz analytics
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="selector-label">Select Course:</span>
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
              <div className="metric-icon">🎯</div>
              <div className="metric-info">
                <h4>Overall Completion</h4>
                <p style={{ color: "#a78bfa" }}>{progressData.overallProgress}% / 100%</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">⏱️</div>
              <div className="metric-info">
                <h4>Total Hours Spent</h4>
                <p style={{ color: "#38bdf8" }}>{progressData.totalHoursSpent || 0} hrs</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📝</div>
              <div className="metric-info">
                <h4>Avg Quiz Score</h4>
                <p style={{ color: "#4ade80" }}>{progressData.avgQuizScore || 0}%</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon">📦</div>
              <div className="metric-info">
                <h4>Modules Done</h4>
                <p style={{ color: "#facc15" }}>
                  {progressData.completedModules} / {progressData.totalModules}
                </p>
              </div>
            </div>

            <div className="metric-card" style={{ border: progressData.overallProgress >= 100 ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.1)" }}>
              <div className="metric-icon">{progressData.overallProgress >= 100 ? "🏆" : "🔒"}</div>
              <div className="metric-info">
                <h4>Cert Eligibility</h4>
                <p style={{ color: progressData.overallProgress >= 100 ? "#34d399" : "#fbbf24", fontSize: "14px", fontWeight: "bold" }}>
                  {progressData.overallProgress >= 100 ? "Eligible (100%)" : `${progressData.overallProgress}% (Req: 100%)`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          <div className="spinner" style={{ margin: "0 auto 15px auto" }}></div>
          <p>Fetching course analytics and progress data...</p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "30px", background: "#1e293b", borderRadius: "12px" }}>
          <p style={{ color: "#ef4444" }}>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && progressData && (
        <>
          {/* Main Charts Grid */}
          <div className="charts-grid-2col">
            {/* Chart 1: Module Progress */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="chart-card-title">
                  <span>📊</span> Module Completion & Time Spent
                </div>
                <span className="chart-badge">Bar Chart</span>
              </div>
              <ModuleProgressChart modules={progressData.modules} />
            </div>

            {/* Chart 2: Quiz Scores */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="chart-card-title">
                  <span>📈</span> Quiz Performance Trend vs 70% Pass Mark
                </div>
                <span className="chart-badge">Line Chart</span>
              </div>
              <QuizScoreChart quizzes={progressData.quizzes} />
            </div>

            {/* Chart 3: Doughnut Status Breakdown */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="chart-card-title">
                  <span>🍩</span> Module Status Distribution
                </div>
                <span className="chart-badge">Doughnut</span>
              </div>
              <CourseStatusDoughnut progressData={progressData} />
            </div>

            {/* Chart 4: Radar Skill Matrix */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div className="chart-card-title">
                  <span>🕸️</span> Skill Competency Matrix
                </div>
                <span className="chart-badge">Radar</span>
              </div>
              <SkillRadarChart skillMetrics={progressData.skillMetrics} />
            </div>
          </div>

          {/* Detailed Lists */}
          <div className="details-tables-grid">
            {/* Module Breakdown List */}
            <div className="detail-table-card">
              <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#a78bfa", fontSize: "17px" }}>
                📚 Detailed Module Breakdown
              </h3>
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
                      <span>Progress: {m.progress}%</span>
                      <span>Time Spent: {m.timeSpentHours || 0} hrs</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quiz Performance List */}
            <div className="detail-table-card">
              <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#38bdf8", fontSize: "17px" }}>
                🏆 Quiz Assessment Scores
              </h3>
              {progressData.quizzes.map((q) => (
                <div key={q.id} className="quiz-item-row">
                  <div className="quiz-info">
                    <span className="quiz-title">{q.title}</span>
                    <span className="quiz-meta">
                      Attempts: {q.attempts || 0} • Status: {q.status}
                    </span>
                  </div>
                  <div className={`quiz-score-badge ${q.status === "Passed" ? "passed" : "pending"}`}>
                    {q.score > 0 ? `${q.score}%` : "Not Taken"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CourseProgressView;
