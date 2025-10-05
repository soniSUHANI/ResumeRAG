const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  description: String,
  requirements: [String],
  preferredSkills: [String],
  location: String,
  salaryRange: {
    min: Number,
    max: Number
  },
  createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);