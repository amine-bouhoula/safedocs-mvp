import { useState, useCallback, SetStateAction } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import * as jwt_decode from 'jwt-decode';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components/router-link';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();

  const scheduleAutoLogout = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwt_decode.jwtDecode(token);

      if (decodedToken.exp && typeof decodedToken.exp === 'number') {
        const remainingTime = decodedToken.exp * 1000 - Date.now();

        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login'; // Redirect to login page
        }, remainingTime);
      } else {
        // Handle the case where 'exp' is undefined or not a number
        console.warn('Token does not have a valid exp claim.');
        // Implement appropriate fallback behavior
      }
    }
  };

  const handleEmailChange = (e: { target: { value: SetStateAction<string> } }) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: { target: { value: SetStateAction<string> } }) => {
    setPassword(e.target.value);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = useCallback(() => {
    // router.push('/');
    fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Add any data you want to send
        email,
        password,
      }),
    })
      .then((response) => {
        // Check if the response status is OK (200 range)
        if (response.status !== 200) {
          // Handle error or invalid status code
          console.error('Invalid login:', response.status);
          alert('Invalid login credentials');
          return Promise.reject(new Error('Invalid login credentials')); // Reject if status is not OK
        }
        return response.json(); // Proceed to parse JSON if status is 200
      })
      .then((data) => {
        // Handle successful login, once the JSON is parsed
        console.log('Success:', data);
        const token = data.token;
        localStorage.setItem('token', token);

        // Handle auto logout when token expires.
        scheduleAutoLogout();

        router.push('/'); // Navigate to homepage upon successful response
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, [email, password, router]);

  const renderForm = (
    <Box display="flex" flexDirection="column" alignItems="flex-end">
      <TextField
        fullWidth
        name="email"
        label="Email address"
        defaultValue="user@company.com"
        onChange={handleEmailChange} // Update email state on change
        InputLabelProps={{ shrink: true }}
        sx={{ mb: 3 }}
      />

      <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
        Forgot password?
      </Link>

      <TextField
        fullWidth
        name="password"
        label="Password"
        defaultValue="@demo1234"
        InputLabelProps={{ shrink: true }}
        onChange={handlePasswordChange} // Update password state on change
        type={showPassword ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
      >
        Sign in
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="center" sx={{ mb: 5 }}>
        <Typography variant="h5">Sign in</Typography>
        <Typography variant="body2" color="text.secondary">
          Don’t have an account?
          <Link component={RouterLink} variant="subtitle2" href="/sign-up" sx={{ ml: 0.5 }}>
            Get started
          </Link>
        </Typography>
      </Box>
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OR
        </Typography>
      </Divider>
      <Box gap={1} display="flex" justifyContent="center">
        <IconButton color="inherit">
          <Iconify icon="logos:google-icon" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify icon="eva:github-fill" />
        </IconButton>
        <IconButton color="inherit">
          <Iconify icon="ri:twitter-x-fill" />
        </IconButton>
      </Box>
    </>
  );
}
