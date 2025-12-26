import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Typography, Button, Card, CardContent, TextField, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, CircularProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import axios from 'axios'

export default function Questionnaire() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const assessmentId = searchParams.get('assessmentId')
  
  const [questionnaire, setQuestionnaire] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [currentSection, setCurrentSection] = useState(0)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [companyDialog, setCompanyDialog] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [companyId, setCompanyId] = useState(null)

  useEffect(() => {
    fetchQuestionnaire()
    if (!assessmentId) {
      checkCompany()
    } else {
      loadExistingAssessment()
    }
  }, [id, assessmentId])

  const loadExistingAssessment = async () => {
    try {
      const response = await axios.get(`/.netlify/functions/get-assessments?assessmentId=${assessmentId}`)
      if (response.data && response.data.length > 0) {
        const assessment = response.data[0]
        setCompanyId(assessment.company._id)
        setCompanyName(assessment.company.name)
        
        // Load existing answers into form
        const answerMap = {}
        if (assessment.answers && assessment.answers.length > 0) {
          assessment.answers.forEach(ans => {
            // Convert boolean values to yes/no strings for radio buttons
            if (typeof ans.value === 'boolean') {
              answerMap[ans.questionId] = ans.value ? 'yes' : 'no'
            } else {
              answerMap[ans.questionId] = ans.value
            }
          })
          setAnswers(answerMap)
          console.log('Loaded', Object.keys(answerMap).length, 'answers from assessment')
        }
      }
    } catch (error) {
      console.error('Error loading assessment:', error)
    }
  }

  const checkCompany = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.company) {
      setCompanyId(user.company)
    } else {
      setCompanyDialog(true)
    }
  }

  const handleCompanySubmit = async () => {
    if (!companyName.trim()) {
      alert('Please enter a company name')
      return
    }

    try {
      const response = await axios.post('/.netlify/functions/create-company', {
        name: companyName.trim()
      })
      
      const newCompanyId = response.data._id
      setCompanyId(newCompanyId)
      
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      user.company = newCompanyId
      localStorage.setItem('user', JSON.stringify(user))
      
      setCompanyDialog(false)
      setCompanyName(companyName.trim())
    } catch (error) {
      console.error('Error creating company:', error)
      alert('Failed to create company')
    }
  }

  const fetchQuestionnaire = async () => {
    try {
      const response = await axios.get('/.netlify/functions/questionnaires')
      const allQuestionnaires = response.data
      const found = allQuestionnaires.find(q => q._id === id)
      if (found) {
        setQuestionnaire(found)
      } else {
        setError('Questionnaire not found')
      }
    } catch (error) {
      console.error('Error fetching questionnaire:', error)
      setError('Failed to load questionnaire')
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async (currentAnswers, status = 'draft') => {
    if (!companyId) return

    try {
      setSaving(true)
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const formattedAnswers = Object.entries(currentAnswers).map(([questionId, value]) => ({
        questionId,
        value
      }))
      
      await axios.post('/.netlify/functions/save-assessment', {
        questionnaireId: id,
        userId: user.id,
        companyId: companyId,
        answers: formattedAnswers,
        status
      })
      
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (error) {
      console.error('Error saving progress:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAnswerChange = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    saveProgress(newAnswers)
  }

  const handleNext = () => {
    if (currentSection < questionnaire.sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      await saveProgress(answers, 'completed')
      alert('Assessment submitted successfully!')
      navigate('/assessments')
    } catch (error) {
      setError('Failed to submit assessment')
    }
  }

  if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>
  if (!questionnaire) return <Box sx={{ p: 3 }}><Typography>Questionnaire not found</Typography></Box>

  const section = questionnaire.sections?.[currentSection]

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/assessments')}
          variant="outlined"
        >
          Back to Assessments
        </Button>
      </Box>

      {companyName && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
          <Typography variant="h6" color="primary.contrastText">
            {companyName}
          </Typography>
        </Box>
      )}

      <Typography variant="h4" gutterBottom>Infor WMS Questionnaire</Typography>

      {section ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Section {currentSection + 1} of {questionnaire.sections.length}: {section.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {section.description}
            </Typography>

            {section.questions?.map((question, idx) => (
              <Box key={idx} sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <FormLabel>{question.text}</FormLabel>
                  {question.type === 'text' && (
                    <TextField
                      fullWidth
                      margin="normal"
                      multiline
                      rows={2}
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                  )}
                  {question.type === 'boolean' && (
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    >
                      <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                      <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                  )}
                </FormControl>
              </Box>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info">No sections available</Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button variant="outlined" onClick={handlePrevious} disabled={currentSection === 0}>
          Previous
        </Button>
        
        <Box>
          {saving && <Typography variant="caption" sx={{ mr: 2 }}>Saving...</Typography>}
          {currentSection < (questionnaire.sections?.length || 0) - 1 ? (
            <Button variant="contained" onClick={handleNext}>Next Section</Button>
          ) : (
            <Button variant="contained" color="success" onClick={handleSubmit}>Submit Assessment</Button>
          )}
        </Box>
      </Box>

      <Dialog open={companyDialog} onClose={() => {}}>
        <DialogTitle>Company Information</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please enter your company name to begin the assessment.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/assessments')}>Cancel</Button>
          <Button onClick={handleCompanySubmit} variant="contained">Continue</Button>
      