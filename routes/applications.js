const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");

// ------------------------
// Apply for a Job (Employee)
// ------------------------
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
     return next();
  } else {
    return  res.redirect("/login");
  }
}
router.get("/apply/:id",isAuthenticated , async (req, res) => {
    const jobId = req.params.id;
    try {
        const job = await Job.findById(jobId);   // Job DB se nikal
        if (!job) {
            return res.status(404).send("Job not found");
        }
        res.render("apply", { job });  // Yaha job pass karna zaroori hai
    } catch (err) {
        res.status(500).send("Server error");
    }
});

// Middleware to check if user is logged in

// Apply for a job
router.post("/apply/:jobId", isAuthenticated, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const user = req.session.user;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).send("Job not found");

    // Create application
    const newApplication = new Application({
      jobId: job._id,
      applicantId: user._id,
      name: req.body.name,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      address: req.body.address,
      workExperience: req.body.workExperience,
      resumeLink: req.body.resumeLink,
      classification: req.body.classification,
    });

    await newApplication.save();

    // After successful save, fetch all user's applications
    const userApplications = await Application.find({ applicantId: user._id }).populate("jobId");
    res.render("appliedJobs", { applications: userApplications });
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

// Get All Applications for a Job (Recruiter)
router.get("/job/:jobId", async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate("applicant", "name email address experience classification")
      .populate("job", "title description");
    res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get My Applied Jobs (Employee)
router.get("/myjobs/:userId", async (req, res) => {
  try {
    const userId = req.session.user._id;  // Logged-in user's ID
    const applications = await Application.find({ applicantId: userId })
      .populate("jobId", "title description location salary recruiter")
      .populate("applicantId", "name email");
    res.render("appliedJobs", { applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
