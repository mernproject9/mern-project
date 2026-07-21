const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const { protect } = require("../middleware/auth");

// Helper function to format date for labels (e.g. "Jul 15")
function formatDateShort(d) {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return `${monthNames[d.getMonth()]} ${d.getDate()}`;
}

// Helper function to calculate 4 weekly buckets ending today
function getFourWeekBuckets(refDate = new Date()) {
  const buckets = [];
  const now = new Date(refDate);

  // Set to end of current day
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  for (let i = 3; i >= 0; i--) {
    const end = new Date(endOfToday.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const start = new Date(endOfToday.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000 + 1);

    const isCurrentWeek = i === 0;
    const weekNumber = 4 - i;
    const weekLabel = isCurrentWeek ? "This Week" : `${i} Wks Ago`;
    const range = `${formatDateShort(start)} - ${formatDateShort(end)}`;

    buckets.push({
      weekIndex: weekNumber,
      weekLabel: `Week ${weekNumber}`,
      subLabel: weekLabel,
      range,
      fullLabel: `W${weekNumber} (${range})`,
      startDate: start,
      endDate: end,
      timeSpent: 0,
      modulesCompleted: 0,
      activityCount: 0,
    });
  }

  return buckets;
}

// @desc    Get weekly activity metrics for current logged in student (past 4 weeks)
// @route   GET /api/activity/weekly
// @access  Private
router.get("/weekly", protect, async (req, res) => {
  try {
    const studentId = req.user._id;
    const buckets = getFourWeekBuckets();

    const fourWeeksAgoStart = buckets[0].startDate;
    const currentEnd = buckets[3].endDate;

    // Aggregate student activity records in range
    const activities = await Activity.find({
      studentId,
      timestamp: { $gte: fourWeeksAgoStart, $lte: currentEnd },
    }).sort("timestamp");

    // Distribute activities into weekly buckets
    activities.forEach((act) => {
      const actTime = new Date(act.timestamp).getTime();
      for (const bucket of buckets) {
        if (actTime >= bucket.startDate.getTime() && actTime <= bucket.endDate.getTime()) {
          bucket.timeSpent += act.timeSpentMinutes || 0;
          bucket.modulesCompleted += act.modulesCompleted || 0;
          bucket.activityCount += 1;
          break;
        }
      }
    });

    // Format response for chart consumption
    const labels = buckets.map((b) => b.fullLabel);
    const timeSpentData = buckets.map((b) => b.timeSpent);
    const modulesCompletedData = buckets.map((b) => b.modulesCompleted);

    const totalTimeSpent = timeSpentData.reduce((acc, v) => acc + v, 0);
    const totalModulesCompleted = modulesCompletedData.reduce((acc, v) => acc + v, 0);
    const activeWeeks = buckets.filter((b) => b.timeSpent > 0 || b.modulesCompleted > 0).length;

    res.json({
      success: true,
      labels,
      datasets: {
        timeSpent: timeSpentData,
        timeSpentHours: timeSpentData.map((mins) => parseFloat((mins / 60).toFixed(1))),
        modulesCompleted: modulesCompletedData,
      },
      weeks: buckets.map((b) => ({
        weekIndex: b.weekIndex,
        weekLabel: b.weekLabel,
        subLabel: b.subLabel,
        range: b.range,
        fullLabel: b.fullLabel,
        startDate: b.startDate,
        endDate: b.endDate,
        timeSpent: b.timeSpent,
        timeSpentHours: parseFloat((b.timeSpent / 60).toFixed(1)),
        modulesCompleted: b.modulesCompleted,
        activityCount: b.activityCount,
      })),
      summary: {
        totalTimeSpent,
        totalTimeSpentHours: parseFloat((totalTimeSpent / 60).toFixed(1)),
        totalModulesCompleted,
        activeWeeks,
        avgTimePerWeek: parseFloat((totalTimeSpent / 4).toFixed(1)),
        avgModulesPerWeek: parseFloat((totalModulesCompleted / 4).toFixed(1)),
      },
    });
  } catch (error) {
    console.error("Get weekly activity error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get weekly activity metrics for a specific student ID (admin/query)
// @route   GET /api/activity/student/:studentId/weekly
// @access  Private
router.get("/student/:studentId/weekly", protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const buckets = getFourWeekBuckets();
    const fourWeeksAgoStart = buckets[0].startDate;
    const currentEnd = buckets[3].endDate;

    const activities = await Activity.find({
      studentId,
      timestamp: { $gte: fourWeeksAgoStart, $lte: currentEnd },
    }).sort("timestamp");

    activities.forEach((act) => {
      const actTime = new Date(act.timestamp).getTime();
      for (const bucket of buckets) {
        if (actTime >= bucket.startDate.getTime() && actTime <= bucket.endDate.getTime()) {
          bucket.timeSpent += act.timeSpentMinutes || 0;
          bucket.modulesCompleted += act.modulesCompleted || 0;
          bucket.activityCount += 1;
          break;
        }
      }
    });

    const labels = buckets.map((b) => b.fullLabel);
    const timeSpentData = buckets.map((b) => b.timeSpent);
    const modulesCompletedData = buckets.map((b) => b.modulesCompleted);

    res.json({
      success: true,
      labels,
      datasets: {
        timeSpent: timeSpentData,
        timeSpentHours: timeSpentData.map((mins) => parseFloat((mins / 60).toFixed(1))),
        modulesCompleted: modulesCompletedData,
      },
      weeks: buckets.map((b) => ({
        weekIndex: b.weekIndex,
        weekLabel: b.weekLabel,
        subLabel: b.subLabel,
        range: b.range,
        fullLabel: b.fullLabel,
        timeSpent: b.timeSpent,
        modulesCompleted: b.modulesCompleted,
      })),
      summary: {
        totalTimeSpent: timeSpentData.reduce((a, b) => a + b, 0),
        totalModulesCompleted: modulesCompletedData.reduce((a, b) => a + b, 0),
      },
    });
  } catch (error) {
    console.error("Get student weekly activity error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Log a new study activity session
// @route   POST /api/activity/log
// @access  Private
router.post("/log", protect, async (req, res) => {
  try {
    const { courseId, timeSpentMinutes, modulesCompleted, notes, activityType, timestamp } = req.body;

    const activity = await Activity.create({
      studentId: req.user._id,
      courseId: courseId || undefined,
      timeSpentMinutes: Number(timeSpentMinutes) || 0,
      modulesCompleted: Number(modulesCompleted) || 0,
      notes: notes || "",
      activityType: activityType || "study_session",
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    res.status(201).json({ success: true, activity });
  } catch (error) {
    console.error("Log activity error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Seed sample test scenario for testing activity chart
// @route   POST /api/activity/seed-scenario
// @access  Private
router.post("/seed-scenario", protect, async (req, res) => {
  try {
    const { scenario } = req.body; // 'consistent', 'spike', 'inactive', 'empty'
    const studentId = req.user._id;

    // Delete existing activity records for testing
    await Activity.deleteMany({ studentId });

    if (scenario === "empty") {
      return res.json({ success: true, message: "Cleared all activity records (Empty Scenario)" });
    }

    const buckets = getFourWeekBuckets();
    const newActivities = [];

    // Helper to pick random date inside bucket
    const randomDateInBucket = (bucket) => {
      const startMs = bucket.startDate.getTime();
      const endMs = bucket.endDate.getTime();
      return new Date(startMs + Math.random() * (endMs - startMs));
    };

    if (scenario === "consistent") {
      // 45-60 mins and 2-3 modules per week
      buckets.forEach((b) => {
        newActivities.push({
          studentId,
          timeSpentMinutes: 45 + Math.floor(Math.random() * 30),
          modulesCompleted: 2 + Math.floor(Math.random() * 2),
          timestamp: randomDateInBucket(b),
          activityType: "study_session",
        });
        newActivities.push({
          studentId,
          timeSpentMinutes: 30 + Math.floor(Math.random() * 20),
          modulesCompleted: 1,
          timestamp: randomDateInBucket(b),
          activityType: "module_completion",
        });
      });
    } else if (scenario === "spike") {
      // Low initial, huge recent spike in week 4
      buckets.forEach((b, idx) => {
        if (idx === 0) {
          // Week 1: 0 activity
        } else if (idx === 1) {
          // Week 2: 15 mins
          newActivities.push({
            studentId,
            timeSpentMinutes: 15,
            modulesCompleted: 1,
            timestamp: randomDateInBucket(b),
          });
        } else if (idx === 2) {
          // Week 3: 40 mins
          newActivities.push({
            studentId,
            timeSpentMinutes: 40,
            modulesCompleted: 2,
            timestamp: randomDateInBucket(b),
          });
        } else {
          // Week 4: 180 mins spike, 6 modules
          newActivities.push({
            studentId,
            timeSpentMinutes: 120,
            modulesCompleted: 4,
            timestamp: randomDateInBucket(b),
          });
          newActivities.push({
            studentId,
            timeSpentMinutes: 60,
            modulesCompleted: 2,
            timestamp: randomDateInBucket(b),
          });
        }
      });
    } else if (scenario === "inactive") {
      // Activity in week 1 & 4, zero in week 2 & 3
      newActivities.push({
        studentId,
        timeSpentMinutes: 60,
        modulesCompleted: 3,
        timestamp: randomDateInBucket(buckets[0]),
      });
      newActivities.push({
        studentId,
        timeSpentMinutes: 90,
        modulesCompleted: 4,
        timestamp: randomDateInBucket(buckets[3]),
      });
    }

    if (newActivities.length > 0) {
      await Activity.insertMany(newActivities);
    }

    res.json({
      success: true,
      message: `Seeded test scenario: ${scenario}`,
      count: newActivities.length,
    });
  } catch (error) {
    console.error("Seed scenario error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
