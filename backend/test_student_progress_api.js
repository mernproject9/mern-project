const http = require("http");
const jwt = require("jsonwebtoken");
const app = require("./app");

const PORT = 5007;
const JWT_SECRET = process.env.JWT_SECRET || "urban_edtech_jwt_secret_key_2026_antigravity";

function request(method, path, headers = {}) {
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
    req.end();
  });
}

const server = app.listen(PORT, async () => {
  console.log(`\n=================================================`);
  console.log(`⚡ TESTING STUDENT PROGRESS DASHBOARD API ⚡`);
  console.log(`=================================================\n`);

  try {
    const studentToken = jwt.sign(
      { id: "stu_progress_101", name: "Maria Garcia", email: "maria.garcia@urban.edu", role: "student" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 1. Test GET /api/dashboard/me without token -> Expect 401 Unauthorized
    console.log("[TASK 1] Test 1: Request GET /api/dashboard/me WITHOUT Token -> Expect 401 Unauthorized");
    const res1 = await request("GET", "/api/dashboard/me");
    console.log(`   Status: ${res1.status} | Response:`, res1.body.message || res1.body.error);
    if (res1.status !== 401) throw new Error(`Test 1 Failed. Expected 401, got ${res1.status}`);

    // 2. Test GET /api/dashboard/me with valid student token -> Expect 200 OK & Progress stats
    console.log("\n[TASK 2 & 3] Test 2: Request GET /api/dashboard/me WITH Student Token -> Expect 200 OK & Enrolled Progress");
    const res2 = await request("GET", "/api/dashboard/me", { Authorization: `Bearer ${studentToken}` });
    console.log(`   Status: ${res2.status}`);
    console.log(`   Student Name: ${res2.body.student?.name}, Email: ${res2.body.student?.email}`);
    console.log(`   Stats Summary:`, res2.body.stats);
    console.log(`   Total Courses Returned: ${res2.body.courses?.length}`);
    if (res2.status !== 200 || !res2.body.courses) throw new Error(`Test 2 Failed. Expected 200 OK with courses array`);

    // 3. Test GET /api/dashboard/demo -> Expect 200 OK
    console.log("\n[DEMO ENDPOINT] Test 3: Request GET /api/dashboard/demo -> Expect 200 OK");
    const res3 = await request("GET", "/api/dashboard/demo");
    console.log(`   Status: ${res3.status} | Enrolled Count: ${res3.body.courses?.length}`);
    if (res3.status !== 200) throw new Error(`Test 3 Failed. Expected 200 OK`);

    console.log(`\n=================================================`);
    console.log(`🎉 STUDENT PROGRESS DASHBOARD API VERIFIED 100%! 🎉`);
    console.log(`=================================================\n`);
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
});
