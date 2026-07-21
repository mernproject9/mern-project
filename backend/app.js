const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Import Routers
const authRouter = require("./routes/auth");
const coursesRouter = require("./routes/courses");
const enrollmentsRouter = require("./routes/enrollments");
const studentsRouter = require("./routes/students");
const activityRouter = require("./routes/activity");

dotenv.config();

connectDB();

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// Enable CORS for frontend integration
app.use(cors());

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Mount Routers
app.use("/api/auth", authRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/activity", activityRouter);
app.use("/students", studentsRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;