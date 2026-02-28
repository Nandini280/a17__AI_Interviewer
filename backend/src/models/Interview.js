const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Technical', 'HR', 'Behavioral'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  expectedKeywords: [String],
  skill: String
});

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId
  },
  questionText: String,
  answerText: {
    type: String,
    default: ''
  },
  answerType: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text'
  },
  scores: {
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    overall: { type: Number, default: 0 }
  },
  feedback: {
    type: String,
    default: ''
  },
  strengths: [String],
  weaknesses: [String]
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  questions: [questionSchema],
  answers: [answerSchema],
  overallScore: {
    type: Number,
    default: 0
  },
  technicalScore: {
    type: Number,
    default: 0
  },
  communicationScore: {
    type: Number,
    default: 0
  },
  confidenceLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  skillsTested: [String],
  strengths: [String],
  weaknesses: [String],
  improvementTips: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
