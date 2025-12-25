import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Container, AppBar, Toolbar, Typography, Button } from '@mui/material'
import Login from './pages/Login'
import Questionnaire from './pages/Questionnaire'
import Assessments from './pages/Assessments'
import Report from './pages/Report'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  const handleLogin = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <BrowserRouter>
      {token && (
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              WMS Questionnaire
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Toolbar>
        </AppBar>
      )}
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/login" element={!token ? <Login onLogin={handleLogin} /> : <Navigate to="/assessments" />} />
          <Route path="/assessments" element={token ? <Assessments /> : <Navigate to="/login" />} />
          <Route path="/questionnaire/:id" element={token ? <Questionnaire /> : <Navigate to="/login" />} />
          <Route path="/report/:id" element={token ? <Report /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={token ? "/assessments" : "/login"} />} />
        </Routes>
      </Container>
    </BrowserRouter>
  )
}

export default App
