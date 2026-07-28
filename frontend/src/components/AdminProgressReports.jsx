import React, { useState } from "react";
import { Bar, Pie } from "react-chartjs-2";

const mockStudents = [
  { id: "STU-101", name: "Aarav Sharma", course: "MERN Stack Development", progress: 95, score: 92, status: "Active", cert: "Issued" },
  { id: "STU-102", name: "Priya Patel", course: "Python Data Science", progress: 100, score: 96, status: "Completed", cert: "Issued" },
  { id: "STU-103", name: "Rohan Verma", course: "Java Programming", progress: 85, score: 86, status: "Active", cert: "Eligible" },
  { id: "STU-104", name: "Ananya Gupta", course: "UI/UX Design Masterclass", progress: 45, score: 78, status: "Active", cert: "In Progress" },
  { id: "STU-105", name: "Vikram Malhotra", course: "Cloud Computing & DevOps", progress: 35, score: 80, status: "Active", cert: "In Progress" },
  { id: "STU-106", name: "Neha Singh", course: "Data Structures & Algorithms", progress: 60, score: 84, status: "Active", cert: "In Progress" },
  { id: "STU-107", name: "Karan Mehta", course: "MERN Stack Development", progress: 100, score: 98, status: "Completed", cert: "Issued" },
  { id: "STU-108", name: "Sneha Reddy", course: "Python Data Science", progress: 90, score: 90, status: "Active", cert: "Issued" },
];

function AdminProgressReports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportSummary, setReportSummary] = useState(null);

  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === "All" || student.course === filterCourse;
    return matchesSearch && matchesCourse;
  });

  const handleGenerateReport = () => {
    const totalEnrolled = filteredStudents.length;
    const avgProg = (
      filteredStudents.reduce((acc, s) => acc + s.progress, 0) / (totalEnrolled || 1)
    ).toFixed(1);
    const avgScore = (
      filteredStudents.reduce((acc, s) => acc + s.score, 0) / (totalEnrolled || 1)
    ).toFixed(1);
    const certsIssued = filteredStudents.filter((s) => s.cert === "Issued").length;

    const summary = {
      timestamp: new Date().toLocaleString(),
      totalEnrolled,
      avgProg,
      avgScore,
      certsIssued,
      list: filteredStudents,
    };

    setReportSummary(summary);
    setReportGenerated(true);
  };

  const handleDownloadCSV = () => {
    if (!filteredStudents.length) return;

    let csvContent = "data:text/csv;charset=utf-8,Student ID,Name,Course,Progress (%),Quiz Score (%),Status,Certificate Status\n";
    filteredStudents.forEach((s) => {
      csvContent += `${s.id},"${s.name}","${s.course}",${s.progress},${s.score},${s.status},${s.cert}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Urban_EdTech_Progress_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart data for enrollment stats
  const enrollmentChartData = {
    labels: ["MERN Stack", "Python DS", "Java Dev", "UI/UX", "Cloud/DevOps", "DSA"],
    datasets: [
      {
        label: "Enrolled Learners",
        data: [840, 620, 480, 390, 310, 520],
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(14, 165, 233, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: ["Completed & Certified", "Active Learning", "Needs Follow-up"],
    datasets: [
      {
        data: [45, 42, 13],
        backgroundColor: ["#10b981", "#6366f1", "#ef4444"],
      },
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          borderRadius: "16px",
          padding: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2 style={{ margin: "0 0 6px 0", color: "#fbbf24", fontSize: "22px" }}>
            📈 Urban Enrollment Stats & Progress Reporting
          </h2>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "14px" }}>
            Centralized admin controls to track student outcomes, query metrics, and export compliance reports.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleGenerateReport}
            style={{
              padding: "12px 20px",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "#0f172a",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
            }}
          >
            ⚡ Generate Full Report
          </button>
          <button
            onClick={handleDownloadCSV}
            style={{
              padding: "12px 20px",
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid #10b981",
              color: "#34d399",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        <div
          style={{
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", color: "#f8fafc", fontSize: "16px" }}>
            📊 Enrollment Distribution across Urban Courses
          </h3>
          <div style={{ height: "240px" }}>
            <Bar
              data={enrollmentChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } },
                  x: { ticks: { color: "#cbd5e1" }, grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        <div
          style={{
            background: "#1e293b",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "20px",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", color: "#f8fafc", fontSize: "16px" }}>
            🍩 Learner Outcome Rates (%)
          </h3>
          <div style={{ height: "240px", display: "flex", justifyContent: "center" }}>
            <Pie
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom", labels: { color: "#cbd5e1" } } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Generated Report Summary Modal / Section */}
      {reportGenerated && reportSummary && (
        <div
          style={{
            background: "rgba(15, 23, 42, 0.95)",
            border: "2px solid #f59e0b",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, color: "#fbbf24", fontSize: "18px" }}>
              📄 Official Urban EdTech Progress Summary Report
            </h3>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Generated at: {reportSummary.timestamp}</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <div style={{ background: "#1e293b", padding: "12px", borderRadius: "10px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Selected Learners</div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#6366f1" }}>{reportSummary.totalEnrolled}</div>
            </div>
            <div style={{ background: "#1e293b", padding: "12px", borderRadius: "10px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Avg Progress</div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#38bdf8" }}>{reportSummary.avgProg}%</div>
            </div>
            <div style={{ background: "#1e293b", padding: "12px", borderRadius: "10px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Avg Quiz Score</div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#4ade80" }}>{reportSummary.avgScore}%</div>
            </div>
            <div style={{ background: "#1e293b", padding: "12px", borderRadius: "10px" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>Certificates Issued</div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#fbbf24" }}>{reportSummary.certsIssued}</div>
            </div>
          </div>
        </div>
      )}

      {/* Student Progress Management Table */}
      <div
        style={{
          background: "#1e293b",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h3 style={{ margin: 0, color: "#f8fafc", fontSize: "18px" }}>
            🎓 Enrolled Students Progress Roster
          </h3>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search student or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "#0f172a",
                color: "#f8fafc",
                fontSize: "13px",
                outline: "none",
              }}
            />

            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "#0f172a",
                color: "#f8fafc",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="All">All Courses</option>
              <option value="MERN Stack Development">MERN Stack</option>
              <option value="Python Data Science">Python Data Science</option>
              <option value="Java Programming">Java Programming</option>
              <option value="UI/UX Design Masterclass">UI/UX Design</option>
              <option value="Cloud Computing & DevOps">Cloud & DevOps</option>
              <option value="Data Structures & Algorithms">DSA</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                <th style={{ padding: "12px" }}>ID</th>
                <th style={{ padding: "12px" }}>Student Name</th>
                <th style={{ padding: "12px" }}>Enrolled Course</th>
                <th style={{ padding: "12px" }}>Progress</th>
                <th style={{ padding: "12px" }}>Quiz Score</th>
                <th style={{ padding: "12px" }}>Certificate</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#f8fafc" }}>
                  <td style={{ padding: "12px", fontFamily: "monospace", color: "#818cf8" }}>{s.id}</td>
                  <td style={{ padding: "12px", fontWeight: "600" }}>{s.name}</td>
                  <td style={{ padding: "12px", color: "#cbd5e1" }}>{s.course}</td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "80px",
                          height: "6px",
                          background: "#0f172a",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${s.progress}%`,
                            height: "100%",
                            background: s.progress === 100 ? "#10b981" : "#6366f1",
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>{s.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", color: s.score >= 85 ? "#34d399" : "#fbbf24" }}>
                    {s.score}%
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        background:
                          s.cert === "Issued"
                            ? "rgba(16, 185, 129, 0.2)"
                            : s.cert === "Eligible"
                            ? "rgba(245, 158, 11, 0.2)"
                            : "rgba(148, 163, 184, 0.2)",
                        color:
                          s.cert === "Issued"
                            ? "#34d399"
                            : s.cert === "Eligible"
                            ? "#fbbf24"
                            : "#94a3b8",
                      }}
                    >
                      {s.cert}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminProgressReports;
