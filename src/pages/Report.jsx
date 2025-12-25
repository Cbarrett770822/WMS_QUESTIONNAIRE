import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Typography, Card, CardContent, Grid, Chip, Divider, CircularProgress, Alert, Button, Paper } from '@mui/material'
import axios from 'axios'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PrintIcon from '@mui/icons-material/Print'

export default function Report() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReport()
  }, [id])

  const fetchReport = async () => {
    try {
      const response = await axios.get(`/.netlify/functions/get-report?reportId=${id}`)
      setReport(response.data)
    } catch (error) {
      console.error('Error fetching report:', error)
      setError('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>
  if (!report) return <Box sx={{ p: 3 }}><Typography>Report not found</Typography></Box>

  const { reportData } = report

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, '@media print': { display: 'none' } }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/assessments')}>
          Back to Assessments
        </Button>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
          Print Report
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          WMS Assessment Report
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Generated: {new Date(report.generatedAt).toLocaleDateString()}
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>Executive Summary</Typography>
          <Typography variant="body1">{reportData.executiveSummary}</Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>Current State Metrics</Typography>
          <Grid container spacing={2}>
            {Object.entries(reportData.metrics?.currentState || {}).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                    <Typography variant="h6">{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>Identified Pain Points</Typography>
          {reportData.painPoints?.map((pain, idx) => (
            <Card key={idx} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">{pain.category}</Typography>
                  <Chip 
                    label={pain.severity} 
                    color={pain.severity === 'high' ? 'error' : pain.severity === 'medium' ? 'warning' : 'info'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {pain.description}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  Impact: {pain.impact}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>Improvement Opportunities</Typography>
          {reportData.opportunities?.map((opp, idx) => (
            <Card key={idx} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{opp.title}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{opp.description}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Chip label={`Priority ${opp.priority}`} size="small" color="primary" />
                  <Chip label={opp.timeframe} size="small" variant="outlined" />
                </Box>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  Expected Value: {opp.expectedValue}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>Infor WMS Value Propositions</Typography>
          {reportData.valuePropositions?.map((vp, idx) => (
            <Card key={idx} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{vp.businessProcess}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Current State:</Typography>
                    <Typography variant="body2">{vp.currentState}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Proposed Solution:</Typography>
                    <Typography variant="body2">{vp.proposedSolution}</Typography>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Expected Benefits:</Typography>
                  <ul>
                    {vp.expectedBenefits?.map((benefit, i) => (
                      <li key={i}><Typography variant="body2">{benefit}</Typography></li>
                    ))}
                  </ul>
                </Box>
                <Typography variant="body2" color="success.main" fontWeight="bold" sx={{ mt: 1 }}>
                  {vp.roiImpact}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>Capability Gaps</Typography>
          {reportData.capabilityGaps?.map((gap, idx) => (
            <Card key={idx} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{gap.area}</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">Current:</Typography>
                    <Typography variant="body2">{gap.currentCapability}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">Required:</Typography>
                    <Typography variant="body2">{gap.requiredCapability}</Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="success.main">Infor WMS Solution:</Typography>
                    <Typography variant="body2">{gap.inforWMSSolution}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>Recommended Implementation Roadmap</Typography>
          {reportData.recommendations?.map((rec, idx) => (
            <Card key={idx} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{rec.phase}</Typography>
                <Typography variant="subtitle2" gutterBottom>Actions:</Typography>
                <ul>
                  {rec.actions?.map((action, i) => (
                    <li key={i}><Typography variant="body2">{action}</Typography></li>
                  ))}
                </ul>
                <Typography variant="body2" color="primary.main" fontWeight="bold" sx={{ mt: 1 }}>
                  Expected Outcome: {rec.expectedOutcome}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>Projected Improvements</Typography>
          <Grid container spacing={2}>
            {Object.entries(reportData.metrics?.projectedImprovements || {}).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Card variant="outlined" sx={{ bgcolor: 'success.light' }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                    <Typography variant="h6" color="success.dark">{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  )
}
