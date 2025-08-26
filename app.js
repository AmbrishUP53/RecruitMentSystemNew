const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

// Models
const Job = require("./models/Job");
const Application = require("./models/Application");
const User = require("./models/User");

const app = express();

// ===== Middleware =====
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, "public")));

// EJS View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Sessions (for login state)
app.use(session({
  secret: "yourSecretKey",
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
    ttl: 1000 * 60 * 60 * 24 // 24 hours
  }),
  cookie: {
    maxAge : null
  }
}));



// ===== Database Connection =====
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// ===== Routes =====
const jobRoutes = require("./routes/jobs");
app.use("/jobs", jobRoutes);
const applicationRoute = require("./routes/applications");
app.use("/applications" , applicationRoute);



// Home Page
app.get("/", async (req, res) => {
  const jobs = await Job.find().limit(10);
  res.render("index", { jobs, user: req.session.user });
});

// Show Jobs (search & filter)
app.get("/jobs", async (req, res) => {
  const { keyword, location } = req.query;
  let query = {};

  if (keyword) {
    query.title = { $regex: keyword, $options: "i" };
  }
  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  const jobs = await Job.find(query);
  res.render("jobs", { jobs, user: req.session.user });
});
// Apply Page
app.get("/apply/:id", async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).send("Job not found");
  res.render("apply", { job, user: req.session.user });
});

// Handle Application
app.post("/apply", async (req, res) => {
  try {
    const { jobId, name, email, resume } = req.body;
    const job = await Job.findById(jobId);

    if (!job) return res.status(404).send("Job not found");

    const application = new Application({
      job: jobId,
      applicantName: name,
      applicantEmail: email,
      resume,
    });

    await application.save();
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error submitting application");
  }
});

// Recruiter: Post Job
app.get("/post-job", (req, res) => {
  res.render("post-job", { user: req.session.user });
});

app.post("/post-job", async (req, res) => {
  try {
    const { title, description, location, salary } = req.body;
    const newJob = new Job({
      title,
      description,
      location,
      salary,
      postedBy: req.session.user ? req.session.user._id : null,
    });
    await newJob.save();
    res.redirect("/jobs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error posting job");
  }
});

// Dashboard
app.get("/dashboard", async (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  let appliedJobs = [];
  if (req.session.user.role === "employee") {
    appliedJobs = await Application.find({ applicantEmail: req.session.user.email }).populate("job");
  }

  let postedJobs = [];
  if (req.session.user.role === "recruiter") {
    postedJobs = await Job.find({ postedBy: req.session.user._id });
  }

  res.render("dashboard", { user: req.session.user, appliedJobs, postedJobs });
});

// Auth: Login Page
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email, password, role });

  if (user) {
    req.session.user = user;
    res.redirect("/dashboard");
  } else {
    res.render("login", { error: "Invalid credentials" });
  }
});

// Auth: Signup Page
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  const newUser = new User({ name, email, password, role });
  await newUser.save();
  res.redirect("/login");
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
