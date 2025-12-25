const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: String,
  text: String,
  type: {
    type: String,
    enum: ['text', 'number', 'select', 'multiselect', 'boolean', 'scale']
  },
  options: [String],
  required: Boolean,
  category: String
});

const sectionSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  questions: [questionSchema]
});

const questionnaireSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  version: {
    type: String,
    default: '1.0'
  },
  sections: [sectionSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

questionnaireSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.models.Questionnaire || mongoose.model('Questionnaire', questionnaireSchema);
