import { useState } from 'react'
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Divider, CircularProgress } from '@mui/material'
import KeyIcon from '@mui/icons-material/Key'
import axios from 'axios'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@wms.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKeyFile, setApiKeyFile] = useState(null)

  const handleApiKeyUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target.result)
          if (config.anthropicApiKey) {
            localStorage.setItem('anthropicApiKey', config.anthropicApiKey)
            setApiKeyFile(file.name)
            setError('')
          } else {
            setError('API key file must contain "anthropicApiKey" field')
          }
        } catch (err) {
          setError('Invalid API key file format')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/.netlify/functions/auth-login', { email, password })
      onLogin(response.data.user, response.data.token)
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card sx={{ maxWidth: 450, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">WMS Questionnaire Login</Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {apiKeyFile && <Alert severity="success" sx={{ mb: 2 }}>API Key: {apiKeyFile}</Alert>}
          
          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" component="label" fullWidth startIcon={<KeyIcon />}>
              Upload API Key (api-key.json)
              <input type="file" hidden accept=".json" onChange={handleApiKeyUpload} />
            </Button>
          </Box>

          <Divider sx={{ my: 2 }}>Login</Divider>

          <form onSubmit={handleSubmit}>
            <TextField 
              fullWidth 
              label="Email" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              margin="normal"
              required
            />
            <TextField 
              fullWidth 
              label="Password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              margin="normal"
              required
            />
            <Button 
              fullWidth 
              variant="contained" 
              type="submit" 
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>

        </CardContent>
      </Card>
    </Box>
  )
}
