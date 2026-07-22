import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  Award,
  TrendingUp,
  Users,
  Grid,
  PlusCircle,
  FileText,
  LogOut,
  Clock,
  Search,
  Filter,
  User,
  Printer,
  Sparkles,
  Layers,
  ShieldCheck,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react";
import AnalyticsChart from "../components/AnalyticsChart";
import WeeklyActivityChart from "../components/WeeklyActivityChart";
import VerifyCertificate from "../components/VerifyCertificate";

const Dashboard = () => {
  const { user, token, logout, API_BASE } = useContext(AuthContext);
  const navigate = useNavigate();

  // Route protection
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // Sidebar navigation active state
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, courses, manage-courses, reports (admin)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Learner State ---
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [learnerStats, setLearnerStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedProgressCourse, setSelectedProgressCourse] = useState(null); // for progress modal
  const [selectedCertificate, setSelectedCertificate] = useState(null); // for certificate modal
  const [activityRefreshTrigger, setActivityRefreshTrigger] = useState(0);

  // --- Admin State ---
  const [adminStats, setAdminStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReportCourse, setSelectedReportCourse] = useState("");
  const [isGeneratingCsv, setIsGeneratingCsv] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "Web Development",
    duration: "4 weeks",
    instructor: "",
    modules: "",
  });

  // Admin Course Edit & Delete State
  const [editingCourse, setEditingCourse] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
    instructor: "",
    modules: "",
    imageUrl: "",
  });
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);

  // Common notifications
  const [alert, setAlert] = useState({ type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 4000);
  };

  // Fetch Learners Data
  const fetchLearnerData = useCallback(async () => {
    if (!token || user?.role !== "learner") return;
    try {
      // 1. My Enrollments
      const enrollRes = await fetch(`${API_BASE}/enrollments/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (enrollRes.ok) {
        const enrollData = await enrollRes.json();
        setMyEnrollments(enrollData);
      }

      // 2. Stats
      const statsRes = await fetch(`${API_BASE}/enrollments/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setLearnerStats(statsData);
      }

      // 3. All Courses to Browse
      const coursesRes = await fetch(`${API_BASE}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setAvailableCourses(coursesData);
      }
    } catch (err) {
      console.error("Error fetching learner data:", err);
    }
  }, [token, user, API_BASE]);

  // Fetch Admin Data
  const fetchAdminData = useCallback(async () => {
    if (!token || user?.role !== "admin") return;
    try {
      // 1. Admin Dashboard Stats
      const statsRes = await fetch(`${API_BASE}/enrollments/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setAdminStats(statsData);
      }

      // 2. Admin Progress Reports Table
      const reportsRes = await fetch(`${API_BASE}/enrollments/admin/reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }

      // 3. Courses List (to verify or show number of modules)
      const coursesRes = await fetch(`${API_BASE}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setAvailableCourses(coursesData);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  }, [token, user, API_BASE]);

  useEffect(() => {
    if (user) {
      if (user.role === "learner") {
        fetchLearnerData();
      } else if (user.role === "admin") {
        fetchAdminData();
      }
    }
  }, [user, token, fetchLearnerData, fetchAdminData]);

  // Handle CSV Progress Report Generation & Download (Admin)
  const handleDownloadCsvReport = async () => {
    setIsGeneratingCsv(true);
    try {
      const url = selectedReportCourse
        ? `${API_BASE}/enrollments/admin/reports/csv?courseId=${selectedReportCourse}`
        : `${API_BASE}/enrollments/admin/reports/csv`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to download CSV report");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;

      let filename = "course_progress_report.csv";
      const disposition = response.headers.get("Content-Disposition");
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      a.setAttribute("download", filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      showAlert("success", "Progress report CSV generated and downloaded successfully!");
    } catch (error) {
      console.error("Download CSV error:", error);
      showAlert("danger", error.message || "Failed to generate CSV report");
    } finally {
      setIsGeneratingCsv(false);
    }
  };

  // Handle Course Enrollment
  const handleEnroll = async (courseId) => {
    try {
      const response = await fetch(`${API_BASE}/enrollments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to enroll");
      }

      showAlert("success", `Enrolled in "${data.courseId?.title || "Course"}" successfully!`);
      fetchLearnerData();
    } catch (error) {
      showAlert("danger", error.message);
    }
  };

  // Handle Module Toggle (Progress tracking)
  const handleModuleToggle = async (moduleName) => {
    if (!selectedProgressCourse) return;

    const courseId = selectedProgressCourse.courseId._id;
    let updatedCompleted = [...selectedProgressCourse.completedModules];

    if (updatedCompleted.includes(moduleName)) {
      updatedCompleted = updatedCompleted.filter((m) => m !== moduleName);
    } else {
      updatedCompleted.push(moduleName);
    }

    try {
      const response = await fetch(`${API_BASE}/enrollments/my/${courseId}/progress`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completedModules: updatedCompleted }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedProgressCourse(data); // update modal state
        
        // update local list state
        setMyEnrollments((prev) =>
          prev.map((e) => (e._id === data._id ? data : e))
        );

        // refetch stats to update dashboard charts
        const statsRes = await fetch(`${API_BASE}/enrollments/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setLearnerStats(statsData);
        }

        // Trigger weekly activity chart refetch
        setActivityRefreshTrigger((prev) => prev + 1);

        if (data.progress === 100) {
          showAlert("success", `Congratulations! You completed ${data.courseId.title}! Claim your certificate now.`);
        }
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  // Handle Admin Add Course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCourse),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create course");
      }

      showAlert("success", `Course "${data.title}" created successfully!`);
      setNewCourse({
        title: "",
        description: "",
        category: "Web Development",
        duration: "4 weeks",
        instructor: "",
        modules: "",
      });
      fetchAdminData();
    } catch (error) {
      showAlert("danger", error.message);
    }
  };

  // Pre-fill Edit Form with existing course details
  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setEditFormData({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "Web Development",
      duration: course.duration || "",
      instructor: course.instructor || "",
      modules: Array.isArray(course.modules) ? course.modules.join(", ") : course.modules || "",
      imageUrl: course.imageUrl || "",
    });
  };

  // Send Update Course Request to Backend (PUT /api/courses/:id)
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    setIsSubmittingCourse(true);
    try {
      const response = await fetch(`${API_BASE}/courses/${editingCourse._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update course");
      }

      showAlert("success", `Course "${data.title}" updated successfully!`);
      setEditingCourse(null);
      fetchAdminData();
    } catch (error) {
      showAlert("danger", error.message);
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  // Send Delete Course Request to Backend (DELETE /api/courses/:id)
  const handleConfirmDeleteCourse = async () => {
    if (!deletingCourse) return;
    setIsSubmittingCourse(true);
    try {
      const response = await fetch(`${API_BASE}/courses/${deletingCourse._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete course");
      }

      showAlert("success", `Course "${deletingCourse.title}" deleted successfully!`);
      setDeletingCourse(null);
      fetchAdminData();
    } catch (error) {
      showAlert("danger", error.message);
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  if (!user) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading user profile...</p>
      </div>
    );
  }

  // Filter available courses
  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === "" || course.category === categoryFilter;

    // Learners shouldn't see courses they are already enrolled in
    const isEnrolled = myEnrollments.some((e) => e.courseId?._id === course._id);

    return matchesSearch && matchesCategory && !isEnrolled;
  });

  // Unique categories for filtering
  const categoriesList = [...new Set(availableCourses.map((c) => c.category))];

  // --- Chart Setup (Learner) ---
  const learnerProgressChartData = {
    labels: learnerStats?.courseProgressList.map((c) => c.courseTitle.substring(0, 15) + "...") || [],
    datasets: [
      {
        label: "Progress (%)",
        data: learnerStats?.courseProgressList.map((c) => c.progress) || [],
        backgroundColor: "rgba(99, 102, 241, 0.4)",
        borderColor: "#6366f1",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const learnerCategoryChartData = {
    labels: Object.keys(learnerStats?.categories || {}),
    datasets: [
      {
        data: Object.values(learnerStats?.categories || {}),
        backgroundColor: [
          "rgba(99, 102, 241, 0.7)",
          "rgba(14, 165, 233, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(245, 158, 11, 0.7)",
        ],
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
    ],
  };

  // --- Chart Setup (Admin) ---
  const adminEnrollmentsChartData = {
    labels: adminStats?.coursesBreakdown.map((c) => c.courseTitle.substring(0, 15) + "...") || [],
    datasets: [
      {
        label: "Enrollments",
        data: adminStats?.coursesBreakdown.map((c) => c.enrollments) || [],
        backgroundColor: "rgba(14, 165, 233, 0.6)",
        borderColor: "#0ea5e9",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const adminCategoryChartData = {
    labels: adminStats?.categoriesBreakdown.map((c) => c.category) || [],
    datasets: [
      {
        data: adminStats?.categoriesBreakdown.map((c) => c.count) || [],
        backgroundColor: [
          "rgba(99, 102, 241, 0.7)",
          "rgba(14, 165, 233, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(245, 158, 11, 0.7)",
        ],
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
      },
    ],
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">UL</div>
          <span className="logo-text">UrbanLearner</span>
        </div>

        <ul className="sidebar-menu">
          <li>
            <a
              className={`sidebar-link ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("dashboard");
                setMobileMenuOpen(false);
              }}
            >
              <Grid size={20} /> Dashboard
            </a>
          </li>
          <li>
            <a
              className={`sidebar-link ${activeTab === "courses" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("courses");
                setMobileMenuOpen(false);
              }}
            >
              <BookOpen size={20} /> {user.role === "admin" ? "Courses Catalog" : "Enroll & Browse"}
            </a>
          </li>
          {user.role === "admin" && (
            <>
              <li>
                <a
                  className={`sidebar-link ${activeTab === "manage-courses" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("manage-courses");
                    setMobileMenuOpen(false);
                  }}
                >
                  <BookOpen size={20} /> Manage Courses
                </a>
              </li>
              <li>
                <a
                  className={`sidebar-link ${activeTab === "reports" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("reports");
                    setMobileMenuOpen(false);
                  }}
                >
                  <FileText size={20} /> Analytics & Reports
                </a>
              </li>
              <li>
                <a
                  className={`sidebar-link ${activeTab === "verify-certificate" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("verify-certificate");
                    setMobileMenuOpen(false);
                  }}
                >
                  <ShieldCheck size={20} /> Verify Certificate
                </a>
              </li>
            </>
          )}
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile-widget">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-block"
            style={{ marginTop: "16px", padding: "8px", fontSize: "0.85rem" }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Navbar */}
        <header className="navbar">
          <h1 className="nav-title">
            {activeTab === "dashboard" && "Dashboard Overview"}
            {activeTab === "courses" && (user.role === "admin" ? "Academy Courses" : "Explore Courses")}
            {activeTab === "manage-courses" && "Admin Course Management"}
            {activeTab === "reports" && "Education Metrics & Reports"}
            {activeTab === "verify-certificate" && "Certificate Authenticity Verification"}
          </h1>

          <div className="nav-actions">
            <button
              className="btn btn-secondary"
              style={{ display: "none" }} /* In responsive design can reveal mobile menu toggler */
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              Menu
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="badge badge-info" style={{ textTransform: "uppercase" }}>
                {user.role} Portal
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="content-body">
          {alert.message && (
            <div className={`alert alert-${alert.type}`} style={{ marginBottom: "24px" }}>
              {alert.message}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD FOR LEARNER */}
          {/* ========================================================= */}
          {user.role === "learner" && activeTab === "dashboard" && (
            <>
              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon-wrapper" style={{ backgroundColor: "#4f46e5" }}>
                    <BookOpen size={24} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-label">Enrolled Courses</span>
                    <span className="metric-value">{learnerStats?.totalEnrollments || 0}</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrapper" style={{ backgroundColor: "#10b981" }}>
                    <Award size={24} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-label">Completed Courses</span>
                    <span className="metric-value">{learnerStats?.completedCourses || 0}</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrapper" style={{ backgroundColor: "#f59e0b" }}>
                    <Clock size={24} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-label">In-Progress</span>
                    <span className="metric-value">{learnerStats?.inProgressCourses || 0}</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrapper" style={{ backgroundColor: "#0ea5e9" }}>
                    <TrendingUp size={24} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-label">Average Progress</span>
                    <span className="metric-value">{learnerStats?.avgProgress || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Weekly Learning Activity Line Chart Component */}
              <WeeklyActivityChart token={token} API_BASE={API_BASE} refreshTrigger={activityRefreshTrigger} />

              {/* Charts & Progress */}
              <div className="charts-grid">
                {/* Chart 1: Course Progress */}
                <div className="chart-card">
                  <div className="card-header">
                    <h3 className="card-title">Enrolled Courses Progress</h3>
                  </div>
                  <div className="chart-container">
                    {learnerStats?.courseProgressList && learnerStats.courseProgressList.length > 0 ? (
                      <AnalyticsChart type="bar" data={learnerProgressChartData} />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--text-muted)",
                        }}
                      >
                        No active enrollments to show.
                      </div>
                    )}
                  </div>
                </div>

                {/* Chart 2: Category distribution */}
                <div className="chart-card">
                  <div className="card-header">
                    <h3 className="card-title">Topic Breakdown</h3>
                  </div>
                  <div className="chart-container">
                    {learnerStats?.categories && Object.keys(learnerStats.categories).length > 0 ? (
                      <AnalyticsChart type="doughnut" data={learnerCategoryChartData} />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--text-muted)",
                        }}
                      >
                        No data available.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Enrolled Courses Trackers */}
              <div className="chart-card" style={{ marginBottom: "32px" }}>
                <div className="card-header">
                  <h3 className="card-title">My Learning Portal</h3>
                </div>
                {myEnrollments.length > 0 ? (
                  <div className="table-wrapper">
                    <table className="glass-table">
                      <thead>
                        <tr>
                          <th>Course Name</th>
                          <th>Instructor</th>
                          <th>Progress</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myEnrollments.map((enroll) => (
                          <tr key={enroll._id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{enroll.courseId?.title}</div>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {enroll.courseId?.category}
                              </span>
                            </td>
                            <td>{enroll.courseId?.instructor}</td>
                            <td>
                              <div style={{ minWidth: "150px" }}>
                                <div className="progress-info">
                                  <span>{enroll.progress}%</span>
                                  <span>
                                    {enroll.completedModules.length} of {enroll.courseId?.modules.length || 0} modules
                                  </span>
                                </div>
                                <div className="progress-track">
                                  <div className="progress-fill" style={{ width: `${enroll.progress}%` }}></div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {enroll.status === "completed" ? (
                                <span className="badge badge-success">Completed</span>
                              ) : (
                                <span className="badge badge-info">Learning</span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                                  onClick={() => setSelectedProgressCourse(enroll)}
                                >
                                  Update Progress
                                </button>
                                {enroll.status === "completed" && (
                                  <button
                                    className="btn btn-success"
                                    style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                                    onClick={() => setSelectedCertificate(enroll)}
                                  >
                                    <Award size={14} /> Certificate
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    <p style={{ marginBottom: "16px" }}>You are not enrolled in any courses yet.</p>
                    <button className="btn btn-primary" onClick={() => setActiveTab("courses")}>
                      Browse Courses Catalog
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 1: DASHBOARD FOR ADMIN */}
          {/* ========================================================= */}
          {user.role === "admin" && activeTab === "dashboard" && (
            <>
              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon-wrapper" style={{ backgroundColor: "#4f46e5" }}>
                    <Users size={24} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-label">Total Learners</span>
                    <span className="metric-value">{adminStats?.totalStudents || 0}</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrapper" style={{ backgroundColor: "#0ea5e9" }}>
                    <BookOpen size={24} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-label">Total Courses</span>
                    <span className="metric-value">{adminStats?.totalCourses || 0}</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrapper" style={{ backgroundColor: "#10b981" }}>
                    <Layers size={24} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-label">Total Enrollments</span>
                    <span className="metric-value">{adminStats?.totalEnrollments || 0}</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon-wrapper" style={{ backgroundColor: "#f59e0b" }}>
                    <Award size={24} />
                  </div>
                  <div className="metric-details">
                    <span className="metric-label">Completed Certs</span>
                    <span className="metric-value">{adminStats?.completedEnrollments || 0}</span>
                  </div>
                </div>
              </div>

              {/* Grid: Charts & Add Course */}
              <div className="charts-grid">
                {/* Enrollments Chart */}
                <div className="chart-card">
                  <div className="card-header">
                    <h3 className="card-title">Enrollment Statistics per Course</h3>
                  </div>
                  <div className="chart-container">
                    {adminStats?.coursesBreakdown && adminStats.coursesBreakdown.length > 0 ? (
                      <AnalyticsChart type="bar" data={adminEnrollmentsChartData} />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--text-muted)",
                        }}
                      >
                        No enrollment stats available yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Categories Chart */}
                <div className="chart-card">
                  <div className="card-header">
                    <h3 className="card-title">Course Category Share</h3>
                  </div>
                  <div className="chart-container">
                    {adminStats?.categoriesBreakdown && adminStats.categoriesBreakdown.length > 0 ? (
                      <AnalyticsChart type="doughnut" data={adminCategoryChartData} />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--text-muted)",
                        }}
                      >
                        No categories stats.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Course Creation Panel */}
              <div className="chart-card" style={{ marginBottom: "32px" }}>
                <div className="card-header">
                  <h3 className="card-title">
                    <PlusCircle size={18} style={{ verticalAlign: "middle", marginRight: "6px" }} /> Add New Course
                  </h3>
                </div>
                <form onSubmit={handleAddCourse} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Course Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Master React 19 & Redux Toolkit"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Course Category</label>
                    <select
                      className="form-select"
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Design">UI/UX Design</option>
                      <option value="Product Management">Product Management</option>
                      <option value="Marketing">Digital Marketing</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 6 weeks, 24 hours"
                      value={newCourse.duration}
                      onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Instructor Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Prof. Sarah Jenkins"
                      value={newCourse.instructor}
                      onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Course Modules (Comma Separated)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Intro, Setup, Routing, Authentication, State Management"
                      value={newCourse.modules}
                      onChange={(e) => setNewCourse({ ...newCourse, modules: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      placeholder="Give a brief summary of the course topics, outcomes, and objectives..."
                      style={{ resize: "vertical", fontFamily: "inherit" }}
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: "12px 32px" }}>
                      Create Course
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 2: EXPLORE COURSES / ADMIN MANAGE COURSES */}
          {/* ========================================================= */}
          {user.role === "admin" && activeTab === "manage-courses" && (
            <div className="chart-card">
              <div
                className="card-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <h3 className="card-title" style={{ margin: 0 }}>
                  Manage Courses List ({availableCourses.length})
                </h3>

                <div className="search-input-wrapper" style={{ margin: 0 }}>
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    className="form-input search-input"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "260px" }}
                  />
                </div>
              </div>

              {availableCourses.length > 0 ? (
                <div className="table-wrapper">
                  <table className="glass-table">
                    <thead>
                      <tr>
                        <th>Course Title</th>
                        <th>Category</th>
                        <th>Instructor</th>
                        <th>Duration</th>
                        <th>Modules</th>
                        <th style={{ textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableCourses
                        .filter((course) => {
                          const matchesSearch =
                            (course.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (course.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (course.instructor || "").toLowerCase().includes(searchQuery.toLowerCase());
                          return matchesSearch;
                        })
                        .map((course) => (
                          <tr key={course._id}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{course.title}</div>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {course.description}
                              </span>
                            </td>
                            <td>
                              <span className="badge badge-info">{course.category}</span>
                            </td>
                            <td>{course.instructor}</td>
                            <td>{course.duration}</td>
                            <td>{Array.isArray(course.modules) ? course.modules.length : 0} modules</td>
                            <td>
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}
                                  onClick={() => handleOpenEditModal(course)}
                                >
                                  <Edit size={14} /> Edit
                                </button>
                                <button
                                  className="btn btn-danger"
                                  style={{ padding: "6px 12px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}
                                  onClick={() => setDeletingCourse(course)}
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  No courses registered yet.
                </div>
              )}
            </div>
          )}

          {activeTab === "courses" && (
            <>
              {/* Filter controls */}
              <div className="courses-header">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    className="form-input search-input"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "300px" }}
                  />
                </div>

                <div className="filters-wrapper">
                  <Filter size={16} style={{ color: "var(--text-muted)" }} />
                  <select
                    className="form-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ width: "200px" }}
                  >
                    <option value="">All Categories</option>
                    {categoriesList.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid layout of courses */}
              {filteredCourses.length > 0 ? (
                <div className="courses-grid">
                  {filteredCourses.map((course) => (
                    <div className="course-card" key={course._id}>
                      <div
                        className="course-thumbnail"
                        style={{
                          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.3), rgba(15, 23, 42, 0.8)), url(${
                            course.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60"
                          })`,
                        }}
                      >
                        <span className="course-category">{course.category}</span>
                      </div>
                      <div className="course-body">
                        <h3 className="course-title">{course.title}</h3>
                        <p className="course-description">{course.description}</p>
                        <div className="course-meta">
                          <span className="course-meta-item">
                            <User size={14} /> {course.instructor}
                          </span>
                          <span className="course-meta-item">
                            <Clock size={14} /> {course.duration}
                          </span>
                        </div>
                        <div style={{ marginTop: "auto" }}>
                          {user.role === "learner" ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <button
                                className="btn btn-primary btn-block"
                                onClick={() => handleEnroll(course._id)}
                              >
                                Quick Enroll
                              </button>
                              <Link
                                to={`/courses/${course._id}`}
                                className="btn btn-secondary btn-block"
                                style={{ fontSize: "0.85rem", padding: "8px", textDecoration: "none" }}
                              >
                                View Syllabus & Details
                              </Link>
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                className="btn btn-secondary"
                                style={{ flex: 1, padding: "8px", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                onClick={() => handleOpenEditModal(course)}
                              >
                                <Edit size={14} /> Edit
                              </button>
                              <button
                                className="btn btn-danger"
                                style={{ flex: 1, padding: "8px", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                onClick={() => setDeletingCourse(course)}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
                  <BookOpen size={48} style={{ strokeWidth: 1, marginBottom: "16px" }} />
                  <p>No new courses match your criteria.</p>
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ADMIN REPORTS */}
          {/* ========================================================= */}
          {user.role === "admin" && activeTab === "reports" && (
            <div className="chart-card">
              <div
                className="card-header"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <h3 className="card-title" style={{ margin: 0 }}>
                  Learners Education Progress Reports
                </h3>

                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label
                      htmlFor="course-select-report"
                      style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "nowrap" }}
                    >
                      Select Course:
                    </label>
                    <select
                      id="course-select-report"
                      className="form-select"
                      value={selectedReportCourse}
                      onChange={(e) => setSelectedReportCourse(e.target.value)}
                      style={{ minWidth: "220px", fontSize: "0.85rem", padding: "8px 12px" }}
                    >
                      <option value="">All Courses</option>
                      {availableCourses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    id="generate-download-csv-btn"
                    className="btn btn-primary"
                    style={{ fontSize: "0.85rem", padding: "8px 18px", display: "flex", alignItems: "center", gap: "6px" }}
                    disabled={isGeneratingCsv}
                    onClick={handleDownloadCsvReport}
                  >
                    <FileText size={16} />
                    {isGeneratingCsv ? "Generating CSV..." : "Generate & Download CSV"}
                  </button>
                </div>
              </div>

              {(() => {
                const displayedReports = reports.filter((report) => {
                  if (!selectedReportCourse || selectedReportCourse === "all") return true;
                  const cId = typeof report.courseId === "object" && report.courseId !== null ? report.courseId._id : report.courseId;
                  return cId === selectedReportCourse;
                });

                return displayedReports.length > 0 ? (
                  <div className="table-wrapper">
                    <table className="glass-table">
                      <thead>
                        <tr>
                          <th>Learner Name</th>
                          <th>Course Enrolled</th>
                          <th>Status</th>
                          <th>Score</th>
                          <th>Progress</th>
                          <th>Certificate Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedReports.map((report) => {
                          const currentScore = report.score !== undefined ? report.score : report.progress;
                          return (
                            <tr key={report.enrollmentId}>
                              <td>
                                <div style={{ fontWeight: 600 }}>{report.studentName}</div>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                  {report.studentEmail}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600 }}>{report.courseTitle}</div>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                  {report.category} | {report.instructor}
                                </span>
                              </td>
                              <td>
                                {report.status === "completed" ? (
                                  <span className="badge badge-success">Completed</span>
                                ) : (
                                  <span className="badge badge-info">Learning</span>
                                )}
                              </td>
                              <td>
                                <span
                                  style={{
                                    fontWeight: 600,
                                    color: currentScore >= 80 ? "var(--color-success)" : "var(--text-primary)",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  {currentScore} / 100
                                </span>
                              </td>
                              <td>
                                <div style={{ minWidth: "120px" }}>
                                  <div className="progress-info">
                                    <span>{report.progress}%</span>
                                  </div>
                                  <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${report.progress}%` }}></div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {report.certificateId ? (
                                  <span
                                    style={{
                                      fontSize: "0.8rem",
                                      fontFamily: "monospace",
                                      background: "rgba(255,255,255,0.04)",
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      border: "1px solid var(--border-color)",
                                    }}
                                  >
                                    {report.certificateId}
                                  </span>
                                ) : (
                                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Pending</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    No learners found for the selected report criteria.
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: CERTIFICATE VERIFICATION (ADMIN ONLY) */}
          {/* ========================================================= */}
          {user.role === "admin" && activeTab === "verify-certificate" && (
            <VerifyCertificate token={token} API_BASE={API_BASE} reports={reports} />
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL: UPDATE MODULES PROGRESS (Learner only) */}
      {/* ========================================================= */}
      {selectedProgressCourse && (
        <div className="modal-overlay" onClick={() => setSelectedProgressCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Track Course Modules</h3>
              <button className="modal-close" onClick={() => setSelectedProgressCourse(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                Course: <strong style={{ color: "#fff" }}>{selectedProgressCourse.courseId?.title}</strong>
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
                Select modules as you complete them. Progress will be computed dynamically.
              </p>

              <div className="module-list">
                {selectedProgressCourse.courseId?.modules.map((mod, index) => {
                  const isCompleted = selectedProgressCourse.completedModules.includes(mod);
                  return (
                    <label
                      key={index}
                      className={`module-item ${isCompleted ? "completed" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleModuleToggle(mod);
                      }}
                    >
                      <input
                        type="checkbox"
                        className="module-checkbox"
                        checked={isCompleted}
                        readOnly
                      />
                      <span className="module-title-text">{mod}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedProgressCourse(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CERTIFICATE SHOWCASE */}
      {/* ========================================================= */}
      {selectedCertificate && (
        <div className="modal-overlay" onClick={() => setSelectedCertificate(null)}>
          <div className="modal-content modal-cert-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={18} style={{ color: "var(--color-warning)" }} /> Course Completion Certificate
              </h3>
              <button className="modal-close" onClick={() => setSelectedCertificate(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ backgroundColor: "#1e293b", padding: "20px" }}>
              
              {/* Premium Certificate Layout */}
              <div className="certificate-container">
                <div className="cert-border-corner" style={{ top: "10px", left: "10px", borderRight: "none", borderBottom: "none" }}></div>
                <div className="cert-border-corner" style={{ top: "10px", right: "10px", borderLeft: "none", borderBottom: "none" }}></div>
                <div className="cert-border-corner" style={{ bottom: "10px", left: "10px", borderRight: "none", borderTop: "none" }}></div>
                <div className="cert-border-corner" style={{ bottom: "10px", right: "10px", borderLeft: "none", borderTop: "none" }}></div>
                
                <div className="cert-bg-emblem">AWARD</div>

                <div className="certificate-header">Certificate of Completion</div>
                <div className="certificate-subtitle">URBAN EDTECH ACADEMY PORTAL</div>
                
                <p style={{ fontStyle: "italic", fontSize: "0.95rem", color: "#64748b" }}>This is proudly presented to</p>
                <div className="certificate-name">{user.name}</div>
                
                <p className="certificate-text">
                  for demonstrating outstanding commitment, intelligence, and effort in completing all required curriculum modules for the course
                </p>
                
                <div className="certificate-course">{selectedCertificate.courseId?.title}</div>
                <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>
                  under instruction of {selectedCertificate.courseId?.instructor}
                </p>

                <div className="certificate-footer">
                  <div className="cert-meta">
                    <div><strong>Date Issued:</strong> {new Date(selectedCertificate.completedAt).toLocaleDateString()}</div>
                    <div><strong>Certificate ID:</strong> {selectedCertificate.certificateId}</div>
                  </div>
                  
                  <div className="cert-sign-block">
                    <div className="cert-signature-line">Antigravity</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>
                      Academic Director
                    </div>
                  </div>
                </div>
              </div>

            </div>
            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Tip: Print to PDF or select local printer
              </span>
              <div style={{ display: "flex", gap: "12px" }}>
                <button className="btn btn-secondary" onClick={() => setSelectedCertificate(null)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handlePrintCertificate}>
                  <Printer size={16} /> Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT COURSE (PRE-FILLED WITH EXISTING DATA) */}
      {/* ========================================================= */}
      {editingCourse && (
        <div className="modal-overlay" onClick={() => setEditingCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3 className="card-title">Edit Course Details</h3>
              <button className="modal-close" onClick={() => setEditingCourse(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateCourse}>
              <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Course Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Marketing">Digital Marketing</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duration *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.duration}
                    onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Instructor Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.instructor}
                    onChange={(e) => setEditFormData({ ...editFormData, instructor: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.imageUrl}
                    onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Modules (Comma Separated) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editFormData.modules}
                    onChange={(e) => setEditFormData({ ...editFormData, modules: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCourse(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmittingCourse}>
                  {isSubmittingCourse ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE COURSE CONFIRMATION PROMPT */}
      {/* ========================================================= */}
      {deletingCourse && (
        <div className="modal-overlay" onClick={() => setDeletingCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-danger)" }}>
                <AlertTriangle size={20} /> Delete Course Confirmation
              </h3>
              <button className="modal-close" onClick={() => setDeletingCourse(null)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text-primary)", fontSize: "1rem", lineHeight: "1.5" }}>
                Are you sure you want to delete <strong style={{ color: "#fff" }}>"{deletingCourse.title}"</strong>?
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "8px" }}>
                This action is permanent and will remove the course from the database along with associated enrollments.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeletingCourse(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                disabled={isSubmittingCourse}
                onClick={handleConfirmDeleteCourse}
              >
                {isSubmittingCourse ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
