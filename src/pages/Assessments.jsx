import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Card, CardContent, Grid, Chip, CircularProgress, Alert, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import AssessmentIcon from '@mui/icons-material/Assessment'
import StarIcon from '@mui/icons-material/Star'
import axios from 'axios'

export default function Assessments() {
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, assessmentId: null })
  const [questionnaireId, setQuestionnaireId] = useState(null)
  const [generatingReport, setGeneratingReport] = useState(null)

  useEffect(() => {
    fetchAssessments()
    fetchQuestionnaire()
  }, [])

  // Refresh assessments when component becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page visible - refreshing assessments')
        fetchAssessments()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchQuestionnaire = async () => {
    try {
      const response = await axios.get('/.netlify/functions/questionnaires')
      if (response.data && response.data.length > 0) {
        setQuestionnaireId(response.data[0]._id)
      }
    } catch (error) {
      console.error('Error fetching questionnaire:', error)
    }
  }

  const fetchAssessments = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      // Admin users see all assessments, regular users see only their company's assessments
      let url = '/.netlify/functions/get-assessments'
      
      if (user.role !== 'admin' && user.company) {
        url += `?companyId=${user.company}`
      }

      console.log('Fetching assessments for user:', user.email, 'role:', user.role)
      const response = await axios.get(url)
      console.log('Fetched assessments:', response.data.length)
      setAssessments(response.data)
    } catch (error) {
      console.error('Error fetching assessments:', error)
      setError('Failed to load assessments')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (assessmentId) => {
    try {
      await axios.delete(`/.netlify/functions/delete-assessment?assessmentId=${assessmentId}`)
      setAssessments(assessments.filter(a => a._id !== assessmentId))
      setDeleteDialog({ open: false, assessmentId: null })
    } catch (error) {
      console.error('Error deleting assessment:', error)
      alert('Failed to delete assessment')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success'
      case 'draft': return 'warning'
      case 'reviewed': return 'info'
      default: return 'default'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleGenerateReport = async (assessmentId) => {
    setGeneratingReport(assessmentId)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const anthropicApiKey = localStorage.getItem('anthropicApiKey')
      
      if (!anthropicApiKey) {
        setError('Please upload API key file (api-key.json) on login page')
        setGeneratingReport(null)
        return
      }
      
      const response = await axios.post('/.netlify/functions/generate-assessment-report', {
        assessmentId,
        userId: user.id,
        anthropicApiKey
      })
      if (response.data?._id) {
        navigate(`/report/${response.data._id}`)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      setError('Failed to generate report')
    } finally {
      setGeneratingReport(null)
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">WMS Assessments</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => questionnaireId && navigate(`/questionnaire/${questionnaireId}`)}
          disabled={!questionnaireId}
        >
          Start New Assessment
        </Button>
      </Box>

      {assessments.length === 0 ? (
        <Alert severity="info">
          No assessments found. Click "Start New Assessment" to begin.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {assessments.map((assessment) => (
            <Grid item xs={12} md={6} lg={4} key={assessment._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Chip 
                      label={assessment.status} 
                      color={getStatusColor(assessment.status)}
                      size="small"
                    />
                  </Box>

                  {assessment.company && (
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h5" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        {assessment.company.name}
                      </Typography>
                      {assessment.isSample && (
                        <Chip 
                          icon={<StarIcon />} 
                          label="Sample" 
                          color="primary" 
                          size="small" 
                        />
                      )}
                    </Box>
                  )}

                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Created: {formatDate(assessment.createdAt)}
                    </Typography>
                  </Box>

                  {assessment.completedAt && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Completed: {formatDate(assessment.completedAt)}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Answers: {assessment.answers?.length || 0}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      fullWidth
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/questionnaire/${assessment.questionnaire._id}?assessmentId=${assessment._id}`)}
                    >
                      {assessment.status === 'completed' ? 'View' : 'Continue'}
                    </Button>
                    {!assessment.isSample && (<IconButton 
                      color="error" 
                      size="small"
                      onClick={() => setDeleteDialog({ open: true, assessmentId: assessment._id })}
                    >
                      <DeleteIcon />
                    </IconButton>)}
                  </Box>

                  {assessment.status === 'completed' && (
                    <Button 
                      variant="contained" 
                      size="small"
                      fullWidth
                      startIcon={<AssessmentIcon />}
                      onClick={() => handleGenerateReport(assessment._id)}
                      disabled={generatingReport === assessment._id}
                      sx={{ mt: 1 }}
                    >
                      {generatingReport === assessment._id ? 'Generating...' : 'Generate Report'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, assessmentId: null })}>
        <DialogTitle>Delete Assessment</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this assessment? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, assessmentId: null })}>Cancel</Button>
          <Button onClick={() => handleDelete(deleteDialog.assessmentId)} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

