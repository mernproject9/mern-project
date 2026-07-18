function StudentCard({ student }) {
  return (
    <div className="card">

      <h2>Profile Details</h2>

      <p>
        <strong>Name:</strong> {student.name}
      </p>

      <p>
        <strong>Email:</strong> {student.email}
      </p>

      <p>
        <strong>Course:</strong> {student.course}
      </p>

      <p>
        <strong>Role:</strong> <span className={`badge badge-${student.role ? student.role.toLowerCase() : "student"}`}>{student.role || "Student"}</span>
      </p>

      {student.role === "Admin" && (
        <div className="role-portal admin-portal">
          <h4>Admin Console</h4>
          <p>Access Level: Super Administrator</p>
          <div className="portal-actions">
            <button className="portal-btn" onClick={() => alert("Admin: Fetching system health logs...")}>System Logs</button>
            <button className="portal-btn" onClick={() => alert("Admin: Opening database configurations...")}>DB Config</button>
          </div>
        </div>
      )}

      {student.role === "Instructor" && (
        <div className="role-portal instructor-portal">
          <h4>Instructor Portal</h4>
          <p>Access Level: Academic Instructor</p>
          <div className="portal-actions">
            <button className="portal-btn" onClick={() => alert("Instructor: Loading grade book...")}>Grade Book</button>
            <button className="portal-btn" onClick={() => alert("Instructor: Opening lecture scheduler...")}>Schedule Lecture</button>
          </div>
        </div>
      )}

      {student.role === "Student" && (
        <div className="role-portal student-portal">
          <h4>Student Dashboard</h4>
          <p>Access Level: View & Enroll Only</p>
          <div className="portal-actions">
            <button className="portal-btn" onClick={() => alert("Student: Opening your course catalog...")}>My Courses</button>
            <button className="portal-btn" onClick={() => alert("Student: Fetching attendance summary...")}>Attendance</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default StudentCard;