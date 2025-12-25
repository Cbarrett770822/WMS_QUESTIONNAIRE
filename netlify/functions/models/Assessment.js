const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  questionnaire: { type: mongoose.Schema.Types.ObjectId, ref: 'Questionnaire', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ questionId: String, value: mongoose.Schema.Types.Mixed, notes: String }],
  status: { type: String, enum: ['draft', 'completed', 'reviewed'], default: 'draft' },
  score: Number,
  isSample: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.models.Assessment || mongoose.model('Assessment', assessmentSchema);
