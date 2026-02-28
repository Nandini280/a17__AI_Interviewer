const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  education: [{
    institution: String,
    degree: String,
    year: String
  }],
  experience: [{
    company: String,
    position: String,
    duration: String,
    description: String
  }],
  domain: {
    type: String,
    default: 'General'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
