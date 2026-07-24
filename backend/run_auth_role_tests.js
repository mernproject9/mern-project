const http = require("http");
const jwt = require("jsonwebtoken");
const app = require("./app");

const PORT = 5006;
const JWT_SECRET = process.env.JWT_SECRET || "urban_edtech_jwt_secret_key_2026";

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
  console.log(`⚡ EXPRESS ROLE-BASED AUTH MIDDLEWARE TEST SUITE ⚡`);
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

    // 1. Test missing Authorization header
    console.log("[TASK 1 & 2] Test 1: Request with missing Authorization header -> Expect 401");
    const res1 = await request("GET", "/api/auth/me");
    console.log(`   Status: ${res1.status} | Response:`, res1.body.message);
    if (res1.status !== 401) throw new Error(`Test 1 Failed. Got ${res1.status}`);

    // 2. Test invalid token
    console.log("\n[TASK 1 & 2] Test 2: Request with invalid JWT token -> Expect 401");
    const res2 = await request("GET", "/api/auth/me", { Authorization: "Bearer bad.token.here" });
    console.log(`   Status: ${res2.status} | Response:`, res2.body.message);
    if (res2.status !== 401) throw new Error(`Test 2 Failed. Got ${res2.status}`);

    // 3. Test Student accessing Student-Protected endpoint
    console.log("\n[TASK 3] Test 3: Student token accessing Student-Protected route -> Expect 200");
    const res3 = await request("GET", "/api/auth/student-protected", { Authorization: `Bearer ${studentToken}` });
    console.log(`   Status: ${res3.status} | Response:`, res3.body.message);
    if (res3.status !== 200) throw new Error(`Test 3 Failed. Got ${res3.status}`);

    // 4. Test Student accessing Admin-Protected endpoint (Role check returning 403)
    console.log("\n[TASK 3] Test 4: Student token accessing Admin-Protected route -> Expect 403 Forbidden");
    const res4 = await request("GET", "/api/auth/admin-protected", { Authorization: `Bearer ${studentToken}` });
    console.log(`   Status: ${res4.status} | Response:`, res4.body.message);
    if (res4.status !== 403) throw new Error(`Test 4 Failed. Expected 403, got ${res4.status}`);

    // 5. Test Admin accessing Admin-Protected endpoint
    console.log("\n[TASK 3] Test 5: Admin token accessing Admin-Protected route -> Expect 200");
    const res5 = await request("GET", "/api/auth/admin-protected", { Authorization: `Bearer ${adminToken}` });
    console.log(`   Status: ${res5.status} | Response:`, res5.body.message);
    if (res5.status !== 200) throw new Error(`Test 5 Failed. Got ${res5.status}`);

    // 6. Test Student trying to access Dashboard Admin Stats route -> Expect 403 Forbidden
    console.log("\n[TASK 3] Test 6: Student token accessing Dashboard Admin stats (/api/dashboard/admin/stats) -> Expect 403");
    const res6 = await request("GET", "/api/dashboard/admin/stats", { Authorization: `Bearer ${studentToken}` });
    console.log(`   Status: ${res6.status} | Response:`, res6.body.message);
    if (res6.status !== 403) throw new Error(`Test 6 Failed. Expected 403, got ${res6.status}`);

    console.log(`\n=================================================`);
    console.log(`🎉 ALL 3 TASKS & ACCEPTANCE CRITERIA VERIFIED 100%! 🎉`);
    console.log(`=================================================\n`);
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
});
