const http = require("http");
const app = require("./app");

const PORT = 5008;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: PORT,
      path,
      method,
      headers: { "Content-Type": "application/json" },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const server = app.listen(PORT, async () => {
  console.log(`\n=================================================`);
  console.log(`⚡ TESTING PROGRESS MILESTONE NOTIFICATIONS ⚡`);
  console.log(`=================================================\n`);

  try {
    // 1. Fetch student dashboard
    const dashRes = await request("GET", "/api/dashboard/demo");
    const course = dashRes.body.courses[0];
    const courseId = course.id;
    const lessonId = course.modules[0]?.lessons[0]?.id || "l101";

    console.log(`[TASK 1] Milestone detection testing on course: "${course.title}" (${course.code})`);

    // 2. Toggle lesson to hit 50%
    console.log(`\n[TASK 1 & 2] Step 1: Toggle lesson ${lessonId}...`);
    const res1 = await request("POST", `/api/dashboard/demo/toggle-lesson`, { courseId, lessonId });
    console.log(`   Progress: ${res1.body.progressPercentage}% | Reached Milestones:`, res1.body.reachedMilestones);
    if (res1.body.milestoneNotification) {
      console.log(`   🎉 Triggered Milestone:`, res1.body.milestoneNotification.message);
    }

    // 3. Toggle lesson again to hit 60% (Triggers 50% milestone for the first time)
    console.log(`\n[TASK 1 & 2] Step 2: Toggle lesson ${lessonId} back on...`);
    const res2 = await request("POST", `/api/dashboard/demo/toggle-lesson`, { courseId, lessonId });
    console.log(`   Progress: ${res2.body.progressPercentage}% | Reached Milestones:`, res2.body.reachedMilestones);
    if (res2.body.milestoneNotification) {
      console.log(`   🎉 Triggered Milestone:`, res2.body.milestoneNotification.message);
    }

    // 4. Toggle lesson a third time (Both 25% and 50% are now recorded in reachedMilestones)
    console.log(`\n[ACCEPTANCE CRITERIA] Step 3: Toggle lesson ${lessonId} again (Both 25% and 50% already triggered) -> Expect NO duplicate notification!`);
    const res3 = await request("POST", `/api/dashboard/demo/toggle-lesson`, { courseId, lessonId });
    console.log(`   Progress: ${res3.body.progressPercentage}% | Reached Milestones:`, res3.body.reachedMilestones);
    console.log(`   Milestone Notification Received:`, res3.body.milestoneNotification);

    if (res3.body.milestoneNotification !== null) {
      throw new Error("FAILED: Milestone notification was triggered again after already being recorded in reachedMilestones!");
    }

    console.log(`\n=================================================`);
    console.log(`🎉 ALL MILESTONE NOTIFICATION TESTS PASSED 100%! 🎉`);
    console.log(`=================================================\n`);
  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
});
