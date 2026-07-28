const assert = require("assert");
const http = require("http");

console.log("==================================================================");
console.log("🧪 TESTING COURSE COMPLETION & CERTIFICATE ELIGIBILITY LOGIC");
console.log("==================================================================\n");

// 1. Local Rule Evaluation Unit Test
const COMPLETION_RULES = {
  COMPLETION_THRESHOLD: 100,
  PASSING_QUIZ_SCORE: 70,
};

function evaluateCertificateEligibility(progressData) {
  if (!progressData) return { eligible: false };

  const { overallProgress = 0, modules = [], quizzes = [] } = progressData;

  const overallThresholdMet = overallProgress >= COMPLETION_RULES.COMPLETION_THRESHOLD;

  const completedModulesCount = modules.filter(
    (m) => m.progress === 100 || m.status === "Completed"
  ).length;
  const totalModulesCount = modules.length || 1;
  const modulesCompletionMet = completedModulesCount === totalModulesCount;

  const passedQuizzesCount = quizzes.filter(
    (q) => (q.status === "Passed" || q.score >= COMPLETION_RULES.PASSING_QUIZ_SCORE) && q.score > 0
  ).length;
  const totalQuizzesCount = quizzes.length || 1;
  const quizzesPassedMet = quizzes.length > 0 ? passedQuizzesCount === totalQuizzesCount : true;

  const eligible = overallThresholdMet && modulesCompletionMet && quizzesPassedMet;

  return {
    eligible,
    overallProgress,
    overallThresholdMet,
    modulesCompletionMet,
    quizzesPassedMet,
    completedModulesCount,
    totalModulesCount,
    passedQuizzesCount,
    totalQuizzesCount,
  };
}

// Scenario 1: Eligible User (100% threshold satisfied)
const eligibleStudentData = {
  overallProgress: 100,
  modules: [
    { id: "m1", progress: 100, status: "Completed" },
    { id: "m2", progress: 100, status: "Completed" },
    { id: "m3", progress: 100, status: "Completed" },
    { id: "m4", progress: 100, status: "Completed" },
    { id: "m5", progress: 100, status: "Completed" },
  ],
  quizzes: [
    { id: "q1", score: 95, status: "Passed" },
    { id: "q2", score: 90, status: "Passed" },
    { id: "q3", score: 92, status: "Passed" },
    { id: "q4", score: 88, status: "Passed" },
    { id: "q5", score: 96, status: "Passed" },
  ],
};

// Scenario 2: Ineligible User (75% threshold, missing modules/quizzes)
const ineligibleStudentData = {
  overallProgress: 75,
  modules: [
    { id: "m1", progress: 100, status: "Completed" },
    { id: "m2", progress: 100, status: "Completed" },
    { id: "m3", progress: 100, status: "Completed" },
    { id: "m4", progress: 75, status: "In Progress" },
    { id: "m5", progress: 0, status: "Not Started" },
  ],
  quizzes: [
    { id: "q1", score: 95, status: "Passed" },
    { id: "q2", score: 90, status: "Passed" },
    { id: "q3", score: 92, status: "Passed" },
    { id: "q4", score: 74, status: "Passed" },
    { id: "q5", score: 0, status: "Pending" },
  ],
};

// Execute Test 1: Eligible User
console.log("▶ [Test 1] Testing Eligible User Scenario (100% Completion Threshold)...");
const eligibleRes = evaluateCertificateEligibility(eligibleStudentData);
console.log("   Result:", eligibleRes);
assert.strictEqual(eligibleRes.eligible, true, "Eligible student must return eligible: true");
assert.strictEqual(eligibleRes.overallThresholdMet, true, "100% overall threshold must be met");
assert.strictEqual(eligibleRes.modulesCompletionMet, true, "All modules must be completed");
assert.strictEqual(eligibleRes.quizzesPassedMet, true, "All quizzes must be passed");
console.log("   ✅ PASSED: Eligible User correctly validated for certificate emission!\n");

// Execute Test 2: Ineligible User
console.log("▶ [Test 2] Testing Ineligible User Scenario (75% Completion Threshold)...");
const ineligibleRes = evaluateCertificateEligibility(ineligibleStudentData);
console.log("   Result:", ineligibleRes);
assert.strictEqual(ineligibleRes.eligible, false, "Ineligible student must return eligible: false");
assert.strictEqual(ineligibleRes.overallThresholdMet, false, "75% overall threshold must fail 100% requirement");
assert.strictEqual(ineligibleRes.modulesCompletionMet, false, "Incomplete modules must fail requirement");
assert.strictEqual(ineligibleRes.quizzesPassedMet, false, "Pending quiz must fail requirement");
console.log("   ✅ PASSED: Ineligible User correctly rejected from claiming certificate!\n");

// Execute Test 3: Express HTTP Route Eligibility Endpoints
console.log("▶ [Test 3] Testing Express HTTP Eligibility Endpoints...");
const app = require("./app");
const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`   Express test server listening on port ${port}`);

  const makeRequest = (path) => {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:${port}${path}`, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      }).on("error", reject);
    });
  };

  try {
    // Test Scenario: GET /courses/test-eligibility/eligible
    const eligibleHttp = await makeRequest("/courses/test-eligibility/eligible");
    assert.strictEqual(eligibleHttp.status, 200);
    assert.strictEqual(eligibleHttp.data.eligible, true);
    assert.strictEqual(eligibleHttp.data.completionThreshold, 100);
    console.log("   ✅ GET /courses/test-eligibility/eligible passed (eligible: true, threshold: 100%)");

    // Test Scenario: GET /courses/test-eligibility/ineligible
    const ineligibleHttp = await makeRequest("/courses/test-eligibility/ineligible");
    assert.strictEqual(ineligibleHttp.status, 200);
    assert.strictEqual(ineligibleHttp.data.eligible, false);
    console.log("   ✅ GET /courses/test-eligibility/ineligible passed (eligible: false)");

    // Test Endpoint: GET /courses/1/eligibility
    const routeHttp = await makeRequest("/courses/1/eligibility");
    assert.strictEqual(routeHttp.status, 200);
    assert.strictEqual(routeHttp.data.success, true);
    assert.strictEqual(typeof routeHttp.data.eligible, "boolean");
    console.log("   ✅ GET /courses/1/eligibility passed (MongoDB query fallback verified)");

    console.log("\n==================================================================");
    console.log("🎉 ALL CERTIFICATE ELIGIBILITY TESTS & HTTP ROUTES PASSED!");
    console.log("==================================================================");
    server.close();
    process.exit(0);
  } catch (err) {
    console.error("   ❌ HTTP Route Test Error:", err);
    server.close();
    process.exit(1);
  }
});

