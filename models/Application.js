const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // New fields
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobileNo: { type: String, required: true },
  address: { type: String, required: true },
  workExperience: { type: String, required: true },
  resumeLink: { type: String, required: true },
  classification: { 
    type: String, 
    enum: ["Graduate", "12th Pass", "Diploma", "Other"], 
    required: true 
  },

  status: { type: String, enum: ["submitted", "shortlisted"], default: "submitted" },
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);
