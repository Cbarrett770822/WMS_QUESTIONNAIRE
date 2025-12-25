require('dotenv').config();
const { connectToDatabase } = require('./utils/db.js');
const { anthropicMessages } = require('./utils/anthropic.js');
const Assessment = require('./models/Assessment.js');
const Report = require('./models/Report.js');
const Company = require('./models/Company.js');
const Questionnaire = require('./models/Questionnaire.js');
const User = require('./models/User.js');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    await connectToDatabase();
    const { assessmentId, userId, anthropicApiKey } = JSON.parse(event.body);
    
    if (!anthropicApiKey) {
      return { 
        statusCode: 400, 
        headers, 
        body: JSON.stringify({ error: 'Anthropic API key is required' }) 
      };
    }

    const assessment = await Assessment.findById(assessmentId)
      .populate('company')
      .populate('questionnaire')
      .populate('user');

    if (!assessment) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: 'Assessment not found' }) };
    }

    console.log('Generating AI analysis with Claude...');
    const aiAnalysis = await generateAIAnalysisWithClaude(assessment, anthropicApiKey);

    const report = await Report.create({
      assessmentId: assessment._id,
      companyId: assessment.company._id,
      generatedBy: userId,
      reportData: aiAnalysis,
      status: 'draft'
    });

    return { statusCode: 200, headers, body: JSON.stringify(report) };
  } catch (error) {
    console.error('Error generating report:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};

async function generateAIAnalysisWithClaude(assessment, anthropicApiKey) {
  const answers = assessment.answers || [];
  const questionnaire = assessment.questionnaire;
  const company = assessment.company;

  console.log('=== Starting AI Analysis ===');
  console.log('Company:', company.name);
  console.log('Answers count:', answers.length);
  console.log('Has questionnaire:', !!questionnaire);
  console.log('Has sections:', !!questionnaire?.sections);

  // Build answer map with question text for context
  const answerMap = {};
  const questionMap = {};
  
  if (questionnaire && questionnaire.sections) {
    questionnaire.sections.forEach(section => {
      if (section.questions) {
        section.questions.forEach(q => {
          questionMap[q.id] = {
            section: section.title,
            question: q.text,
            type: q.type
          };
        });
      }
    });
  }

  console.log('Question map built with', Object.keys(questionMap).length, 'questions');

  answers.forEach(a => {
    answerMap[a.questionId] = {
      value: a.value,
      question: questionMap[a.questionId]
    };
  });

  console.log('Answer map built with', Object.keys(answerMap).length, 'answers');

  // Prepare comprehensive context for Claude
  const questionnaireContext = JSON.stringify(answerMap, null, 2);
  
  const systemPrompt = `You are an expert WMS (Warehouse Management System) consultant specializing in Infor WMS solutions. Your role is to analyze customer questionnaire responses and generate comprehensive, actionable reports that identify pain points, opportunities, and value propositions.

You have deep expertise in:
- Warehouse operations and best practices
- Inventory management and accuracy optimization
- Labor management and productivity improvement
- Technology integration and automation
- ROI analysis and business case development
- Infor WMS capabilities and features

Your analysis should be data-driven, specific, and focused on quantifiable business outcomes.`;

  const userPrompt = `Analyze the following WMS questionnaire responses for ${company.name} and generate a comprehensive assessment report.

QUESTIONNAIRE RESPONSES:
${questionnaireContext}

Generate a detailed JSON report with the following structure:

{
  "executiveSummary": "A 2-3 paragraph executive summary highlighting the current state, key challenges, and recommended path forward",
  
  "painPoints": [
    {
      "category": "Category name (e.g., Inventory Accuracy, Labor Costs, Technology Gap)",
      "description": "Detailed description of the pain point based on questionnaire responses",
      "impact": "Business impact and consequences",
      "severity": "high|medium|low",
      "currentMetric": "Current performance metric if available",
      "estimatedCost": "Estimated annual cost of this pain point"
    }
  ],
  
  "opportunities": [
    {
      "title": "Opportunity title",
      "description": "Detailed description of the improvement opportunity",
      "expectedValue": "Expected business value and improvements",
      "timeframe": "Implementation timeframe",
      "priority": 1-5,
      "estimatedCost": "Implementation cost range",
      "estimatedSavings": "Annual savings potential",
      "quickWin": true|false
    }
  ],
  
  "valuePropositions": [
    {
      "businessProcess": "Business process or capability area",
      "currentState": "Customer's current state from responses",
      "proposedSolution": "How Infor WMS addresses this",
      "expectedBenefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "roiImpact": "ROI calculation or estimate"
    }
  ],
  
  "capabilityGaps": [
    {
      "area": "Functional area",
      "currentCapability": "What they have now",
      "requiredCapability": "What they need",
      "businessImpact": "Impact of the gap",
      "inforWMSSolution": "Specific Infor WMS solution",
      "priority": "Critical|High|Medium|Low"
    }
  ],
  
  "recommendations": [
    {
      "phase": "Phase name and timeframe",
      "actions": ["Action 1", "Action 2", "Action 3"],
      "expectedOutcome": "Expected results",
      "estimatedCost": "Cost range",
      "estimatedSavings": "Savings potential"
    }
  ],
  
  "metrics": {
    "currentState": {
      "inventoryAccuracy": "value",
      "otifScore": "value",
      "returnsRate": "value",
      "orderAccuracy": "value",
      "capacityUtilization": "value"
    },
    "projectedState": {
      "inventoryAccuracy": "target value",
      "otifScore": "target value",
      "returnsRate": "target value",
      "orderAccuracy": "target value",
      "capacityUtilization": "target value"
    },
    "estimatedROI": "Overall ROI timeframe",
    "totalInvestment": "Total implementation cost",
    "annualSavings": "Total annual savings",
    "paybackPeriod": "Months to payback"
  }
}

IMPORTANT GUIDELINES:
1. Base all analysis on the actual questionnaire responses provided
2. Be specific and quantitative - use actual numbers from responses
3. Identify 5-10 pain points prioritized by severity
4. Suggest 5-8 opportunities with clear ROI potential
5. Create 3-5 compelling value propositions linking Infor WMS to customer needs
6. Identify 4-6 critical capability gaps
7. Provide a phased implementation roadmap (3-4 phases)
8. Calculate realistic ROI based on industry benchmarks and customer data
9. Focus on business outcomes, not just features
10. Make recommendations actionable and prioritized

Return ONLY valid JSON, no additional text.`;

  try {
    console.log('Calling Claude API...');
    
    const claudeResponse = await anthropicMessages({
      apiKey: anthropicApiKey,
      model: 'claude-3-haiku-20240307',
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 4096,
      timeoutMs: 90000
    });

    console.log('Claude response received');

    let cleanedResponse = claudeResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }
    
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    }

    const aiAnalysis = JSON.parse(cleanedResponse);
    console.log('Analysis parsed successfully');
    
    return aiAnalysis;
  } catch (error) {
    console.error('Claude API error:', error.message);
    throw error;
  }
}

function generateFallbackAnalysis(answerMap, company) {
  // Simplified fallback analysis
  const painPoints = [];
  const opportunities = [];
  
  // Extract key metrics
  Object.keys(answerMap).forEach(key => {
    const answer = answerMap[key];
    if (key === 'exec_7' && parseFloat(answer.value) < 95) {
      painPoints.push({
        category: 'Inventory Accuracy',
        description: `Current inventory accuracy is ${answer.value}%, below industry best practice`,
        impact: 'High - Leads to stockouts and customer dissatisfaction',
        severity: 'high',
        currentMetric: `${answer.value}%`,
        estimatedCost: 'Significant operational inefficiency'
      });
    }
  });

  return {
    executiveSummary: `Assessment completed for ${company.name}. Analysis based on questionnaire responses indicates opportunities for operational improvement through WMS implementation.`,
    painPoints,
    opportunities: [
      {
        title: 'Implement WMS for Operational Excellence',
        description: 'Deploy Infor WMS to address identified gaps',
        expectedValue: 'Significant operational improvements',
        timeframe: '6-12 months',
        priority: 1,
        quickWin: false
      }
    ],
    valuePropositions: [],
    capabilityGaps: [],
    recommendations: [
      {
        phase: 'Phase 1: Assessment and Planning',
        actions: ['Detailed requirements gathering', 'Solution design', 'Project planning'],
        expectedOutcome: 'Clear implementation roadmap'
      }
    ],
    metrics: {
      currentState: {},
      projectedState: {},
      estimatedROI: 'To be determined based on detailed analysis'
    }
  };
}




