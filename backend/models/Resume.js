const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  filePath: String,
  fileSize: Number,
  uploadDate: { type: Date, default: Date.now },
  parsedData: {
    name: String,
    email: String,
    phone: String,
    skills: [String],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    education: [{
      degree: String,
      institution: String,
      year: String
    }],
    rawText: String
  }
});

module.exports = mongoose.model('Resume', resumeSchema);