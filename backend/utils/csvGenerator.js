const escapeCsv = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const generateProgressCsv = (reports) => {
  const headers = [
    "User Name",
    "Email",
    "Course Title",
    "Category",
    "Instructor",
    "Completion Status",
    "Score",
    "Progress (%)",
    "Enrolled Date",
    "Completion Date",
    "Certificate ID"
  ];

  const rows = reports.map((r) => [
    escapeCsv(r.studentName),
    escapeCsv(r.studentEmail),
    escapeCsv(r.courseTitle),
    escapeCsv(r.category),
    escapeCsv(r.instructor),
    escapeCsv(r.status === "completed" ? "Completed" : "In Progress"),
    escapeCsv(r.score !== undefined ? r.score : r.progress),
    escapeCsv(`${r.progress}%`),
    escapeCsv(r.enrolledAt ? new Date(r.enrolledAt).toISOString().split("T")[0] : "N/A"),
    escapeCsv(r.completedAt ? new Date(r.completedAt).toISOString().split("T")[0] : "N/A"),
    escapeCsv(r.certificateId || "N/A")
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
};

module.exports = { escapeCsv, generateProgressCsv };
