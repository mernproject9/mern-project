import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from "chart.js";
import { Bar, Pie, Doughnut } from "react-chartjs-2";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

export default function EnrollmentStatsChart({ adminToken }) {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("bar"); // "bar", "pie", "doughnut"
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchEnrollmentStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/enrollment-stats", {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatsData(data);
      } else {
        setError(data.message || "Failed to load enrollment aggregation stats");
      }
    } catch (err) {
      setError("Error connecting to server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      fetchEnrollmentStats();
    }
  }, [adminToken]);

  // Periodic real-time update sync
  useEffect(() => {
    if (!autoRefresh || !adminToken) return;
    const interval = setInterval(() => {
      fetchEnrollmentStats();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, adminToken]);

  if (loading && !statsData) {
    return (
      <div className="section-card" style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
        <div className="spinner-small" style={{ margin: "0 auto 1rem", width: "24px", height: "24px" }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem" }}>
          Connecting to MongoDB & rendering Chart.js visualizations...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-card" style={{ borderLeft: "4px solid #ef4444" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "1rem", color: "#f87171" }}>⚠️ Chart.js Load Error</h3>
          <button className="btn-secondary" onClick={fetchEnrollmentStats} style={{ fontSize: "0.78rem" }}>
            🔄 Retry
          </button>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
          {error}
        </p>
      </div>
    );
  }

  const chartData = statsData?.chartData || [];
  const categoryData = statsData?.categoryData || [];

  // Map API data to Chart.js Bar Chart configuration
  const barChartData = {
    labels: chartData.map((d) => d.courseCode || d.courseTitle.slice(0, 15)),
    datasets: [
      {
        label: "Total Enrollments",
        data: chartData.map((d) => d.enrollmentCount),
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderColor: "#6366f1",
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: "Active Learners",
        data: chartData.map((d) => d.activeCount),
        backgroundColor: "rgba(56, 189, 248, 0.8)",
        borderColor: "#38bdf8",
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: "Completed Certs",
        data: chartData.map((d) => d.completedCount),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "#34d399",
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#9ca3af",
          font: { family: "Inter", size: 12, weight: "600" },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#f9fafb",
        bodyColor: "#9ca3af",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (items) => {
            if (!items.length) return "";
            const index = items[0].dataIndex;
            return chartData[index] ? chartData[index].courseTitle : items[0].label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#9ca3af", font: { family: "Inter", size: 11 } },
        grid: { color: "rgba(255, 255, 255, 0.05)" }
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#9ca3af", font: { family: "Inter", size: 11 }, precision: 0 },
        grid: { color: "rgba(255, 255, 255, 0.05)" }
      }
    }
  };

  // Map API data to Chart.js Pie / Doughnut Chart configuration
  const pieChartColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#ec4899", "#3b82f6"];

  const pieChartData = {
    labels: categoryData.map((d) => d.category),
    datasets: [
      {
        label: "Enrollments per Category",
        data: categoryData.map((d) => d.count),
        backgroundColor: pieChartColors.slice(0, categoryData.length),
        borderColor: "#111827",
        borderWidth: 3
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#9ca3af",
          font: { family: "Inter", size: 12, weight: "600" },
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#f9fafb",
        bodyColor: "#9ca3af",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        padding: 12
      }
    }
  };

  return (
    <div className="section-card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Widget Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Chart.js Course Enrollment Dashboard
          </h2>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
            Visualizing MongoDB course aggregation using React & Chart.js
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "var(--text-secondary)", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            ⚡ Live Sync (15s)
          </label>

          <button
            className="btn-secondary"
            onClick={fetchEnrollmentStats}
            style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
          >
            🔄 Refresh Chart
          </button>
        </div>
      </div>

      {/* Metric Summary Banner */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "0.75rem",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "0.85rem 1.1rem"
      }}>
        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Total Enrollments</span>
          <strong style={{ fontSize: "1.3rem", color: "var(--accent-primary)" }}>{statsData?.totalEnrollments || 0}</strong>
        </div>
        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Active Learners</span>
          <strong style={{ fontSize: "1.3rem", color: "#38bdf8" }}>{statsData?.totalActive || 0}</strong>
        </div>
        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Completed Certs</span>
          <strong style={{ fontSize: "1.3rem", color: "#34d399" }}>{statsData?.totalCompleted || 0}</strong>
        </div>
        <div>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Total Courses</span>
          <strong style={{ fontSize: "1.3rem", color: "#c084fc" }}>{statsData?.totalCourses || 0}</strong>
        </div>
      </div>

      {/* Chart.js Controls: Bar / Pie / Doughnut Switcher */}
      <div className="tab-group" style={{ marginBottom: "0.25rem" }}>
        <button
          type="button"
          className={`tab-btn ${chartType === 'bar' ? 'active' : ''}`}
          onClick={() => setChartType('bar')}
        >
          📊 Bar Chart (Enrollments per Course)
        </button>
        <button
          type="button"
          className={`tab-btn ${chartType === 'pie' ? 'active' : ''}`}
          onClick={() => setChartType('pie')}
        >
          🥧 Pie Chart (Category Breakdown)
        </button>
        <button
          type="button"
          className={`tab-btn ${chartType === 'doughnut' ? 'active' : ''}`}
          onClick={() => setChartType('doughnut')}
        >
          🍩 Doughnut Chart
        </button>
      </div>

      {/* Canvas Area for Chart.js Container */}
      <div style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
        height: "340px",
        position: "relative"
      }}>
        {chartData.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-secondary)" }}>
            No enrollment data retrieved from MongoDB.
          </div>
        ) : chartType === "bar" ? (
          <Bar data={barChartData} options={barChartOptions} />
        ) : chartType === "pie" ? (
          <Pie data={pieChartData} options={pieChartOptions} />
        ) : (
          <Doughnut data={pieChartData} options={pieChartOptions} />
        )}
      </div>

      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "right" }}>
        Chart.js Canvas Rendered • Data Synced: {statsData?.generatedAt ? new Date(statsData.generatedAt).toLocaleTimeString() : 'Just now'}
      </div>
    </div>
  );
}
