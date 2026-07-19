import React, { useState, useEffect } from "react";
import { Plus, BookOpen, Users, TrendingUp, BarChart2, Search, Trash2, FolderPlus } from "lucide-react";
import { api } from "../utils/api";

// Register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Course addition form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [duration, setDuration] = useState("");
  const [moduleInput, setModuleInput] = useState("");
  const [modulesList, setModulesList] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const metrics = await api.getAdminStats();
      setStats(metrics);

      const detailedReports = await api.getAdminReports();
      setReports(detailedReports);
    } catch (err) {
      setError(err.message || "Failed to retrieve platform analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddModule = (e) => {
    e.preventDefault();
    if (moduleInput.trim() && !modulesList.includes(moduleInput.trim())) {
      setModulesList([...modulesList, moduleInput.trim()]);
      setModuleInput("");
    }
  };

  const handleRemoveModule = (indexToRemove) => {
    setModulesList(modulesList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (modulesList.length === 0) {
      setError("Please add at least one module to the course syllabus.");
      return;
    }

    setActionLoading(true);

    try {
      const courseData = {
        title,
        description,
        instructor,
        category,
        duration,
        modules: modulesList,
      };

      await api.createCourse(courseData);
      setSuccess(`Course "${title}" created successfully!`);
      
      // Clear form
      setTitle("");
      setDescription("");
      setInstructor("");
      setDuration("");
      setModulesList([]);
      
      // Refresh statistics and reports
      await fetchAdminData();
    } catch (err) {
      setError(err.message || "Failed to create course.");
    } finally {
      setActionLoading(false);
    }
  };

  // Compute average platform progress
  const averagePlatformProgress = reports.length
    ? Math.round(reports.reduce((sum, r) => sum + r.progress, 0) / reports.length)
    : 0;

  // Search filter reports
  const filteredReports = reports.filter((r) => {
    const studentName = r.student ? r.student.name.toLowerCase() : "";
    const studentEmail = r.student ? r.student.email.toLowerCase() : "";
    const courseTitle = r.course ? r.course.title.toLowerCase() : "";
    const match = searchQuery.toLowerCase();

    return (
      studentName.includes(match) ||
      studentEmail.includes(match) ||
      courseTitle.includes(match)
    );
  });

  // Chart setup
  const barData = {
    labels: stats?.courseEnrollments?.map((ce) => ce.title.substring(0, 12) + "...") || [],
    datasets: [
      {
        label: "Enrollments",
        data: stats?.courseEnrollments?.map((ce) => ce.count) || [],
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderColor: "var(--primary)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const doughnutData = {
    labels: stats?.categoryEnrollments?.map((cat) => cat.category) || [],
    datasets: [
      {
        data: stats?.categoryEnrollments?.map((cat) => cat.count) || [],
        backgroundColor: [
          "rgba(20, 184, 166, 0.8)",
          "rgba(99, 102, 241, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(244, 63, 94, 0.8)"
        ],
        borderWidth: 1,
      },
    ],
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
        <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>Loading platform analytics...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: "5rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>Administrator Analytics Hub</h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Unifying education workflows. Monitor student course metrics, expand the catalog, and generate reports.
        </p>
      </div>

      {success && (
        <div className="glass-panel" style={{
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          color: "var(--accent-emerald)",
          padding: "1rem",
          borderRadius: "var(--radius-sm)",
          marginBottom: "1.5rem"
        }}>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="glass-panel" style={{
          background: "rgba(244, 63, 94, 0.1)",
          border: "1px solid rgba(244, 63, 94, 0.2)",
          color: "var(--accent-rose)",
          padding: "1rem",
          borderRadius: "var(--radius-sm)",
          marginBottom: "1.5rem"
        }}>
          <span>{error}</span>
        </div>
      )}

      {/* platform KPIs */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2.5rem"
      }}>
        {/* KPI 1 */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Total Active Learners</span>
            <strong style={{ fontSize: "1.75rem", fontWeight: 700 }}>{stats?.totalStudents || 0}</strong>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "rgba(20,184,166,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-teal)" }}>
            <BookOpen size={24} />
          </div>
          <div>
            <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Courses Registered</span>
            <strong style={{ fontSize: "1.75rem", fontWeight: 700 }}>{stats?.totalCourses || 0}</strong>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-violet)" }}>
            <BarChart2 size={24} />
          </div>
          <div>
            <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Total Enrollments</span>
            <strong style={{ fontSize: "1.75rem", fontWeight: 700 }}>{stats?.totalEnrollments || 0}</strong>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent-emerald)" }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <span style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Average Progress</span>
            <strong style={{ fontSize: "1.75rem", fontWeight: 700 }}>{averagePlatformProgress}%</strong>
          </div>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "2rem",
        marginBottom: "3rem"
      }}>
        {/* Course enrollment bar chart */}
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem" }}>Course Enrollees Distribution</h3>
          <div style={{ position: "relative", height: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {stats?.courseEnrollments?.length === 0 ? (
              <span style={{ color: "var(--text-muted)" }}>No enrollments recorded</span>
            ) : (
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "rgba(255, 255, 255, 0.05)" },
                      ticks: { color: "var(--text-secondary)", stepSize: 1 }
                    },
                    x: {
                      ticks: { color: "var(--text-secondary)" },
                      grid: { display: false }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Category distribution doughnut chart */}
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem" }}>Enrollment by Skill Category</h3>
          <div style={{ position: "relative", height: "240px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {stats?.categoryEnrollments?.length === 0 ? (
              <span style={{ color: "var(--text-muted)" }}>No data available</span>
            ) : (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom", labels: { color: "var(--text-primary)" } } }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Layout containing course creation form and progress report */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 2fr",
        gap: "2rem",
        alignItems: "start"
      }}>
        {/* Course Creation Panel */}
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FolderPlus size={20} style={{ color: "var(--primary)" }} />
            Create Course Module
          </h2>

          <form onSubmit={handleCreateCourse}>
            <div className="input-group">
              <label className="input-label" htmlFor="course-title">Course Title</label>
              <input
                id="course-title"
                type="text"
                className="form-input"
                placeholder="e.g. intro to Python basics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="course-desc">Course Description</label>
              <textarea
                id="course-desc"
                className="form-input"
                style={{ resize: "vertical", minHeight: "80px", fontFamily: "inherit" }}
                placeholder="Details of what the course covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="input-group">
                <label className="input-label" htmlFor="course-instr">Instructor</label>
                <input
                  id="course-instr"
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="course-dur">Duration</label>
                <input
                  id="course-dur"
                  type="text"
                  className="form-input"
                  placeholder="e.g. 6 Weeks"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="course-cat">Category</label>
              <select
                id="course-cat"
                className="form-input"
                style={{ background: "#111827" }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Web Development">Web Development</option>
                <option value="Digital Literacy">Digital Literacy</option>
                <option value="Data Science">Data Science</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>
            </div>

            {/* Dynamic syllabus modules section */}
            <div style={{
              padding: "1rem",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid var(--border-glass)",
              borderRadius: "8px",
              marginBottom: "1.5rem"
            }}>
              <label className="input-label">Syllabus Modules ({modulesList.length})</label>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, padding: "0.5rem" }}
                  placeholder="e.g. Module 1: HTML tags"
                  value={moduleInput}
                  onChange={(e) => setModuleInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="btn btn-secondary"
                  style={{ padding: "0.5rem 1rem" }}
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {modulesList.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxHeight: "150px", overflowY: "auto" }}>
                  {modulesList.map((mod, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.4rem 0.6rem",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "4px",
                        fontSize: "0.85rem"
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {idx + 1}. {mod}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(idx)}
                        style={{ background: "none", border: "none", color: "var(--accent-rose)", cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>No modules added to syllabus.</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", height: "46px" }}
              disabled={actionLoading}
            >
              Create Course Module
            </button>
          </form>
        </div>

        {/* Platform Progress reports */}
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Learner Outcomes Ledger</h2>
            
            {/* Search reports */}
            <div style={{ position: "relative", minWidth: "220px" }}>
              <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                className="form-input"
                style={{ width: "100%", paddingLeft: "2.25rem", paddingRight: "0.5rem", height: "36px", fontSize: "0.85rem" }}
                placeholder="Search name, email, course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
              <span>No outcomes reported.</span>
            </div>
          ) : (
            <div className="table-container">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Learner</th>
                    <th>Course Program</th>
                    <th>Progress</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => (
                    <tr key={report._id}>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 600 }}>
                            {report.student ? report.student.name : "Unknown"}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {report.student ? report.student.email : ""}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 500 }}>
                            {report.course ? report.course.title : "Missing Course"}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                            {report.course ? report.course.category : ""}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ width: "60px", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
                            <div style={{
                              width: `${report.progress}%`,
                              height: "100%",
                              background: report.status === "completed" ? "var(--accent-emerald)" : "var(--primary)"
                            }} />
                          </div>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                            {report.progress}%
                          </span>
                        </div>
                      </td>
                      <td>
                        {report.status === "completed" ? (
                          <span className="badge badge-emerald">Completed</span>
                        ) : (
                          <span className="badge badge-amber">Enrolled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
