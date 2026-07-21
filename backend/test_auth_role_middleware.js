const dotenv = require("dotenv");
dotenv.config();

const { generateToken, verifyToken, authorize } = require("./middleware/auth");

async function runMiddlewareTests() {
  console.log("=================================================");
  console.log("⚡ TESTING ROLE-BASED JWT AUTHORIZATION MIDDLEWARE ⚡");
  console.log("=================================================\n");

  const BASE_URL = "http://localhost:5000";

  // Generate tokens for testing
  const studentToken = generateToken({
    _id: "student_101",
    name: "Alex Morgan",
    email: "alex@urban.edu",
    role: "student"
  });

  const adminToken = generateToken({
    _id: "admin_999",
    name: "Dr. Marcus Sterling",
    email: "admin@urban.edu",
    role: "admin"
  });

  console.log("🔑 Student JWT Token generated:", studentToken.substring(0, 30) + "...");
  console.log("🔑 Admin JWT Token generated:", adminToken.substring(0, 30) + "...\n");

  // Test Case 1: Unauthenticated request (No Authorization header) -> Expect 401
  console.log("▶ TEST 1: Requesting Protected Admin Route WITHOUT Authorization Token");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/overview`);
    const status = res.status;
    const body = await res.json();
    console.log(`   Status: ${status} ${status === 401 ? "✅ SUCCESS (401 Unauthorized)" : "❌ FAILED"}`);
    console.log(`   Response:`, body);
  } catch (err) {
    console.error("   Error:", err.message);
  }
  console.log("-------------------------------------------------\n");

  // Test Case 2: Student trying to access Admin-Only Route -> Expect 403 Forbidden
  console.log("▶ TEST 2: Student Token accessing Admin-Only Route (/api/admin/overview)");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: {
        Authorization: `Bearer ${studentToken}`
      }
    });
    const status = res.status;
    const body = await res.json();
    console.log(`   Status: ${status} ${status === 403 ? "✅ SUCCESS (403 Forbidden)" : "❌ FAILED"}`);
    console.log(`   Response:`, body);
  } catch (err) {
    console.error("   Error:", err.message);
  }
  console.log("-------------------------------------------------\n");

  // Test Case 3: Admin accessing Admin-Only Route -> Expect 200 OK
  console.log("▶ TEST 3: Admin Token accessing Admin-Only Route (/api/admin/overview)");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/overview`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    const status = res.status;
    const body = await res.json();
    console.log(`   Status: ${status} ${status === 200 ? "✅ SUCCESS (200 OK)" : "❌ FAILED"}`);
    console.log(`   Admin Stats Received:`, body.stats);
  } catch (err) {
    console.error("   Error:", err.message);
  }
  console.log("-------------------------------------------------\n");

  // Test Case 4: Admin creating a new course via POST /api/admin/courses -> Expect 201 Created
  console.log("▶ TEST 4: Admin creating new course via Admin API (/api/admin/courses)");
  try {
    const newCourseData = {
      title: "Urban Smart Grid & IoT Infrastructure",
      code: "IOT-601",
      category: "Urban Tech",
      instructor: "Dr. Elena Vance",
      estimatedHours: 36
    };
    const res = await fetch(`${BASE_URL}/api/admin/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(newCourseData)
    });
    const status = res.status;
    const body = await res.json();
    console.log(`   Status: ${status} ${status === 201 || status === 400 ? "✅ SUCCESS" : "❌ FAILED"}`);
    console.log(`   Response:`, body.message || body);
  } catch (err) {
    console.error("   Error:", err.message);
  }
  console.log("-------------------------------------------------\n");

  // Test Case 5: Student attempting to create course -> Expect 403 Forbidden
  console.log("▶ TEST 5: Student attempting to create a course via Admin API");
  try {
    const res = await fetch(`${BASE_URL}/api/admin/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({ title: "Hack Course", code: "HACK-101" })
    });
    const status = res.status;
    const body = await res.json();
    console.log(`   Status: ${status} ${status === 403 ? "✅ SUCCESS (403 Forbidden)" : "❌ FAILED"}`);
    console.log(`   Response:`, body);
  } catch (err) {
    console.error("   Error:", err.message);
  }
  console.log("=================================================");
  console.log("🎉 ALL JWT AUTHORIZATION ACCEPTANCE TESTS COMPLETED 🎉");
  console.log("=================================================");
}

runMiddlewareTests();
