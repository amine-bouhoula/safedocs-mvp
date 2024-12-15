import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Box, 
  Alert 
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';

//axios.defaults.headers.common['Expires'] = new Date(Date.now() + 60 * 60 * 1000).toUTCString();
axios.defaults.headers.common['Content-Type'] = 'application/json';


interface DecodedToken {
  name: string;
  profileLink: string;
  [key: string]: any; // Add other token claims if needed
}

// Function to decode token
const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sending login request...");

    try {
      const response = await axios.post('http://localhost:8000/api/v1/auth/login', {
        email,
        password,
      },
      { timeout: 10000 } // 10-second timeout
      );
      console.log(response);
  
      if (response.status === 200) {
        // Save the token to localStorage
        const token = response.data.token;
        localStorage.setItem('token', token);
  
        // Decode the token to extract user information
        const decoded = jwtDecode<DecodedToken>(token);
        console.log('User Info:', decoded); // Debug the user info
  
        // Use the decoded info (e.g., redirect to dashboard, show welcome message)
        navigate('/dashboard');
      }
    } catch (error: any) {
	    if (error.code === 'ECONNABORTED') {
	      console.error('Request timeout:', error.message);
	      alert('The request timed out. Please try again.');
	    } else if (error.response) {
	      console.error('Error response:', error.response.data);
	      alert(error.response.data.error || 'Login failed.');
	    } else {
	      console.error('Unexpected error:', error.message);
	      alert('An unexpected error occurred. Please try again.');
	    }
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleLogin}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          mt: 8,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
        />

        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth
        >
          Login
        </Button>
      </Box>
    </Container>
  );
}

export default LoginPage;
