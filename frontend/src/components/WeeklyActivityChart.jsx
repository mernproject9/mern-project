import { useState, useEffect, useRef, useCallback } from "react";
import Chart from "chart.js/auto";
import { Clock, BookOpen, Layers, Flame, RefreshCw, PlusCircle, AlertCircle, Sparkles } from "lucide-react";

const WeeklyActivityChart = ({ token, API_BASE, refreshTrigger }) => {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [metric, setMetric] = useState("timeSpent"); // 'timeSpent', 'modulesCompleted', 'both'
  const [activeScenario, setActiveScenario] = useState("current"); // 'current', 'consistent', 'spike', 'inactive', 'empty'
  const [showLogModal, setShowLogModal] = useState(false);

  // Manual Log Form State
  const [logForm, setLogForm] = useState({
    timeSpentMinutes: 30,
    modulesCompleted: 1,
    notes: "",
  });
  const [logSubmitting, setLogSubmitting] = useState(false);

  // Fetch weekly activity metrics from API
  const fetchWeeklyActivity = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/activity/weekly`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to load weekly activity metrics");
      }

      const data = await response.json();
      setActivityData(data);
    } catch (err) {
      console.error("Weekly activity fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, API_BASE]);

  useEffect(() => {
    fetchWeeklyActivity();
  }, [fetchWeeklyActivity, refreshTrigger]);

  // Seed sample scenario for testing
  const handleSelectScenario = async (scenario) => {
    setActiveScenario(scenario);
    if (scenario === "current") {
      fetchWeeklyActivity();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/activity/seed-scenario`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scenario }),
      });

      if (response.ok) {
        await fetchWeeklyActivity();
      }
    } catch (err) {
      console.error("Failed to seed scenario:", err);
    } finally {
      setLoading(false);
    }
  };

  // Submit manual log session
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setLogSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/activity/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(logForm),
      });

      if (response.ok) {
        setShowLogModal(false);
        setLogForm({ timeSpentMinutes: 30, modulesCompleted: 1, notes: "" });
        setActiveScenario("current");
        await fetchWeeklyActivity();
      }
    } catch (err) {
      console.error("Error logging activity:", err);
    } finally {
      setLogSubmitting(false);
    }
  };

  // Render Chart.js Line Chart
  useEffect(() => {
    if (!canvasRef.current || !activityData || loading) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");

    // Create gradient fills
    const gradientIndigo = ctx.createLinearGradient(0, 0, 0, 300);
    gradientIndigo.addColorStop(0, "rgba(99, 102, 241, 0.45)");
    gradientIndigo.addColorStop(1, "rgba(99, 102, 241, 0.0)");

    const gradientSky = ctx.createLinearGradient(0, 0, 0, 300);
    gradientSky.addColorStop(0, "rgba(14, 165, 233, 0.45)");
    gradientSky.addColorStop(1, "rgba(14, 165, 233, 0.0)");

    const labels = activityData.weeks.map((w) => `${w.subLabel}\n(${w.range})`);

    let datasets = [];

    if (metric === "timeSpent") {
      datasets = [
        {
          label: "Time Spent (mins)",
          data: activityData.datasets.timeSpent,
          borderColor: "#6366f1",
          backgroundColor: gradientIndigo,
          fill: true,
          tension: 0.38,
          pointBackgroundColor: "#818cf8",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 9,
          borderWidth: 3,
        },
      ];
    } else if (metric === "modulesCompleted") {
      datasets = [
        {
          label: "Modules Completed",
          data: activityData.datasets.modulesCompleted,
          borderColor: "#0ea5e9",
          backgroundColor: gradientSky,
          fill: true,
          tension: 0.38,
          pointBackgroundColor: "#38bdf8",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 9,
          borderWidth: 3,
        },
      ];
    } else {
      // Both datasets (Dual Axis)
      datasets = [
        {
          label: "Time Spent (mins)",
          data: activityData.datasets.timeSpent,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          fill: true,
          tension: 0.38,
          yAxisID: "y",
          pointRadius: 5,
          borderWidth: 2.5,
        },
        {
          label: "Modules Completed",
          data: activityData.datasets.modulesCompleted,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          fill: true,
          tension: 0.38,
          yAxisID: "y1",
          pointRadius: 5,
          borderWidth: 2.5,
        },
      ];
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: "#94a3b8",
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: "500" },
            usePointStyle: true,
            boxWidth: 8,
          },
        },
        tooltip: {
          backgroundColor: "#0f172a",
          titleColor: "#f8fafc",
          bodyColor: "#cbd5e1",
          borderColor: "rgba(255, 255, 255, 0.12)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              const w = activityData.weeks[idx];
              return `${w.weekLabel} (${w.range})`;
            },
            label: (context) => {
              const label = context.dataset.label || "";
              const val = context.raw;
              if (label.includes("Time")) {
                const hours = (val / 60).toFixed(1);
                return `⏱️ ${label}: ${val} mins (${hours} hrs)`;
              }
              return `📚 ${label}: ${val} modules`;
            },
            footer: (items) => {
              const idx = items[0].dataIndex;
              const w = activityData.weeks[idx];
              if (w.timeSpent === 0 && w.modulesCompleted === 0) {
                return "⚠️ No activity logged this week";
              }
              return `🔥 Active Week (${w.activityCount || 1} session/s)`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: {
            color: "#94a3b8",
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
          },
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          min: 0,
          grid: { color: "rgba(255, 255, 255, 0.05)" },
          ticks: {
            color: "#94a3b8",
            precision: 0,
            font: { family: "'Plus Jakarta Sans', sans-serif" },
          },
          title: {
            display: metric !== "both",
            text: metric === "timeSpent" ? "Minutes" : "Modules",
            color: "#64748b",
            font: { size: 11 },
          },
        },
        ...(metric === "both"
          ? {
              y1: {
                type: "linear",
                display: true,
                position: "right",
                min: 0,
                grid: { drawOnChartArea: false },
                ticks: {
                  color: "#10b981",
                  precision: 0,
                },
                title: {
                  display: true,
                  text: "Modules",
                  color: "#10b981",
                },
              },
            }
          : {}),
      },
    };

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets,
      },
      options: chartOptions,
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [activityData, metric, loading]);

  const isEmpty = activityData?.summary?.totalTimeSpent === 0 && activityData?.summary?.totalModulesCompleted === 0;

  return (
    <div className="activity-chart-card">
      <div className="activity-card-header">
        <div>
          <div className="header-badge">
            <Flame size={14} className="text-orange-400" />
            <span>Weekly Learning Consistency</span>
          </div>
          <h3 className="card-title">Past 4 Weeks Activity Trends</h3>
          <p className="card-subtitle">Track your time spent and modules completed weekly</p>
        </div>

        <div className="header-actions">
          {/* Metric Selector Toggle */}
          <div className="metric-toggle-group">
            <button
              className={`toggle-btn ${metric === "timeSpent" ? "active" : ""}`}
              onClick={() => setMetric("timeSpent")}
              title="View Time Spent (Minutes)"
            >
              <Clock size={14} /> Time Spent
            </button>
            <button
              className={`toggle-btn ${metric === "modulesCompleted" ? "active" : ""}`}
              onClick={() => setMetric("modulesCompleted")}
              title="View Modules Completed"
            >
              <BookOpen size={14} /> Modules
            </button>
            <button
              className={`toggle-btn ${metric === "both" ? "active" : ""}`}
              onClick={() => setMetric("both")}
              title="View Both Metrics"
            >
              <Layers size={14} /> Both
            </button>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => setShowLogModal(true)}>
            <PlusCircle size={14} /> Log Activity
          </button>
        </div>
      </div>

      {/* Test Scenarios Quick Toolbar */}
      <div className="scenario-toolbar">
        <span className="scenario-label">
          <Sparkles size={13} /> Test Data Scenarios:
        </span>
        <div className="scenario-buttons">
          <button
            className={`scenario-btn ${activeScenario === "current" ? "active" : ""}`}
            onClick={() => handleSelectScenario("current")}
          >
            Live Data
          </button>
          <button
            className={`scenario-btn ${activeScenario === "consistent" ? "active" : ""}`}
            onClick={() => handleSelectScenario("consistent")}
          >
            🎯 Consistent
          </button>
          <button
            className={`scenario-btn ${activeScenario === "spike" ? "active" : ""}`}
            onClick={() => handleSelectScenario("spike")}
          >
            ⚡ Recent Spike
          </button>
          <button
            className={`scenario-btn ${activeScenario === "inactive" ? "active" : ""}`}
            onClick={() => handleSelectScenario("inactive")}
          >
            💤 Inactive Weeks
          </button>
          <button
            className={`scenario-btn ${activeScenario === "empty" ? "active" : ""}`}
            onClick={() => handleSelectScenario("empty")}
          >
            🚫 Empty (0 Data)
          </button>
        </div>
      </div>

      {/* Activity Summary Stat Badges */}
      {activityData && (
        <div className="activity-summary-grid">
          <div className="stat-pill">
            <span className="pill-label">Total Time Spent</span>
            <span className="pill-value text-indigo-400">
              {activityData.summary.totalTimeSpent} mins ({activityData.summary.totalTimeSpentHours} hrs)
            </span>
          </div>
          <div className="stat-pill">
            <span className="pill-label">Modules Completed</span>
            <span className="pill-value text-sky-400">
              {activityData.summary.totalModulesCompleted} modules
            </span>
          </div>
          <div className="stat-pill">
            <span className="pill-label">Consistency Streak</span>
            <span className="pill-value text-emerald-400">
              {activityData.summary.activeWeeks} of 4 Active Weeks ({Math.round((activityData.summary.activeWeeks / 4) * 100)}%)
            </span>
          </div>
          <div className="stat-pill">
            <span className="pill-label">Weekly Avg</span>
            <span className="pill-value text-amber-400">
              {activityData.summary.avgTimePerWeek} mins / wk
            </span>
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="chart-canvas-wrapper" style={{ position: "relative", height: "300px", marginTop: "1rem" }}>
        {loading ? (
          <div className="chart-loading-state">
            <RefreshCw size={24} className="spin-icon" />
            <span>Updating activity metrics...</span>
          </div>
        ) : error ? (
          <div className="chart-error-state">
            <AlertCircle size={24} />
            <span>{error}</span>
          </div>
        ) : (
          <>
            {isEmpty && (
              <div className="empty-chart-overlay">
                <div className="empty-chart-box">
                  <Flame size={28} className="text-amber-500 opacity-60" />
                  <h4>No Activity Recorded for Past 4 Weeks</h4>
                  <p>Check off modules in your courses or click "Log Activity" to start tracking your streak!</p>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowLogModal(true)}>
                    <PlusCircle size={14} /> Log First Session
                  </button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} />
          </>
        )}
      </div>

      {/* Week-by-Week Cards (Handles Empty Weeks gracefully with Placeholders) */}
      {activityData && (
        <div className="weekly-breakdown-section">
          <h4 className="breakdown-title">Past 4 Weeks Detailed Breakdown</h4>
          <div className="weeks-grid">
            {activityData.weeks.map((week) => {
              const isWeekEmpty = week.timeSpent === 0 && week.modulesCompleted === 0;

              return (
                <div key={week.weekIndex} className={`week-card ${isWeekEmpty ? "empty-week" : "active-week"}`}>
                  <div className="week-card-header">
                    <span className="week-name">{week.weekLabel}</span>
                    <span className="week-date-badge">{week.range}</span>
                  </div>

                  <div className="week-card-metrics">
                    <div className="metric-row">
                      <span className="m-label"><Clock size={12} /> Time:</span>
                      <span className={`m-val ${isWeekEmpty ? "text-muted" : "text-indigo-400"}`}>
                        {isWeekEmpty ? "0 mins (Empty)" : `${week.timeSpent} mins (${week.timeSpentHours}h)`}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="m-label"><BookOpen size={12} /> Modules:</span>
                      <span className={`m-val ${isWeekEmpty ? "text-muted" : "text-sky-400"}`}>
                        {isWeekEmpty ? "0 completed" : `${week.modulesCompleted} modules`}
                      </span>
                    </div>
                  </div>

                  {isWeekEmpty ? (
                    <div className="week-placeholder-tag">
                      <span>No activity</span>
                    </div>
                  ) : (
                    <div className="week-active-tag">
                      <span>{week.activityCount || 1} session(s)</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Manual Activity Log Modal */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content activity-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log Learning Session</h3>
              <button className="close-btn" onClick={() => setShowLogModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleLogSubmit} className="modal-form">
              <div className="form-group">
                <label>Time Spent (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="600"
                  value={logForm.timeSpentMinutes}
                  onChange={(e) => setLogForm({ ...logForm, timeSpentMinutes: e.target.value })}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Modules Completed</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={logForm.modulesCompleted}
                  onChange={(e) => setLogForm({ ...logForm, modulesCompleted: e.target.value })}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Notes / Topic (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Practiced React State & Hooks"
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLogModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={logSubmitting}>
                  {logSubmitting ? "Saving..." : "Save Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyActivityChart;
