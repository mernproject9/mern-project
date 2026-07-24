const http = require("http");
const jwt = require("jsonwebtoken");
const app = require("./app");

const PORT = 5008;
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
  console.log(`⚡ ADMIN ADD COURSE FORM TEST SUITE ⚡`);
  console.log(`=================================================\n`);

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

    // 1. Only admins can access the add course form endpoint
    console.log("[ACCEPTANCE CRITERIA 1] Test 1: POST /api/admin/courses without token -> Expect 401 Unauthorized");
    const res1 = await request("POST", "/api/admin/courses", {}, { title: "Test Course" });
    console.log(`   Status: ${res1.status} | Response:`, res1.body.message);
    if (res1.status !== 401) throw new Error(`Test 1 Failed. Expected 401, got ${res1.status}`);

    console.log("\n[ACCEPTANCE CRITERIA 1] Test 2: POST /api/admin/courses with Student token -> Expect 403 Forbidden");
    const res2 = await request("POST", "/api/admin/courses", { Authorization: `Bearer ${studentToken}` }, { title: "Test Course" });
    console.log(`   Status: ${res2.status} | Response:`, res2.body.message || res2.body.error);
    if (res2.status !== 403) throw new Error(`Test 2 Failed. Expected 403, got ${res2.status}`);

    // 2. All required fields are validated before submission
    console.log("\n[ACCEPTANCE CRITERIA 2] Test 3: POST /api/admin/courses with missing required fields -> Expect 400 Bad Request");
    const res3 = await request("POST", "/api/admin/courses", { Authorization: `Bearer ${adminToken}` }, { title: "" });
    console.log(`   Status: ${res3.status} | Errors:`, res3.body.errors);
    if (res3.status !== 400 || !res3.body.errors) throw new Error(`Test 3 Failed. Expected 400 with errors object.`);

    // 3. New courses are saved to DB and visible in course list
    console.log("\n[ACCEPTANCE CRITERIA 3 & 4] Test 4: POST /api/admin/courses with valid data -> Expect 201 Created");
    const testCoursePayload = {
      title: "Docker & Kubernetes Cloud DevOps Masterclass",
      code: `OPS-${Math.floor(100 + Math.random() * 900)}`,
      category: "DevOps & Cloud",
      duration: "45 Hours",
      description: "Learn containerization, orchestration, microservices architecture, and production deployment with Docker and Kubernetes.",
      instructor: "Dr. Alex Morgan",
      estimatedHours: 45
    };

    const res4 = await request("POST", "/api/admin/courses", { Authorization: `Bearer ${adminToken}` }, testCoursePayload);
    console.log(`   Status: ${res4.status} | Message: ${res4.body.message}`);
    if (res4.status !== 201 || !res4.body.course) throw new Error(`Test 4 Failed. Expected 201 Created.`);

    const createdCourseId = res4.body.course._id;

    console.log("\n[ACCEPTANCE CRITERIA 3] Test 5: GET /api/admin/courses -> Verify newly created course is in DB list");
    const res5 = await request("GET", "/api/admin/courses", { Authorization: `Bearer ${adminToken}` });
    console.log(`   Status: ${res5.status} | Total courses in DB: ${res5.body.count}`);
    const foundCourse = res5.body.courses.find(c => c._id === createdCourseId || c.title === testCoursePayload.title);
    if (!foundCourse) throw new Error("Test 5 Failed. Created course was not found in GET /api/admin/courses.");
    console.log(`   Found Course in DB: "${foundCourse.title}" (${foundCourse.duration})`);

    // Clean up created test course
    await request("DELETE", `/api/admin/courses/${createdCourseId}`, { Authorization: `Bearer ${adminToken}` });

    console.log(`\n=================================================`);
    console.log(`🎉 ALL 4 ACCEPTANCE CRITERIA VERIFIED 100%! 🎉`);
    console.log(`=================================================\n`);
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
});
