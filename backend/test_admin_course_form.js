const http = require("http");
const jwt = require("jsonwebtoken");
const app = require("./app");

const PORT = 5010;
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
  console.log(`⚡ EXPRESS ROUTE FOR NEW COURSES & MONGODB TEST ⚡`);
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

    // 1. Test POST /api/courses route security (Admin role check)
    console.log("[EXPRESS ROUTE SECURITY] Test 1: POST /api/courses without token -> Expect 401");
    const res1 = await request("POST", "/api/courses", {}, { title: "Unauthenticated Course" });
    console.log(`   Status: ${res1.status} | Response: ${res1.body.message}`);
    if (res1.status !== 401) throw new Error(`Test 1 Failed. Expected 401, got ${res1.status}`);

    console.log("\n[EXPRESS ROUTE SECURITY] Test 2: POST /api/courses with Student token -> Expect 403 Forbidden");
    const res2 = await request("POST", "/api/courses", { Authorization: `Bearer ${studentToken}` }, { title: "Forbidden Course" });
    console.log(`   Status: ${res2.status} | Response: ${res2.body.message || res2.body.error}`);
    if (res2.status !== 403) throw new Error(`Test 2 Failed. Expected 403, got ${res2.status}`);

    // 2. Test Incoming Data Validation
    console.log("\n[DATA VALIDATION] Test 3: POST /api/courses with missing required fields -> Expect 400 Bad Request");
    const res3 = await request("POST", "/api/courses", { Authorization: `Bearer ${adminToken}` }, { title: "" });
    console.log(`   Status: ${res3.status} | Errors:`, res3.body.errors);
    if (res3.status !== 400 || !res3.body.errors) throw new Error(`Test 3 Failed. Expected 400 with errors.`);

    // 3. Test Saving Course to MongoDB
    console.log("\n[SAVE TO MONGODB] Test 4: POST /api/courses with valid data -> Expect 201 Created");
    const testPayload = {
      title: "Cloud Native Microservices with Go & gRPC",
      code: `GO-${Math.floor(100 + Math.random() * 900)}`,
      category: "DevOps & Cloud",
      duration: "50 Hours",
      description: "Master Go programming, protocol buffers, gRPC microservices, containerization, and distributed systems.",
      instructor: "Prof. Michael Rivera",
      estimatedHours: 50
    };

    const res4 = await request("POST", "/api/courses", { Authorization: `Bearer ${adminToken}` }, testPayload);
    console.log(`   Status: ${res4.status} | Message: ${res4.body.message}`);
    if (res4.status !== 201 || !res4.body.course) throw new Error(`Test 4 Failed. Expected 201 Created.`);

    const createdCourseId = res4.body.course._id;

    // 4. Test Querying Saved Course from Database
    console.log("\n[RETRIEVE FROM DB] Test 5: GET /api/courses -> Verify newly saved course in MongoDB list");
    const res5 = await request("GET", "/api/courses");
    console.log(`   Status: ${res5.status} | Total Courses: ${res5.body.count}`);
    const foundCourse = res5.body.courses.find(c => c._id === createdCourseId || c.title === testPayload.title);
    if (!foundCourse) throw new Error("Test 5 Failed. Course not found in MongoDB.");
    console.log(`   Verified Saved Course in MongoDB: "${foundCourse.title}" (${foundCourse.duration})`);

    // Clean up
    await request("DELETE", `/api/admin/courses/${createdCourseId}`, { Authorization: `Bearer ${adminToken}` });

    console.log(`\n=================================================`);
    console.log(`🎉 ALL EXPRESS ROUTE & MONGODB TASKS VERIFIED 100%! 🎉`);
    console.log(`=================================================\n`);
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
});
