const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  assessmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  reportData: {
    executiveSummary: String,
    painPoints: [{
      category: String,
      description: String,
      impact: String,
      severity: {
        type: String,
        enum: ['high', 'medium', 'low']
      }
    }],
    opportunities: [{
      title: String,
      description: String,
      expectedValue: String,
      timeframe: String,
      priority: Number
    }],
    valuePropositions: [{
      businessProcess: String,
      currentState: String,
      proposedSolution: String,
      expectedBenefits: [String],
      roiImpact: String
    }],
    capabilityGaps: [{
      area: String,
      currentCapability: String,
      requiredCapability: String,
      inforWMSSolution: String
    }],
    recommendations: [{
      phase: String,
      actions: [String],
      expectedOutcome: String
    }],
    metrics: {
      currentState: mongoose.Schema.Types.Mixed,
      projectedImprovements: mongoose.Schema.Types.Mixed
    }
  },
  status: {
    type: String,
    enum: ['draft', 'final', 'shared'],
    default: 'draft'
  },
  sharedAt: Date,
  shareToken: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
