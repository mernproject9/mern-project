const http = require("http");
const jwt = require("jsonwebtoken");
const app = require("./app");
const Student = require("./models/Student");
const Course = require("./models/Course");
const Enrollment = require("./models/Enrollment");

const PORT = 5016;
const JWT_SECRET = process.env.JWT_SECRET || "urban_edtech_jwt_secret_key_2026_antigravity";

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: PORT,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const server = app.listen(PORT, async () => {
  console.log(`\n=================================================`);
  console.log(`⚡ ADMIN ENROLLMENT STATS DASHBOARD TEST SUITE ⚡`);
  console.log(`=================================================\n`);

  let createdStudentId = null;
  let createdCourseId = null;
  let createdEnrollmentId = null;

  try {
    const studentToken = jwt.sign(
      { id: "stu_101", name: "Student User", email: "student@urban.edu", role: "student" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    const adminToken = jwt.sign(
      { id: "adm_999", name: "Admin User", email: "admin@urban.edu", role: "admin" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 1. Protection Test
    console.log("[SECURITY] Test 1: GET /api/admin/enrollment-stats without token -> Expect 401");
    const res1 = await request("GET", "/api/admin/enrollment-stats");
    console.log(`   Status: ${res1.status} | Response: ${res1.body.message}`);
    if (res1.status !== 401) throw new Error(`Test 1 Failed. Expected 401, got ${res1.status}`);

    console.log("\n[SECURITY] Test 2: GET /api/admin/enrollment-stats with Student token -> Expect 403");
    const res2 = await request("GET", "/api/admin/enrollment-stats", { Authorization: `Bearer ${studentToken}` });
    console.log(`   Status: ${res2.status} | Response: ${res2.body.message || res2.body.error}`);
    if (res2.status !== 403) throw new Error(`Test 2 Failed. Expected 403, got ${res2.status}`);

    // 2. Admin Access & Aggregation Test
    console.log("\n[AGGREGATION] Test 3: GET /api/admin/enrollment-stats with Admin token -> Expect 200 OK & Formatted Chart Data");
    const res3 = await request("GET", "/api/admin/enrollment-stats", { Authorization: `Bearer ${adminToken}` });
    console.log(`   Status: ${res3.status} | Total Enrollments: ${res3.body.totalEnrollments} | Total Courses: ${res3.body.totalCourses}`);
    if (res3.status !== 200 || !res3.body.chartData) throw new Error(`Test 3 Failed. Expected 200 with chartData.`);

    const initialTotal = res3.body.totalEnrollments;
    console.log(`   Chart Data Items: ${res3.body.chartData.length}`);
    if (res3.body.chartData.length > 0) {
      const topCourse = res3.body.chartData[0];
      console.log(`   Top Course in Chart: "${topCourse.courseTitle}" (${topCourse.enrollmentCount} enrollments)`);
    }

    // 3. Real-time / Dynamic Update Test
    console.log("\n[REAL-TIME SYNC] Test 4: Creating a brand new student, course, and enrollment...");
    const sampleStudent = await Student.create({ name: "Chart Unique Student", email: `chart_${Date.now()}@test.edu`, age: 24 });
    createdStudentId = sampleStudent._id;

    const sampleCourse = await Course.create({
      title: "Rust Systems Programming",
      code: `RST-${Date.now().toString().slice(-4)}`,
      category: "Systems",
      instructor: "Dr. Alex Morgan",
      duration: "40 Hours"
    });
    createdCourseId = sampleCourse._id;

    const enrollRes = await request("POST", "/api/admin/enrollments", { Authorization: `Bearer ${adminToken}` }, {
      studentId: sampleStudent._id,
      courseId: sampleCourse._id
    });
    console.log(`   Enrollment Created Status: ${enrollRes.status} | Message: ${enrollRes.body.message}`);
    if (enrollRes.status !== 201 || !enrollRes.body.enrollment) {
      throw new Error(`Enrollment creation failed. Status: ${enrollRes.status}`);
    }
    createdEnrollmentId = enrollRes.body.enrollment._id;

    console.log("\n[REAL-TIME SYNC] Test 5: Re-querying GET /api/admin/enrollment-stats -> Verify total enrollments updated");
    const res5 = await request("GET", "/api/admin/enrollment-stats", { Authorization: `Bearer ${adminToken}` });
    console.log(`   New Total Enrollments in MongoDB: ${res5.body.totalEnrollments} (Previous: ${initialTotal})`);
    if (res5.body.totalEnrollments !== initialTotal + 1) {
      throw new Error(`Test 5 Failed. Total enrollments did not increment. Got ${res5.body.totalEnrollments}, expected ${initialTotal + 1}.`);
    }
    console.log("   Verified real-time aggregation data update in MongoDB!");

    console.log(`\n=================================================`);
    console.log(`🎉 ALL 4 DASHBOARD & AGGREGATION TASKS VERIFIED 100%! 🎉`);
    console.log(`=================================================\n`);
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
  } finally {
    // Cleanup created test records
    if (createdEnrollmentId) await Enrollment.findByIdAndDelete(createdEnrollmentId);
    if (createdStudentId) await Student.findByIdAndDelete(createdStudentId);
    if (createdCourseId) await Course.findByIdAndDelete(createdCourseId);

    server.close(() => {
      process.exit(0);
    });
  }
});
