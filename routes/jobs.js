const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const User = require("../models/User");

// Show jobs posted by a recruiter
router.get("/recruiter-jobs/:id", async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.params.id });
    res.render("recruiterJobs", { jobs , user:req.session.user }); 
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});


// Show create job form
router.get("/create", (req, res) => {
  res.render("createJob", { user: req.session.user });  
});

// Create a Job (Recruiter)
router.post("/create", async (req, res) => {
  try {
    const { title, description, location, salary, category, recruiterId } = req.body;
    // Recruiter validate karo
    const recruiter = await User.findById(recruiterId);
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(400).json({ message: "Invalid recruiter" });
    }
    // Job create karo
    const job = new Job({
      title,
      description,
      location,
      salary,
      category,
      recruiter: recruiterId,
    });

    await job.save();
    // Ab recruiter ki saari jobs fetch karo
    const jobs = await Job.find({ recruiter: recruiterId });

    // recruiterJobs page render karo with recruiter details + jobs list
    res.render("recruiterJobs", { user: recruiter, jobs });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ------------------------
// Get All Jobs (Employee)
// ------------------------
router.get("/all", async (req, res) => {
  try {
    const jobs = await Job.find().populate("recruiter", "name email");
    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// Get Job by ID
// ------------------------
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("recruiter", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------------
// Filter Jobs by Category / Location
// ------------------------
router.get("/filter/:field/:value", async (req, res) => {
  try {
    const { field, value } = req.params;
    const query = {};
    query[field] = value;

    const jobs = await Job.find(query).populate("recruiter", "name email");
    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
