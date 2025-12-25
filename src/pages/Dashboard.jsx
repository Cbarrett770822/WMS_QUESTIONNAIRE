import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Card, CardContent, Grid, CircularProgress } from '@mui/material'
import axios from 'axios'

export default function Dashboard() {
  const navigate = useNavigate()
  const [questionnaires, setQuestionnaires] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuestionnaires()
  }, [])

  const fetchQuestionnaires = async () => {
    try {
      const response = await axios.get('/.netlify/functions/questionnaires')
      setQuestionnaires(response.data)
    } catch (error) {
      console.error('Error fetching questionnaires:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>Welcome to WMS Questionnaire App</Typography>
      
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {questionnaires.map((q) => (
            <Grid item xs={12} md={6} key={q._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{q.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {q.description}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate(`/questionnaire/${q._id}`)}
                  >
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
